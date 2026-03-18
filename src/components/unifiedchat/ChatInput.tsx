// src/components/unifiedchat/ChatInput.tsx

import React, { useRef, useState, useCallback } from "react";
import { Paperclip, ArrowUp, X } from "lucide-react";
import { useCompanion } from "@/context/CompanionContext";

type ChatInputProps = {
  onSend: (payload: { text?: string; file?: File }) => void;
  sending: boolean;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
  sending,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "processing">("idle");
  const [isFocused, setIsFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { companion: activeCompanion } = useCompanion();
  const isLyra = activeCompanion === "lyra";

  /* ── Accent tokens ─────────────────────────────────────── */
  const accentRing = isLyra
    ? "ring-teal-500/60 dark:ring-teal-400/60"
    : "ring-yellow-500/60 dark:ring-yellow-400/60";

  const sendBg = isLyra
    ? "bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400"
    : "bg-yellow-600 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-400";

  const dotColor = isLyra ? "bg-teal-400" : "bg-yellow-400";

  /* ── Auto-resize textarea ───────────────────────────────── */
  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || sending) return;
    if (!value.trim() && !file) return;

    if (file) setUploadPhase("processing");

    const frozenFile = file;
    onSend({ text: value.trim() || undefined, file: frozenFile ?? undefined });

    setValue("");
    setFile(null);
    setUploadPhase("idle");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFilePick = () => {
    if (disabled || sending) return;
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    e.target.value = "";
  };

  const isLoading = sending || uploadPhase === "processing";
  const canSend = !disabled && (value.trim().length > 0 || !!file);

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-3 mb-3"
    >
      <div
        className={`
          relative flex flex-col
          bg-white dark:bg-[#161616]
          border rounded-xl shadow-lg
          transition-all duration-150
          ${isFocused
            ? `border-transparent ring-2 ${accentRing}`
            : "border-gray-200 dark:border-neutral-800"
          }
        `}
      >
        {/* File chip — above textarea row */}
        {file && (
          <div className="flex items-center gap-2 px-3 pt-2.5 pb-0">
            <div
              className="
                inline-flex items-center gap-2 px-2.5 py-1.5
                rounded-md border text-xs
                bg-gray-50 border-gray-200 text-gray-700
                dark:bg-white/5 dark:border-white/10 dark:text-gray-300
              "
            >
              <span className="text-[12px]">📎</span>
              <span className="truncate max-w-[180px]">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-0 px-1.5 py-1.5">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept=".pdf,.docx,.xlsx,.csv"
            onChange={handleFileChange}
          />

          {/* Paperclip — integrated left of textarea */}
          <button
            type="button"
            onClick={handleFilePick}
            disabled={disabled || sending}
            className="
              flex-shrink-0 p-2 rounded-lg
              text-gray-400 hover:text-gray-600
              dark:text-gray-400 dark:hover:text-gray-400
              transition-colors duration-150
              disabled:opacity-40
            "
          >
            <Paperclip size={16} strokeWidth={1.8} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            placeholder={
              file
                ? "Add instructions, or press send…"
                : activeCompanion === "lyra"
                ? "Ask Lyra anything…"
                : "Ask Salar anything…"
            }
            disabled={disabled || sending}
            className="
              flex-1 bg-transparent border-none outline-none resize-none
              text-sm text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-600
              py-2 px-1
              min-h-[44px] max-h-[120px] overflow-y-auto
              leading-relaxed
              disabled:opacity-60
            "
            style={{ height: "44px" }}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`
              flex-shrink-0 w-8 h-8 mb-0.5 rounded-lg
              flex items-center justify-center
              text-white transition-all duration-150
              disabled:opacity-25 disabled:cursor-not-allowed
              ${sendBg}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`w-[3px] h-[3px] rounded-full ${dotColor}`}
                    style={{ animation: `kora-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </span>
            ) : (
              <ArrowUp size={15} strokeWidth={2.5} />
            )}
          </button>

          {/* v2 scaffold: future action slot */}
          <div className="hidden" data-input-actions />
        </div>
      </div>

    </form>
  );
}
