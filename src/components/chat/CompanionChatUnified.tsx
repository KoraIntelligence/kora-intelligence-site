import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CompanionChatUnifiedProps {
  companion?: {
    slug: string;
    title: string;
    tagline?: string;
  };
}

/* ============================================================================
   Types
============================================================================ */

type Mode = "ccc" | "fmc" | "builder";
type Role = "user" | "assistant" | "system";

type Attachment =
  | { kind: "pdf"; filename: string; dataUrl: string }
  | { kind: "docx"; filename: string; dataUrl: string }
  | { kind: "xlsx"; filename: string; dataUrl: string }
  | { kind: "image"; filename: string; dataUrl: string }
  | { kind: "code"; language: "html" | "tsx" | "jsx"; content: string }
  | { kind: "html"; content: string; title?: string }
  | { kind: "preview"; title: string; body: string }; // FMC preview card (optional struct from API)

type Message = {
  id: string;
  role: Role;
  content: string;
  ts: number;
  attachments?: Attachment[];
};

type ModeState = {
  previousResponseId?: string;
  messages: Message[];
};

type StoreShape = Record<Mode, ModeState>;

/* ============================================================================
   Helpers
============================================================================ */

const uid = () => Math.random().toString(36).slice(2);

const LOCAL_KEY = "kora-unified-chat-v2";

function loadPersisted(): {
  tone?: string;
  mode?: Mode;
  store?: StoreShape;
} | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function savePersisted(payload: unknown) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  } catch {}
}

async function downloadNodeAsPNG(node: HTMLElement, filename = "preview.png") {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(node, { scale: 2, useCORS: true });
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/* ============================================================================
   Component
============================================================================ */

export default function CompanionChatUnified({ companion }: CompanionChatUnifiedProps) {
  /* ---------------- State ---------------- */
  const [mode, setMode] = useState<Mode>("ccc");
  const [tone, setTone] = useState<string>("calm");
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [store, setStore] = useState<StoreShape>({
    ccc: { previousResponseId: undefined, messages: [] },
    fmc: { previousResponseId: undefined, messages: [] },
    builder: { previousResponseId: undefined, messages: [] },
  });

  /* Restore persisted */
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted?.tone) setTone(persisted.tone);
    if (persisted?.mode) setMode(persisted.mode);
    if (persisted?.store) setStore(persisted.store);
  }, []);

  /* Persist on change */
  useEffect(() => {
    savePersisted({ tone, mode, store });
  }, [tone, mode, store]);

  const active = store[mode] ?? { messages: [] };

  /* Scroll to bottom */
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [active.messages.length, mode]);

  /* ==========================================================================
     API: /api/session (Responses API on server)
  ========================================================================== */

  const callSession = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "API error");
    }
    return (await res.json()) as {
      reply?: string;
      responseId?: string;
      attachments?: Attachment[];
    };
  };

  /* ==========================================================================
     Send text message
  ========================================================================== */
  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content,
      ts: Date.now(),
    };

    setStore((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        messages: [
          ...prev[mode].messages,
          userMsg,
          { id: uid(), role: "system", content: "…", ts: Date.now() },
        ],
      },
    }));
    setInput("");
    setSending(true);

    try {
      const data = await callSession({
        input: content,
        mode,
        tone,
        previousResponseId: active.previousResponseId ?? null,
      });

      const assistant: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply ?? "",
        attachments: data.attachments ?? undefined,
        ts: Date.now(),
      };

      setStore((prev) => ({
        ...prev,
        [mode]: {
          previousResponseId:
            data.responseId ?? prev[mode].previousResponseId,
          messages: [
            ...prev[mode].messages.filter((m) => m.role !== "system"),
            assistant,
          ],
        },
      }));
    } catch (e) {
      setStore((prev) => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          messages: [
            ...prev[mode].messages.filter((m) => m.role !== "system"),
            {
              id: uid(),
              role: "assistant",
              content:
                "⚠️ The Companion fell silent. Please try again in a moment.",
              ts: Date.now(),
            },
          ],
        },
      }));
    } finally {
      setSending(false);
    }
  };

  /* ==========================================================================
     CCC: Upload → immediate analysis (Risk/Reward)
  ========================================================================== */
  const onUploadCCC = async (file: File) => {
    if (!file || uploading) return;
    setUploading(true);

    // add temp system msg
    const temp = {
      id: uid(),
      role: "system" as const,
      content: `Uploading “${file.name}”…`,
      ts: Date.now(),
    };
    setStore((prev) => ({
      ...prev,
      ccc: { ...prev.ccc, messages: [...prev.ccc.messages, temp] },
    }));

    try {
      const asBase64 = await readAsDataURL(file);

      const data = await callSession({
        mode: "ccc",
        tone,
        previousResponseId: store.ccc.previousResponseId ?? null,
        filePayload: {
          filename: file.name,
          mime: file.type || inferMime(file.name),
          dataUrl: asBase64,
          intent: "rfq_rfp_analysis",
        },
      });

      const assistant: Message = {
        id: uid(),
        role: "assistant",
        content:
          data.reply ??
          "I’ve analyzed the document. Would you like a first draft proposal?",
        attachments: data.attachments ?? undefined,
        ts: Date.now(),
      };

      setStore((prev) => ({
        ...prev,
        ccc: {
          previousResponseId: data.responseId ?? prev.ccc.previousResponseId,
          messages: [
            ...prev.ccc.messages.filter((m) => m.id !== temp.id),
            assistant,
          ],
        },
      }));
    } catch (e) {
      setStore((prev) => ({
        ...prev,
        ccc: {
          ...prev.ccc,
          messages: [
            ...prev.ccc.messages.filter((m) => m.id !== temp.id),
            {
              id: uid(),
              role: "assistant",
              content:
                "💥 A parsing disruption occurred. Try again or upload a different file.",
              ts: Date.now(),
            },
          ],
        },
      }));
    } finally {
      setUploading(false);
    }
  };

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  function inferMime(name: string) {
    const lower = name.toLowerCase();
    if (lower.endsWith(".pdf")) return "application/pdf";
    if (lower.endsWith(".docx"))
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (lower.endsWith(".doc")) return "application/msword";
    if (lower.endsWith(".xlsx"))
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
    return "application/octet-stream";
  }

  /* ==========================================================================
     Builder: Split preview
  ========================================================================== */
  const [split, setSplit] = useState(false);

  const latestPreviewAttachment = useMemo(() => {
    const msgs = active.messages;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (!m.attachments) continue;
      // prefer exact "html" preview
      const htmlAtt = m.attachments.find((a) => a.kind === "html") as
        | Extract<Attachment, { kind: "html" }>
        | undefined;
      if (htmlAtt) return htmlAtt;
      // fallback: code-language html as html
      const codeAtt = m.attachments.find((a) => a.kind === "code") as
        | Extract<Attachment, { kind: "code" }>
        | undefined;
      if (codeAtt && codeAtt.language === "html") {
        return { kind: "html", content: codeAtt.content } as Extract<
          Attachment,
          { kind: "html" }
        >;
      }
    }
    return null;
  }, [active.messages]);

  const renderHtmlInFrame = (html: string, title?: string) => {
    const doc = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title ?? "Preview"}</title>
<style>
  body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding:16px; }
</style>
</head>
<body>
${html}
</body>
</html>`;
    return (
      <iframe
        className="w-full h-72 rounded-lg border border-gray-200 dark:border-zinc-700"
        srcDoc={doc}
      />
    );
  };

  /* ==========================================================================
     FMC: Preview card (if provided)
  ========================================================================== */
  const latestPreviewCard = useMemo(() => {
    const msgs = active.messages;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (!m.attachments) continue;
      const card = m.attachments.find(
        (a) => a.kind === "preview"
      ) as Extract<Attachment, { kind: "preview" }> | undefined;
      if (card) return card;
    }
    return null;
  }, [active.messages]);

  const PreviewCard: React.FC<{ title: string; body: string }> = ({
    title,
    body,
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={ref}
        className="rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-800 shadow-sm"
      >
        <div className="text-xs uppercase tracking-wide text-amber-600 mb-1">
          Campaign Preview
        </div>
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{body}</p>
        <div className="mt-3">
          <button
            className="px-3 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700"
            onClick={() => {
              if (ref.current) downloadNodeAsPNG(ref.current, "campaign-preview.png");
            }}
          >
            Download Visual (PNG)
          </button>
        </div>
      </div>
    );
  };

  /* ==========================================================================
     Renderers
  ========================================================================== */

  const ModeTabs = () => {
    const modes: [Mode, string][] = [
      ["ccc", "CCC – Proposal Builder"],
      ["fmc", "FMC – Full Spectrum Marketing"],
      ["builder", "Builder – Manifestation Studio"],
    ];
    return (
      <div className="flex items-center justify-between bg-white/70 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-2xl p-1">
        <div className="flex gap-1">
          {modes.map(([value, label]: [Mode, string]) => {
            const activeTab = mode === value;
            return (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-[0.95rem] transition ${
                  activeTab
                    ? "bg-amber-600 text-white shadow"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-zinc-700/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1"
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
  };

  const Attachments: React.FC<{ items: Attachment[] }> = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((att, idx) => {
          switch (att.kind) {
            case "image":
              return (
                <img
                  key={idx}
                  src={att.dataUrl}
                  alt={att.filename}
                  className="max-h-40 rounded border"
                />
              );
            case "code":
              return (
                <CodeBlock
                  key={idx}
                  language={att.language}
                  content={att.content}
                />
              );
            case "html":
              return (
                <div key={idx} className="w-full">
                  {renderHtmlInFrame(att.content, att.title)}
                </div>
              );
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
            case "preview":
              // FMC card is rendered separately below if latest; but also render here inline if appears mid-chat
              return (
                <div key={idx} className="w-full">
                  <PreviewCard title={att.title} body={att.body} />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const CodeBlock: React.FC<{ language: string; content: string }> = ({
    language,
    content,
  }) => {
    const [copied, setCopied] = useState(false);
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase text-gray-500">{language}</span>
          <button
            className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-zinc-700"
            onClick={() => {
              navigator.clipboard.writeText(content);
              setCopied(true);
              setTimeout(() => setCopied(false), 900);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-auto rounded-lg border border-gray-200 dark:border-zinc-700 p-3 text-xs bg-gray-50 dark:bg-zinc-900 whitespace-pre-wrap">
{content}
        </pre>
      </div>
    );
  };

  const MessageBubble: React.FC<{ m: Message }> = ({ m }) => {
    const isUser = m.role === "user";
    const isSystem = m.role === "system";
    return (
      <div
        className={`relative p-3 rounded-lg text-sm whitespace-pre-wrap ${
          isSystem
            ? "text-xs text-gray-500 italic"
            : isUser
            ? "bg-amber-100 text-gray-900 text-right ml-auto max-w-[90%]"
            : "bg-amber-50 text-gray-900 border-l-4 border-amber-400 dark:bg-zinc-800 dark:text-gray-100 dark:border-amber-600 max-w-[90%]"
        }`}
      >
        {!isSystem ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {m.content}
            </ReactMarkdown>
          </div>
        ) : (
          <span>{m.content}</span>
        )}

        {m.attachments && m.attachments.length > 0 && (
          <Attachments items={m.attachments} />
        )}

        {!isSystem && (
          <span className="block text-[10px] opacity-60 mt-1">
            {new Date(m.ts).toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  };

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <section
      className={`pt-6 sm:pt-8 pb-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-4 rounded-3xl ${
        mode === "ccc"
          ? "bg-gradient-to-b from-amber-50 to-white dark:from-zinc-900 dark:to-zinc-950"
          : mode === "fmc"
          ? "bg-gradient-to-b from-teal-50 to-white dark:from-zinc-900 dark:to-zinc-950"
          : "bg-gradient-to-b from-violet-50 to-white dark:from-zinc-900 dark:to-zinc-950"
      }`}
    >
      <ModeTabs />

      {/* CCC upload row */}
      {mode === "ccc" && (
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Upload RFQ/RFP (PDF, DOCX, XLSX)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xlsx,.xls"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadCCC(f);
              // reset so same file can be re-selected
              e.currentTarget.value = "";
            }}
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:px-3 file:py-2"
          />
        </div>
      )}

      {/* Builder split toggle */}
      {mode === "builder" && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setSplit((s) => !s)}
            className="text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            {split ? "Close Preview" : "Open Preview"}
          </button>
        </div>
      )}

      {/* Chat + optional split view */}
      <div className={`grid gap-4 ${split ? "md:grid-cols-2" : ""}`}>
        <div>
          <div
            ref={listRef}
            className="messages overflow-y-auto space-y-3 p-4 rounded-xl bg-white/80 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800"
            style={{ height: 460, scrollBehavior: "smooth" }}
          >
            {active.messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
          </div>

          {/* FMC preview card (if returned by API) */}
          {mode === "fmc" && latestPreviewCard && (
            <div className="mt-3">
              <PreviewCard
                title={latestPreviewCard.title}
                body={latestPreviewCard.body}
              />
            </div>
          )}

          {/* Input row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="mt-4 flex gap-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "ccc"
                  ? "Ask CCC about pricing, proposals, or this RFQ/RFP…"
                  : mode === "fmc"
                  ? "Ask Full Spectrum Marketing Companion for tone, posts, or campaign structure…"
                  : "Ask The Builder for a layout, component, or flow…"
              }
              className="flex-1 min-h-[3rem] rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </div>

        {/* Builder live preview pane */}
        {split && mode === "builder" && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Live Preview
            </div>
            {latestPreviewAttachment ? (
              renderHtmlInFrame(latestPreviewAttachment.content)
            ) : (
              <div className="rounded-lg border border-gray-200 dark:border-zinc-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                Ask The Builder for an HTML/Tailwind snippet to preview here.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}