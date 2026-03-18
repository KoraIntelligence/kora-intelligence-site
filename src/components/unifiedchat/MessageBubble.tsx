// src/components/unifiedchat/MessageBubble.tsx

import React from "react";
import Image from "next/image";
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
  isFirstInRun?: boolean;
  isTyping?: boolean;
};

export default function MessageBubble({
  message,
  onOpenAttachment,
  onNextAction,
  isFirstInRun = true,
  isTyping = false,
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
  const showWorkflow = !isUser && !isSystem && !!workflow;

  /* ── Accent tokens ─────────────────────────────────────── */
  const accentText = isLyra
    ? "text-teal-500 dark:text-teal-400"
    : "text-yellow-500 dark:text-yellow-400";

  const accentBg = isLyra
    ? "bg-teal-500/10 dark:bg-teal-500/[0.12]"
    : "bg-yellow-500/10 dark:bg-yellow-500/[0.12]";

  const accentBorder = isLyra
    ? "border-l-teal-500 dark:border-l-teal-400"
    : "border-l-yellow-500 dark:border-l-yellow-400";

  const dotColor = isLyra ? "bg-teal-400" : "bg-yellow-400";

  /* ── Typing indicator ────────────────────────────────────── */
  if (isTyping) {
    return (
      <div className="flex items-start gap-3 w-full px-1">
        {/* Avatar slot — always shown for typing */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#222222] border border-neutral-800 overflow-hidden">
          <Image
            src={`/assets/glyphs/glyph-${companion}.png`}
            alt={companion}
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dots */}
        <div
          className={`
            flex items-center gap-[5px] px-4 py-3
            border-l-[3px] ${accentBorder}
            pl-3 ml-0
          `}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-[5px] h-[5px] rounded-full ${dotColor} opacity-60`}
              style={{
                animation: `kora-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        <style jsx>{`
          @keyframes kora-pulse {
            0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  /* ── System message ─────────────────────────────────────── */
  if (isSystem) {
    return (
      <div className="flex justify-center w-full py-1">
        <span className="text-[11px] text-gray-400 dark:text-gray-400 italic tracking-wide">
          {message.content}
        </span>
      </div>
    );
  }

  /* ── User message ────────────────────────────────────────── */
  if (isUser) {
    return (
      <div className="group flex justify-end w-full">
        <div className="max-w-[72%]">
          <div
            className={`
              px-4 py-3 rounded-xl text-sm
              ${accentBg}
              text-gray-900 dark:text-gray-100
            `}
          >
            {/* File chip */}
            {!(message as any).attachments?.length &&
              rawMeta?.hasFile &&
              rawMeta?.filename && (
                <div className="mb-2">
                  <div
                    className="
                      inline-flex items-center gap-2 px-2.5 py-1.5
                      rounded-md border text-xs
                      bg-white/60 border-gray-300/60 text-gray-700
                      dark:bg-white/5 dark:border-white/10 dark:text-gray-300
                    "
                  >
                    <span className="text-[12px]">📎</span>
                    <span className="truncate max-w-[200px]">
                      {rawMeta.filename}
                    </span>
                  </div>
                </div>
              )}

            <div className="prose prose-sm max-w-none prose-invert leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>

            {Array.isArray((message as any).attachments) &&
              (message as any).attachments.length > 0 && (
                <div className="mt-2">
                  <MessageAttachments
                    items={(message as any).attachments as any}
                    onOpenAttachment={onOpenAttachment as any}
                  />
                </div>
              )}
          </div>

          {/* Timestamp — hover reveal */}
          <div className="flex justify-end mt-0.5 pr-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
              {new Date((message as any).ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Assistant message ──────────────────────────────────── */
  return (
    <div className="group flex items-start gap-3 w-full">
      {/* Avatar — only on first in run */}
      <div className="flex-shrink-0 w-7 h-7 mt-0.5">
        {isFirstInRun ? (
          <div className="w-7 h-7 rounded-full bg-[#222222] border border-neutral-800 overflow-hidden">
            <Image
              src={`/assets/glyphs/glyph-${companion}.png`}
              alt={companion}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-7 h-7" />
        )}
      </div>

      {/* Message body */}
      <div className="flex-1 min-w-0">
        <div
          className={`
            border-l-[3px] ${accentBorder}
            pl-3
          `}
        >
          {/* Header: name + mode */}
          {isFirstInRun && (
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className={`text-[11px] font-semibold tracking-wide uppercase ${accentText}`}>
                {companion[0].toUpperCase() + companion.slice(1)}
              </span>
              {displayMode && (
                <span className="text-[10px] text-gray-400 dark:text-gray-400 tracking-widest uppercase">
                  {displayMode.replace(/_/g, " ")}
                </span>
              )}
            </div>
          )}

          {/* Workflow stage */}
          {showWorkflow && workflow?.stageLabel && (
            <div className="mb-2">
              <div className={`text-[11px] font-medium tracking-wide ${accentText}`}>
                {workflow.stageLabel}
                {workflow.isTerminal && (
                  <span className="ml-1.5 text-green-500 dark:text-green-400">
                    ✓ Final
                  </span>
                )}
              </div>
              {workflow.stageDescription && (
                <div className="text-[11px] text-gray-500 dark:text-gray-500 whitespace-pre-line mt-0.5">
                  {workflow.stageDescription}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none prose-invert prose-headings:text-gray-100 prose-strong:text-gray-200 prose-a:text-yellow-400 prose-li:text-gray-200 prose-p:text-gray-200 prose-code:text-gray-200 text-gray-200 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

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

          {/* Next actions */}
          {Array.isArray(meta.nextActions) && meta.nextActions.length > 0 && (
            <div className="mt-2">
              <NextActionButtons meta={meta} onSend={onNextAction} />
            </div>
          )}

          {/* v2 scaffold: metadata slot */}
          <div data-message-meta className="hidden" />
        </div>

        {/* Timestamp — hover reveal */}
        <div className="mt-0.5 pl-3">
          <span className="text-[10px] text-gray-400 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wide">
            {new Date((message as any).ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
