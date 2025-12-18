// src/components/unifiedchat/ChatInput.tsx

import React, { useRef, useState } from "react";
import { Paperclip, SendHorizontal, Loader2, X } from "lucide-react";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (!value.trim() && !file) return;

    onSend({
      text: value.trim() || undefined,
      file: file || undefined,
    });

    setValue("");
    setFile(null);
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

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full flex flex-col gap-2 px-3 py-2
        bg-white dark:bg-[#111111]
        border-t border-gray-200 dark:border-[#2a2a2a]
      "
    >
      {/* Attachment preview */}
      {file && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1b1b1b]">
          <span className="text-xs truncate text-gray-700 dark:text-gray-200">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept=".pdf,.docx,.xlsx,.csv"
          onChange={handleFileChange}
        />

        {/* Upload button */}
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
          "
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text input */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            file
              ? "Add instructions, or press send to continue…"
              : "Ask your companion…"
          }
          disabled={disabled || sending}
          className="
            flex-1 p-3 rounded-xl border resize-none
            bg-white dark:bg-[#1a1a1a]
            border-gray-300 dark:border-[#333333]
            text-gray-900 dark:text-gray-100
            placeholder-gray-400
            min-h-[48px] max-h-[140px]
            focus:outline-none
            text-sm
          "
        />

        {/* Send button */}
        <button
  type="submit"
  disabled={disabled || (!value.trim() && !file)}
          className="
            p-3 rounded-xl
            bg-amber-600 hover:bg-amber-700
            text-white disabled:opacity-60
          "
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SendHorizontal className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}