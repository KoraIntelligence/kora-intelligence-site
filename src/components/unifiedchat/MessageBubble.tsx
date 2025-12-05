// src/components/unifiedchat/MessageBubble.tsx

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import MessageAttachments from "./MessageAttachments";
import NextActionButtons from "./NextActionButtons";

import type { Message, Attachment } from "@/types/chat";
import { useCompanion } from "@/context/CompanionContext";

type WorkflowMeta = {
  stageId?: string;
  stageLabel?: string;
  stageDescription?: string;
  nextStageIds?: string[];
  isTerminal?: boolean;
};

type ExtendedMeta = {
  companion?: string;
  mode?: string;
  nextActions?: string[];
  workflow?: WorkflowMeta | null;
  [key: string]: any;
};

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

  const rawMeta: ExtendedMeta = ((message as any).meta || {}) as ExtendedMeta;

  // Companion + mode fallbacks
  const { companion: activeCompanion, salarMode, lyraMode } = useCompanion();
  const metaCompanion = rawMeta.companion?.toLowerCase?.();
  const companion = (metaCompanion || activeCompanion || "salar").toLowerCase();
  const isLyra = companion === "lyra";

  const displayMode =
    rawMeta.mode ||
    (activeCompanion === "salar" ? (salarMode as string) : (lyraMode as string));

  const meta = rawMeta;
  const workflow = meta.workflow || undefined;

  // ---- Bubble styling ----
  const bubbleBase = "max-w-4xl w-full px-4 py-3 rounded-2xl text-sm";
  const bubbleUser = "bg-gray-100 text-gray-900";
  const bubbleSystem =
    "text-gray-500 text-xs italic bg-transparent shadow-none";
  const bubbleAssistant = "bg-white border shadow-sm";

  const roleStyle = isSystem
    ? bubbleSystem
    : isUser
    ? bubbleUser
    : `${bubbleAssistant} ${
        isLyra ? "border-teal-500" : "border-amber-500"
      }`;

  const showWorkflow = !isUser && !isSystem && !!workflow;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div className={`${bubbleBase} ${roleStyle}`}>
        {/* Header: Companion + Mode */}
        {!isUser && !isSystem && (
          <div className="flex justify-between items-center mb-1">
            <span
              className={`text-[11px] font-semibold ${
                isLyra ? "text-teal-600" : "text-amber-600"
              }`}
            >
              {companion[0].toUpperCase() + companion.slice(1)}
            </span>

            {displayMode && (
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                {displayMode}
              </span>
            )}
          </div>
        )}

        {/* Workflow Stage (label + description) */}
        {showWorkflow && workflow?.stageLabel && (
          <div className="mb-2">
            <div
              className={`text-[12px] font-semibold ${
                isLyra ? "text-teal-700" : "text-amber-700"
              }`}
            >
              {workflow.stageLabel}
              {workflow.isTerminal && (
                <span className="ml-1 text-green-600">(Final Stage)</span>
              )}
            </div>

            {workflow.stageDescription && (
              <div className="text-[11px] text-gray-500 whitespace-pre-line mt-1">
                {workflow.stageDescription}
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        {isSystem ? (
          <span>{message.content}</span>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Attachments */}
        {Array.isArray((message as any).attachments) &&
          (message as any).attachments.length > 0 && (
            <div className="mt-3">
              <MessageAttachments
                items={(message as any).attachments as any}
                onOpenAttachment={onOpenAttachment as any}
              />
            </div>
          )}

        {/* Next Actions */}
        {Array.isArray(meta.nextActions) && meta.nextActions.length > 0 && (
          <div className="mt-2">
            <NextActionButtons meta={meta} onSend={onNextAction} />
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