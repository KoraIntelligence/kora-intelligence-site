import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import AttachmentPreviewModal from "./AttachmentPreviewModal";

import type { Message, Attachment } from "@/types/chat";

type ChatWindowProps = {
  messages: Message[];
  onSend: (text: string, nextAction?: string) => void;
  onUpload: (file: File) => void;
  sending: boolean;
  companion: "salar" | "lyra";
};

export default function ChatWindow({
  messages,
  onSend,
  onUpload,
  sending,
  companion,
}: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [previewAttachment, setPreviewAttachment] =
    useState<Attachment | null>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Workflow next-action logic
  const handleNextAction = (action: string) => {
    onSend("", action);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Messages list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-amber-50/40 to-white"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            Start a conversation with{" "}
            <span className="font-semibold text-amber-700 capitalize">
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

        {/* Typing Indicator */}
        {sending && (
          <div className="flex items-center gap-2 text-gray-500 text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>{companion === "salar" ? "Salar" : "Lyra"} is thinking…</span>
          </div>
        )}
      </div>

      {/* File preview modal */}
      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      {/* Chat Input */}
      <div className="border-t bg-white">
        <ChatInput
          onSend={(text) => onSend(text)}
          onUpload={onUpload}
          sending={sending}
          disabled={false}
        />
      </div>
    </div>
  );
}