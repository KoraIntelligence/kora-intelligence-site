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

  const { companion: activeCompanion, salarMode, lyraMode } = useCompanion();
  const metaCompanion = rawMeta.companion?.toLowerCase?.();
  const companion = (metaCompanion || activeCompanion || "salar").toLowerCase();
  const isLyra = companion === "lyra";

  const displayMode =
    rawMeta.mode ||
    (activeCompanion === "salar" ? (salarMode as string) : (lyraMode as string));

  const meta = rawMeta;
  const workflow = meta.workflow || undefined;

  /* -------------------------------------------------------
     BUBBLE STYLING — SOFT DARK MODE PATCH
  ------------------------------------------------------- */
  const bubbleBase =
    "max-w-4xl w-full px-4 py-3 rounded-2xl text-sm transition-colors duration-150 shadow-sm";

  // USER MESSAGE BUBBLE — Light & Soft Dark
  const bubbleUser =
    "bg-gray-100 text-gray-900 " +
    "dark:bg-[#1a1a1a] dark:text-gray-100 dark:border dark:border-neutral-800";

  // SYSTEM MESSAGE BUBBLE — unchanged, light text only
  const bubbleSystem =
    "text-gray-500 dark:text-gray-400 text-xs italic bg-transparent shadow-none";

  // ASSISTANT MESSAGE BUBBLE — themed by companion
  const bubbleAssistant =
    "bg-white border border-gray-200 " +
    "dark:bg-[#141414] dark:border-[#2a2a2a] dark:text-gray-200";

  // Salar vs Lyra Accent Rings (dark-mode friendly)
  const accentRing = isLyra
    ? "ring-1 ring-teal-500/40 border-teal-500 dark:border-teal-400"
    : "ring-1 ring-amber-500/40 border-amber-500 dark:border-amber-400";

  const roleStyle = isSystem
    ? bubbleSystem
    : isUser
    ? bubbleUser
    : `${bubbleAssistant} ${accentRing}`;

  /* Workflow visibility */
  const showWorkflow = !isUser && !isSystem && !!workflow;

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div className={`${bubbleBase} ${roleStyle}`}>
        
        {/* Header: Companion + Mode */}
        {!isUser && !isSystem && (
          <div className="flex justify-between items-center mb-1">
            <span
              className={`text-[11px] font-semibold ${
                isLyra
                  ? "text-teal-600 dark:text-teal-300"
                  : "text-amber-600 dark:text-amber-300"
              }`}
            >
              {companion[0].toUpperCase() + companion.slice(1)}
            </span>

            {displayMode && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {displayMode}
              </span>
            )}
          </div>
        )}

        {/* Workflow Stage */}
        {showWorkflow && workflow?.stageLabel && (
          <div className="mb-2">
            <div
              className={`text-[12px] font-semibold ${
                isLyra
                  ? "text-teal-700 dark:text-teal-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {workflow.stageLabel}

              {workflow.isTerminal && (
                <span className="ml-1 text-green-600 dark:text-green-400">
                  (Final Stage)
                </span>
              )}
            </div>

            {workflow.stageDescription && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-pre-line mt-1">
                {workflow.stageDescription}
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        {isSystem ? (
          <span>{message.content}</span>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
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

        {/* User-uploaded file (pre-processing visual) */}
{isUser &&
  !isSystem &&
  !(message as any).attachments?.length &&
  rawMeta?.hasFile &&
  rawMeta?.filename && (
    <div className="mt-2">
      <div
        className="
          inline-flex items-center gap-2 px-3 py-2
          rounded-lg border text-xs
          bg-white border-gray-300 text-gray-700
          dark:bg-[#1a1a1a] dark:border-[#333333] dark:text-gray-200
        "
      >
        <span className="text-[14px]">📎</span>
        <span className="truncate max-w-[220px]">
          {rawMeta.filename}
        </span>
      </div>
    </div>
  )}  

        {/* Next Actions */}
        {Array.isArray(meta.nextActions) && meta.nextActions.length > 0 && (
          <div className="mt-2">
            <NextActionButtons meta={meta} onSend={onNextAction} />
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 text-right">
          {new Date(message.ts).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}