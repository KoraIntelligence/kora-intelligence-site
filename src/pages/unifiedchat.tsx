// src/pages/unifiedchat.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";

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

type Role = "user" | "assistant" | "system";

type Attachment =
  | { kind: "pdf"; filename: string; dataUrl: string }
  | { kind: "docx"; filename: string; dataUrl: string }
  | { kind: "xlsx"; filename: string; dataUrl: string }
  | { kind: "html"; content: string; title?: string }
  | { kind: "preview"; title: string; body: string; canvaUrl?: string };

type MessageMeta = {
  companion?: "Salar" | "Lyra";
  mode?: string;
  tone?: string;
  intent?: string;
  // For new orchestrators: object of arrays e.g. { clarify: ["clarify_requirements"] }
  nextActions?: Record<string, string[]>;
  identity?: {
    mode?: string;
    persona?: string;
    tone?: string;
  };
};

type Message = {
  id: string;
  role: Role;
  content: string;
  ts: number;
  attachments?: Attachment[];
  meta?: MessageMeta;
};

const uid = () => Math.random().toString(36).slice(2);
const LOCAL_KEY = "kora-unified-chat-v6";

// Per-companion mode labels (slug → display)
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

// Simple tone map for now (you can expand later / make dynamic)
const TONE_OPTIONS = [
  "calm",
  "confident",
  "assured",
  "curious",
  "warm",
  "precise",
];

export default function UnifiedChat() {
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

  const listRef = useRef<HTMLDivElement>(null);

  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guest_mode") === "true";

  // Derive active mode slug per companion
  const activeMode: SalarMode | LyraMode =
    companion === "salar" ? salarMode : lyraMode;

  // ---------------------------
  // Auto-scroll
  // ---------------------------
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Restore local state (tone, companion, modes)
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
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ tone, companion, salarMode, lyraMode })
    );
  }, [tone, companion, salarMode, lyraMode]);

  // ---------------------------
  // Utilities
  // ---------------------------

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const downloadHTML = (content: string, filename = "kora_component.html") => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const capturePreviewAsPNG = async (id: string, filename: string) => {
    const node = document.getElementById(id);
    if (!node) return;
    const canvas = await html2canvas(node);
    const dataUrl = canvas.toDataURL("image/png");
    downloadDataUrl(dataUrl, filename);
  };

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

  // ---------------------------
  // File Upload
  // ---------------------------
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
      },
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
          meta: data.meta as MessageMeta,
          ts: Date.now(),
        },
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
        },
      ]);
    } finally {
      setUploading(false);
    }
  }

  // ---------------------------
  // Send Message
  // ---------------------------
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
    };

    // Optimistic system spinner
    setMessages((m) => [
      ...m,
      userMsg,
      { id: uid(), role: "system", content: "…", ts: Date.now() },
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
          meta: data.meta as MessageMeta,
          ts: Date.now(),
        },
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
    } finally {
      setSending(false);
    }
  }

  // ---------------------------
  // Next Actions
  // ---------------------------
  const NextActionButtons = ({ meta }: { meta?: MessageMeta }) => {
    if (!meta?.nextActions) return null;

    // Flatten object-of-arrays to a simple list of triggers
    const triggers: string[] = Object.values(meta.nextActions).flat();

    if (triggers.length === 0) return null;

    const labelMap: Record<string, string> = {
      clarify_requirements: "Clarify Requirements",
      generate_draft_proposal: "Generate Draft Proposal",
      refine_proposal: "Refine Proposal",
      finalise_proposal: "Finalise Proposal",
      clarify_contract_context: "Clarify Contract Context",
      request_contract_upload: "Upload Contract",
      confirm_summary: "Confirm Summary",
      choose_analysis_path: "Choose Analysis Path",
      refine_contract_analysis: "Refine Contract Analysis",
      finalise_contract_pack: "Finalise Contract Pack",
      clarify_pricing_requirements: "Clarify Pricing",
      request_pricing_template: "Upload Pricing Template",
      analyse_pricing_template: "Analyse Pricing Template",
      set_pricing_strategy: "Set Pricing Strategy",
      generate_pricing_draft: "Generate Pricing Draft",
      refine_pricing: "Refine Pricing",
      finalise_pricing: "Finalise Pricing",
      request_context: "Clarify Context",
      provide_insight: "Provide Insight",
      deep_dive_analysis: "Deep Dive",
      refine_strategy: "Refine Strategy",
      finalise_strategy_summary: "Finalise Strategy Summary",

      // Lyra generic actions
      ask_questions: "Clarify Requirements",
      draft_concepts: "Generate Concepts",
      refine_direction: "Refine Direction",
      finalise_pack: "Finalise Pack",
      content_plan: "Generate Content Plan",
      kv_direction: "Key Visual Directions",
      request_csv: "Upload Lead List",
      segment_data: "Generate Segments",
      draft_outreach: "Generate Outreach Sequence",
      refine_outreach: "Refine Outreach",
      draft_arc: "Generate Narrative Arc",
      draft_emails: "Draft Emails",
      refine_emails: "Refine Emails",

      // Freeform chat modes
      refine_thinking: "Refine This Thinking",
      explore_options: "Explore Options",
      summarise: "Summarise Conversation",
      switch_mode: "Switch to Workflow",
      refine_idea: "Refine Idea",
    };

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {triggers.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => handleSend(action)}
            className="px-3 py-1 text-xs rounded-full bg-amber-600 text-white hover:bg-amber-700 transition"
          >
            {labelMap[action] || action}
          </button>
        ))}
      </div>
    );
  };

  // ---------------------------
  // Attachments
  // ---------------------------
  const Attachments = ({ items }: { items?: Attachment[] }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mt-3 flex flex-col gap-3">
        {items.map((att, idx) => {
          if (att.kind === "preview") {
            const previewId = `preview-${idx}`;
            return (
              <div
                key={idx}
                id={previewId}
                className="border rounded-xl bg-white shadow p-4"
              >
                <h3 className="font-semibold text-amber-700 mb-2">
                  {att.title}
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{att.body}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      capturePreviewAsPNG(previewId, "lyra_preview.png")
                    }
                    className="px-3 py-1 text-xs rounded-md bg-amber-600 text-white"
                  >
                    Download PNG
                  </button>
                  {att.canvaUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(att.canvaUrl, "_blank")}
                      className="px-3 py-1 text-xs rounded-md bg-teal-600 text-white"
                    >
                      Open in Canva
                    </button>
                  )}
                </div>
              </div>
            );
          }

          if (att.kind === "html") {
            return (
              <div key={idx} className="border rounded-xl overflow-hidden">
                <iframe
                  srcDoc={att.content}
                  className="w-full h-64 border-0"
                  title={att.title || "Builder Preview"}
                />
                <div className="flex justify-between p-2 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => downloadHTML(att.content)}
                    className="text-xs text-amber-700 underline"
                  >
                    Download HTML
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(att.content || "")
                    }
                    className="text-xs text-gray-600 underline"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            );
          }

          if (["pdf", "docx", "xlsx"].includes(att.kind)) {
            return (
              <button
                key={idx}
                type="button"
                className="px-3 py-2 text-xs rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => downloadDataUrl(att.dataUrl, att.filename)}
              >
                Download {att.kind.toUpperCase()}
              </button>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // ---------------------------
  // Message Bubble
  // ---------------------------
  const MessageBubble = ({ m }: { m: Message }) => {
    const isUser = m.role === "user";
    const isSystem = m.role === "system";

    const badge =
      m.meta?.companion || m.meta?.identity?.persona || m.meta?.mode;

    return (
      <div
        className={`relative p-3 rounded-2xl text-sm shadow-sm ${
          isSystem
            ? "text-gray-500 italic text-xs bg-transparent shadow-none"
            : isUser
            ? "bg-amber-100 ml-auto max-w-[90%] rounded-br-sm"
            : "bg-white border border-amber-100 max-w-[90%] rounded-bl-sm"
        }`}
      >
        {badge && !isUser && !isSystem && (
          <div className="absolute -top-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white">
            {badge}
          </div>
        )}
        {isSystem ? (
          m.content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {m.content}
          </ReactMarkdown>
        )}
        <Attachments items={m.attachments} />
        {!isUser && !isSystem && <NextActionButtons meta={m.meta} />}
        <div className="text-[10px] text-gray-400 mt-1 text-right">
          {new Date(m.ts).toLocaleTimeString()}
        </div>
      </div>
    );
  };

  // ---------------------------
  // Identity Overlay (simple)
  // ---------------------------
  const currentIdentityMeta = messages
    .slice()
    .reverse()
    .find((m) => m.meta?.identity);

  const identityPersona = currentIdentityMeta?.meta?.identity?.persona;
  const identityTone = currentIdentityMeta?.meta?.identity?.tone;

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-teal-50 py-8">
      <div className="max-w-6xl mx-auto rounded-3xl bg-white/80 shadow-xl border border-amber-100 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-teal-50">
          <div>
            <h1 className="text-2xl font-semibold text-amber-800">
              Kora Unified Chat
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Talk to{" "}
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

          <div className="flex items-center gap-4">
            {/* Companion Toggle */}
            <div className="inline-flex bg-white rounded-full border border-amber-200 p-1">
              <button
                type="button"
                onClick={() => setCompanion("salar")}
                className={`px-3 py-1 text-xs rounded-full ${
                  companion === "salar"
                    ? "bg-amber-600 text-white"
                    : "text-gray-600 hover:bg-amber-50"
                }`}
              >
                Salar
              </button>
              <button
                type="button"
                onClick={() => setCompanion("lyra")}
                className={`px-3 py-1 text-xs rounded-full ${
                  companion === "lyra"
                    ? "bg-teal-600 text-white"
                    : "text-gray-600 hover:bg-teal-50"
                }`}
              >
                Lyra
              </button>
            </div>

            {/* Tone Selector */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Tone</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="border border-amber-200 rounded-full px-3 py-1 text-xs bg-white"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Identity */}
            <button
              type="button"
              onClick={() => setShowIdentity(true)}
              className="text-xs px-3 py-1 rounded-full border border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              View Identity
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="grid grid-cols-[260px,1fr] gap-0">
          {/* Sidebar */}
          <aside className="border-r border-amber-100 bg-amber-50/60 p-4 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-amber-700 mb-2">
                Modes
              </h2>
              <div className="space-y-1">
                {companion === "salar" &&
                  (Object.keys(SALAR_MODE_LABELS) as SalarMode[]).map(
                    (modeKey) => (
                      <button
                        key={modeKey}
                        type="button"
                        onClick={() => setSalarMode(modeKey)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                          salarMode === modeKey
                            ? "bg-amber-600 text-white"
                            : "bg-white text-gray-700 hover:bg-amber-100"
                        }`}
                      >
                        {SALAR_MODE_LABELS[modeKey]}
                      </button>
                    )
                  )}

                {companion === "lyra" &&
                  (Object.keys(LYRA_MODE_LABELS) as LyraMode[]).map(
                    (modeKey) => (
                      <button
                        key={modeKey}
                        type="button"
                        onClick={() => setLyraMode(modeKey)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                          lyraMode === modeKey
                            ? "bg-teal-600 text-white"
                            : "bg-white text-gray-700 hover:bg-teal-100"
                        }`}
                      >
                        {LYRA_MODE_LABELS[modeKey]}
                      </button>
                    )
                  )}
              </div>
            </div>

            {/* File Upload (only show for modes that naturally use docs) */}
            {(companion === "salar" &&
              ["proposal_builder", "contract_advisor", "pricing_estimation"].includes(
                activeMode
              )) ||
            (companion === "lyra" && activeMode === "lead_outreach") ? (
              <div className="mt-4">
                <label className="block text-xs text-gray-600 mb-1">
                  {companion === "salar"
                    ? "Upload RFQ / Contract / Pricing file"
                    : "Upload Lead List (CSV)"}
                </label>
                <input
                  type="file"
                  accept={
                    companion === "lyra"
                      ? ".csv,.xlsx"
                      : ".pdf,.docx,.xlsx,.csv"
                  }
                  disabled={uploading}
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files[0])
                  }
                  className="w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:px-3 file:py-2"
                />
              </div>
            ) : null}
          </aside>

          {/* Chat Panel */}
          <section className="flex flex-col">
            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 h-[480px] overflow-y-auto space-y-3 p-4 bg-white"
            >
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Start a conversation with{" "}
                  {companion === "salar" ? "Salar" : "Lyra"}…
                </div>
              )}
              {messages.map((m) => (
                <MessageBubble key={m.id} m={m} />
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-amber-100 p-3 flex gap-2 bg-amber-50/60"
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
          </section>
        </div>
      </div>

      {/* Identity Overlay (simple, text-based) */}
      {showIdentity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowIdentity(false)}
              className="absolute top-3 right-3 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-amber-800 mb-2">
              {companion === "salar" ? "Salar" : "Lyra"} Identity Snapshot
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              This uses your shared Codex and Identity layers. For now, this
              overlay shows the most recent persona + tone returned from the
              orchestrator.
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Persona:</span>{" "}
                {identityPersona || "Not yet surfaced in this session."}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Tone:</span>{" "}
                {identityTone || "Not yet surfaced in this session."}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Companion:</span>{" "}
                {companion === "salar" ? "Salar — Commercial Intelligence" : "Lyra — Brand & Marketing Intelligence"}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Mode:</span>{" "}
                {companion === "salar"
                  ? SALAR_MODE_LABELS[salarMode]
                  : LYRA_MODE_LABELS[lyraMode]}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}