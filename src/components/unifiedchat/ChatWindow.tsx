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
  topBarHeight?: number; // Deprecated but kept for backward safety
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
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden">
      {/* ------------------------------------------------ */}
      {/* MESSAGE LIST */}
      {/* ------------------------------------------------ */}
      <div
        ref={listRef}
        className="
          flex-1
          overflow-y-auto
          px-4
          md:px-6
          py-6
          space-y-4
          scroll-smooth
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-14">
            Start a conversation with{" "}
            <span className="font-semibold text-gray-700 capitalize">
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
          <div className="flex items-center gap-2 text-gray-500 text-xs animate-pulse pl-1 pt-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="w-2 h-2 rounded-full bg-gray-400" />
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
          border-t 
          bg-white 
          shadow-sm 
          p-3 
          relative
        "
        style={{
          paddingBottom: "env(safe-area-inset-bottom)", // iOS keyboard safety
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