// src/components/unifiedchat/ChatWindow.tsx

import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import AttachmentPreviewModal from "./AttachmentPreviewModal";

import type { Message, Attachment } from "@/types/chat";

type ChatWindowProps = {
  messages: Message[];
  onSend: (payload: { text?: string; action?: string }) => void;
  onUpload: (file: File) => void;
  sending: boolean;
  companion: "salar" | "lyra";
  topBarHeight?: number;
};

export default function ChatWindow({
  messages,
  onSend,
  onUpload,
  sending,
  companion,
}: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [previewAttachment, setPreviewAttachment] =
    useState<Attachment | null>(null);

  /* Auto-scroll on update */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const handleNextAction = (action: string) => onSend({ action });

  return (
    <div
      className="
        relative w-full h-full flex flex-col 
        bg-white dark:bg-[#0d0d0d]
        text-gray-900 dark:text-gray-100
        overflow-hidden
      "
    >
      {/* ------------------------------------------------ */}
      {/* MESSAGE LIST */}
      {/* ------------------------------------------------ */}
      <div
        ref={listRef}
        className="
          flex-1 overflow-y-auto scroll-smooth
          px-4 md:px-6 py-6 space-y-4
          bg-white dark:bg-[#0d0d0d]
          overscroll-contain
        "
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm mt-14">
            Start a conversation with{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">
              {companion}
            </span>
            .
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onOpenAttachment={(a) => setPreviewAttachment(a)}
            onNextAction={handleNextAction}
          />
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs animate-pulse pl-1 pt-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
            <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
            <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
            <span>{companion === "salar" ? "Salar" : "Lyra"} is thinking…</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------ */}
      {/* ATTACHMENT PREVIEW */}
      {/* ------------------------------------------------ */}
      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      {/* ------------------------------------------------ */}
      {/* INPUT BAR */}
      {/* ------------------------------------------------ */}
      <div
        className="
          border-t border-gray-200 dark:border-neutral-800
          bg-white dark:bg-[#111111]
          shadow-sm
          p-3
          relative
        "
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={({ text, action }) => onSend({ text, action })}
          onUpload={onUpload}
          sending={sending}
          disabled={sending}
        />
      </div>
    </div>
  );
}