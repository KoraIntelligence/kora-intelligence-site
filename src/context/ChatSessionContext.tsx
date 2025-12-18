// src/context/ChatSessionContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import type { Message as BaseMessage } from "@/types/chat";
import type { SalarMode } from "@/companions/orchestrators/salar";
import type { LyraMode } from "@/companions/orchestrators/lyra";
import { useCompanion } from "./CompanionContext";

type Companion = "salar" | "lyra";

type Message = BaseMessage & {
  meta?: any;
  attachments?: any[];
};

type ChatSessionContextValue = {
  userId: string | null;
  messages: Message[];
  sending: boolean;
  uploading: boolean;
  sessionIds: Record<Companion, string | null>;
  activeSessionId: string | null;

  // ✅ now supports file
  sendMessage: (payload: {
    text?: string;
    action?: string;
    file?: File;
  }) => Promise<void>;

  // kept for backwards compatibility (can be retired later)
  uploadFile: (file: File) => Promise<void>;

  clearMessagesForCompanion: (companion: Companion) => void;
};

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

// keys (match old mvp.tsx)
const USER_ID_KEY = "kora_user_id";
const SESSION_KEY_PREFIX = "kora-session";

const uid = () => Math.random().toString(36).slice(2);

interface ProviderProps {
  children: React.ReactNode;
  tone: string; // current tone from UI
  isGuest: boolean; // guest flag from localStorage
}

function fallbackMimeType(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (name.endsWith(".xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (name.endsWith(".csv")) return "text/csv";
  return "application/octet-stream";
}

async function fileToContentBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize))
    );
  }

  return btoa(binary);
}

export function ChatSessionProvider({ children, tone, isGuest }: ProviderProps) {
  const { companion, salarMode, lyraMode } = useCompanion();

  const activeMode: SalarMode | LyraMode =
    companion === "salar" ? salarMode : lyraMode;

  const [userId, setUserId] = useState<string | null>(null);
  const [sessionIds, setSessionIds] = useState<Record<Companion, string | null>>({
    salar: null,
    lyra: null,
  });

  const activeSessionId = sessionIds[companion];

  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* -------------------------------------------------- */
  /* USER ID INITIALISATION                             */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let stored = localStorage.getItem(USER_ID_KEY);
    if (!stored) {
      stored = crypto?.randomUUID?.() ?? uid();
      localStorage.setItem(USER_ID_KEY, stored);
    }
    setUserId(stored);
  }, []);

  /* -------------------------------------------------- */
  /* RESTORE PER-COMPANION SESSIONS                     */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const salarStored = localStorage.getItem(`${SESSION_KEY_PREFIX}_salar`);
    const lyraStored = localStorage.getItem(`${SESSION_KEY_PREFIX}_lyra`);

    setSessionIds({
      salar: salarStored || null,
      lyra: lyraStored || null,
    });

    console.log("🔧 Restored sessions:", {
      salar: salarStored,
      lyra: lyraStored,
    });
  }, []);

  /* -------------------------------------------------- */
  /* LAZY SESSION INITIALISATION FOR ACTIVE COMPANION   */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!userId) return;
    if (sessionIds[companion]) return;

    (async () => {
      try {
        const res = await fetch("/api/unified", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isGuest ? { "x-guest": "true" } : {}),
          },
          body: JSON.stringify({
            companion,
            mode: activeMode,
            tone,
            userId,
            sessionId: null,
            input: null,
          }),
        });

        const data = await res.json();

        if (res.ok && data.sessionId) {
          setSessionIds((prev) => {
            if (prev[companion] === data.sessionId) return prev;

            const next = { ...prev, [companion]: data.sessionId as string };
            localStorage.setItem(
              `${SESSION_KEY_PREFIX}_${companion}`,
              data.sessionId as string
            );
            return next;
          });

          console.log("🆕 Created session for companion:", companion, data.sessionId);
        } else {
          console.warn("⚠️ Failed to create session:", data.error);
        }
      } catch (e) {
        console.error("⚠️ Failed to initialize session:", e);
      }
    })();
  }, [userId, companion, sessionIds, activeMode, tone, isGuest]);

  /* -------------------------------------------------- */
  /* LOAD HISTORY WHEN COMPANION / SESSION CHANGES      */
  /* -------------------------------------------------- */
  useEffect(() => {
    const sid = activeSessionId;
    console.log("✅ Switching to companion:", companion, "sessionId:", sid);

    if (!sid) {
      console.warn("⚠️ No sessionId for companion — won’t load history");
      setMessages([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/unified?sessionId=${sid}`);
        console.log("📦 History fetch status:", res.status);
        const data = await res.json();
        console.log("📥 Loaded messages:", data.messages?.length);

        if (Array.isArray(data.messages)) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              ts: m.ts,
              meta: {
                ...(m.meta || {}),
                companion,
                workflow: m.meta?.workflow || null,
                nextActions: m.meta?.nextActions || [],
                mode: m.meta?.mode || activeMode,
              },
              attachments: m.attachments || [],
            }))
          );
        }
      } catch (e) {
        console.error("❌ Error loading history after companion switch", e);
      }
    })();
  }, [companion, activeSessionId, activeMode]);

  /* -------------------------------------------------- */
  /* HELPER: CALL UNIFIED API                           */
  /* -------------------------------------------------- */
  const callUnified = useCallback(
    async (extraPayload: Record<string, unknown>) => {
      if (!userId) {
        throw new Error("No userId initialised yet.");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(isGuest ? { "x-guest": "true" } : {}),
      };

      const payload = {
        companion,
        mode: activeMode,
        tone,
        userId,
        sessionId: activeSessionId,
        conversationHistory: messages,
        ...extraPayload,
      };

      const res = await fetch("/api/unified", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unified API request failed");

      if (data.sessionId && typeof data.sessionId === "string") {
        setSessionIds((prev) => {
          if (prev[companion] === data.sessionId) return prev;

          const next = { ...prev, [companion]: data.sessionId as string };
          localStorage.setItem(
            `${SESSION_KEY_PREFIX}_${companion}`,
            data.sessionId as string
          );
          return next;
        });
      }

      return data;
    },
    [companion, activeMode, tone, userId, activeSessionId, isGuest, messages]
  );

  /* -------------------------------------------------- */
  /* SEND MESSAGE (NOW SUPPORTS FILE ATTACHMENT)         */
  /* -------------------------------------------------- */
  const sendMessage = useCallback(
    async (payload: { text?: string; action?: string; file?: File }) => {
      const { text, action, file } = payload;
      const trimmed = text?.trim();

      // ✅ allow: text OR action OR file-only
      if (!trimmed && !action && !file) return;

      setSending(true);

      const timestamp = Date.now();
      const contentForUserBubble =
        action ? `[Triggered Action: ${action}]` : trimmed || (file ? "[Uploaded file]" : "");

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: contentForUserBubble,
        ts: timestamp,
        // optional: mark locally that a file was attached (for UI later)
        meta: file ? { hasFile: true, filename: file.name } : undefined,
      };

      setMessages((m) => [
        ...m,
        userMsg,
        {
          id: uid(),
          role: "system",
          content: "…",
          ts: Date.now(),
        },
      ]);

      try {
        let filePayload: any = null;

        if (file) {
          const contentBase64 = await fileToContentBase64(file);
          filePayload = {
            name: file.name,
            type: file.type || fallbackMimeType(file),
            contentBase64,
          };
        }

        const data = await callUnified({
          input: trimmed || (file ? "[Uploaded file]" : null),
          nextAction: action || null,
          ...(filePayload ? { filePayload } : {}),
        });

        const assistantMeta = data.meta || {};

        const assistantMsg: Message = {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: data.attachments || [],
          meta: assistantMeta,
          ts: Date.now(),
        };

        setMessages((m) => {
          const cleaned = m.filter(
            (msg) => !(msg.role === "system" && msg.content === "…")
          );
          return [...cleaned, assistantMsg];
        });
      } catch (err) {
        console.error("❌ Chat error:", err);

        setMessages((m) => [
          ...m.filter((msg) => msg.role !== "system"),
          {
            id: uid(),
            role: "assistant",
            content: "⚠️ Companion connection lost. Try again.",
            ts: Date.now(),
          },
        ]);
      }

      setSending(false);
    },
    [callUnified]
  );

  /* -------------------------------------------------- */
  /* FILE UPLOAD (LEGACY / OPTIONAL)                    */
  /* -------------------------------------------------- */
  const uploadFile = useCallback(
    async (file: File) => {
      if (!file || uploading) return;
      setUploading(true);

      const tempId = uid();
      setMessages((m) => [
        ...m,
        {
          id: tempId,
          role: "system",
          content: `Uploading "${file.name}"…`,
          ts: Date.now(),
        },
      ]);

      try {
        const contentBase64 = await fileToContentBase64(file);

        const data = await callUnified({
          filePayload: {
            name: file.name,
            type: file.type || fallbackMimeType(file),
            contentBase64,
          },
          input: null,
          nextAction: null,
        });

        const assistantMeta = data.meta || {};

        setMessages((m) => [
          ...m.filter((msg) => msg.id !== tempId),
          {
            id: uid(),
            role: "assistant",
            content: data.reply,
            attachments: data.attachments || [],
            meta: assistantMeta,
            ts: Date.now(),
          },
        ]);
      } catch (err) {
        console.error("❌ File upload error:", err);
        setMessages((m) => [
          ...m.filter((msg) => msg.id !== tempId),
          {
            id: uid(),
            role: "assistant",
            content: "⚠️ File upload failed. Try again.",
            ts: Date.now(),
          },
        ]);
      }

      setUploading(false);
    },
    [callUnified, uploading]
  );

  const clearMessagesForCompanion = (c: Companion) => {
    if (c === companion) {
      setMessages([]);
    }
  };

  return (
    <ChatSessionContext.Provider
      value={{
        userId,
        messages,
        sending,
        uploading,
        sessionIds,
        activeSessionId,
        sendMessage,
        uploadFile,
        clearMessagesForCompanion,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSession() {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) {
    throw new Error("useChatSession must be used within <ChatSessionProvider>");
  }
  return ctx;
}