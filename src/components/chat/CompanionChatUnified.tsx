import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode = "ccc" | "fmc" | "builder";
type Role = "user" | "assistant" | "system";

type Attachment =
  | { kind: "pdf"; filename: string; dataUrl: string }
  | { kind: "docx"; filename: string; dataUrl: string }
  | { kind: "xlsx"; filename: string; dataUrl: string }
  | { kind: "html"; content: string; title?: string }
  | { kind: "preview"; title: string; body: string };

type Message = {
  id: string;
  role: Role;
  content: string;
  ts: number;
  attachments?: Attachment[];
};

const uid = () => Math.random().toString(36).slice(2);
const LOCAL_KEY = "kora-unified-chat-v4";

export default function CompanionChatUnified() {
  const [mode, setMode] = useState<Mode>("ccc");
  const [tone, setTone] = useState("calm");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const isGuest =
    typeof window !== "undefined" &&
    localStorage.getItem("guest_mode") === "true";

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const { tone: t, mode: m } = JSON.parse(raw);
      if (t) setTone(t);
      if (m) setMode(m);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ tone, mode }));
  }, [tone, mode]);

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
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

  async function handleFileUpload(file: File) {
    if (!file || uploading) return;
    setUploading(true);

    const msgId = uid();
    setMessages((m) => [
      ...m,
      {
        id: msgId,
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
        mode: "ccc",
        tone,
        filePayload: {
          name: file.name,
          type: file.type,
          contentBase64,
        },
        intent: "rfq_rfp_analysis",
      };

      const data = await callSession(payload);
      console.log("📥 File upload response:", data);

      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m.filter((msg) => msg.id !== msgId),
        {
          id: uid(),
          role: "assistant",
          content:
            data.reply ||
            "I’ve analyzed the document. Would you like a first draft proposal?",
          attachments: data.attachments || [],
          ts: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      setMessages((m) => [
        ...m.filter((msg) => msg.id !== msgId),
        {
          id: uid(),
          role: "assistant",
          content:
            "💥 A parsing disruption occurred. Try again or upload a different file.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content,
      ts: Date.now(),
    };

    setMessages((m) => [
      ...m,
      userMsg,
      { id: uid(), role: "system", content: "…", ts: Date.now() },
    ]);

    try {
      const data = await callSession({ input: content, mode, tone });
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m.filter((msg) => msg.role !== "system"),
        {
          id: uid(),
          role: "assistant",
          content: data.reply || "The Companion has no reply.",
          attachments: data.attachments || [],
          ts: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.error("❌ Chat send error:", err);
      setMessages((m) => [
        ...m.filter((msg) => msg.role !== "system"),
        {
          id: uid(),
          role: "assistant",
          content: "⚠️ The Companion fell silent. Please try again.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const ModeTabs = () => (
    <div className="flex items-center justify-between bg-white/80 border border-gray-200 rounded-2xl p-2 mb-4">
      <div className="flex gap-2">
        {[
          ["ccc", "CCC – Proposal Builder"],
          ["fmc", "FMC – Full Spectrum Marketing"],
          ["builder", "Builder – Manifestation Studio"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              setMode(value as Mode);
              setMessages((m) => [
                ...m,
                {
                  id: uid(),
                  role: "system",
                  content: `Switched to ${label}. Personality context loaded.`,
                  ts: Date.now(),
                },
              ]);
            }}
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
      <div className="flex items-center gap-2">
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
        </select>
      </div>
    </div>
  );

  const Attachments = ({ items }: { items?: Attachment[] }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((att, idx) => {
          switch (att.kind) {
            case "pdf":
            case "docx":
            case "xlsx":
              return (
                <button
                  key={idx}
                  className="px-3 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                  onClick={() => downloadDataUrl(att.dataUrl, att.filename)}
                >
                  Download {att.kind.toUpperCase()}
                </button>
              );
            default:
              return null;
          }
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
        {m.attachments && <Attachments items={m.attachments} />}
        <div className="text-[10px] text-gray-400 mt-1">
          {new Date(m.ts).toLocaleTimeString()}
        </div>
      </div>
    );
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4 bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-sm">
      <h1 className="text-2xl font-semibold text-amber-700 mb-2">
        Unified Chat Playground
      </h1>
      <p className="text-sm text-gray-500 mb-2">
        Upload a document or chat directly with your selected Companion.
      </p>
      {sessionId && (
        <p className="text-xs text-gray-400 italic">
          Session: {sessionId} | Tone: {tone}
        </p>
      )}

      <ModeTabs />

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

      <div
        ref={listRef}
        className="h-[420px] overflow-y-auto space-y-3 p-4 bg-white border rounded-xl"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
      </div>

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
    </main>
  );
}