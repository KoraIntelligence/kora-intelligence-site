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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const config = {
  api: {
    bodyParser: { sizeLimit: "25mb" },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* ---------------------------------------------------------------------
       STEP 1: Authenticate via Supabase
    --------------------------------------------------------------------- */
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("🚫 Unauthorized request — no Supabase session.");
      return res.status(401).json({ error: "Unauthorized. Please sign in first." });
    }

    const userId = user.id;
    const userEmail = user.email || "unknown@user";
    await getOrCreateUserProfile(userId, userEmail);

    /* ---------------------------------------------------------------------
       STEP 2: Extract and validate request payload
    --------------------------------------------------------------------- */
    const { input, mode, filePayload, tone: userTone, intent } = req.body || {};

    if (!mode) {
      return res.status(400).json({ error: "Missing 'mode' (ccc, fmc, builder)" });
    }

    if (!input && !filePayload) {
      return res
        .status(400)
        .json({ error: "Missing 'input' or 'filePayload'. One is required." });
    }

    const lastTone = await getLastTone(userId, mode);
    const tone = userTone || lastTone || "neutral";

/* ---------------------------------------------------------------------
   STEP 3: Parse uploaded file (if any)
--------------------------------------------------------------------- */
let extractedText = "";

if (filePayload) {
  try {
    // Save to /tmp so pdf-parse-fixed can handle it safely
// ✅ Always write temp files to /tmp (Vercel-compatible)
const tmpDir = "/tmp"; // Vercel’s writable directory
const tmpPath = path.join(tmpDir, filePayload.name || "upload.tmp");

const base64Data = filePayload.contentBase64?.split(",").pop();
if (!base64Data) throw new Error("Invalid file upload: missing base64 content.");

const buffer = Buffer.from(base64Data, "base64");

try {
  await fs.writeFile(tmpPath, buffer);
} catch (err: any) {
  console.error("❌ Temp file write failed:", err.message);
  throw new Error("Could not write temporary file to /tmp.");
}

// ✅ Pass to parser safely
extractedText = await parseUploadedFile(tmpPath, filePayload.type);

    // Use parser
    extractedText = await parseUploadedFile(tmpPath, filePayload.type);
  } catch (fileErr: any) {
    console.error("❌ File handling failed:", fileErr.message);
    throw new Error("File parsing failed or temporary file could not be saved.");
  }
}

    /* ---------------------------------------------------------------------
       STEP 4: Create or continue a session
    --------------------------------------------------------------------- */
    const session = await createSession(userId, mode, intent);
    await saveMessage(session.id, "user", input || "(File Upload)");

    /* ---------------------------------------------------------------------
       STEP 5: Route to correct Companion logic
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
          return res.status(400).json({ error: `Invalid mode '${mode}'` });
      }
    } catch (err: any) {
      console.error(`💥 Companion processing error [${mode}]:`, err);
      return res.status(500).json({ error: `AI processing failed for ${mode}` });
    }

    /* ---------------------------------------------------------------------
       STEP 6: Generate Attachments (PDF / DOCX / XLSX)
    --------------------------------------------------------------------- */
    const attachments: any[] = [];
    if (result.outputText) {
      try {
        attachments.push(await createPDF(result.outputText));
        attachments.push(await createDocx(result.outputText));

        if (mode === "ccc") {
          attachments.push(await createXlsx());
        }
      } catch (genErr: any) {
        console.error("⚠️ Attachment generation failed:", genErr);
      }
    }

    /* ---------------------------------------------------------------------
       STEP 7: Store assistant message & tone memory
    --------------------------------------------------------------------- */
    await saveMessage(session.id, "assistant", result.outputText);
    await saveTone(userId, mode, tone, "Post-response update");

    /* ---------------------------------------------------------------------
       STEP 8: Enrich with Companion personality
    --------------------------------------------------------------------- */
    type CompanionMode = keyof typeof companionsConfig;
    const companionProfile =
      companionsConfig[mode as CompanionMode] || {
        title: "Unknown Companion",
        essence: "This companion has yet to reveal its identity.",
      };

    /* ---------------------------------------------------------------------
       STEP 9: Send structured response
    --------------------------------------------------------------------- */
    return res.status(200).json({
      ok: true,
      user: { id: userId, email: userEmail },
      mode,
      tone,
      sessionId: session.id,
      personality: {
        name: companionProfile.title,
        summary: companionProfile.essence,
      },
      reply: result.outputText,
      attachments,
      meta: result.meta || {},
    });
  } catch (err: any) {
    console.error("🔥 Unified session fatal error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Internal Server Error",
    });
  }
}