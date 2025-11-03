// src/pages/api/session/index.ts
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

// 🧠 Shared companion personality configs
import { companionsConfig } from "@/companions/config/shared";

// Initialize OpenAI client
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
       STEP 1: Verify user authentication (Supabase session)
    --------------------------------------------------------------------- */
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("🔒 Unauthorized request (no Supabase user)");
      return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }

    const userId = user.id;
    const userEmail = user.email || "unknown";

    await getOrCreateUserProfile(userId, userEmail);

    /* ---------------------------------------------------------------------
       STEP 2: Extract request payload
    --------------------------------------------------------------------- */
    const { input, mode, filePayload, tone: userTone, intent } = req.body || {};

    if (!mode || (!input && !filePayload)) {
      return res.status(400).json({ error: "Missing required parameters: mode or input/filePayload" });
    }

    // Retrieve last known tone memory
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
       STEP 4: Create session record
    --------------------------------------------------------------------- */
    const session = await createSession(userId, mode, intent);
    await saveMessage(session.id, "user", input || "(File upload)");

    /* ---------------------------------------------------------------------
       STEP 5: Route to the correct Companion
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
       STEP 6: Generate attachments (PDF/DOCX/XLSX)
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
       STEP 7: Save assistant response + tone memory
    --------------------------------------------------------------------- */
    await saveMessage(session.id, "assistant", result.outputText);
    await saveTone(userId, mode, tone, "Post-response update");

/* ---------------------------------------------------------------------
   STEP 8: Retrieve personality metadata
--------------------------------------------------------------------- */

// Define valid modes for TypeScript
type CompanionMode = keyof typeof companionsConfig;

const personality =
  companionsConfig[mode as CompanionMode]
    ? {
        name: companionsConfig[mode as CompanionMode].title,
        summary: companionsConfig[mode as CompanionMode].essence,
      }
    : { name: "Unknown Companion", summary: "No description available" };

    /* ---------------------------------------------------------------------
       STEP 9: Return structured API response
    --------------------------------------------------------------------- */
    return res.status(200).json({
      ok: true,
      user: { id: userId, email: userEmail },
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