// src/components/unifiedchat/NextActionButtons.tsx

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export type WorkflowMeta = {
  stageId?: string;
  stageLabel?: string;
  stageDescription?: string;
  nextStageIds?: string[];
  isTerminal?: boolean;
};

export type NextActionMeta = {
  nextActions?: string[];
  companion?: string;
  mode?: string;
  workflow?: WorkflowMeta | null;
  [key: string]: any;
};

type Props = {
  meta: NextActionMeta;
  history?: { meta?: { workflow?: WorkflowMeta | null } }[];
  onSend?: (action: string) => void;
  onRenderVisual?: () => void;
  sending?: boolean;
};

const UPLOAD_RELATED_ACTIONS = new Set([
  "request_csv",
  "request_contract_upload",
  "request_pricing_template",
]);

const LABEL_MAP: Record<string, string> = {
  refine_idea: "Refine Idea",
  explore_options: "Explore Options",
  summarise: "Summarise",
  switch_mode: "Switch Mode",
  ask_questions: "Clarify Requirements",
  draft_concepts: "Draft Concepts",
  refine_direction: "Refine Direction",
  finalise_pack: "Finalise Pack",
  content_plan: "Generate Content Plan",
  kv_direction: "Generate Visual Direction",
  request_csv: "Upload Lead List",
  segment_data: "Segment Data",
  draft_outreach: "Draft Outreach",
  refine_outreach: "Refine Outreach",
  finalise_pack_outreach: "Finalise Pack",
  ask_questions_nurture: "Clarify Nurture Requirements",
  draft_arc: "Create Narrative Arc",
  draft_emails: "Draft Emails",
  refine_emails: "Refine Emails",
  finalise_pack_nurture: "Finalise Pack",
  clarify_requirements: "Clarify Requirements",
  generate_draft_proposal: "Generate Draft",
  refine_proposal: "Refine Proposal",
  finalise_proposal: "Finalise Proposal",
  request_contract_upload: "Upload Contract",
  confirm_summary: "Summarise Contract",
  choose_analysis_path: "Choose Analysis Path",
  refine_contract_analysis: "Refine Analysis",
  finalise_contract_pack: "Finalise Pack",
  clarify_pricing_requirements: "Clarify Requirements",
  request_pricing_template: "Upload Template",
  analyse_pricing_template: "Analyse Template",
  set_pricing_strategy: "Set Pricing Strategy",
  generate_pricing_draft: "Generate Pricing Draft",
  refine_pricing: "Refine Pricing",
  finalise_pricing: "Finalise Pricing Pack",
  request_context: "Provide Context",
  provide_insight: "Provide Insight",
  deep_dive_analysis: "Deep Dive",
  refine_strategy: "Refine Strategy",
  finalise_strategy_summary: "Finalise Summary",
  render_visual: "Render Visual",
};

export default function NextActionButtons({
  meta,
  onSend,
  onRenderVisual,
  sending,
}: Props) {
  if (!meta?.nextActions || meta.nextActions.length === 0) return null;

  const companionName = meta?.companion?.toLowerCase?.() || "salar";
  const isLyra = companionName === "lyra";

  const uniqueActions = Array.from(
    new Set(meta.nextActions.filter((action) => !UPLOAD_RELATED_ACTIONS.has(action)))
  );

  if (uniqueActions.length === 0) return null;

  /* ── Accent classes ─────────────────────────────────────── */
  const primaryClass = isLyra
    ? "bg-teal-600 hover:bg-teal-500 text-white border-transparent dark:bg-teal-500 dark:hover:bg-teal-400"
    : "bg-yellow-600 hover:bg-yellow-500 text-white border-transparent dark:bg-yellow-500 dark:hover:bg-yellow-400";

  const outlineClass = isLyra
    ? "border-teal-600/40 text-teal-700 hover:bg-teal-50 hover:border-teal-500 dark:border-teal-500/30 dark:text-teal-400 dark:hover:bg-teal-500/10 dark:hover:border-teal-400"
    : "border-yellow-600/40 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 dark:border-yellow-500/30 dark:text-yellow-400 dark:hover:bg-yellow-500/10 dark:hover:border-yellow-400";

  return (
    <div
      className={`flex flex-wrap gap-2 mt-3 ${sending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {uniqueActions.map((action, i) => {
        const label = LABEL_MAP[action] || action.replace(/_/g, " ");
        const isPrimary = i === 0;

        const handleClick = () => {
          if (sending) return;
          if (action === "render_visual") {
            onRenderVisual?.();
          } else {
            onSend?.(action);
          }
        };

        return (
          <motion.div
            key={action}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: i * 0.05,
              ease: "easeOut",
            }}
          >
            <Button
              type="button"
              size="sm"
              variant={isPrimary ? "default" : "outline"}
              disabled={!!sending}
              onClick={handleClick}
              className={`
                text-xs font-medium tracking-wide transition-all duration-150
                ${isPrimary ? primaryClass : outlineClass}
              `}
            >
              {label}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
