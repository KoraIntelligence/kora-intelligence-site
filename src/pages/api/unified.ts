// src/pages/api/unified.ts

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

type CompanionSlug = "salar" | "lyra";

interface UnifiedRequestBody {
  companion?: CompanionSlug;
  mode: string;
  tone?: string;
  input?: string | null;
  nextAction?: string | null;
  filePayload?: any;
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

function parseBody(req: NextApiRequest): UnifiedRequestBody {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body as UnifiedRequestBody;
}

function normalizeMessageContent(content: any): string {
  if (!content) return "";

  // If already string → return directly
  if (typeof content === "string") return content;

  // If OpenAI returned structured array content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part) return "";
        if (typeof part === "string") return part;
        if (typeof part.text === "string") return part.text;
        if (typeof part.content === "string") return part.content;
        return JSON.stringify(part);
      })
      .join("\n");
  }

  // Fallback: force to string
  return String(content);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
        meta: row.meta || undefined, // ✅ CORRECTED: now returns root meta
        attachments: row.attachments || [],
      })),
    });
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
      userId,
      sessionId: incomingSessionId,
    } = body;

    if (!mode) {
      return res.status(400).json({ error: "Missing mode in request." });
    }

    if (!userId) {
      userId = "guest-" + (req.headers["x-guest"] || "anon");
    }

    await getOrCreateUserProfile(userId);

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

    let sessionId = incomingSessionId || null;
    if (!sessionId) {
      const newSession = await createSession(userId, companion, "general");
      sessionId = newSession.id;
    }

    const rawHistory = await getMessages(sessionId as string);
    const conversationHistory: ConversationTurn[] = rawHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
      meta: m.meta || null, // ✅ restored memory
    }));

    const trimmed = input?.trim() || "";
    if (trimmed || nextAction) {
      const userContent = trimmed || `[Triggered Action: ${nextAction}]`;
      await saveMessage(sessionId as string, "user", userContent, {
        meta: {
          nextAction: nextAction || undefined,
          mode,
          companion,
        },
      });
    }

    const rawIdentity = loadIdentity(companion, mode);
    const toneBase =
      typeof rawIdentity?.tone === "string"
        ? rawIdentity.tone
        : rawIdentity?.tone?.base;

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

    let replyRaw =
  orchestratorResult.outputText ||
  orchestratorResult.reply ||
  "No response generated.";

const reply = normalizeMessageContent(replyRaw);

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

    await saveMessage(sessionId as string, "assistant", reply, {
      attachments,
      meta,
    });

    await saveTone(
      userId as string,
      companion,
      tone || "calm",
      "post-response update"
    );

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