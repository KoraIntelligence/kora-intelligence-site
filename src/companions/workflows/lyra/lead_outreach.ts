// src/companions/workflows/lyra/lead_outreach.ts

export type LyraOutreachStageId =
  | "clarify"
  | "ingest"
  | "segment"
  | "draft"
  | "refine"
  | "finalise";

export type LyraOutreachNextAction =
  | "ask_questions"          // → Clarify Requirements
  | "request_csv"            // → Data Ingestion
  | "segment_data"           // → Segmentation
  | "draft_outreach"         // → Outreach Draft
  | "refine_outreach"        // → Refinement
  | "finalise_pack_outreach"; // → Final pack

export interface WorkflowStage {
  id: LyraOutreachStageId;
  label: string;
  description: string;
  nextActions: LyraOutreachNextAction[];
  nextStageIds: LyraOutreachStageId[];
  isTerminal?: boolean;
}

export interface WorkflowDefinition {
  mode: "lead_outreach";
  stages: Record<LyraOutreachStageId, WorkflowStage>;
  nextActionToStage: Record<LyraOutreachNextAction, LyraOutreachStageId>;
  initialStageId: LyraOutreachStageId;
}

export const LYRA_OUTREACH_WORKFLOW: WorkflowDefinition = {
  mode: "lead_outreach",
  initialStageId: "clarify",

  stages: {
    clarify: {
      id: "clarify",
      label: "Clarify Requirements",
      description:
        "Lyra gathers your ICP, outreach intent, targeting preferences, and message tone before starting lead segmentation.",
      nextActions: ["ask_questions"],
      nextStageIds: ["ingest"],
    },

    ingest: {
      id: "ingest",
      label: "Upload Lead List",
      description:
        "Lyra requests and processes your CSV of leads, extracting metadata: names, roles, industries, segments, and patterns.",
      nextActions: ["request_csv"],
      nextStageIds: ["segment"],
    },

    segment: {
      id: "segment",
      label: "Segment Leads",
      description:
        "Lyra analyses the uploaded list and generates structured lead segments with clear rationale and messaging angles.",
      nextActions: ["segment_data"],
      nextStageIds: ["draft"],
    },

    draft: {
      id: "draft",
      label: "Draft Outreach Sequence",
      description:
        "Lyra creates a personalised, multi-step outreach sequence tailored to each segment’s motivations and context.",
      nextActions: ["draft_outreach"],
      nextStageIds: ["refine"],
    },

    refine: {
      id: "refine",
      label: "Refine Outreach",
      description:
        "Lyra refines the outreach copy, adjusts tone, strengthens hooks, and incorporates your preferences.",
      nextActions: ["refine_outreach"],
      nextStageIds: ["finalise"],
    },

    finalise: {
      id: "finalise",
      label: "Finalise Outreach Pack",
      description:
        "Lyra produces the final outreach pack: segmented strategy, touchpoints, messaging, and downloadable assets.",
      nextActions: ["finalise_pack_outreach"],
      nextStageIds: [],
      isTerminal: true,
    },
  },

  nextActionToStage: {
    ask_questions: "clarify",
    request_csv: "ingest",
    segment_data: "segment",
    draft_outreach: "draft",
    refine_outreach: "refine",
    finalise_pack_outreach: "finalise",
  },
};