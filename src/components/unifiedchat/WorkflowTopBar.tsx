// src/components/unifiedchat/WorkflowTopBar.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
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
  onOpenDeliverables?: () => void;
};

/* -----------------------------------------------------------
   Build ordered stage list — ORIGINAL WORKING VERSION
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
  onOpenDeliverables,
}: WorkflowTopBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const { setTopBarHeight } = useUIState();
  const { salarMode, lyraMode } = useCompanion();

  const mode = companion === "salar" ? salarMode : lyraMode;

  const workflowMessages = useMemo(
    () =>
      messages.filter(
        (m) => m.meta?.workflow?.stageId
      ) as (MessageWithMeta & { meta: { workflow: WorkflowMeta } })[],
    [messages]
  );

  const noWorkflow = workflowMessages.length === 0;
  const latest = workflowMessages[workflowMessages.length - 1];
  const currentStageId = latest?.meta?.workflow?.stageId;

  const workflow = mode ? getWorkflow(companion, mode) : null;
  const stages =
    workflow && currentStageId ? buildLinearStages(workflow) : [];

  const currentIndex = stages.findIndex((s) => s.id === currentStageId);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const activeStage = stages[safeIndex];

  useEffect(() => {
    if (!barRef.current) return setTopBarHeight(0);
    setTopBarHeight(barRef.current.getBoundingClientRect().height);
  }, [workflowMessages.length, safeIndex, stages.length, setTopBarHeight]);

  // No workflow yet — render a minimal bar so Deliverables is always accessible
  if (noWorkflow || !workflow || !currentStageId) {
    return (
      <div
        ref={barRef}
        className="relative w-full h-10 flex items-center bg-[#171717] border-b border-yellow-500/20 px-3 md:px-4"
      >
        <div className="flex-1" />
        <button
          disabled
          title="Available at export stage"
          className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-medium text-yellow-500/40 rounded-md px-2.5 py-1 cursor-default"
        >
          <Package size={12} strokeWidth={1.8} />
          <span className="hidden sm:inline">Deliverables</span>
        </button>
      </div>
    );
  }

  /* ── Accent tokens ─────────────────────────────────────── */
  const isLyra = companion === "lyra";

  const accentText = isLyra
    ? "text-teal-500 dark:text-teal-400"
    : "text-yellow-500 dark:text-yellow-400";

  const accentBorderB = isLyra
    ? "border-b border-teal-500/40 dark:border-teal-400/30"
    : "border-b border-yellow-500/40 dark:border-yellow-400/30";

  const accentDotFill = isLyra
    ? "bg-teal-500 dark:bg-teal-400"
    : "bg-yellow-500 dark:bg-yellow-400";

  const accentRing = isLyra
    ? "ring-2 ring-teal-500/25 dark:ring-teal-400/20"
    : "ring-2 ring-yellow-500/25 dark:ring-yellow-400/20";

  const accentHoverBg = isLyra
    ? "hover:bg-teal-500/10 dark:hover:bg-teal-400/10"
    : "hover:bg-yellow-500/10 dark:hover:bg-yellow-400/10";

  const deliverablesEnabled = !!activeStage?.isTerminal;

  return (
    <div
      ref={barRef}
      className={`
        relative w-full h-10 flex items-center
        bg-[#171717]
        ${accentBorderB}
        px-3 md:px-4
      `}
    >
      {/* ── Left: stage name ───────────────────────────────── */}
      <div className="hidden md:flex items-center flex-1 min-w-0">
        <span className={`text-[11px] tracking-wide ${accentText} truncate`}>
          {activeStage?.label}
        </span>
      </div>

      {/* ── Center: stage dots ─────────────────────────────── */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0">
        {stages.map((stage, idx) => {
          const isPast = idx < safeIndex;
          const isCurrent = idx === safeIndex;
          const isUpcoming = idx > safeIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center">
                {/* Dot */}
                <motion.div
                  layout
                  animate={{
                    scale: isCurrent ? 1 : 1,
                    opacity: isUpcoming ? 0.4 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`
                    rounded-full
                    ${isCurrent
                      ? `w-2.5 h-2.5 ${accentDotFill} ${accentRing}`
                      : isPast
                      ? `w-2 h-2 ${accentDotFill}`
                      : "w-2 h-2 border border-gray-300 dark:border-neutral-700 bg-transparent"
                    }
                  `}
                />

                {/* Active stage label — only active dot gets a label */}
                <div className="h-0 overflow-visible flex justify-center">
                  <AnimatePresence>
                    {isCurrent && (
                      <motion.span
                        key={stage.id}
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          absolute top-[22px]
                          text-[8px] tracking-widest uppercase whitespace-nowrap
                          ${accentText}
                        `}
                      >
                        {stage.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Connector */}
              {idx < stages.length - 1 && (
                <div className="w-5 h-px bg-gray-200 dark:bg-neutral-800 mx-0.5" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Right: Deliverables button ─────────────────────── */}
      <div className="flex items-center justify-end flex-1">
        <button
          onClick={deliverablesEnabled ? onOpenDeliverables : undefined}
          title={!deliverablesEnabled ? "Available at export stage" : undefined}
          className={`
            flex items-center gap-1.5
            text-[10px] tracking-wider uppercase font-medium
            ${accentText} ${accentHoverBg}
            rounded-md px-2.5 py-1
            transition-all duration-150
            ${!deliverablesEnabled ? "opacity-40 cursor-default" : "cursor-pointer"}
          `}
        >
          <Package size={12} strokeWidth={1.8} />
          <span className="hidden sm:inline">Deliverables</span>
        </button>
      </div>
    </div>
  );
}
