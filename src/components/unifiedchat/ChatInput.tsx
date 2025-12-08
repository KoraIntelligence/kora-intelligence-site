// src/components/unifiedchat/ChatInput.tsx

import React, { useState, useRef } from "react";
import { Paperclip, SendHorizontal, Loader2 } from "lucide-react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;

  onSend: (payload: { text?: string; action?: string }) => void;
  onUpload: (file: File) => void;
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
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || sending) return;
    onSend({ text: value.trim() });
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend({ text: value.trim() });
        setValue("");
      }
    }
  };

  const handleFilePick = () => {
    if (disabled || sending) return;
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);
    e.target.value = "";
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

      {/* Textarea Input */}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask your companion…"
        disabled={disabled || sending}
        className="
          flex-1 p-3 rounded-xl border resize-none
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

      {/* Send Button */}
      <button
        type="submit"
        disabled={disabled || sending}
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