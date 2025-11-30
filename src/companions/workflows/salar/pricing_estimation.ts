// src/companions/workflows/salar/pricing_estimation.ts

export type SalarPricingStageId =
  | "clarify"
  | "template"
  | "analysis"
  | "strategy"
  | "draft"
  | "refine"
  | "finalise";

export type SalarPricingNextAction =
  | "clarify_pricing_requirements"
  | "request_pricing_template"
  | "analyse_pricing_template"
  | "set_pricing_strategy"
  | "generate_pricing_draft"
  | "refine_pricing"
  | "finalise_pricing";

export interface WorkflowStage {
  id: SalarPricingStageId;
  label: string;
  description: string;
  nextActions: SalarPricingNextAction[];
  nextStageIds: SalarPricingStageId[];
  isTerminal?: boolean;
}

export interface WorkflowDefinition {
  mode: "pricing_estimation";
  stages: Record<SalarPricingStageId, WorkflowStage>;
  nextActionToStage: Record<
    SalarPricingNextAction,
    SalarPricingStageId
  >;
  initialStageId: SalarPricingStageId;
}

export const SALAR_PRICING_WORKFLOW: WorkflowDefinition = {
  mode: "pricing_estimation",
  initialStageId: "clarify",

  stages: {
    clarify: {
      id: "clarify",
      label: "Clarify Pricing Requirements",
      description:
        "Salar gathers context on the pricing scenario, client constraints, deliverables, and commercial expectations.",
      nextActions: ["clarify_pricing_requirements"],
      nextStageIds: ["template"],
    },

    template: {
      id: "template",
      label: "Upload Pricing Template",
      description:
        "Salar requests the pricing sheet or template to analyse the cost structure and assumptions.",
      nextActions: ["request_pricing_template"],
      nextStageIds: ["analysis"],
    },

    analysis: {
      id: "analysis",
      label: "Analyse Template",
      description:
        "Salar analyses the uploaded pricing template, extracting key variables and modelling insights.",
      nextActions: ["analyse_pricing_template"],
      nextStageIds: ["strategy"],
    },

    strategy: {
      id: "strategy",
      label: "Set Pricing Strategy",
      description:
        "Salar helps define a pricing strategy based on value, market expectations, and commercial positioning.",
      nextActions: ["set_pricing_strategy"],
      nextStageIds: ["draft"],
    },

    draft: {
      id: "draft",
      label: "Generate Pricing Draft",
      description:
        "Salar creates an initial pricing draft including structure, narrative, and commercial rationale.",
      nextActions: ["generate_pricing_draft"],
      nextStageIds: ["refine"],
    },

    refine: {
      id: "refine",
      label: "Refine Pricing",
      description:
        "Salar refines the pricing draft based on user feedback and adjusts numbers, narrative, or structure.",
      nextActions: ["refine_pricing"],
      nextStageIds: ["finalise"],
    },

    finalise: {
      id: "finalise",
      label: "Finalise Pricing Pack",
      description:
        "Salar prepares the final pricing pack and generates downloadable files such as PDF, DOCX, or XLSX.",
      nextActions: ["finalise_pricing"],
      nextStageIds: [],
      isTerminal: true,
    },
  },

  nextActionToStage: {
    clarify_pricing_requirements: "clarify",
    request_pricing_template: "template",
    analyse_pricing_template: "analysis",
    set_pricing_strategy: "strategy",
    generate_pricing_draft: "draft",
    refine_pricing: "refine",
    finalise_pricing: "finalise",
  },
};