// src/components/unifiedchat/WorkflowTopBar.tsx

import React from "react";
import type { Message as BaseMessage } from "@/types/chat";

type WorkflowMeta = {
  stageId?: string;
  stageLabel?: string;
  stageDescription?: string;
  nextStageIds?: string[];
  isTerminal?: boolean;
};

type MessageWithMeta = BaseMessage & {
  meta?: {
    workflow?: WorkflowMeta | null;
    [key: string]: any;
  };
};

type WorkflowTopBarProps = {
  companion: "salar" | "lyra";
  messages: MessageWithMeta[];
};

export default function WorkflowTopBar({
  companion,
  messages,
}: WorkflowTopBarProps) {
  // 1) Find all messages that have workflow metadata
  const workflowMessages = messages.filter(
    (m) => m.meta && m.meta.workflow && m.meta.workflow.stageId
  ) as (MessageWithMeta & { meta: { workflow: WorkflowMeta } })[];

  if (workflowMessages.length === 0) {
    // No workflow yet → no bar
    return null;
  }

  // 2) Current stage = last message with workflow
  const latest = workflowMessages[workflowMessages.length - 1];
  const current = latest.meta.workflow;

  if (!current || !current.stageId) return null;

  // 3) Build ordered list of unique stages (first time each stage appears)
  const seen = new Map<string, { id: string; label: string }>();

  for (const msg of workflowMessages) {
    const wf = msg.meta.workflow;
    if (!wf?.stageId) continue;

    if (!seen.has(wf.stageId)) {
      seen.set(wf.stageId, {
        id: wf.stageId,
        label: wf.stageLabel || wf.stageId,
      });
    }
  }

  const stages = Array.from(seen.values());
  const currentIndex = stages.findIndex((s) => s.id === current.stageId);

  // 4) Visual styling based on companion
  const isLyra = companion === "lyra";

  const bgClass = isLyra ? "bg-teal-50" : "bg-amber-50";
  const borderClass = isLyra ? "border-teal-200" : "border-amber-200";
  const accentText = isLyra ? "text-teal-700" : "text-amber-700";
  const accentDot = isLyra ? "bg-teal-500 border-teal-500" : "bg-amber-500 border-amber-500";

  return (
    <div
      className={`
        w-full border-b ${borderClass} ${bgClass}
        px-4 md:px-6 py-3
        flex flex-col md:flex-row md:items-center md:justify-between
        gap-3
      `}
    >
      {/* Left: Stage label + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500 mb-1">
          <span className={`w-2 h-2 rounded-full ${accentDot}`} />
          <span>Workflow Stage</span>
          {current.isTerminal && (
            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
              Final Stage
            </span>
          )}
        </div>

        <div className={`text-sm font-semibold ${accentText} truncate`}>
          {current.stageLabel || current.stageId}
        </div>

        {current.stageDescription && (
          <div className="mt-0.5 text-xs text-gray-600 line-clamp-2 whitespace-pre-line">
            {current.stageDescription}
          </div>
        )}
      </div>

      {/* Right: Progress nodes */}
      {stages.length > 1 && (
        <div className="flex items-center gap-2 md:ml-4">
          {stages.map((stage, idx) => {
            const isPast = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            let circleClass =
              "w-2.5 h-2.5 rounded-full border border-gray-300 bg-white";

            if (isPast) {
              circleClass = `w-2.5 h-2.5 rounded-full border ${accentDot}`;
            } else if (isCurrent) {
              circleClass = `
                w-3 h-3 rounded-full border-2
                ${accentDot}
                ring-2 ring-offset-1 ring-gray-200
              `;
            }

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center gap-1">
                  <div className={circleClass} />
                  <span className="hidden md:block text-[10px] text-gray-500 max-w-[80px] truncate text-center">
                    {stage.label}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div className="w-6 h-px bg-gray-300 hidden md:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}