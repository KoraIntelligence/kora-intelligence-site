// src/components/unifiedchat/NextActionButtons.tsx
import React from "react";

type Props = {
  meta?: {
    nextActions?: string[];
    companion?: string;
    workflowStage?: string;
  };
  onSend?: (action: string) => void;
  onRenderVisual?: () => void;
  sending?: boolean;
};

// Human-readable button labels
const LABEL_MAP: Record<string, string> = {
  // Shared creative & commercial
  refine_idea: "Refine Idea",
  explore_options: "Explore Options",
  summarise: "Summarise",
  switch_mode: "Switch Mode",

  // Lyra Messaging
  ask_questions: "Clarify Requirements",
  draft_concepts: "Draft Concepts",
  refine_direction: "Refine Direction",
  finalise_pack: "Finalise Pack",

  // Lyra Campaign
  content_plan: "Generate Content Plan",
  kv_direction: "Generate Visual Direction",

  // Lyra Outreach
  request_csv: "Upload Lead List",
  segment_data: "Segment Data",
  draft_outreach: "Draft Outreach",
  refine_outreach: "Refine Outreach",
  finalise_pack_outreach: "Finalise Pack",

  // Lyra Nurture
  ask_questions_nurture: "Clarify Nurture Requirements",
  draft_arc: "Create Narrative Arc",
  draft_emails: "Draft Emails",
  refine_emails: "Refine Emails",
  finalise_pack_nurture: "Finalise Pack",

  // Salar Proposal
  clarify_requirements: "Clarify Requirements",
  generate_draft_proposal: "Generate Draft",
  refine_proposal: "Refine Proposal",
  finalise_proposal: "Finalise Proposal",

  // Salar Contract
  request_contract_upload: "Upload Contract",
  confirm_summary: "Summarise Contract",
  choose_analysis_path: "Choose Analysis Path",
  refine_contract_analysis: "Refine Analysis",
  finalise_contract_pack: "Finalise Pack",

  // Salar Pricing
  clarify_pricing_requirements: "Clarify Requirements",
  request_pricing_template: "Upload Template",
  analyse_pricing_template: "Analyse Template",
  set_pricing_strategy: "Set Pricing Strategy",
  generate_pricing_draft: "Generate Pricing Draft",
  refine_pricing: "Refine Pricing",
  finalise_pricing: "Finalise Pricing Pack",

  // Strategist
  request_context: "Provide Context",
  provide_insight: "Provide Insight",
  deep_dive_analysis: "Deep Dive",
  refine_strategy: "Refine Strategy",
  finalise_strategy_summary: "Finalise Summary",

  // Visual render
  render_visual: "Render Visual",
};

export default function NextActionButtons({
  meta,
  onSend,
  onRenderVisual,
  sending,
}: Props) {
  // If nothing to show
  if (!meta?.nextActions || meta.nextActions.length === 0) return null;

  // Safely normalise companion
  const companion =
    meta.companion
      ? meta.companion[0].toUpperCase() + meta.companion.slice(1)
      : "Salar";

  const isLyra = companion === "Lyra";

  // Styling per companion
  const basePalette = isLyra
    ? "bg-teal-600 hover:bg-teal-700"
    : "bg-amber-600 hover:bg-amber-700";

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {meta.nextActions.map((action) => {
        const label = LABEL_MAP[action] || action.replace(/_/g, " ");

        // Special case: visual rendering
        if (action === "render_visual") {
          return (
            <button
              key={action}
              type="button"
              onClick={() => !sending && onRenderVisual?.()}
              className={`px-3 py-1 text-xs rounded-lg text-white ${basePalette} ${
                sending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {label}
            </button>
          );
        }

        return (
          <button
            key={action}
            type="button"
            onClick={() => !sending && onSend?.(action)}
            className={`px-3 py-1 text-xs rounded-lg text-white ${basePalette} ${
              sending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}