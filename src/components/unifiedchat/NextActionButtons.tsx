// src/components/unifiedchat/NextActionButtons.tsx
import React from "react";

type Props = {
  meta?: {
    nextActions?: string[];
    companion?: string;
    workflow?: {
      stageId: string;
      nextStageIds?: string[];
    };
  };
  history?: { meta?: { workflow?: { stageId: string } } }[];
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
  history,
  onSend,
  onRenderVisual,
  sending,
}: Props) {
  // Always ensure we have a history array
  const safeHistory = Array.isArray(history) ? history : [];

  if (!meta?.nextActions || meta.nextActions.length === 0) return null;

  const companionName = meta?.companion?.toLowerCase?.() || "salar";
  const isLyra = companionName === "lyra";

  // ---- workflow state ----
  const currentStage = meta.workflow?.stageId;
  const nextStageIds = new Set(meta.workflow?.nextStageIds || []);

  const completedStages = new Set(
    safeHistory
      .map((msg) => msg.meta?.workflow?.stageId)
      .filter((id): id is string => Boolean(id) && id !== currentStage)
  );
  const uniqueActions = Array.from(new Set(meta.nextActions));

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {uniqueActions.map((action) => {
    // Ensure React does NOT wipe buttons aggressively
    const stableKey = `${action}-${currentStage ?? "root"}`;
        const label = LABEL_MAP[action] || action.replace(/_/g, " ");

        // Determine color style
        let style = "";

        if (completedStages.has(action)) {
          style =
            "bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300";
        } else if (action === currentStage) {
          style =
            "bg-blue-600 text-white hover:bg-blue-700 border border-blue-700";
        } else if (nextStageIds.has(action)) {
          style =
            "bg-green-600 text-white hover:bg-green-700 border border-green-700";
        } else {
          style = isLyra
            ? "bg-teal-600 text-white hover:bg-teal-700 border border-teal-700"
            : "bg-amber-600 text-white hover:bg-amber-700 border border-amber-700";
        }

        const common =
          `px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${style} ` +
          (sending ? "opacity-50 cursor-not-allowed" : "");

        // Special handling for visual render
        if (action === "render_visual") {
          return (
            <button
              key={stableKey}
              type="button"
              disabled={sending}
              onClick={() => !sending && onRenderVisual?.()}
              className={common}
            >
              {label}
            </button>
          );
        }

        return (
          <button
            key={action}
            type="button"
            disabled={sending}
            onClick={() => !sending && onSend?.(action)}
            className={common}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}