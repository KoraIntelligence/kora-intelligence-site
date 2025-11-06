import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import OpenAI from "openai";
import path from "path";
import fs from "fs/promises";

import { runCCC } from "./companions/ccc";
import { runFMC } from "./companions/fmc";
import { runBuilder } from "./companions/builder";
import { parseUploadedFile } from "./utils/parseFiles";
import { createPDF, createDocx, createXlsx } from "./utils/generateDocs";

import {
  getOrCreateUserProfile,
  createSession,
  saveMessage,
  getLastTone,
  saveTone,
} from "@/lib/memory";
import { companionsConfig } from "@/companions/config/shared";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // required for guest creation

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const config = {
  api: {
    bodyParser: { sizeLimit: "25mb" },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    /* ---------------------------------------------------------------------
       STEP 1: Verify user authentication or create guest session
    --------------------------------------------------------------------- */
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const guestHeader = req.headers["x-guest"];

    let userId: string;
    let userEmail: string;
    let isGuest = false;

if (user) {
  userId = user.id;
  userEmail = user.email || "unknown";
} else if (guestHeader === "true") {
  // Guest mode path
  isGuest = true;
  const existingGuest = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("email", "guest@kora.local")
    .single();

  if (existingGuest.data) {
    userId = existingGuest.data.id;
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
  // No user or guest flag — reject
  return res.status(401).json({ error: "Unauthorized. Please sign in or use guest mode." });
}

    /* ---------------------------------------------------------------------
       STEP 2: Extract payload
    --------------------------------------------------------------------- */
    const { input, mode, filePayload, tone: userTone, intent } = req.body || {};
    if (!mode || (!input && !filePayload)) {
      return res.status(400).json({ error: "Missing required parameters: mode or input/filePayload" });
    }

    const lastTone = await getLastTone(userId, mode);
    const tone = userTone || lastTone || "neutral";

    /* ---------------------------------------------------------------------
       STEP 3: Parse uploaded file (if any)
    --------------------------------------------------------------------- */
    let extractedText = "";
    if (filePayload?.contentBase64 && filePayload?.type) {
      const tmpDir = path.join(process.cwd(), "tmp");
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

    /* ---------------------------------------------------------------------
       STEP 4: Create or reuse chat session
    --------------------------------------------------------------------- */
    const session = await createSession(userId, mode, intent);
    await saveMessage(session.id, "user", input || "(File upload)");

    /* ---------------------------------------------------------------------
       STEP 5: Route request to Companion
    --------------------------------------------------------------------- */
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
      console.error(`💥 Companion (${mode}) processing error:`, aiErr);
      return res.status(500).json({ error: `AI processing failed for ${mode}.` });
    }

    /* ---------------------------------------------------------------------
       STEP 6: Generate downloadable attachments
    --------------------------------------------------------------------- */
    const attachments: any[] = [];
    if (result.outputText) {
      try {
        const pdf = await createPDF(result.outputText);
        const docx = await createDocx(result.outputText);
        attachments.push(pdf, docx);
        if (mode === "ccc") {
          const xlsx = await createXlsx();
          attachments.push(xlsx);
        }
      } catch (genErr: any) {
        console.error("⚠️ Attachment generation failed:", genErr);
      }
    }

    /* ---------------------------------------------------------------------
       STEP 7: Save AI response + tone
    --------------------------------------------------------------------- */
    await saveMessage(session.id, "assistant", result.outputText);
    await saveTone(userId, mode, tone, "Post-response update");

    /* ---------------------------------------------------------------------
       STEP 8: Retrieve personality metadata
    --------------------------------------------------------------------- */
    type CompanionMode = keyof typeof companionsConfig;
    const personality =
      companionsConfig[mode as CompanionMode]
        ? {
            name: companionsConfig[mode as CompanionMode].title,
            summary: companionsConfig[mode as CompanionMode].essence,
          }
        : { name: "Unknown Companion", summary: "No description available" };

    /* ---------------------------------------------------------------------
       STEP 9: Respond
    --------------------------------------------------------------------- */
    return res.status(200).json({
      ok: true,
      user: { id: userId, email: userEmail, guest: isGuest },
      mode,
      sessionId: session.id,
      tone,
      personality,
      reply: result.outputText,
      attachments,
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