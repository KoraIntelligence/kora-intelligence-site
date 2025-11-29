// src/pages/api/unified.ts

// Increase upload limit for this API route only.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // you can safely use up to "4mb" or "5mb" on Vercel Hobby
    },
  },
};

import type { NextApiRequest, NextApiResponse } from "next";

import {
  runSalar,
  SalarMode,
  type SalarOrchestratorInput,
} from "@/companions/orchestrators/salar";
import {
  runLyra,
  LyraMode,
  type LyraOrchestratorInput,
} from "@/companions/orchestrators/lyra";

import { parseUploadedFile } from "@/pages/api/session/utils/parseFiles";
import { loadIdentity } from "@/companions/identity/loader";

// -----------------------------
// Types for this API
// -----------------------------

type CompanionSlug = "salar" | "lyra";

interface UnifiedRequestBody {
  companion?: CompanionSlug;
  mode: string; // we'll narrow per companion
  tone?: string;
  input?: string;
  nextAction?: string;
  filePayload?: any; // { name, type, contentBase64 } – from frontend
}

// Shape of orchestrator result
interface OrchestratorResult {
  reply: string;
  attachments?: any[];
  meta?: Record<string, any>;
}

// -----------------------------
// Helper: safely parse JSON body
// -----------------------------
function parseBody(req: NextApiRequest): UnifiedRequestBody {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      throw new Error("Invalid JSON body.");
    }
  }
  return req.body as UnifiedRequestBody;
}

// -----------------------------
// API Handler
// -----------------------------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const {
      companion = "salar",
      mode,
      tone = "calm",
      input = "",
      nextAction,
      filePayload,
    } = body;

    if (!mode) {
      return res.status(400).json({ error: "Missing mode in request." });
    }

    // -----------------------------
    // 1) Extract text from file (if any)
    // -----------------------------
    let extractedText = "";
    if (filePayload) {
      try {
        extractedText = await parseUploadedFile(filePayload, filePayload.type);
      } catch (err) {
        console.error("❌ File parsing failed in /api/unified:", err);
        return res.status(400).json({
          error: "File parsing failed. Try a different file.",
        });
      }
    }

    // -----------------------------
    // 2) Load identity (for fallback identity meta)
    // -----------------------------
    const rawIdentity: any = loadIdentity(companion, mode);

    const toneBaseFromIdentity: string | undefined =
      typeof rawIdentity?.tone === "string"
        ? rawIdentity.tone
        : rawIdentity?.tone?.base;

    // -----------------------------
    // 3) Call the correct orchestrator
    // -----------------------------
    let result: OrchestratorResult;

    if (companion === "salar") {
      const salarInput: SalarOrchestratorInput = {
        mode: mode as SalarMode,
        input,
        extractedText,
        tone,
        nextAction,
      };

      result = await runSalar(salarInput);
    } else {
      const lyraInput: LyraOrchestratorInput = {
        mode: mode as LyraMode,
        input,
        extractedText,
        tone,
        nextAction,
      };

      result = await runLyra(lyraInput);
    }

    const reply = result.reply || "No response generated.";
    const attachments = result.attachments || [];

    // -----------------------------
    // 4) Unify meta + inject fallback identity
    // -----------------------------
    const metaFromOrchestrator = result.meta || {};

    const meta = {
      ...metaFromOrchestrator,
      companion: metaFromOrchestrator.companion ?? companion, // "salar" | "lyra"
      mode: metaFromOrchestrator.mode ?? mode,
      tone: metaFromOrchestrator.tone ?? tone,
      identity:
        metaFromOrchestrator.identity ??
        {
          persona: rawIdentity?.persona,
          toneBase: toneBaseFromIdentity,
          mode,
        },
      // ensure memory at least exists as a placeholder
      memory: metaFromOrchestrator.memory ?? {
        shortTerm: [],
      },
    };

    // -----------------------------
    // 5) Return response
    // -----------------------------
    return res.status(200).json({
      reply,
      attachments,
      meta,
      sessionId: null, // reserved for future Supabase sessions
    });
  } catch (err: any) {
    console.error("❌ /api/unified error:", err?.message || err);

    return res.status(500).json({
      error:
        err?.message || "Unknown error in unified companion endpoint.",
    });
  }
}