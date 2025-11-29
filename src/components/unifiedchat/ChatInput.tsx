import React, { useState, useRef } from "react";
import { Paperclip, SendHorizontal, Loader2 } from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
  onUpload: (file: File) => void;
  disabled?: boolean;
  sending?: boolean;
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
    onSend(value.trim());
    setValue("");
  };

  /**
   * Enter     → send
   * Shift+Enter → newline
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value.trim());
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
    // reset input so selecting the same file again still triggers onChange
    e.target.value = "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full border-t bg-white p-4 flex items-end gap-3"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept=".pdf,.docx,.xlsx,.csv"
        onChange={handleFileChange}
      />

      {/* File upload button */}
      <button
        type="button"
        onClick={handleFilePick}
        disabled={disabled || sending}
        className="p-2 rounded-xl border bg-gray-50 hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Text Input */}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask your companion…"
        disabled={disabled || sending}
        className="flex-1 p-3 rounded-xl border bg-white resize-none min-h-[48px] max-h-[120px] focus:outline-none text-sm leading-relaxed disabled:opacity-70"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={disabled || sending}
        className="p-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition disabled:opacity-70"
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