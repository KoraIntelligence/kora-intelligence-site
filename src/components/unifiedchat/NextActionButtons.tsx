// src/components/unifiedchat/NextActionButtons.tsx
import React from "react";

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
  onSend?: (action: string) => void;
  onRenderVisual?: () => void;
  sending?: boolean;
};

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
  finalise_proposal: "Finalize Proposal",
  request_contract_upload: "Upload Contract",
  confirm_summary: "Summarise Contract",
  choose_analysis_path: "Choose Analysis Path",
  refine_contract_analysis: "Refine Analysis",
  finalise_contract_pack: "Finalise Pack",
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
  const actions = Array.isArray(meta?.nextActions)
    ? meta.nextActions
    : [];

  if (actions.length === 0) return null;

  const companionName = meta?.companion?.toLowerCase?.() || "salar";
  const isLyra = companionName === "lyra";

  const workflow = meta.workflow ?? null;
  const nextStageIds = new Set(workflow?.nextStageIds || []);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((action) => {
        const label = LABEL_MAP[action] || action.replace(/_/g, " ");
        const isNextStage = nextStageIds.has(action);

        let style = isNextStage
          ? "bg-green-600 text-white border border-green-700"
          : isLyra
          ? "bg-teal-600 text-white border border-teal-700"
          : "bg-amber-600 text-white border border-amber-700";

        const classes =
          `px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all ` +
          style +
          (sending ? " opacity-50 cursor-not-allowed" : "");

        if (action === "render_visual") {
          return (
            <button
              key={action}
              className={classes}
              disabled={sending}
              onClick={() => !sending && onRenderVisual?.()}
            >
              {label}
            </button>
          );
        }

        return (
          <button
            key={action}
            className={classes}
            disabled={sending}
            onClick={() => !sending && onSend?.(action)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}