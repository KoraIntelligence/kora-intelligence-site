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
   Build ordered stage list from workflow definition
----------------------------------------------------------- */
function buildLinearStages(workflow: GenericWorkflow): GenericWorkflowStage[] {
  const ordered: GenericWorkflowStage[] = [];
  const visited = new Set<string>();
  let cursor: string | undefined = workflow.initialStageId;

  while (cursor && !visited.has(cursor)) {
    const stage: GenericWorkflowStage | undefined =
      workflow.stages[cursor]; // <-- explicit type fixes “implicitly any”

    if (!stage) break;

    ordered.push(stage);
    visited.add(stage.id);

    const next: string | undefined =
      stage.nextStageIds && stage.nextStageIds.length > 0
        ? stage.nextStageIds[0]
        : undefined; // <-- explicit type fixes second error

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
  const { salarMode, lyraMode } = useCompanion();

  // Determine mode
  const mode = companion === "salar" ? salarMode : lyraMode;

  // Extract workflow-aware messages
  const workflowMessages = useMemo(
    () =>
      messages.filter(
        (m) => m.meta?.workflow?.stageId
      ) as (MessageWithMeta & { meta: { workflow: WorkflowMeta } })[],
    [messages]
  );

  // Case 1: No workflow available
  const noWorkflow = workflowMessages.length === 0;

  // Case 2: Identify current stage
  const latest = workflowMessages[workflowMessages.length - 1];
  const currentStageId = latest?.meta?.workflow?.stageId;

  // Retrieve workflow definition
  const workflow = mode ? getWorkflow(companion, mode) : null;

  // Build ordered stages if workflow present
  const stages =
    workflow && currentStageId ? buildLinearStages(workflow) : [];

  const currentIndex = stages.findIndex((s) => s.id === currentStageId);
  const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
  const activeStage = stages[safeCurrentIndex];

  /* --------------------------------------------------------
     EFFECT: Update top bar height after render
--------------------------------------------------------- */
  useEffect(() => {
    if (!barRef.current) {
      // If no workflow → bar hidden → height = 0
      setTopBarHeight(0);
      return;
    }

    setTopBarHeight(barRef.current.getBoundingClientRect().height);
  }, [workflowMessages.length, safeCurrentIndex, stages.length, setTopBarHeight]);

  /* --------------------------------------------------------
     If no workflow → render nothing
--------------------------------------------------------- */
  if (noWorkflow || !workflow || !currentStageId) {
    return null;
  }

  /* --------------------------------------------------------
     Visual styling
--------------------------------------------------------- */
  const isLyra = companion === "lyra";
  const bgClass = isLyra ? "bg-teal-50" : "bg-amber-50";
  const borderClass = isLyra ? "border-teal-200" : "border-amber-200";
  const accentText = isLyra ? "text-teal-700" : "text-amber-700";
  const accentDot =
    isLyra ? "bg-teal-500 border-teal-500" : "bg-amber-500 border-amber-500";

  /* --------------------------------------------------------
     Render bar
--------------------------------------------------------- */
  return (
    <div
      ref={barRef}
      className={`w-full border-b ${borderClass} ${bgClass}
                  px-4 md:px-6 py-3 flex flex-col md:flex-row
                  md:items-center md:justify-between gap-3`}
    >
      {/* LEFT SIDE */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-500 mb-1">
          <span className={`w-2 h-2 rounded-full ${accentDot}`} />
          <span>Workflow Stage</span>
          {activeStage?.isTerminal && (
            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
              Final Stage
            </span>
          )}
        </div>

        <div className={`text-sm font-semibold ${accentText} truncate`}>
          {activeStage?.label}
        </div>

        {activeStage?.description && (
          <div className="mt-0.5 text-xs text-gray-600 line-clamp-2 whitespace-pre-line">
            {activeStage.description}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 md:ml-4">
        {stages.map((stage, idx) => {
          const isPast = idx < safeCurrentIndex;
          const isCurrent = idx === safeCurrentIndex;

          let circleClass =
            "w-2.5 h-2.5 rounded-full border border-gray-300 bg-white";

          if (isPast) {
            circleClass = `w-2.5 h-2.5 rounded-full border ${accentDot}`;
          } else if (isCurrent) {
            circleClass = `w-3 h-3 rounded-full border-2 ${accentDot}
                            ring-2 ring-offset-1 ring-gray-200`;
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