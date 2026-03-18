// src/pages/api/unified-stream.ts
// Main streaming SSE endpoint — Anthropic Claude

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { withRetry } from "../../lib/retry";
import { parseUploadedFile } from "../../pages/api/session/utils/parseFiles";
import { loadIdentity } from "../../companions/identity/loader";
import {
  createSession,
  getMessages,
  saveMessage,
  saveTone,
  getBrandContext,
  getLastTone,
  updateSessionTitle,
} from "../../lib/memory";

import type { SalarMode } from "../../companions/orchestrators/salar";
import type { LyraMode } from "../../companions/orchestrators/lyra";

import {
  buildSalarStreamingPlan,
  type SalarStreamingPlanInput,
} from "../../companions/orchestrators/salar";

import {
  buildLyraStreamingPlan,
  type LyraStreamingPlanInput,
} from "../../companions/orchestrators/lyra";

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
  handoverContext?: string | null;
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
  meta?: any;
}

/* ---------------- Helpers ---------------- */

async function getGuestUserId(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("email", "guest@kora.local")
    .single();

  if (error || !data?.id) {
    throw new Error("Guest user profile not found");
  }

  return data.id;
}

function parseBody(req: NextApiRequest): UnifiedRequestBody {
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body as UnifiedRequestBody;
}

function sseInit(res: NextApiResponse) {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // @ts-ignore
  res.flushHeaders?.();
}

function sseSend(res: NextApiResponse, data: any) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function ssePing(res: NextApiResponse) {
  res.write(`: ping\n\n`);
}

/* ---------------- Handler ---------------- */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = process.env.KORA_MODEL || "claude-sonnet-4-6";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🟦 unified-stream.ts: Incoming request:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  sseInit(res);

  const heartbeat = setInterval(() => {
    try { ssePing(res); } catch {}
  }, 15_000);

  const abortController = new AbortController();
  req.on("close", () => {
    abortController.abort();
    clearInterval(heartbeat);
  });

  try {
    const body = parseBody(req);

    let {
      companion = "salar",
      mode,
      tone = "calm",
      input = "",
      nextAction = null,
      filePayload,
      sessionId: incomingSessionId,
      handoverContext = null,
    } = body;

    if (!mode) {
      sseSend(res, { type: "error", error: "Missing mode in request." });
      clearInterval(heartbeat);
      return res.end();
    }

    const isGuest = req.headers["x-guest"] === "true";

    /* ---------- USER ID ---------- */
    let userId: string | null = null;

    if (isGuest) {
      userId = await getGuestUserId();
    } else {
      const supabase = createPagesServerClient({ req, res });
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        sseSend(res, { type: "error", error: "Not authenticated" });
        clearInterval(heartbeat);
        return res.end();
      }

      userId = user.id;
    }

    /* ---------- TONE RESOLUTION ---------- */
    // If frontend sent no tone or the default, load from DB so returning users
    // get their saved preference rather than always defaulting to "calm".
    if (!tone || tone === "calm") {
      const savedTone = await getLastTone(userId, companion);
      if (savedTone && savedTone !== "calm") tone = savedTone;
    }

    /* ---------- FILE HANDLING ---------- */
    let extractedText = "";
    if (filePayload) {
      try {
        extractedText = await parseUploadedFile(filePayload, filePayload.type);
      } catch (err) {
        console.error("❌ File parse error:", err);
        sseSend(res, { type: "error", error: "File parsing failed." });
        clearInterval(heartbeat);
        return res.end();
      }
    }

    /* ---------- SESSION ---------- */
    let sessionId = incomingSessionId || null;

    if (!sessionId) {
      const newSession = await createSession(userId, companion, "general");
      sessionId = newSession.id;
    }

    const rawHistory = await getMessages(sessionId as string);
    const conversationHistory: ConversationTurn[] = rawHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
      meta: m.meta || null,
    }));

    /* ---------- SAVE USER MESSAGE ---------- */
    const trimmed =
      input?.trim() || (extractedText ? "User uploaded a document for analysis." : "");

    if (trimmed || nextAction) {
      const userContent = trimmed || `[Triggered Action: ${nextAction}]`;
      await saveMessage(sessionId as string, "user", userContent, {
        meta: { nextAction: nextAction || undefined, mode, companion },
      });
    }

    /* ---------- BRAND CONTEXT ---------- */
    const brandContext = await getBrandContext(userId);

    /* ---------- BUILD STREAMING PLAN ---------- */
    const rawIdentity = loadIdentity(companion, mode);

    const plan =
      companion === "salar"
        ? buildSalarStreamingPlan({
            mode: mode as SalarMode,
            input: trimmed,
            extractedText,
            tone,
            nextAction: nextAction || undefined,
            conversationHistory,
            brandContext,
            handoverContext: handoverContext || undefined,
          } as SalarStreamingPlanInput)
        : buildLyraStreamingPlan({
            mode: mode as LyraMode,
            input: trimmed,
            extractedText,
            tone,
            nextAction: nextAction || undefined,
            conversationHistory,
            brandContext,
            handoverContext: handoverContext || undefined,
          } as LyraStreamingPlanInput);

    sseSend(res, { type: "start", sessionId });

    /* ---------- STREAM CLAUDE TOKENS ---------- */
    let fullText = "";

    const stream = anthropic.messages.stream(
      {
        model: plan.model || MODEL,
        max_tokens: 8192,
        system: plan.system,
        messages: plan.messages as Array<{ role: "user" | "assistant"; content: string }>,
      },
      { signal: abortController.signal as any }
    );

    for await (const event of stream) {
      if (abortController.signal.aborted) break;

      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        const delta = event.delta.text;
        if (delta) {
          fullText += delta;
          sseSend(res, { type: "token", value: delta });
        }
      }

      if (event.type === "message_stop") {
        break;
      }
    }

    if (abortController.signal.aborted) {
      clearInterval(heartbeat);
      return res.end();
    }

    const finalReply = fullText.trim() || "No response generated.";

    /* ---------- POST-PROCESS ---------- */
    const attachments = await plan.buildAttachments(finalReply);
    const metaFromPlan = plan.buildMeta(finalReply);

    const meta = {
      ...metaFromPlan,
      companion,
      mode,
      tone,
      identity:
        metaFromPlan.identity ??
        ({
          persona: rawIdentity?.persona,
          toneBase:
            typeof rawIdentity?.tone === "string"
              ? rawIdentity.tone
              : rawIdentity?.tone?.base,
          mode,
        } as any),
      memory: { shortTerm: conversationHistory.slice(-8) },
    };

    /* ---------- SAVE ASSISTANT MESSAGE ---------- */
    await saveMessage(sessionId as string, "assistant", finalReply, {
      attachments,
      meta,
    });

    // Auto-name on first message of a new session
    if (sessionId && !incomingSessionId) {
      updateSessionTitle(sessionId as string, companion, mode).catch(() => {});
    }

    if (userId) {
      await saveTone(userId, companion, tone || "calm", "post-response update");
    }

    /* ---------- FINAL EVENT ---------- */
    sseSend(res, { type: "done", reply: finalReply, attachments, meta, sessionId });

    clearInterval(heartbeat);
    return res.end();
  } catch (err: any) {
    console.error("❌ unified-stream.ts error:", err);
    try {
      sseSend(res, { type: "error", error: err?.message || "Unknown error" });
    } catch {}
    clearInterval(heartbeat);
    return res.end();
  }
}
