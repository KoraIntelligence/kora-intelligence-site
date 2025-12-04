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

// keys (match your old mvp.tsx)
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
              meta: {
                ...(m.meta || {}),
                companion,   // 🔒 ensure identity is always present client-side
              },
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
    async (
      extraPayload: Record<string, unknown>,
      overrideHistory?: Message[]
    ) => {
      if (!userId) {
        throw new Error("No userId initialised yet.");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(isGuest ? { "x-guest": "true" } : {}),
      };

      const historyToSend = overrideHistory ?? messages;

      const payload = {
        companion,
        mode: activeMode,
        tone,
        userId,
        sessionId: activeSessionId,
        conversationHistory: historyToSend.map((m) => ({
          role: m.role,
          content: m.content,
          meta: {
            ...(m.meta || {}),
            companion, // sessions are per-companion, keep it explicit
          },
        })),
        ...extraPayload,
      };

      const res = await fetch("/api/unified", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unified API request failed");

      // If backend returns a sessionId, store it
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

      // Put user + temp system "…" into UI
      setMessages((m) => [
        ...m,
        userMsg,
        {
          id: uid(),
          role: "system",
          content: "…",
          meta: { companion, mode: activeMode },
          ts: Date.now(),
        },
      ]);

      try {
        const historyForThisTurn = [...messages, userMsg];

        const data = await callUnified(
          {
            input: trimmed || null,
            nextAction: action || null,
          },
          historyForThisTurn
        );

        const assistantMsg: Message = {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: data.attachments || [],
          meta: {
            ...(data.meta || {}),
            companion,
            mode: activeMode,
          },
          ts: Date.now(),
        };

        setMessages((m) => [
          ...m.filter((msg) => msg.role !== "system"),
          assistantMsg,
        ]);
      } catch (err) {
        console.error("❌ Chat error:", err);

        setMessages((m) => [
          ...m.filter((msg) => msg.role !== "system"),
          {
            id: uid(),
            role: "assistant",
            content: "⚠️ Companion connection lost. Try again.",
            meta: { companion, mode: activeMode },
            ts: Date.now(),
          },
        ]);
      }

      setSending(false);
    },
    [callUnified, messages, companion, activeMode]
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
          meta: { companion, mode: activeMode },
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

        setMessages((m) => [
          ...m.filter((msg) => msg.id !== tempId),
          {
            id: uid(),
            role: "assistant",
            content: data.reply,
            attachments: data.attachments || [],
            meta: {
              ...(data.meta || {}),
              companion,
              mode: activeMode,
            },
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
            meta: { companion, mode: activeMode },
            ts: Date.now(),
          },
        ]);
      }

      setUploading(false);
    },
    [callUnified, uploading, companion, activeMode]
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