import React from "react";
import ReactMarkdown from "react-markdown";

import MessageAttachments from "./MessageAttachments";
import NextActionButtons from "./NextActionButtons";

import type { Message, Attachment } from "@/types/chat";

type MessageBubbleProps = {
  message: Message;
  onOpenAttachment?: (attachment: Attachment) => void;
  onNextAction?: (action: string) => void;
};

export default function MessageBubble({
  message,
  onOpenAttachment,
  onNextAction,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const meta = (message as any).meta || {};

  // Normalise meta.companion for UI consistency ("salar" → "Salar")
  const normalizedMeta = {
    ...meta,
    companion: meta.companion
      ? meta.companion.charAt(0).toUpperCase() + meta.companion.slice(1)
      : meta.companion,
  };

  const companionLabel =
    normalizedMeta.companion ||
    (message.role === "assistant" ? "Companion" : undefined);

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } text-sm w-full`}
    >
      <div
        className={[
          "max-w-[90%] rounded-xl px-3 py-2 shadow-sm",
          isSystem
            ? "text-gray-500 text-xs italic bg-transparent shadow-none"
            : isUser
            ? "bg-amber-100 text-gray-900"
            : "bg-amber-50 border-l-4 border-amber-400 text-gray-900",
        ].join(" ")}
      >
        {/* Header line for assistant / companion */}
        {!isUser && !isSystem && companionLabel && (
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700">
              {companionLabel}
            </span>
            {normalizedMeta.mode && (
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                {normalizedMeta.mode}
              </span>
            )}
          </div>
        )}

        {/* Message content */}
        {isSystem ? (
          <span>{message.content}</span>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3">
            <MessageAttachments
              items={message.attachments as any}
              onOpenAttachment={onOpenAttachment as any}
            />
          </div>
        )}

        {/* Next Actions */}
        {normalizedMeta.nextActions &&
          Array.isArray(normalizedMeta.nextActions) &&
          normalizedMeta.nextActions.length > 0 && (
            <div className="mt-2">
              <NextActionButtons
                meta={normalizedMeta}
                onSend={onNextAction}
              />
            </div>
          )}

        {/* Timestamp */}
        <div className="mt-1 text-[10px] text-gray-400 text-right">
          {new Date(message.ts).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}