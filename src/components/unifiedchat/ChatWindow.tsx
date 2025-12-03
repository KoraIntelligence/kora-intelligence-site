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
  topBarHeight?: number; // optional future-proofing
};

export default function ChatWindow({
  messages,
  onSend,
  onUpload,
  sending,
  companion,
  topBarHeight = 64, // reserve 64px for future workflow/top bar
}: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(
    null
  );

  // Auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleNextAction = (action: string) => onSend({ action });

  return (
    <div
      className="relative w-full bg-white"
      style={{ height: `calc(100vh - ${topBarHeight}px)` }}
    >
      {/* Message list */}
      <div
        ref={listRef}
        className="absolute top-0 left-0 right-0 bottom-16 overflow-y-auto px-6 py-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
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

      {/* Attachment preview */}
      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      {/* Input at page bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-white shadow-sm p-3">
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