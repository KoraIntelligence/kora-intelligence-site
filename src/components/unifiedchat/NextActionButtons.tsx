// src/components/unifiedchat/NextActionButtons.tsx
import React from "react";

type Props = {
  meta?: {
    nextActions?: string[];
    companion?: string;
  };
  onSend?: (action: string) => void;
  onRenderVisual?: () => void;
};

const LABEL_MAP: Record<string, string> = {
  // Shared creative & commercial triggers
  refine_idea: "Refine Idea",
  explore_options: "Explore Options",
  summarise: "Summarise Conversation",
  switch_mode: "Switch Workflow",

  // Lyra Messaging Mode
  ask_questions: "Clarify Requirements",
  draft_concepts: "Generate Creative Directions",
  refine_direction: "Refine Messaging",
  finalise_pack: "Finalise Messaging Pack",

  // Lyra Campaign Mode
  content_plan: "Generate Content Plan",
  kv_direction: "Generate Visual Direction",

  // Lyra Outreach Mode
  request_csv: "Upload Lead List",
  segment_data: "Generate Segments",
  draft_outreach: "Generate Outreach Sequence",
  refine_outreach: "Refine Outreach",
  finalise_pack_outreach: "Finalise Outreach Pack",

  // Lyra Nurture Mode
  ask_questions_nurture: "Clarify Nurture Requirements",
  draft_arc: "Create Narrative Arc",
  draft_emails: "Draft Emails",
  refine_emails: "Refine Emails",
  finalise_pack_nurture: "Finalise Nurture Pack",

  // Salar Modes
  clarify_requirements: "Clarify Requirements",
  generate_draft_proposal: "Generate Proposal Draft",
  refine_proposal: "Refine Proposal",
  finalise_proposal: "Finalise Proposal",

  request_contract_upload: "Upload Contract",
  confirm_summary: "Summarise Contract",
  choose_analysis_path: "Choose Analysis Path",
  refine_contract_analysis: "Refine Analysis",
  finalise_contract_pack: "Finalise Contract Pack",

  clarify_pricing_requirements: "Clarify Pricing Requirements",
  analyse_pricing_template: "Analyse Pricing Template",
  set_pricing_strategy: "Set Pricing Strategy",
  generate_pricing_draft: "Generate Pricing Draft",
  refine_pricing: "Refine Pricing",
  finalise_pricing: "Finalise Pricing Pack",

  // Salar Strategy Mode
  request_context: "Provide Context",
  provide_insight: "Provide Insight",
  deep_dive_analysis: "Deep Dive",
  refine_strategy: "Refine Strategy",
  finalise_strategy_summary: "Finalise Strategy Summary",

  // FMC visuals
  render_visual: "Render Visual Concept",
};

export default function NextActionButtons({
  meta,
  onSend,
  onRenderVisual,
}: Props) {
  if (!meta?.nextActions || meta.nextActions.length === 0) return null;

  // 🔥 FIX #1 — meta.companion may be undefined
  const companion = meta.companion ?? "Salar";

  const palette =
    companion === "Lyra"
      ? "bg-teal-600 hover:bg-teal-700"
      : "bg-amber-600 hover:bg-amber-700";

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {meta.nextActions.map((action) => {
        const label = LABEL_MAP[action] || action.replace(/_/g, " ");

        // 🔥 FIX #2 — render_visual special case
        if (action === "render_visual") {
          return (
            <button
              key={action}
              onClick={() => onRenderVisual?.()}
              className={`px-3 py-1 text-xs rounded-lg text-white ${palette}`}
            >
              {label}
            </button>
          );
        }

        return (
          <button
            key={action}
            onClick={() => onSend?.(action)}
            className={`px-3 py-1 text-xs rounded-lg text-white ${palette}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}