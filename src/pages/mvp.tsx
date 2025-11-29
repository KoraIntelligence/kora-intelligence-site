// src/pages/mvp.tsx

import React, { useEffect, useRef, useState } from "react";

// Layout + UI components
import ChatLayout from "@/components/unifiedchat/ChatLayout";
import Sidebar from "@/components/unifiedchat/Sidebar";
import ToneSelector from "@/components/unifiedchat/ToneSelector";
import IdentityOverlay from "@/components/unifiedchat/IdentityOverlay";
import AttachmentPreviewModal from "@/components/unifiedchat/AttachmentPreviewModal";
import MessageBubble from "@/components/unifiedchat/MessageBubble";

// Shared chat types
import type { Message, Attachment } from "@/types/chat";

/* ------------------------------------------------------------------ */
/*  Local helper types (modes + companion)                            */
/* ------------------------------------------------------------------ */

type Companion = "salar" | "lyra";

type SalarMode =
  | "commercial_chat"
  | "proposal_builder"
  | "contract_advisor"
  | "pricing_estimation"
  | "commercial_strategist";

type LyraMode =
  | "creative_chat"
  | "messaging_advisor"
  | "campaign_builder"
  | "lead_outreach"
  | "customer_nurture";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const LOCAL_KEY = "kora-mvp-chat-v1";

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

const uid = () => Math.random().toString(36).slice(2);

/* ------------------------------------------------------------------ */
/*  MVP PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function MVP() {
  const [companion, setCompanion] = useState<Companion>("salar");
  const [salarMode, setSalarMode] = useState<SalarMode>("commercial_chat");
  const [lyraMode, setLyraMode] = useState<LyraMode>("creative_chat");
  const [tone, setTone] = useState<string>("calm");

  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [showIdentity, setShowIdentity] = useState(false);
  const [previewAttachment, setPreviewAttachment] =
    useState<Attachment | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);

  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guest_mode") === "true";

  const activeMode: SalarMode | LyraMode =
    companion === "salar" ? salarMode : lyraMode;

  /* ------------------------------------------------------------------ */
  /*  Scroll to bottom on new messages                                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  /* ------------------------------------------------------------------ */
  /*  Restore + persist companion / mode / tone                         */
  /* ------------------------------------------------------------------ */

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
    } catch {
      // ignore bad local state
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ tone, companion, salarMode, lyraMode })
    );
  }, [tone, companion, salarMode, lyraMode]);

  /* ------------------------------------------------------------------ */
  /*  API helper                                                        */
  /* ------------------------------------------------------------------ */

  async function callUnified(payload: Record<string, unknown>) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(isGuest ? { "x-guest": "true" } : {}),
    };

    const res = await fetch("/api/unified", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Unified API request failed");
    }
    return data;
  }

  /* ------------------------------------------------------------------ */
  /*  File upload                                                       */
  /* ------------------------------------------------------------------ */

  async function handleFileUpload(file: File) {
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
      } as Message,
    ]);

    try {
      const arrayBuf = await file.arrayBuffer();
      const contentBase64 = btoa(
        Array.from(new Uint8Array(arrayBuf))
          .map((b) => String.fromCharCode(b))
          .join("")
      );

      const payload = {
        companion,
        mode: activeMode,
        tone,
        filePayload: {
          name: file.name,
          type: file.type,
          contentBase64,
        },
      };

      const data = await callUnified(payload);
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m.filter((msg) => msg.id !== tempId),
        {
          id: uid(),
          role: "assistant",
          content: data.reply || "File processed successfully.",
          attachments: (data.attachments || []) as Attachment[],
          
          ts: Date.now(),
        } as Message,
      ]);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setMessages((m) => [
        ...m.filter((msg) => msg.id !== tempId),
        {
          id: uid(),
          role: "assistant",
          content: "💥 File parsing failed. Try a different file.",
          ts: Date.now(),
        } as Message,
      ]);
    } finally {
      setUploading(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Send message / trigger next actions                               */
  /* ------------------------------------------------------------------ */

  async function handleSend(nextActionTrigger?: string) {
    const trimmed = input.trim();

    if (!trimmed && !nextActionTrigger) {
      console.warn("🟠 Nothing to send.");
      return;
    }

    setSending(true);
    setInput("");

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: nextActionTrigger
        ? `[Triggered Action: ${nextActionTrigger}]`
        : trimmed,
      ts: Date.now(),
    } as Message;

    // Add user message + temporary system "spinner"
    setMessages((m) => [
      ...m,
      userMsg,
      { id: uid(), role: "system", content: "…", ts: Date.now() } as Message,
    ]);

    try {
      const payload: Record<string, unknown> = {
        companion,
        mode: activeMode,
        tone,
        input: trimmed,
      };

      if (nextActionTrigger) {
        payload.nextAction = nextActionTrigger;
      }

      const data = await callUnified(payload);
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m.filter((msg) => msg.role !== "system"),
        {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: (data.attachments || []) as Attachment[],
          
          ts: Date.now(),
        } as Message,
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
        } as Message,
      ]);
    } finally {
      setSending(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Identity snapshot for overlay                                     */
  /* ------------------------------------------------------------------ */

  const currentIdentity =
    [...messages]
      .reverse()
      .find((m) => (m.meta as any)?.identity)?.meta?.identity || null;

  /* ------------------------------------------------------------------ */
  /*  Sidebar node                                                      */
  /* ------------------------------------------------------------------ */

  const sidebarNode = (
    <Sidebar
      companion={companion}
      setCompanion={setCompanion}
      salarMode={salarMode}
      setSalarMode={setSalarMode}
      lyraMode={lyraMode}
      setLyraMode={setLyraMode}
      toneSelector={
        <ToneSelector
          companion={companion}
          value={tone}
          onChange={setTone}
        />
      }
      onFileUpload={handleFileUpload}
    />
  );

  /* ------------------------------------------------------------------ */
  /*  Chat window node (message list)                                   */
  /* ------------------------------------------------------------------ */

  const chatWindowNode = (
    <div
      ref={listRef}
      className="flex flex-col gap-3 min-h-[420px] bg-white"
    >
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-xs text-gray-400">
          Start a conversation with{" "}
          {companion === "salar" ? "Salar" : "Lyra"}…
        </div>
      )}

      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          onOpenAttachment={(att) => setPreviewAttachment(att)}
          onNextAction={(action) => handleSend(action)}
        />
      ))}
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Chat input node                                                   */
  /* ------------------------------------------------------------------ */

  const chatInputNode = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="flex gap-2"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          companion === "salar"
            ? "Ask Salar about pricing, contracts, proposals or strategy…"
            : "Ask Lyra about messaging, campaigns, outreach or nurture…"
        }
        className="flex-1 border border-amber-200 rounded-2xl px-3 py-2 text-sm resize-none min-h-[2.5rem] focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <button
        type="submit"
        disabled={sending}
        className="px-5 py-2 rounded-2xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-60"
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  );

  /* ------------------------------------------------------------------ */
  /*  Identity overlay + attachment preview                             */
  /* ------------------------------------------------------------------ */

  const identityOverlayNode = showIdentity ? (
    <IdentityOverlay
  isOpen={showIdentity}
  companion={companion}
  mode={
    companion === "salar"
      ? SALAR_MODE_LABELS[salarMode]
      : LYRA_MODE_LABELS[lyraMode]
  }
  identity={currentIdentity || null}
  onClose={() => setShowIdentity(false)}
/>
  ) : null;

  const attachmentDrawerNode = previewAttachment ? (
    <AttachmentPreviewModal
      attachment={previewAttachment}
      onClose={() => setPreviewAttachment(null)}
    />
  ) : null;

  /* ------------------------------------------------------------------ */
  /*  Render MVP                                                        */
  /* ------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-teal-50 py-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-2 md:px-0">
          <div>
            <h1 className="text-2xl font-semibold text-amber-800">
              Kora Companion Studio (MVP)
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              You’re talking to{" "}
              <span className="font-medium">
                {companion === "salar" ? "Salar" : "Lyra"}
              </span>{" "}
              in{" "}
              <span className="font-medium">
                {companion === "salar"
                  ? SALAR_MODE_LABELS[salarMode]
                  : LYRA_MODE_LABELS[lyraMode]}
              </span>{" "}
              mode.
            </p>
            {sessionId && (
              <p className="text-[10px] text-gray-400 mt-1">
                Session: {sessionId} · Tone: {tone}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowIdentity(true)}
              className="text-xs px-3 py-1 rounded-full border border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              View Identity
            </button>
          </div>
        </header>

        {/* Main Chat Layout */}
        <ChatLayout
          sidebar={sidebarNode}
          chatWindow={chatWindowNode}
          chatInput={chatInputNode}
          identityOverlay={identityOverlayNode}
          attachmentDrawer={attachmentDrawerNode}
        />
      </div>
    </main>
  );
}