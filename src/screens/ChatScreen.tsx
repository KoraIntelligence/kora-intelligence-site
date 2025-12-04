import React, { useEffect, useState } from "react";

import ChatLayout from "@/components/unifiedchat/ChatLayout";
import ChatWindow from "@/components/unifiedchat/ChatWindow";
import Sidebar from "@/components/unifiedchat/Sidebar";
import IdentityOverlay from "@/components/unifiedchat/IdentityOverlay";
import ToneSelector from "@/components/unifiedchat/ToneSelector";

import type { Message as BaseMessage } from "@/types/chat";
import type { SalarMode } from "@/companions/orchestrators/salar";
import type { LyraMode } from "@/companions/orchestrators/lyra";

type Companion = "salar" | "lyra";

type Message = BaseMessage & {
  meta?: any;
  attachments?: any[];
};

const uid = () => Math.random().toString(36).slice(2);

const LOCAL_KEY = "kora-mvp-chat-v1";
const USER_ID_KEY = "kora_user_id";
const SESSION_KEY_PREFIX = "kora-session";

export default function ChatScreen() {
  /* -------------------------------------------- */
  /* STATE                                         */
  /* -------------------------------------------- */
  const [companion, setCompanion] = useState<Companion>("salar");
  const [salarMode, setSalarMode] = useState<SalarMode>("commercial_chat");
  const [lyraMode, setLyraMode] = useState<LyraMode>("creative_chat");
  const [tone, setTone] = useState("calm");

  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Memory-safe user+session IDs
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionIds, setSessionIds] = useState<Record<Companion, string | null>>({
    salar: null,
    lyra: null,
  });

  const activeSessionId = sessionIds[companion];

  const [showIdentity, setShowIdentity] = useState(false);

  const activeMode: SalarMode | LyraMode =
    companion === "salar" ? salarMode : lyraMode;

  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guest_mode") === "true";

  /* -------------------------------------------- */
  /* INIT: USER ID                                 */
  /* -------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let stored = localStorage.getItem(USER_ID_KEY);
    if (!stored) {
      stored = crypto?.randomUUID?.() ?? uid();
      localStorage.setItem(USER_ID_KEY, stored);
    }
    setUserId(stored);
  }, []);

  /* -------------------------------------------- */
  /* INIT: Restore saved sessionIds                */
  /* -------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    setSessionIds({
      salar: localStorage.getItem("kora-session_salar"),
      lyra: localStorage.getItem("kora-session_lyra"),
    });
  }, []);

  /* -------------------------------------------- */
  /* INIT: Restore UI (companion/mode/tone)        */
  /* -------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.tone) setTone(saved.tone);
        if (saved.companion) setCompanion(saved.companion);
        if (saved.salarMode) setSalarMode(saved.salarMode);
        if (saved.lyraMode) setLyraMode(saved.lyraMode);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ tone, companion, salarMode, lyraMode })
      );
    }
  }, [tone, companion, salarMode, lyraMode]);

  /* -------------------------------------------- */
  /* SESSION BOOTSTRAP                             */
  /* If no session for companion → request new one */
  /* -------------------------------------------- */
  useEffect(() => {
    if (!userId || sessionIds[companion]) return;

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
        if (data.sessionId) {
          setSessionIds((prev) => ({ ...prev, [companion]: data.sessionId }));
          localStorage.setItem(
            `${SESSION_KEY_PREFIX}_${companion}`,
            data.sessionId
          );
        }
      } catch (err) {
        console.error("⚠️ Session init failed:", err);
      }
    })();
  }, [userId, companion, sessionIds, activeMode, tone]);

  /* -------------------------------------------- */
  /* LOAD HISTORY WHEN SESSION CHANGES             */
  /* -------------------------------------------- */
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
              meta: m.meta,
              attachments: m.attachments || [],
            }))
          );
        }
      } catch (err) {
        console.error("❌ Failed to load history:", err);
      }
    })();
  }, [companion, sessionIds]);

  /* -------------------------------------------- */
  /* CALL UNIFIED API                              */
  /* -------------------------------------------- */
  async function callUnified(extra: Record<string, any>) {
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
      ...extra,
    };

    const res = await fetch("/api/unified", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.sessionId) {
      setSessionIds((prev) => ({ ...prev, [companion]: data.sessionId }));
      localStorage.setItem(
        `${SESSION_KEY_PREFIX}_${companion}`,
        data.sessionId
      );
    }

    return data;
  }

  /* -------------------------------------------- */
  /* SEND MESSAGE                                  */
  /* -------------------------------------------- */
  async function handleSend({ text, action }: { text?: string; action?: string }) {
    const trimmed = text?.trim();
    if (!trimmed && !action) return;

    setSending(true);

    const userMessage: Message = {
      id: uid(),
      role: "user",
      content: action ? `[Triggered Action: ${action}]` : trimmed!,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, { id: uid(), role: "system", content: "…", ts: Date.now() }]);

    try {
      const data = await callUnified({
        input: trimmed || null,
        nextAction: action || null,
      });

      const assistantMessage: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply,
        meta: data.meta,
        attachments: data.attachments,
        ts: Date.now(),
      };

      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "system"),
        assistantMessage,
      ]);
    } catch (err) {
      console.error("❌ Send failed:", err);
    }

    setSending(false);
  }
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
  /* -------------------------------------------- */
  /* FILE UPLOAD                                   */
  /* -------------------------------------------- */
  async function handleUpload(file: File) {
    if (!file || uploading) return;

    setUploading(true);

    const tempId = uid();
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "system", content: `Uploading ${file.name}…`, ts: Date.now() },
    ]);

    try {
      const buf = await file.arrayBuffer();
      const base64 = bufferToBase64(buf);

      const data = await callUnified({
        filePayload: {
          name: file.name,
          type: file.type,
          contentBase64: base64,
        },
      });

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: data.attachments,
          meta: data.meta,
          ts: Date.now(),
        },
      ]);
    } catch (err) {
      console.error("⚠️ Upload failed:", err);
    }

    setUploading(false);
  }

  /* -------------------------------------------- */
  /* UI NODES                                      */
  /* -------------------------------------------- */
  const toneSelectorNode = (
    <ToneSelector companion={companion} value={tone} onChange={setTone} />
  );

  const sidebarNode = (
    <Sidebar
      companion={companion}
      setCompanion={setCompanion}
      salarMode={salarMode}
      setSalarMode={setSalarMode}
      lyraMode={lyraMode}
      setLyraMode={setLyraMode}
      toneSelector={toneSelectorNode}
    />
  );

  const chatWindowNode = (
    <ChatWindow
      messages={messages}
      onSend={handleSend}
      onUpload={handleUpload}
      sending={sending}
      companion={companion}
    />
  );

  /* -------------------------------------------- */
  /* RENDER                                        */
  /* -------------------------------------------- */
  return (
    <ChatLayout
      sidebar={sidebarNode}
      chatWindow={chatWindowNode}
      identityOverlay={
        showIdentity ? (
          <IdentityOverlay
            isOpen={showIdentity}
            companion={companion}
            mode={companion === "salar" ? salarMode : lyraMode}
            identity={null}
            onClose={() => setShowIdentity(false)}
          />
        ) : null
      }
    />
  );
}