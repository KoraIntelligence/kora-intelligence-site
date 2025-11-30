// src/companions/workflows/salar/commercial_strategist.ts

export type SalarStrategistStageId =
  | "context"
  | "insight"
  | "deep_dive"
  | "refine"
  | "finalise";

export type SalarStrategistNextAction =
  | "request_context"
  | "provide_insight"
  | "deep_dive_analysis"
  | "refine_strategy"
  | "finalise_strategy_summary";

export interface WorkflowStage {
  id: SalarStrategistStageId;
  label: string;
  description: string;
  nextActions: SalarStrategistNextAction[];
  nextStageIds: SalarStrategistStageId[];
  isTerminal?: boolean;
}

export interface WorkflowDefinition {
  mode: "commercial_strategist";
  stages: Record<SalarStrategistStageId, WorkflowStage>;
  nextActionToStage: Record<
    SalarStrategistNextAction,
    SalarStrategistStageId
  >;
  initialStageId: SalarStrategistStageId;
}

export const SALAR_STRATEGIST_WORKFLOW: WorkflowDefinition = {
  mode: "commercial_strategist",
  initialStageId: "context",

  stages: {
    context: {
      id: "context",
      label: "Provide Context",
      description:
        "Salar gathers the strategic scenario, objectives, stakeholders, constraints, and business context.",
      nextActions: ["request_context"],
      nextStageIds: ["insight"],
    },

    insight: {
      id: "insight",
      label: "Provide Insight",
      description:
        "Salar delivers initial high-level insights and commercial angles based on the provided context.",
      nextActions: ["provide_insight"],
      nextStageIds: ["deep_dive"],
    },

    deep_dive: {
      id: "deep_dive",
      label: "Deep Dive Analysis",
      description:
        "Salar dives deeper into a selected strategic direction (e.g., GTM, commercial model, ICP fit, positioning).",
      nextActions: ["deep_dive_analysis"],
      nextStageIds: ["refine"],
    },

    refine: {
      id: "refine",
      label: "Refine Strategy",
      description:
        "Salar refines the strategic output based on feedback and shapes the storyline, structure, and recommendations.",
      nextActions: ["refine_strategy"],
      nextStageIds: ["finalise"],
    },

    finalise: {
      id: "finalise",
      label: "Finalise Strategy Summary",
      description:
        "Salar generates the final strategic summary with narrative, recommendations, and optional attachments.",
      nextActions: ["finalise_strategy_summary"],
      nextStageIds: [],
      isTerminal: true,
    },
  },

  nextActionToStage: {
    request_context: "context",
    provide_insight: "insight",
    deep_dive_analysis: "deep_dive",
    refine_strategy: "refine",
    finalise_strategy_summary: "finalise",
  },
};