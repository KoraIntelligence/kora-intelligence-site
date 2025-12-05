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
  sendMessage: (payload: { text?: string; action?: string }) => Promise<void>;
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
    if (sessionIds[companion]) return; // already have one

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
          setSessionIds((prev) => ({ ...prev, [companion]: data.sessionId }));
          localStorage.setItem(
            `${SESSION_KEY_PREFIX}_${companion}`,
            data.sessionId
          );
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
    const sid = sessionIds[companion];
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
              // CRITICAL: do NOT mutate backend meta; pass through as-is
              meta: m.meta || {},
              attachments: m.attachments || [],
            }))
          );
        }
      } catch (e) {
        console.error("❌ Error loading history after companion switch", e);
      }
    })();
  }, [companion, sessionIds]);

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

      // IMPORTANT: mirror original MVP → pass messages as-is
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

      // Persist new sessionId if backend returns one
      if (data.sessionId && typeof data.sessionId === "string") {
        setSessionIds((prev) => ({
          ...prev,
          [companion]: data.sessionId!,
        }));

        localStorage.setItem(
          `${SESSION_KEY_PREFIX}_${companion}`,
          data.sessionId!
        );
      }

      return data;
    },
    [companion, activeMode, tone, userId, activeSessionId, isGuest, messages]
  );

  /* -------------------------------------------------- */
  /* SEND MESSAGE                                       */
  /* -------------------------------------------------- */
  const sendMessage = useCallback(
    async (payload: { text?: string; action?: string }) => {
      const { text, action } = payload;
      const trimmed = text?.trim();

      if (!trimmed && !action) return;

      setSending(true);

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: action ? `[Triggered Action: ${action}]` : trimmed!,
        ts: Date.now(),
      };

      // User + temporary system placeholder
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
        const data = await callUnified({
          input: trimmed || null,
          nextAction: action || null,
        });

        const assistantMeta = data.meta || {};

        const assistantMsg: Message = {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: data.attachments || [],
          // CRITICAL: keep backend meta intact
          meta: assistantMeta,
          ts: Date.now(),
        };

        // Remove only the temporary "…" system message
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
  /* FILE UPLOAD                                        */
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
        const arrayBuf = await file.arrayBuffer();
        const base64 = btoa(
          String.fromCharCode(...Array.from(new Uint8Array(arrayBuf)))
        );

        const data = await callUnified({
          filePayload: {
            name: file.name,
            type: file.type,
            contentBase64: base64,
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

  /* -------------------------------------------------- */
  /* CLEAR MESSAGES FOR A COMPANION (optional utility)  */
  /* -------------------------------------------------- */
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