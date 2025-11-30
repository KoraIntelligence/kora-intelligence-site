// src/companions/workflows/lyra/customer_nurture.ts

export type LyraNurtureStageId =
  | "clarify"
  | "narrative_arc"
  | "email_drafts"
  | "refine"
  | "finalise";

export type LyraNurtureNextAction =
  | "ask_questions_nurture"
  | "draft_arc"
  | "draft_emails"
  | "refine_emails"
  | "finalise_pack_nurture";

export interface WorkflowStage {
  id: LyraNurtureStageId;
  label: string;
  description: string;
  nextActions: LyraNurtureNextAction[];
  nextStageIds: LyraNurtureStageId[];
  isTerminal?: boolean;
}

export interface WorkflowDefinition {
  mode: "customer_nurture";
  stages: Record<LyraNurtureStageId, WorkflowStage>;
  nextActionToStage: Record<
    LyraNurtureNextAction,
    LyraNurtureStageId
  >;
  initialStageId: LyraNurtureStageId;
}

export const LYRA_NURTURE_WORKFLOW: WorkflowDefinition = {
  mode: "customer_nurture",
  initialStageId: "clarify",

  stages: {
    clarify: {
      id: "clarify",
      label: "Clarify Nurture Requirements",
      description:
        "Lyra gathers context on customer lifecycle stage, goals of nurture sequence, emotional tone, and story structure.",
      nextActions: ["ask_questions_nurture"],
      nextStageIds: ["narrative_arc"],
    },

    narrative_arc: {
      id: "narrative_arc",
      label: "Draft Narrative Arc",
      description:
        "Lyra crafts a narrative arc that guides emotional flow, sequencing themes over time to nurture relationship depth.",
      nextActions: ["draft_arc"],
      nextStageIds: ["email_drafts"],
    },

    email_drafts: {
      id: "email_drafts",
      label: "Draft Emails",
      description:
        "Lyra produces multi-touch nurture emails aligned with the narrative arc, tone, and customer journey.",
      nextActions: ["draft_emails"],
      nextStageIds: ["refine"],
    },

    refine: {
      id: "refine",
      label: "Refine Emails",
      description:
        "Lyra improves email clarity, emotional resonance, pacing, CTA placement, and adapts to user feedback.",
      nextActions: ["refine_emails"],
      nextStageIds: ["finalise"],
    },

    finalise: {
      id: "finalise",
      label: "Finalise Nurture Pack",
      description:
        "Lyra assembles the final nurture sequence, including polished emails, overarching arc summary, and downloadable assets.",
      nextActions: ["finalise_pack_nurture"],
      nextStageIds: [],
      isTerminal: true,
    },
  },

  nextActionToStage: {
    ask_questions_nurture: "clarify",
    draft_arc: "narrative_arc",
    draft_emails: "email_drafts",
    refine_emails: "refine",
    finalise_pack_nurture: "finalise",
  },
};