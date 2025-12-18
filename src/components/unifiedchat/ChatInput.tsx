// src/components/unifiedchat/ChatInput.tsx

import React, { useState, useRef } from "react";
import { Paperclip, SendHorizontal, Loader2, X } from "lucide-react";

type ChatInputProps = {
  onSend: (payload: { text?: string; file?: File }) => void;
  onUpload?: (file: File) => void; // optional: for pre-processing if needed
  sending: boolean;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
  onUpload,
  disabled,
  sending,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---------------- File Handling ---------------- */

  const handleFilePick = () => {
    if (disabled || sending) return;
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store file locally instead of auto-sending
    setPendingFile(file);

    // Optional hook if parent wants to pre-process (e.g. validate)
    onUpload?.(file);

    e.target.value = "";
  };

  const removePendingFile = () => {
    setPendingFile(null);
  };

  /* ---------------- Send Handling ---------------- */

  const canSend =
    !disabled &&
    !sending &&
    (value.trim().length > 0 || pendingFile !== null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    onSend({
      text: value.trim() || undefined,
      file: pendingFile || undefined,
    });

    setValue("");
    setPendingFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full flex items-end gap-3 px-4 py-3 border-t
        bg-white dark:bg-[#111111]
        border-gray-200 dark:border-[#2a2a2a]
        transition-colors duration-150
      "
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept=".pdf,.docx,.xlsx,.csv"
        onChange={handleFileChange}
      />

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleFilePick}
        disabled={disabled || sending}
        className="
          p-2 rounded-xl border
          bg-gray-50 hover:bg-gray-100
          dark:bg-[#1b1b1b] dark:hover:bg-[#222222]
          border-gray-300 dark:border-[#333333]
          text-gray-600 dark:text-gray-300
          transition disabled:opacity-50
        "
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Input + Attachment Preview */}
      <div className="flex-1 flex flex-col gap-2">
        {pendingFile && (
          <div
            className="
              flex items-center justify-between gap-2
              px-3 py-2 rounded-lg border text-xs
              bg-gray-50 dark:bg-[#1b1b1b]
              border-gray-300 dark:border-[#333333]
              text-gray-700 dark:text-gray-300
            "
          >
            <span className="truncate">{pendingFile.name}</span>
            <button
              type="button"
              onClick={removePendingFile}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            pendingFile
              ? "Add instructions, or press send to continue…"
              : "Ask your companion…"
          }
          disabled={disabled || sending}
          className="
            w-full p-3 rounded-xl border resize-none
            bg-white dark:bg-[#1a1a1a]
            border-gray-300 dark:border-[#333333]
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            min-h-[48px] max-h-[140px]
            focus:outline-none focus:ring-0
            text-sm leading-relaxed
            transition disabled:opacity-60
          "
        />
      </div>

      {/* Send Button */}
      <button
        type="submit"
        disabled={!canSend}
        className="
          p-3 rounded-xl
          bg-amber-600 hover:bg-amber-700
          dark:bg-amber-500 dark:hover:bg-amber-600
          text-white transition disabled:opacity-70
        "
      >
        {sending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <SendHorizontal className="w-5 h-5" />
        )}
      </button>
    </form>
  );
}