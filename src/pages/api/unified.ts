// src/pages/api/unified.ts

// -----------------------------
// Upload size
// -----------------------------
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
// Types
// -----------------------------

type CompanionSlug = "salar" | "lyra";

interface UnifiedRequestBody {
  companion?: CompanionSlug;
  mode: string;
  tone?: string;
  input?: string | null;
  nextAction?: string | null;
  filePayload?: any;

  // memory + identity
  userId?: string | null;
  sessionId?: string | null;
}

interface OrchestratorResult {
  reply?: string;
  outputText?: string;
  attachments?: any[];
  meta?: Record<string, any>;
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
  meta?: any;
}

// -----------------------------
// Helper
// -----------------------------
function parseBody(req: NextApiRequest): UnifiedRequestBody {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body as UnifiedRequestBody;
}

// ===================================================================
// MAIN HANDLER
// ===================================================================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ===============================================================
  // GET → return conversation history for a given sessionId
  // ===============================================================
  if (req.method === "GET") {
    const sessionId = req.query.sessionId;

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Missing or invalid sessionId" });
    }

    const rows = await getMessages(sessionId);

    return res.status(200).json({
      messages: rows.map((row: any) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        ts: new Date(row.created_at).getTime(),
        meta: row.attachments?._meta || undefined,
        attachments: row.attachments || {},
      })),
    });
  }

  // ===============================================================
  // POST → core logic
  // ===============================================================
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
      userId,
      sessionId: incomingSessionId,
    } = body;

    if (!mode) {
      return res.status(400).json({ error: "Missing mode in request." });
    }

    // --------------------------------------------
    // 1) Ensure userId exists (guest fallback)
    // --------------------------------------------
    if (!userId) {
      userId = "guest-" + (req.headers["x-guest"] || "anon");
    }

    await getOrCreateUserProfile(userId);

    // --------------------------------------------
    // 2) Extract uploaded file if present
    // --------------------------------------------
    let extractedText = "";
    if (filePayload) {
      try {
        extractedText = await parseUploadedFile(
          filePayload,
          filePayload.type
        );
      } catch (err) {
        console.error("❌ File parse error:", err);
        return res.status(400).json({ error: "File parsing failed." });
      }
    }

    // --------------------------------------------
    // 3) Ensure session exists
    // --------------------------------------------
    let sessionId = incomingSessionId || null;

    if (!sessionId) {
      const newSession = await createSession(
        userId,
        companion,
        "general"
      );
      sessionId = newSession.id;
    }

    // --------------------------------------------
    // 4) Load conversation history
    // --------------------------------------------
const rawHistory = await getMessages(sessionId as string);

    const conversationHistory: ConversationTurn[] = rawHistory.map(
      (m: any) => ({
        role: m.role,
        content: m.content,
        meta: m.attachments?._meta || null,
      })
    );

    // --------------------------------------------
    // 5) Save USER message
    // --------------------------------------------
    const trimmed = input?.trim() || "";

    if (trimmed || nextAction) {
      const userContent =
        trimmed || `[Triggered Action: ${nextAction}]`;

      await saveMessage(sessionId as string, "user", userContent, {
        meta: {
          nextAction: nextAction || undefined,
          mode,
          companion,
        },
      });
    }

    // --------------------------------------------
    // 6) Load identity template
    // --------------------------------------------
    const rawIdentity = loadIdentity(companion, mode);

    const toneBase =
      typeof rawIdentity?.tone === "string"
        ? rawIdentity.tone
        : rawIdentity?.tone?.base;

    // --------------------------------------------
    // 7) Call orchestrator
    // --------------------------------------------
    let orchestratorResult: OrchestratorResult;

    if (companion === "salar") {
      const salarInput: SalarOrchestratorInput & {
        conversationHistory: ConversationTurn[];
      } = {
        mode: mode as SalarMode,
        input: trimmed,
        extractedText,
        tone,
        nextAction: nextAction || undefined,
        conversationHistory,
      };

      orchestratorResult = await runSalar(salarInput);
    } else {
      const lyraInput: LyraOrchestratorInput & {
        conversationHistory: ConversationTurn[];
      } = {
        mode: mode as LyraMode,
        input: trimmed,
        extractedText,
        tone,
        nextAction: nextAction || undefined,
        conversationHistory,
      };

      orchestratorResult = await runLyra(lyraInput);
    }

    // --------------------------------------------
    // 8) Extract orchestrator output
    // --------------------------------------------
    const reply =
      orchestratorResult.outputText ||
      orchestratorResult.reply ||
      "No response generated.";

    const attachments = orchestratorResult.attachments || [];
    const metaFromOrch = orchestratorResult.meta || {};

    const meta = {
      ...metaFromOrch,
      companion,
      mode,
      tone,
      identity: metaFromOrch.identity ?? {
        persona: rawIdentity?.persona,
        toneBase,
        mode,
      },
      memory: {
        shortTerm: conversationHistory.slice(-8),
      },
    };

    // --------------------------------------------
    // 9) Save ASSISTANT message
    // --------------------------------------------
    await saveMessage(sessionId as string, "assistant", reply, {
      attachments,
      meta,
    });

    // --------------------------------------------
    // 10) Store tone history
    // --------------------------------------------
    await saveTone(
      userId as string,
      companion,
      tone || "calm",
      "post-response update"
    );

    // --------------------------------------------
    // 11) Return
    // --------------------------------------------
    return res.status(200).json({
      reply,
      attachments,
      meta,
      sessionId,
    });
  } catch (err: any) {
    console.error("❌ unified.ts error:", err);
    return res.status(500).json({
      error: err?.message || "Unknown unified.ts error",
    });
  }
}