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
  clearMessagesForCompanion: (c: Companion) => void;
};

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

// localStorage keys
const USER_ID_KEY = "kora_user_id";
const SESSION_KEY_PREFIX = "kora-session";

const uid = () => Math.random().toString(36).slice(2);

interface ProviderProps {
  children: React.ReactNode;
  tone: string;
  isGuest: boolean;
}

export function ChatSessionProvider({ children, tone, isGuest }: ProviderProps) {
  const { companion, salarMode, lyraMode } = useCompanion();

  const activeMode: SalarMode | LyraMode =
    companion === "salar" ? salarMode : lyraMode;

  const [userId, setUserId] = useState<string | null>(null);
  const [sessionIds, setSessionIds] = useState<Record<Companion, string | null>>(
    { salar: null, lyra: null }
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const activeSessionId = sessionIds[companion];

  /* ============================
     USER ID INITIALISATION
  ============================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let stored = localStorage.getItem(USER_ID_KEY);
    if (!stored) {
      stored = crypto?.randomUUID?.() ?? uid();
      localStorage.setItem(USER_ID_KEY, stored);
    }
    setUserId(stored);
  }, []);

  /* ============================
     RESTORE SESSIONS
  ============================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    setSessionIds({
      salar: localStorage.getItem(`${SESSION_KEY_PREFIX}_salar`),
      lyra: localStorage.getItem(`${SESSION_KEY_PREFIX}_lyra`),
    });
  }, []);

  /* ============================
     LAZY SESSION INITIALISATION
  ============================= */
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
          localStorage.setItem(
            `${SESSION_KEY_PREFIX}_${companion}`,
            data.sessionId
          );
          setSessionIds((prev) => ({ ...prev, [companion]: data.sessionId }));
        }
      } catch (e) {
        console.error("Error creating session:", e);
      }
    })();
  }, [userId, companion, activeMode, tone]);

  /* ============================
     LOAD HISTORY
  ============================= */
  useEffect(() => {
    const sid = sessionIds[companion];
    if (!sid) {
      setMessages([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/unified?sessionId=${sid}`);
        const data = await res.json();

        if (Array.isArray(data.messages)) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              ts: m.ts,
              attachments: m.attachments || [],
              meta: {
                ...(m.meta || {}),

                companion: m.meta?.companion || companion,
                mode: m.meta?.mode || activeMode,

                workflow: m.meta?.workflow ?? null,
                nextActions: Array.isArray(m.meta?.nextActions)
                  ? m.meta.nextActions
                  : [],
              },
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    })();
  }, [companion, sessionIds]);

  /* ============================
     CALL UNIFIED (backend)
  ============================= */
  const callUnified = useCallback(
    async (extra: Record<string, unknown>, overrideHistory?: Message[]) => {
      if (!userId) throw new Error("Missing userId");

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
          meta: { ...(m.meta || {}) },
        })),
        ...extra,
      };

      const res = await fetch("/api/unified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isGuest ? { "x-guest": "true" } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backend error");

      if (data.sessionId) {
        localStorage.setItem(
          `${SESSION_KEY_PREFIX}_${companion}`,
          data.sessionId
        );
        setSessionIds((prev) => ({ ...prev, [companion]: data.sessionId }));
      }

      return data;
    },
    [messages, companion, activeMode, tone, userId, activeSessionId, isGuest]
  );

  /* ============================
     SEND MESSAGE
  ============================= */
  const sendMessage = useCallback(
    async ({ text, action }: { text?: string; action?: string }) => {
      const trimmed = text?.trim();
      if (!trimmed && !action) return;

      setSending(true);

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: action ? `[Triggered Action: ${action}]` : trimmed!,
        ts: Date.now(),
      };

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
        const historyForTurn = [...messages, userMsg];

        const data = await callUnified(
          { input: trimmed || null, nextAction: action || null },
          historyForTurn
        );

        const assistantMsg: Message = {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: data.attachments || [],
          ts: Date.now(),
          meta: {
            ...(data.meta || {}),

            companion: data.meta?.companion || companion,
            mode: data.meta?.mode || activeMode,

            workflow: data.meta?.workflow ?? null,
            nextActions: Array.isArray(data.meta?.nextActions)
              ? data.meta.nextActions
              : [],
          },
        };

        setMessages((prev) =>
          [
            ...prev.filter(
              (msg) => !(msg.role === "system" && msg.content === "…")
            ),
            assistantMsg,
          ]
        );
      } catch (err) {
        console.error("Chat error:", err);

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
    [messages, companion, activeMode]
  );

  /* ============================
     FILE UPLOAD
  ============================= */
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
        });

        const assistantMsg: Message = {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: data.attachments || [],
          ts: Date.now(),
          meta: {
            ...(data.meta || {}),

            companion: data.meta?.companion || companion,
            mode: data.meta?.mode || activeMode,

            workflow: data.meta?.workflow ?? null,
            nextActions: Array.isArray(data.meta?.nextActions)
              ? data.meta.nextActions
              : [],
          },
        };

        setMessages((m) => [
          ...m.filter((msg) => msg.id !== tempId),
          assistantMsg,
        ]);
      } catch (err) {
        console.error("Upload error:", err);

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

  /* ============================
     CLEAR MESSAGES
  ============================= */
  const clearMessagesForCompanion = (c: Companion) => {
    if (c === companion) setMessages([]);
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
  if (!ctx)
    throw new Error("useChatSession must be used within <ChatSessionProvider>");
  return ctx;
}