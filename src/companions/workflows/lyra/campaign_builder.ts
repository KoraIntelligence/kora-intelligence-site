// src/companions/workflows/lyra/campaign_builder.ts

export type LyraCampaignStageId =
  | "clarify"
  | "draft"
  | "refine"
  | "content_plan"
  | "kv_direction"
  | "finalise";

export type LyraCampaignNextAction =
  | "ask_questions"
  | "draft_concepts"
  | "refine_direction"
  | "content_plan"
  | "kv_direction"
  | "finalise_pack";

export interface WorkflowStage {
  id: LyraCampaignStageId;
  label: string;
  description: string;
  nextActions: LyraCampaignNextAction[];
  nextStageIds: LyraCampaignStageId[];
  isTerminal?: boolean;
}

export interface WorkflowDefinition {
  mode: "campaign_builder";
  stages: Record<LyraCampaignStageId, WorkflowStage>;
  nextActionToStage: Record<
    LyraCampaignNextAction,
    LyraCampaignStageId
  >;
  initialStageId: LyraCampaignStageId;
}

export const LYRA_CAMPAIGN_WORKFLOW: WorkflowDefinition = {
  mode: "campaign_builder",
  initialStageId: "clarify",

  stages: {
    clarify: {
      id: "clarify",
      label: "Clarify Requirements",
      description:
        "Lyra gathers brand context, audience, objectives, emotional tone, channels, and campaign constraints.",
      nextActions: ["ask_questions"],
      nextStageIds: ["draft"],
    },

    draft: {
      id: "draft",
      label: "Draft Concepts",
      description:
        "Lyra generates initial creative concepts, hooks, campaign angles, and narrative directions.",
      nextActions: ["draft_concepts"],
      nextStageIds: ["refine"],
    },

    refine: {
      id: "refine",
      label: "Refine Direction",
      description:
        "Lyra improves the chosen creative direction, enhancing clarity, resonance, brand alignment, and cohesion.",
      nextActions: ["refine_direction"],
      nextStageIds: ["content_plan"],
    },

    content_plan: {
      id: "content_plan",
      label: "Generate Content Plan",
      description:
        "Lyra develops a structured campaign content plan, including messaging pillars, channel mapping, and frequency.",
      nextActions: ["content_plan"],
      nextStageIds: ["kv_direction"],
    },

    kv_direction: {
      id: "kv_direction",
      label: "Key Visual Direction",
      description:
        "Lyra proposes visual themes, moodboards, aesthetic cues, colour palettes, and conceptual KV options.",
      nextActions: ["kv_direction"],
      nextStageIds: ["finalise"],
    },

    finalise: {
      id: "finalise",
      label: "Finalise Campaign Pack",
      description:
        "Lyra produces the final campaign pack including creative directions, messaging, content plan, and KV summary.",
      nextActions: ["finalise_pack"],
      nextStageIds: [],
      isTerminal: true,
    },
  },

  nextActionToStage: {
    ask_questions: "clarify",
    draft_concepts: "draft",
    refine_direction: "refine",
    content_plan: "content_plan",
    kv_direction: "kv_direction",
    finalise_pack: "finalise",
  },
};