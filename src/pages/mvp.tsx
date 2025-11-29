// src/pages/mvp.tsx

import React, { useEffect, useRef, useState } from "react";

import ChatLayout from "@/components/unifiedchat/ChatLayout";
import Sidebar from "@/components/unifiedchat/Sidebar";
import ToneSelector from "@/components/unifiedchat/ToneSelector";
import MessageBubble from "@/components/unifiedchat/MessageBubble";
import ChatInput from "@/components/unifiedchat/ChatInput";
import IdentityOverlay from "@/components/unifiedchat/IdentityOverlay";
import AttachmentPreviewModal from "@/components/unifiedchat/AttachmentPreviewModal";

import type { Message as BaseMessage } from "@/types/chat";
import type { SalarMode } from "@/companions/orchestrators/salar";
import type { LyraMode } from "@/companions/orchestrators/lyra";

type Companion = "salar" | "lyra";

type Message = BaseMessage & {
  meta?: any;
};

const uid = () => Math.random().toString(36).slice(2);
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

export default function MVP() {
  const [companion, setCompanion] = useState<Companion>("salar");
  const [salarMode, setSalarMode] = useState<SalarMode>("commercial_chat");
  const [lyraMode, setLyraMode] = useState<LyraMode>("creative_chat");
  const [tone, setTone] = useState<string>("calm");

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [showIdentity, setShowIdentity] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);

  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guest_mode") === "true";

  const activeMode: SalarMode | LyraMode =
    companion === "salar" ? salarMode : lyraMode;

  /* ------------------------------------------------------------------ */
  /* Restore + persist basic UI state                                   */
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
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ tone, companion, salarMode, lyraMode })
    );
  }, [tone, companion, salarMode, lyraMode]);

  /* ------------------------------------------------------------------ */
  /* Auto-scroll on new messages                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  /* ------------------------------------------------------------------ */
  /* Unified API helper                                                 */
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
  /* File upload                                                        */
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
          attachments: (data.attachments || []) as any[],
          meta: data.meta,
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
  /* Send message / trigger next action                                 */
  /* ------------------------------------------------------------------ */

  async function handleSend(payload: { text?: string; action?: string }) {
    const { text, action } = payload;
    const trimmed = text?.trim();

    if (!trimmed && !action) {
      console.warn("🟠 Nothing to send.");
      return;
    }

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
      {
        id: uid(),
        role: "system",
        content: "…",
        ts: Date.now(),
      } as Message,
    ]);

    try {
      const apiPayload: Record<string, unknown> = {
        companion,
        mode: activeMode,
        tone,
        input: trimmed || null,
        nextAction: action || null,
      };

      const data = await callUnified(apiPayload);
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m.filter((msg) => msg.role !== "system"),
        {
          id: uid(),
          role: "assistant",
          content: data.reply,
          attachments: (data.attachments || []) as any[],
          meta: data.meta,
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

  const handleNextAction = (action: string) => {
    handleSend({ action });
  };

  /* ------------------------------------------------------------------ */
  /* Identity snapshot                                                  */
  /* ------------------------------------------------------------------ */

  const currentIdentityMessage = [...messages]
    .reverse()
    .find((m) => (m as any).meta?.identity) as Message | undefined;

  const currentIdentity =
    (currentIdentityMessage as any)?.meta?.identity || null;

  /* ------------------------------------------------------------------ */
  /* Sidebar node                                                       */
  /* ------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------ */
  /* Chat window node                                                   */
  /* ------------------------------------------------------------------ */

  const chatWindowNode = (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
        <div>
          <div className="font-semibold text-amber-800 text-sm">
            Kora Companion Studio (MVP)
          </div>
          <div>
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
          </div>
          {sessionId && (
            <div className="text-[10px] text-gray-400 mt-1">
              Session: {sessionId} · Tone: {tone}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowIdentity(true)}
          className="text-xs px-3 py-1 rounded-full border border-amber-300 text-amber-800 hover:bg-amber-50"
        >
          View Identity
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-3"
        id="chat-scroll-container"
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
            message={m as any}
            onOpenAttachment={(att: any) => setPreviewAttachment(att)}
            onNextAction={handleNextAction}
          />
        ))}
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* Chat input node                                                    */
  /* ------------------------------------------------------------------ */

  const chatInputNode = (
    <ChatInput
      value={input}
      onChange={setInput}
      onSend={handleSend}
      onUpload={handleFileUpload}
      sending={sending}
      disabled={uploading}
    />
  );

  /* ------------------------------------------------------------------ */
  /* Identity overlay + attachment preview                              */
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
      identity={currentIdentity}
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
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <ChatLayout
      sidebar={sidebarNode}
      chatWindow={chatWindowNode}
      chatInput={chatInputNode}
      identityOverlay={identityOverlayNode}
      attachmentDrawer={attachmentDrawerNode}
    />
  );
}