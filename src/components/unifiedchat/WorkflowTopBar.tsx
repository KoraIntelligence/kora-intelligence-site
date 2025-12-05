// src/components/unifiedchat/WorkflowTopBar.tsx
import React, { useEffect, useMemo, useRef } from "react";
import type { Message as BaseMessage } from "@/types/chat";
import {
  getWorkflow,
  type GenericWorkflow,
  type GenericWorkflowStage,
} from "@/companions/workflows";

import { useCompanion } from "@/context/CompanionContext";
import { useUIState } from "@/context/UIStateContext";

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
  };
};

type WorkflowTopBarProps = {
  companion: "salar" | "lyra";
  messages: MessageWithMeta[];
};

/* -----------------------------------------------------------
   Build stage order from actual workflow definition
----------------------------------------------------------- */
function buildLinearStages(workflow: GenericWorkflow): GenericWorkflowStage[] {
  const ordered: GenericWorkflowStage[] = [];
  const visited = new Set<string>();
  let cursor: string | undefined = workflow.initialStageId;

  while (cursor && !visited.has(cursor)) {
    const stage: GenericWorkflowStage | undefined = workflow.stages[cursor];
if (!stage) break;

ordered.push(stage);
visited.add(stage.id);

// nextStageIds is string[]
const nextIds: string[] = stage.nextStageIds || [];
const next: string | undefined = nextIds[0];
if (!next) break;

cursor = next;
  }

  return ordered;
}

export default function WorkflowTopBar({
  companion,
  messages,
}: WorkflowTopBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const { setTopBarHeight } = useUIState();

  // 🎯 Reliable mode source from CompanionContext
  const { salarMode, lyraMode } = useCompanion();
  const mode = companion === "salar" ? salarMode : lyraMode;

  // Collect workflow-aware messages
  const workflowMessages = useMemo(
    () =>
      messages.filter(
        (m) => m.meta?.workflow?.stageId
      ) as (MessageWithMeta & { meta: { workflow: WorkflowMeta } })[],
    [messages]
  );

  if (workflowMessages.length === 0) {
    setTopBarHeight(0);
    return null;
  }

  const latest = workflowMessages[workflowMessages.length - 1];
  const current = latest.meta.workflow;

  if (!current?.stageId) {
    setTopBarHeight(0);
    return null;
  }

  // 🎯 Obtain workflow definition safely
  const workflow: GenericWorkflow | null = getWorkflow(companion, mode);

  if (!workflow) {
    setTopBarHeight(0);
    return null;
  }

  const stages = buildLinearStages(workflow);
  const currentIndex = Math.max(
    stages.findIndex((s) => s.id === current.stageId),
    0
  );

  const activeStage = stages[currentIndex];

  /* --------------------------------------------------------
     Measure top bar height and push to UI state
  -------------------------------------------------------- */
  useEffect(() => {
    if (barRef.current) {
      setTopBarHeight(barRef.current.getBoundingClientRect().height);
    }
  }, [setTopBarHeight, currentIndex, stages.length]);

  /* --------------------------------------------------------
     Visual styling
  -------------------------------------------------------- */
  const isLyra = companion === "lyra";
  const bgClass = isLyra ? "bg-teal-50" : "bg-amber-50";
  const borderClass = isLyra ? "border-teal-200" : "border-amber-200";
  const accentText = isLyra ? "text-teal-700" : "text-amber-700";
  const accentDot =
    isLyra ? "bg-teal-500 border-teal-500" : "bg-amber-500 border-amber-500";

  /* --------------------------------------------------------
     Render
  -------------------------------------------------------- */
  return (
    <div
      ref={barRef}
      className={`
        w-full border-b ${borderClass} ${bgClass}
        px-4 md:px-6 py-3
        flex flex-col md:flex-row md:items-center md:justify-between
        gap-3
      `}
    >
      {/* LEFT SIDE: Stage details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500 mb-1">
          <span className={`w-2 h-2 rounded-full ${accentDot}`} />
          <span>Workflow Stage</span>

          {activeStage.isTerminal && (
            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
              Final Stage
            </span>
          )}
        </div>

        <div className={`text-sm font-semibold ${accentText} truncate`}>
          {activeStage.label}
        </div>

        {activeStage.description && (
          <div className="mt-0.5 text-xs text-gray-600 line-clamp-2 whitespace-pre-line">
            {activeStage.description}
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Stage indicators */}
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
              w-3 h-3 rounded-full border-2 ${accentDot}
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
    </div>
  );
}