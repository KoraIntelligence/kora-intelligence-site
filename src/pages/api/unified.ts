// src/pages/api/unified.ts

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

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
  reply?: any;
  outputText?: any;
  attachments?: any[];
  meta?: Record<string, any>;
}

export interface ConversationTurn {
  role: "user" | "assistant" | "system";
  content: string;
  meta?: any;
}

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

/* ---------------- Deep normaliser ---------------- */

function normalizeMessageContentDeep(input: any): string {
  if (input == null) return "";

  if (typeof input === "string") return input;
  if (typeof input === "number") return String(input);
  if (typeof input === "boolean") return input ? "true" : "false";

  if (Array.isArray(input)) {
    return input
      .map((part) => {
        if (!part) return "";
        if (typeof part === "string") return part;
        if (typeof part.text === "string") return part.text;
        if (typeof part.content === "string") return part.content;
        return normalizeMessageContentDeep(part);
      })
      .join("\n");
  }

  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return String(input);
  }
}

function parseBody(req: NextApiRequest): UnifiedRequestBody {
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body as UnifiedRequestBody;
}

/* ---------------- Handler ---------------- */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🟦 unified.ts: Incoming request:", req.method);

  /* ---------- GET: history ---------- */
  if (req.method === "GET") {
    const sessionId = req.query.sessionId;
    console.log("🟦 GET history for session:", sessionId);

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Missing or invalid sessionId" });
    }

    const rows = await getMessages(sessionId);
    console.log("🟦 Loaded history rows:", rows.length);

    return res.status(200).json({
      messages: rows.map((row: any) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        ts: new Date(row.created_at).getTime(),
        meta: row.meta || undefined,
        attachments: row.attachments || [],
      })),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    console.log("🟦 Parsed body:", body);

    let {
      companion = "salar",
      mode,
      tone = "calm",
      input = "",
      nextAction = null,
      filePayload,
      userId: incomingUserId,
      sessionId: incomingSessionId,
    } = body;

    console.log("🟦 Companion:", companion, "Mode:", mode);

    if (!mode) {
      return res.status(400).json({ error: "Missing mode in request." });
    }

    



    const isGuest = req.headers["x-guest"] === "true";

/* ---------- USER ID HANDLING ---------- */
// Guests: keep existing behavior (your guest flow is working)
// Auth users: NEVER trust userId from request body; ALWAYS derive from cookies
let userId: string | null = null;

if (isGuest) {
  // 🔒 Guests ALWAYS use the shared guest profile UUID
  userId = await getGuestUserId();
} else {
  // 🔒 Auth users ALWAYS derive from cookies
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("❌ Auth error in unified.ts:", authError);
    return res.status(401).json({ error: "Not authenticated" });
  }

  userId = user.id;
}

    /* ---------- FILE HANDLING ---------- */
    let extractedText = "";
    if (filePayload) {
      try {
        extractedText = await parseUploadedFile(filePayload, filePayload.type);
        console.log("🟦 Extracted file text length:", extractedText.length);
      } catch (err) {
        console.error("❌ File parse error:", err);
        return res.status(400).json({ error: "File parsing failed." });
      }
    }

    /* ---------- SESSION HANDLING ---------- */
    let sessionId = incomingSessionId || null;

    if (!sessionId) {
      const newSession = await createSession(
        userId,       // guests → null, auth → uuid
        companion,
        "general"
      );
      sessionId = newSession.id;
      console.log("🟦 New session:", sessionId);
    }

    const rawHistory = await getMessages(sessionId as string);
    console.log("🟦 Loaded conversation history:", rawHistory.length);

    const conversationHistory: ConversationTurn[] = rawHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
      meta: m.meta || null,
    }));

    /* ---------- SAVE USER MESSAGE ---------- */
    const trimmed =
  input?.trim() ||
  (extractedText ? "User uploaded a document for analysis." : "");
    if (trimmed || nextAction) {
      const userContent = trimmed || `[Triggered Action: ${nextAction}]`;

      console.log("🟧 Saving user message:", userContent);

      await saveMessage(sessionId as string, "user", userContent, {
        meta: {
          nextAction: nextAction || undefined,
          mode,
          companion,
        },
      });
    }

    /* ---------- LOAD IDENTITY / RUN ORCHESTRATOR ---------- */
    const rawIdentity = loadIdentity(companion, mode);
    console.log("🟦 Loaded identity");

    const toneBase =
      typeof rawIdentity?.tone === "string"
        ? rawIdentity.tone
        : rawIdentity?.tone?.base;

    let orchestratorResult: OrchestratorResult;

    if (companion === "salar") {
      console.log("🟨 Running Salar orchestrator…");
      orchestratorResult = await runSalar({
        mode: mode as SalarMode,
        input: trimmed,
        extractedText,
        tone,
        nextAction: nextAction || undefined,
        conversationHistory,
      } as SalarOrchestratorInput);
    } else {
      console.log("🟨 Running Lyra orchestrator…");
      orchestratorResult = await runLyra({
        mode: mode as LyraMode,
        input: trimmed,
        extractedText,
        tone,
        nextAction: nextAction || undefined,
        conversationHistory,
      } as LyraOrchestratorInput);
    }

    console.log("🟦 Orchestrator Raw Output:", orchestratorResult);

    /* ---------- NORMALISE ASSISTANT OUTPUT ---------- */
    let replyRaw =
      orchestratorResult.outputText ||
      orchestratorResult.reply ||
      "No response generated.";

    console.log("🟦 replyRaw (pre-normalization):", replyRaw);

    const reply = normalizeMessageContentDeep(replyRaw);

    console.log("🟩 reply (post-normalization):", reply);

    let attachments = orchestratorResult.attachments || [];
    attachments = JSON.parse(JSON.stringify(attachments));

    let metaFromOrch = orchestratorResult.meta || {};
    metaFromOrch = JSON.parse(JSON.stringify(metaFromOrch));

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

    console.log("🟧 Saving assistant message…");

    await saveMessage(sessionId as string, "assistant", reply, {
      attachments,
      meta,
    });

    // Only store tone for authenticated users (userId != null)
    if (userId) {
      await saveTone(
        userId,
        companion,
        tone || "calm",
        "post-response update"
      );
    }

    console.log("🟩 Returning response to frontend");

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