// src/companions/workflows/lyra/messaging_advisor.ts

export type LyraMessagingStageId =
  | "clarify"
  | "draft"
  | "refine"
  | "finalise";

export type LyraMessagingNextAction =
  | "ask_questions"
  | "draft_concepts"
  | "refine_direction"
  | "finalise_pack";

export interface WorkflowStage {
  id: LyraMessagingStageId;
  label: string;
  description: string;
  nextActions: LyraMessagingNextAction[];
  nextStageIds: LyraMessagingStageId[];
  isTerminal?: boolean;
}

export interface WorkflowDefinition {
  mode: "messaging_advisor";
  stages: Record<LyraMessagingStageId, WorkflowStage>;
  nextActionToStage: Record<
    LyraMessagingNextAction,
    LyraMessagingStageId
  >;
  initialStageId: LyraMessagingStageId;
}

export const LYRA_MESSAGING_WORKFLOW: WorkflowDefinition = {
  mode: "messaging_advisor",
  initialStageId: "clarify",

  stages: {
    clarify: {
      id: "clarify",
      label: "Clarify Requirements",
      description:
        "Lyra asks targeted questions to understand the brand, audience, emotional tone, positioning, and messaging objectives.",
      nextActions: ["ask_questions"],
      nextStageIds: ["draft"],
    },

    draft: {
      id: "draft",
      label: "Draft Concepts",
      description:
        "Lyra generates initial messaging concepts, themes, angles, and narrative directions for review.",
      nextActions: ["draft_concepts"],
      nextStageIds: ["refine"],
    },

    refine: {
      id: "refine",
      label: "Refine Direction",
      description:
        "Lyra refines the chosen messaging path, improving clarity, tone, emotional resonance, and structure.",
      nextActions: ["refine_direction"],
      nextStageIds: ["finalise"],
    },

    finalise: {
      id: "finalise",
      label: "Finalise Messaging Pack",
      description:
        "Lyra produces the final messaging pack, including polished concepts, narratives, and optional downloadable outputs.",
      nextActions: ["finalise_pack"],
      nextStageIds: [],
      isTerminal: true,
    },
  },

  nextActionToStage: {
    ask_questions: "clarify",
    draft_concepts: "draft",
    refine_direction: "refine",
    finalise_pack: "finalise",
  },
};