import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2canvas from "html2canvas";

type Mode = "ccc" | "fmc" | "builder";
type Role = "user" | "assistant" | "system";

type Attachment =
  | { kind: "pdf"; filename: string; dataUrl: string }
  | { kind: "docx"; filename: string; dataUrl: string }
  | { kind: "xlsx"; filename: string; dataUrl: string }
  | { kind: "html"; content: string; title?: string }
  | { kind: "preview"; title: string; body: string; canvaUrl?: string };

type Message = {
  id: string;
  role: Role;
  content: string;
  ts: number;
  attachments?: Attachment[];
  meta?: {
    companion?: "CCC" | "FMC" | "Builder";
    tone?: string;
    intent?: string;
    nextActions?: string[];
  };
};

const uid = () => Math.random().toString(36).slice(2);
const LOCAL_KEY = "kora-unified-chat-v5";

export default function CompanionChatUnified() {
  const [mode, setMode] = useState<Mode>("ccc");
  const [tone, setTone] = useState("calm");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [splitView, setSplitView] = useState(false);

  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guest_mode") === "true";

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  // Restore tone, mode, and splitView from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.tone) setTone(parsed.tone);
      if (parsed.mode) setMode(parsed.mode);
      if (parsed.splitView) setSplitView(parsed.splitView);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ tone, mode, splitView }));
  }, [tone, mode, splitView]);

  /* --------------------------------------------------------------
     Helpers
  -------------------------------------------------------------- */
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

  async function callSession(payload: Record<string, unknown>) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(isGuest ? { "x-guest": "true" } : {}),
    };
    const res = await fetch("/api/session", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API request failed");
    return data;
  }

  /* --------------------------------------------------------------
     File Upload
  -------------------------------------------------------------- */
  async function handleFileUpload(file: File) {
    if (!file || uploading) return;
    setUploading(true);

    const msgId = uid();
    setMessages((m) => [
      ...m,
      { id: msgId, role: "system", content: `Uploading "${file.name}"…`, ts: Date.now() },
    ]);

    try {
      const arrayBuf = await file.arrayBuffer();
      const contentBase64 = btoa(
        Array.from(new Uint8Array(arrayBuf))
          .map((b) => String.fromCharCode(b))
          .join("")
      );

      const payload = {
        mode,
        tone,
        filePayload: {
          name: file.name,
          type: file.type,
          contentBase64,
        },
        intent: "rfq_rfp_analysis",
      };

      const data = await callSession(payload);
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m.filter((msg) => msg.id !== msgId),
        {
          id: uid(),
          role: "assistant",
          content: data.reply || "File processed successfully.",
          attachments: data.attachments || [],
          meta: data.meta,
          ts: Date.now(),
        },
      ]);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setMessages((m) => [
        ...m.filter((msg) => msg.id !== msgId),
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

  /* --------------------------------------------------------------
     Send Message
  -------------------------------------------------------------- */
  async function handleSend(intentOverride?: string) {
    const content = input.trim();
    if (!content && !intentOverride) return console.warn("🟠 No input or next action triggered");
    setSending(true);
    setInput("");

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: intentOverride ? `[Triggered Action: ${intentOverride}]` : content,
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg, { id: uid(), role: "system", content: "…", ts: Date.now() }]);

    try {
      const data = await callSession({
        input: content,
        mode,
        tone,
        intent: intentOverride || undefined,
      });
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m.filter((msg) => msg.role !== "system"),
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
  /* --------------------------------------------------------------
     🎨 Render Visual (FMC → /api/fmc/render)
  -------------------------------------------------------------- */
  async function handleRenderVisual() {
    try {
      // 1️⃣ Get the latest FMC message content
      const lastMessage = [...messages].reverse().find(
        (m) => m.role === "assistant" && m.meta?.companion === "FMC"
      );

      if (!lastMessage) {
        alert("No FMC message to render yet.");
        return;
      }

      // 2️⃣ Extract title/body text for Canva render
      const title = lastMessage.content.split("\n")[0].trim().slice(0, 80);
      const body = lastMessage.content;

      // 3️⃣ Call the backend render API
      const res = await fetch("/api/fmc/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, brandHints: tone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Render request failed");

      // 4️⃣ Append a new assistant message with the preview
      const newMsg: Message = {
        id: uid(),
        role: "assistant",
        content: "✨ Visual concept rendered via Canva.",
        ts: Date.now(),
        attachments: [
          {
            kind: "preview",
            title: data.preview.title,
            body: data.preview.body,
            canvaUrl: data.url,
          },
        ],
      };

      setMessages((m) => [...m, newMsg]);
    } catch (err: any) {
      console.error("❌ FMC render error:", err.message);
      alert("Render failed — check console for details.");
    }
  }
  /* --------------------------------------------------------------
     RENDER HELPERS
  -------------------------------------------------------------- */

  const NextActionButtons = ({ meta }: { meta?: { nextActions?: string[] } }) => {
    if (!meta?.nextActions || meta.nextActions.length === 0) return null;

    const labelMap: Record<string, string> = {
      proposal_draft: "Generate Draft Proposal",
      pricing_sheet: "Generate Pricing Sheet",
      render_visual: "Render Visual Concept",
      generate_variations: "Generate Variations",
      refine_component: "Refine Component",
      generate_notes: "Generate Notes",
    };

    return (
      <div className="flex flex-wrap gap-2 mt-2">
       {meta.nextActions.map((action) => {
  if (action === "render_visual") {
    return (
      <button
        key={action}
        onClick={handleRenderVisual}
        className="px-3 py-1 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
      >
        Render Visual Concept
      </button>
    );
  }

  return (
    <button
      key={action}
      onClick={() => handleSend(action)}
      className="px-3 py-1 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700"
    >
      {labelMap[action] || action}
    </button>
  );
})}
      </div>
    );
  };

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
                <h3 className="font-semibold text-amber-700 mb-2">{att.title}</h3>
                <p className="text-gray-700 whitespace-pre-line">{att.body}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      capturePreviewAsPNG(previewId, "fmc_preview.png")
                    }
                    className="px-3 py-1 text-sm rounded-md bg-amber-600 text-white"
                  >
                    Download PNG
                  </button>
                  {att.canvaUrl && (
                    <button
                      onClick={() => window.open(att.canvaUrl, "_blank")}
                      className="px-3 py-1 text-sm rounded-md bg-purple-600 text-white"
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
                ></iframe>
                <div className="flex justify-between p-2 bg-gray-50">
                  <button
                    onClick={() => downloadHTML(att.content)}
                    className="text-sm text-amber-700 underline"
                  >
                    Download HTML
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(att.content)}
                    className="text-sm text-gray-600 underline"
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
                className="px-3 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700"
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

  const MessageBubble = ({ m }: { m: Message }) => {
    const isUser = m.role === "user";
    const isSystem = m.role === "system";

    return (
      <div
        className={`p-3 rounded-lg text-sm ${
          isSystem
            ? "text-gray-500 italic text-xs"
            : isUser
            ? "bg-amber-100 ml-auto max-w-[90%]"
            : "bg-amber-50 border-l-4 border-amber-400 max-w-[90%]"
        }`}
      >
        {isSystem ? (
          m.content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {m.content}
          </ReactMarkdown>
        )}
        <Attachments items={m.attachments} />
        <NextActionButtons meta={m.meta} />
        <div className="text-[10px] text-gray-400 mt-1">
          {new Date(m.ts).toLocaleTimeString()}
        </div>
      </div>
    );
  };

  /* --------------------------------------------------------------
     UI
  -------------------------------------------------------------- */
  return (
    <main
      className={`p-6 max-w-5xl mx-auto space-y-4 rounded-3xl shadow-sm ${
        splitView
          ? "grid grid-cols-2 gap-4 bg-amber-50"
          : "bg-gradient-to-b from-amber-50 to-white"
      }`}
    >
      <div>
        <h1 className="text-2xl font-semibold text-amber-700 mb-2">
          Unified Companion Chat
        </h1>
        <p className="text-sm text-gray-500 mb-2">
          Upload a document or chat directly with your selected Companion.
        </p>

        {sessionId && (
          <p className="text-xs text-gray-400 italic">
            Session: {sessionId} | Tone: {tone}
          </p>
        )}

        {/* Mode + Tone */}
        <div className="flex items-center justify-between bg-white/80 border border-gray-200 rounded-2xl p-2 mb-4">
          <div className="flex gap-2">
            {[
              ["ccc", "CCC – Proposal Builder"],
              ["fmc", "FMC – Full Spectrum Marketing"],
              ["builder", "Builder – Manifestation Studio"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value as Mode)}
                className={`px-4 py-2 rounded-xl text-sm ${
                  mode === value
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={splitView}
                onChange={() => setSplitView(!splitView)}
              />
              Split View
            </label>
            <span className="text-xs text-gray-500">Tone</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="border rounded-md text-sm px-2 py-1"
            >
              <option value="calm">Calm</option>
              <option value="confident">Confident</option>
              <option value="assured">Assured</option>
              <option value="curious">Curious</option>
              <option value="warm">Warm</option>
              <option value="precise">Precise</option>
            </select>
          </div>
        </div>

        {/* File Upload */}
        {mode === "ccc" && (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">
              Upload RFQ/RFP (PDF, DOCX, XLSX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx"
              disabled={uploading}
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files[0])
              }
              className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:px-3 file:py-2"
            />
          </div>
        )}

        {/* Chat Area */}
        <div
          ref={listRef}
          className="h-[420px] overflow-y-auto space-y-3 p-4 bg-white border rounded-xl"
        >
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
          className="flex gap-2 mt-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your Companion..."
            className="flex-1 border rounded-md p-2 resize-none min-h-[2.5rem]"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-amber-600 text-white px-5 py-2 rounded-md hover:bg-amber-700 disabled:opacity-60"
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}