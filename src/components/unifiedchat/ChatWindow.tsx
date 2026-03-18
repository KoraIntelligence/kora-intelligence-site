// src/components/unifiedchat/ChatWindow.tsx

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import AttachmentPreviewModal from "./AttachmentPreviewModal";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { Message, Attachment } from "@/types/chat";

type ChatWindowProps = {
  messages: Message[];
  onSend: (payload: { text?: string; action?: string; file?: File }) => void;
  onUpload: (file: File) => void;
  sending: boolean;
  companion: "salar" | "lyra";
  topBarHeight?: number;
};

export default function ChatWindow({
  messages,
  onSend,
  sending,
  companion,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [previewAttachment, setPreviewAttachment] =
    useState<Attachment | null>(null);

  const isLyra = companion === "lyra";
  const accentText = isLyra ? "text-teal-400" : "text-yellow-400";
  const accentBorder = isLyra ? "border-l-teal-400" : "border-l-yellow-400";
  const dotColor = isLyra ? "bg-teal-400" : "bg-yellow-400";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleNextAction = (action: string) => {
    onSend({ action });
  };

  const getIsFirstInRun = (index: number): boolean => {
    if (index === 0) return true;
    return messages[index].role !== messages[index - 1].role;
  };

  const lastMsg = messages[messages.length - 1];
  const showTyping =
    sending &&
    (!lastMsg || lastMsg.role === "user" || (lastMsg.role === "assistant" && !lastMsg.content));

  return (
    <div className="relative w-full h-full flex flex-col bg-[#171717] text-gray-100 overflow-hidden">
      <ScrollArea className="flex-1 w-full">
        <div className="max-w-2xl mx-auto w-full px-4 md:px-6 py-8 space-y-5">

          {messages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center pt-24 pb-8 select-none">
              <div className="w-14 h-14 rounded-full bg-[#222222] border border-neutral-800 overflow-hidden mb-4">
                <Image
                  src={`/assets/glyphs/glyph-${companion}.png`}
                  alt={companion}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-400 tracking-wide">
                Ask {companion[0].toUpperCase() + companion.slice(1)} anything
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onOpenAttachment={(a) => setPreviewAttachment(a)}
              onNextAction={handleNextAction}
              isFirstInRun={getIsFirstInRun(i)}
            />
          ))}

          {showTyping && (
            <motion.div
              className="flex items-start gap-3 w-full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-full bg-[#222222] border border-neutral-800 overflow-hidden">
                <Image
                  src={`/assets/glyphs/glyph-${companion}.png`}
                  alt={companion}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`border-l-[3px] ${accentBorder} pl-3 flex items-center gap-1.5 py-3`}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`block w-1.5 h-1.5 rounded-full ${dotColor}`}
                    style={{ animation: `kora-pulse 1.3s ease-in-out ${i * 0.18}s infinite` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      <div className="pb-1">
        <ChatInput sending={sending} disabled={sending} onSend={onSend} />
        <p className="text-center text-[10px] text-gray-600 pb-2 px-4 leading-relaxed">
          Kora can make mistakes. Review important outputs before using them professionally.
        </p>
      </div>
    </div>
  );
}
