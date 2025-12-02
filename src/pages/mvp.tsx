// src/pages/mvp.tsx

import React, { useEffect, useState } from "react";

import ChatWindow from "@/components/unifiedchat/ChatWindow";
import ChatLayout from "@/components/unifiedchat/ChatLayout";
import Sidebar from "@/components/unifiedchat/Sidebar";
import ToneSelector from "@/components/unifiedchat/ToneSelector";
import IdentityOverlay from "@/components/unifiedchat/IdentityOverlay";

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

const SALAR_MODE_LABELS: Record<SalarMode, string> = {
  commercial_chat: "Commercial Chat",
  proposal_builder: "Proposal Builder",
  contract_advisor: "Contract Advisor",
  pricing_estimation: "Pricing & Estimation",
  commercial_strategist: "Commercial Strategist",
};

const LYRA_MODE_LABELS: Record<LyraMode, string> = {
  creative_chat: "Creative Chat",
  messaging_advisor: "Messaging Advisor",
  campaign_builder: "Campaign Builder",
  lead_outreach: "Lead Outreach",
  customer_nurture: "Customer Nurture",
};

export default function MVP() {
  const [companion, setCompanion] = useState<Companion>("salar");
  const [salarMode, setSalarMode] = useState<SalarMode>("commercial_chat");
  const [lyraMode, setLyraMode] = useState<LyraMode>("creative_chat");
  const [tone, setTone] = useState<string>("calm");

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // --------- MEMORY-SAFE IDs ----------
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionIds, setSessionIds] = useState<Record<Companion, string | null>>({
    salar: null,
    lyra: null,
  });

  const activeSessionId = sessionIds[companion];

  // UI
  const [showIdentity, setShowIdentity] = useState(false);

  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guest_mode") === "true";

  const activeMode: SalarMode | LyraMode =
    companion === "salar" ? salarMode : lyraMode;

  /* -------------------------------------------- */
  /* USER ID INITIALIZATION                       */
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
  /* RESTORE UI STATE                             */
  /* -------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.tone) setTone(parsed.tone);
      if (parsed.companion) setCompanion(parsed.companion);
      if (parsed.salarMode) setSalarMode(parsed.salarMode);
      if (parsed.lyraMode) setLyraMode(parsed.lyraMode);
    } catch {}
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
  /* RESTORE SESSION PER COMPANION                */
  /* -------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `${SESSION_KEY_PREFIX}_${companion}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setSessionIds((prev) => ({ ...prev, [companion]: stored }));
    }
  }, [companion]);

  /* -------------------------------------------- */
/* LOAD HISTORY FROM BACKEND (PATCHED)          */
/* -------------------------------------------- */
useEffect(() => {
  const sid = sessionIds[companion];
  console.log("✅ Switching to companion:", companion, "sessionId:", sid);

  if (sid) {
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
              meta: m.meta,
              attachments: m.attachments || [],
            }))
          );
        }
      } catch (e) {
        console.error("❌ Error loading history after companion switch", e);
      }
    })();
  } else {
    console.warn("⚠️ No sessionId for companion — won’t load history");
    setMessages([]); // clear stale messages if no session
  }
}, [companion, sessionIds]);

  /* -------------------------------------------- */
  /* UNIFIED API CALL                             */
  /* -------------------------------------------- */
  async function callUnified(extraPayload: Record<string, unknown>) {
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
      conversationHistory: messages, // 🧠 Fix for Salar memory
      ...extraPayload,
    };

    const res = await fetch("/api/unified", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unified API request failed");

    // Save new sessionId
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
  }

  /* -------------------------------------------- */
  /* FILE UPLOAD                                  */
  /* -------------------------------------------- */
  async function handleFileUpload(file: File) {
    if (!file || uploading) return;
    setUploading(true);

    const tempId = uid();
    setMessages((m) => [
      ...m,
      { id: tempId, role: "system", content: `Uploading "${file.name}"…`, ts: Date.now() },
    ]);

    try {
      const arrayBuf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(arrayBuf))));

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
          meta: data.meta,
          ts: Date.now(),
        },
      ]);
    } catch (err) {
      console.error(err);
    }

    setUploading(false);
  }

  /* -------------------------------------------- */
  /* SEND MESSAGE                                 */
  /* -------------------------------------------- */
  async function handleSend(payload: { text?: string; action?: string }) {
    const { text, action } = payload;
    const trimmed = text?.trim();

    if (!trimmed && !action) return;

    setSending(true);
    setInput("");

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: action ? `[Triggered Action: ${action}]` : trimmed!,
      ts: Date.now(),
    };

    setMessages((m) => [
      ...m,
      userMsg,
      { id: uid(), role: "system", content: "…", ts: Date.now() },
    ]);

    try {
      const data = await callUnified({
        input: trimmed || null,
        nextAction: action || null,
      });

      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply,
        attachments: data.attachments || [],
        meta: data.meta,
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
          ts: Date.now(),
        },
      ]);
    }

    setSending(false);
  }

  /* -------------------------------------------- */
  /* IDENTITY SNAPSHOT                            */
  /* -------------------------------------------- */
  const currentIdentityMsg = [...messages]
    .reverse()
    .find((m) => m.meta?.identity);

  const currentIdentity = currentIdentityMsg?.meta?.identity || null;

  /* -------------------------------------------- */
  /* UI COMPONENT NODES                           */
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
      onFileUpload={handleFileUpload}
    />
  );

  const chatWindowNode = (
    <ChatWindow
      messages={messages}
      onSend={handleSend}
      onUpload={handleFileUpload}
      sending={sending}
      companion={companion}
    />
  );

  const identityOverlayNode = showIdentity ? (
    <IdentityOverlay
      isOpen={showIdentity}
      companion={companion}
      mode={
        companion === "salar"
          ? SALAR_MODE_LABELS[salarMode]
          : LYRA_MODE_LABELS[lyraMode]
      }
      identity={currentIdentity}
      onClose={() => setShowIdentity(false)}
    />
  ) : null;

  /* -------------------------------------------- */
  /* RENDER                                       */
  /* -------------------------------------------- */
  return (
    <ChatLayout
      sidebar={sidebarNode}
      chatWindow={chatWindowNode}
      chatInput={null}
      identityOverlay={identityOverlayNode}
      attachmentDrawer={null}
    />
  );
}