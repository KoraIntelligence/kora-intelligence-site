// src/pages/api/unified.ts

// Increase upload limit for this API route only.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

import type { NextApiRequest, NextApiResponse } from "next";

import {
  runSalar,
  type SalarMode,
  type SalarOrchestratorInput,
} from "@/companions/orchestrators/salar";
import {
  runLyra,
  type LyraMode,
  type LyraOrchestratorInput,
} from "@/companions/orchestrators/lyra";

import { parseUploadedFile } from "@/pages/api/session/utils/parseFiles";
import { loadIdentity } from "@/companions/identity/loader";

import {
  getOrCreateUserProfile,
  createSession,
  getMessages,
  saveMessage,
  saveTone,
} from "@/lib/memory";

// -----------------------------
// Types for this API
// -----------------------------

type CompanionSlug = "salar" | "lyra";

interface UnifiedRequestBody {
  companion?: CompanionSlug;
  mode: string; // narrowed per companion
  tone?: string;
  input?: string | null;
  nextAction?: string | null;
  filePayload?: any; // { name, type, contentBase64 } – from frontend

  // NEW: memory fields
  userId?: string | null;
  sessionId?: string | null;
}

// Shape of orchestrator result
interface OrchestratorResult {
  reply?: string;
  outputText?: string;
  attachments?: any[];
  meta?: Record<string, any>;
}

// For passing memory into orchestrators
export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
  meta?: any;
}

// -----------------------------
// Helper: safely parse JSON body
// -----------------------------
function parseBody(req: NextApiRequest): UnifiedRequestBody {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new Error("Invalid JSON body.");
    }
  }
  return req.body as UnifiedRequestBody;
}

// -----------------------------
// GET = fetch history
// POST = send message / nextAction
// -----------------------------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // -------------------------------------------------------
    // GET /api/unified?sessionId=...
    // → return previous messages for this session
    // -------------------------------------------------------
    const sessionId = req.query.sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Missing or invalid sessionId" });
    }

    const rows = await getMessages(sessionId);

    const messages = rows.map((row: any) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      ts: new Date(row.created_at).getTime(),
      // meta was stored inside attachments._meta
      meta: row.attachments?._meta || undefined,
      // ignore historical attachments for now – we still show
      // fresh ones coming back from orchestrators
    }));

    return res.status(200).json({ messages });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    let {
      companion = "salar",
      mode,
      tone = "calm",
      input = "",
      nextAction = null,
      filePayload,
      userId = null,
      sessionId = null,
    } = body;

    if (!mode) {
      return res.status(400).json({ error: "Missing mode in request." });
    }

    // Fallback guest id if frontend didn't send one (should be rare)
    if (!userId) {
      userId = "guest-" + (req.headers["x-guest"] || "anon");
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
    // 2) Ensure user profile exists
    // -----------------------------
    await getOrCreateUserProfile(userId);

    // -----------------------------
    // 3) Ensure session exists
    // -----------------------------
    if (!sessionId) {
      const newSession = await createSession(userId, companion, "general");
      sessionId = newSession.id;
    }

    // -------------------------------------------------------
// 4) Load conversation history (only if sessionId exists)
// -------------------------------------------------------
if (!sessionId) {
  return res.status(500).json({
    error: "Session ID missing before loading conversation history.",
  });
}

const rawHistory = await getMessages(sessionId);

const conversationHistory: ConversationTurn[] = rawHistory.map((m: any) => ({
  role: m.role,
  content: m.content,
  meta: m.attachments?._meta || null,
}));

    // -----------------------------
    // 5) Save USER message first
    // -----------------------------
    const trimmedInput = input ? input.trim() : "";

    if (trimmedInput || nextAction) {
      const userContent =
        trimmedInput ||
        (nextAction ? `[Triggered Action: ${nextAction}]` : "");

      await saveMessage(sessionId, "user", userContent, {
        meta: {
          nextAction: nextAction || undefined,
          mode,
          companion,
        },
      });
    }

    // -----------------------------
    // 6) Load identity (for meta)
    // -----------------------------
    const rawIdentity: any = loadIdentity(companion, mode);

    const toneBaseFromIdentity: string | undefined =
      typeof rawIdentity?.tone === "string"
        ? rawIdentity.tone
        : rawIdentity?.tone?.base;

    // -----------------------------
    // 7) Call the correct orchestrator
    // -----------------------------
    let orchestratorResult: OrchestratorResult;

    if (companion === "salar") {
      const salarInput: SalarOrchestratorInput & {
        conversationHistory?: ConversationTurn[];
      } = {
        mode: mode as SalarMode,
        input: trimmedInput,
        extractedText,
        tone,
        nextAction: nextAction || undefined,
        conversationHistory,
      };

      orchestratorResult = await runSalar(salarInput);
    } else {
      const lyraInput: LyraOrchestratorInput & {
        conversationHistory?: ConversationTurn[];
      } = {
        mode: mode as LyraMode,
        input: trimmedInput,
        extractedText,
        tone,
        nextAction: nextAction || undefined,
        conversationHistory,
      };

      orchestratorResult = await runLyra(lyraInput);
    }

    // -------------------------------------------------------
    // 8) Extract orchestrator output
    // -------------------------------------------------------
    const reply =
      orchestratorResult.outputText ||
      orchestratorResult.reply ||
      "No response generated.";

    const attachments: any[] = orchestratorResult.attachments || [];

    const metaFromOrchestrator = orchestratorResult.meta || {};

    const meta = {
      ...metaFromOrchestrator,
      companion,
      mode,
      tone,
      identity: metaFromOrchestrator.identity ?? {
        persona: rawIdentity?.persona,
        toneBase: toneBaseFromIdentity,
        mode,
      },
      memory: {
        shortTerm: conversationHistory.slice(-8),
      },
    };

    // -------------------------------------------------------
    // 9) Save assistant message
    // -------------------------------------------------------
    await saveMessage(sessionId, "assistant", reply, {
      attachments,
      meta,
    });

    // -------------------------------------------------------
    // 10) Save tone history (optional but nice)
    // -------------------------------------------------------
    await saveTone(userId, companion, tone || "calm", "post-response update");

    // -----------------------------
    // 11) Return response
    // -----------------------------
    return res.status(200).json({
      reply,
      attachments,
      meta,
      sessionId,
    });
  } catch (err: any) {
    console.error("❌ /api/unified error:", err?.message || err);

    return res.status(500).json({
      error:
        err?.message || "Unknown error in unified companion endpoint.",
    });
  }
}