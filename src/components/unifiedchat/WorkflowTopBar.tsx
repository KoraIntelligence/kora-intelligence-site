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
  meta?: { workflow?: WorkflowMeta | null };
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
    const stage: GenericWorkflowStage | undefined = workflow.stages[cursor];
    if (!stage) break;

    ordered.push(stage);
    visited.add(stage.id);

    const next: string | undefined =
      stage.nextStageIds && stage.nextStageIds.length > 0
        ? stage.nextStageIds[0]
        : undefined;

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

  const mode = companion === "salar" ? salarMode : lyraMode;

  /* Extract workflow messages */
  const workflowMessages = useMemo(
    () =>
      messages.filter(
        (m) => m.meta?.workflow?.stageId
      ) as (MessageWithMeta & { meta: { workflow: WorkflowMeta } })[],
    [messages]
  );

  if (workflowMessages.length === 0) return null;

  const latest = workflowMessages[workflowMessages.length - 1];
  const currentStageId = latest?.meta?.workflow?.stageId;

  const workflow = mode ? getWorkflow(companion, mode) : null;
  if (!workflow || !currentStageId) return null;

  const stages = buildLinearStages(workflow);
  const currentIndex = stages.findIndex((s) => s.id === currentStageId);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const activeStage = stages[safeIndex];

  /* Track height for correct chat layout */
  useEffect(() => {
    if (!barRef.current) {
      setTopBarHeight(0);
      return;
    }
    setTopBarHeight(barRef.current.getBoundingClientRect().height);
  }, [workflowMessages.length, safeIndex, stages.length, setTopBarHeight]);

  /* --------------------------------------------------------
     Soft Dark Mode Palette + Accents
--------------------------------------------------------- */
  const isLyra = companion === "lyra";

  const bgClass = isLyra
    ? "bg-teal-50 dark:bg-[#072f2f]"
    : "bg-amber-50 dark:bg-[#2f2307]";

  const borderClass = isLyra
    ? "border-teal-200 dark:border-teal-800"
    : "border-amber-200 dark:border-amber-800";

  const accentText = isLyra
    ? "text-teal-700 dark:text-teal-300"
    : "text-amber-700 dark:text-amber-300";

  const accentDot = isLyra
    ? "bg-teal-500 border-teal-500 dark:bg-teal-400 dark:border-teal-300"
    : "bg-amber-500 border-amber-500 dark:bg-amber-400 dark:border-amber-300";

  /* --------------------------------------------------------
     Render
--------------------------------------------------------- */
  return (
    <div
      ref={barRef}
      className={`
        w-full border-b ${borderClass} ${bgClass}
        px-4 md:px-6 py-3 flex flex-col md:flex-row
        md:items-center md:justify-between gap-3
        sticky top-0 z-20
        backdrop-blur-md bg-opacity-90 dark:bg-opacity-60
        transition-colors
      `}
    >
      {/* LEFT SIDE */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
          <span className={`w-2 h-2 rounded-full ${accentDot}`} />
          <span>Workflow Stage</span>

          {activeStage?.isTerminal && (
            <span
              className="
                ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                bg-green-100 text-green-700
                dark:bg-green-900/40 dark:text-green-300
              "
            >
              Final Stage
            </span>
          )}
        </div>

        <div className={`text-sm font-semibold ${accentText} truncate`}>
          {activeStage?.label}
        </div>

        {activeStage?.description && (
          <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line line-clamp-2">
            {activeStage.description}
          </div>
        )}
      </div>

      {/* RIGHT SIDE — Stage Dots */}
      <div className="flex items-center gap-2 md:ml-4">
        {stages.map((stage, idx) => {
          const isPast = idx < safeIndex;
          const isCurrent = idx === safeIndex;

          let circle = `
            w-2.5 h-2.5 rounded-full
            border border-gray-300 bg-white
            dark:border-gray-600 dark:bg-[#333]
          `;

          if (isPast) {
            circle = `w-2.5 h-2.5 rounded-full border ${accentDot}`;
          } else if (isCurrent) {
            circle = `
              w-3 h-3 rounded-full border-2 ${accentDot}
              ring-2 ring-offset-1
              ring-gray-200 dark:ring-gray-700 dark:ring-offset-[#0d0d0d]
            `;
          }

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={circle} />
                <span className="hidden md:block text-[10px] text-gray-600 dark:text-gray-400 max-w-[80px] truncate text-center">
                  {stage.label}
                </span>
              </div>

              {idx < stages.length - 1 && (
                <div className="w-6 h-px bg-gray-300 dark:bg-gray-700 hidden md:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}