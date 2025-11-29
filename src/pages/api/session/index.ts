// src/pages/api/session/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import OpenAI from "openai";
import path from "path";
import fs from "fs/promises";

import { runCCC } from "./companions/salar";
import { runFMC } from "./companions/lyra";
import { runBuilder } from "./companions/builder";
import { parseUploadedFile } from "./utils/parseFiles";

import {
  getOrCreateUserProfile,
  createSession,
  saveMessage,
  getLastTone,
  saveTone,
} from "@/lib/memory";
import { companionsConfig } from "@/companions/config/shared";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const config = {
  api: {
    bodyParser: { sizeLimit: "25mb" },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    /* ────────────────────────────────────────────────
       STEP 1: Identify User (Auth or Guest)
    ──────────────────────────────────────────────── */
    const supabase = createServerSupabaseClient({ req, res });
    const guestHeader = req.headers["x-guest"];

    let userId: string;
    let userEmail: string;
    let isGuest = false;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      userEmail = user.email || "unknown";
      await getOrCreateUserProfile(user.id, user.email || "unknown");
    } else if (guestHeader === "true") {
      isGuest = true;

      const { data: guest, error } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("email", "guest@kora.local")
        .single();

      if (guest) {
        userId = guest.id;
      } else {
        const { data: newGuest, error: guestErr } = await supabaseAdmin
          .from("user_profiles")
          .insert([
            {
              email: "guest@kora.local",
              name: "Guest User",
              current_tone: "calm",
            },
          ])
          .select("id")
          .single();

        if (guestErr) throw guestErr;
        userId = newGuest.id;
      }

      userEmail = "guest@kora.local";
    } else {
      return res.status(401).json({ error: "Unauthorized. Please sign in or use guest mode." });
    }

    /* ────────────────────────────────────────────────
       STEP 2: Validate Payload
    ──────────────────────────────────────────────── */
    const { input, mode, filePayload, tone: userTone, intent } = req.body || {};
    if (!mode || (!input && !filePayload)) {
      return res.status(400).json({ error: "Missing required parameters: mode or input/filePayload" });
    }

    const lastTone = await getLastTone(userId, mode);
    const tone = userTone || lastTone || "neutral";

    /* ────────────────────────────────────────────────
       STEP 3: Parse Uploaded File (if present)
    ──────────────────────────────────────────────── */
    let extractedText = "";
    if (filePayload?.contentBase64 && filePayload?.type) {
      const tmpDir = "/tmp";
      const tmpPath = path.join(tmpDir, filePayload.name);

      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(tmpPath, Buffer.from(filePayload.contentBase64, "base64"));

      try {
        extractedText = await parseUploadedFile(tmpPath, filePayload.type);
      } catch (fileErr: any) {
        console.error("❌ File parsing failed:", fileErr);
        return res.status(400).json({
          ok: false,
          error: "File parsing failed. Try uploading a different file.",
        });
      }
    }

    /* ────────────────────────────────────────────────
       STEP 4: Create/Link Session + Save User Message
    ──────────────────────────────────────────────── */
    const session = await createSession(userId, mode, intent || "general");
    await saveMessage(session.id, "user", input || "(File upload)");

    /* ────────────────────────────────────────────────
       STEP 5: Run Appropriate Companion
    ──────────────────────────────────────────────── */
    let result;
    try {
      switch (mode) {
        case "ccc":
          result = await runCCC({ input, extractedText, tone, intent });
          break;
        case "fmc":
          result = await runFMC({ input, extractedText, tone, intent });
          break;
        case "builder":
          result = await runBuilder({ input, extractedText, tone, intent });
          break;
        default:
          return res.status(400).json({ error: `Invalid mode: ${mode}` });
      }
    } catch (aiErr: any) {
      console.error(`💥 AI processing failed for ${mode}:`, aiErr);
      return res.status(500).json({ error: `AI processing failed for ${mode}.` });
    }

    /* ────────────────────────────────────────────────
       STEP 6: Save AI Response & Tone Update
    ──────────────────────────────────────────────── */
    if (result?.outputText) {
      await saveMessage(session.id, "assistant", result.outputText);
      await saveTone(userId, mode, tone, "Post-response update");
    }

    /* ────────────────────────────────────────────────
       STEP 7: Build Companion Metadata
    ──────────────────────────────────────────────── */
    const personality = companionsConfig[mode as keyof typeof companionsConfig] || {
      title: "Unknown",
      essence: "No description available",
    };

    /* ────────────────────────────────────────────────
       STEP 8: Return Unified Response
    ──────────────────────────────────────────────── */
    return res.status(200).json({
      ok: true,
      user: { id: userId, email: userEmail, guest: isGuest },
      mode,
      sessionId: session.id,
      tone,
      personality: {
        name: personality.title,
        summary: personality.essence,
      },
      reply: result.outputText,
      attachments: result.attachments || [],
      meta: result.meta || {},
    });
  } catch (err: any) {
    console.error("❌ Unified session fatal error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Internal Server Error",
    });
  }
}