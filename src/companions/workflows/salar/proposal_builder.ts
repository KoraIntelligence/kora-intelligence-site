// src/companions/workflows/salar/proposal_builder.ts


export type SalarProposalStageId =
| "clarify"
| "draft"
| "refine"
| "finalise";


export type SalarProposalNextAction =
| "clarify_requirements"
| "generate_draft_proposal"
| "refine_proposal"
| "finalise_proposal";


export interface WorkflowStage {
id: SalarProposalStageId;
label: string;
description: string;
nextActions: SalarProposalNextAction[];
nextStageIds: SalarProposalStageId[];
isTerminal?: boolean;
}


export interface WorkflowDefinition {
mode: "proposal_builder";
stages: Record<SalarProposalStageId, WorkflowStage>;
nextActionToStage: Record<SalarProposalNextAction, SalarProposalStageId>;
initialStageId: SalarProposalStageId;
}


export const SALAR_PROPOSAL_WORKFLOW: WorkflowDefinition = {
mode: "proposal_builder",
initialStageId: "clarify",


stages: {
clarify: {
id: "clarify",
label: "Clarify Requirements",
description:
"Salar asks questions to understand the commercial context, stakeholders, and boundaries of the proposal.",
nextActions: ["clarify_requirements"],
nextStageIds: ["draft"],
},


draft: {
id: "draft",
label: "Draft Proposal",
description:
"Salar generates a first commercial proposal draft, including structure, pricing logic, and key arguments.",
nextActions: ["generate_draft_proposal"],
nextStageIds: ["refine"],
},


refine: {
id: "refine",
label: "Refine Proposal",
description:
"Salar helps refine specific sections, tone, and structure based on your feedback.",
nextActions: ["refine_proposal"],
nextStageIds: ["finalise"],
},


finalise: {
id: "finalise",
label: "Finalise Proposal Pack",
description:
"Salar prepares the final proposal pack and generates downloadable assets (DOCX, PDF, XLSX if configured).",
nextActions: ["finalise_proposal"],
nextStageIds: [],
isTerminal: true,
},
},


nextActionToStage: {
clarify_requirements: "clarify",
generate_draft_proposal: "draft",
refine_proposal: "refine",
finalise_proposal: "finalise",
},
};