// src/companions/workflows/salar/contract_advisor.ts


export type SalarContractStageId =
| "clarify"
| "ingest"
| "summarise"
| "analysis_path"
| "refine"
| "finalise";


export type SalarContractNextAction =
| "clarify_contract_context"
| "request_contract_upload"
| "confirm_summary"
| "choose_analysis_path"
| "refine_contract_analysis"
| "finalise_contract_pack";


export interface WorkflowStage {
id: SalarContractStageId;
label: string;
description: string;
nextActions: SalarContractNextAction[];
nextStageIds: SalarContractStageId[];
isTerminal?: boolean;
}


export interface WorkflowDefinition {
mode: "contract_advisor";
stages: Record<SalarContractStageId, WorkflowStage>;
nextActionToStage: Record<SalarContractNextAction, SalarContractStageId>;
initialStageId: SalarContractStageId;
}


export const SALAR_CONTRACT_WORKFLOW: WorkflowDefinition = {
mode: "contract_advisor",
initialStageId: "clarify",


stages: {
clarify: {
id: "clarify",
label: "Clarify Contract Context",
description:
"Salar gathers context about the contract, parties involved, and the user's objectives for the review.",
nextActions: ["clarify_contract_context"],
nextStageIds: ["ingest"],
},


ingest: {
id: "ingest",
label: "Ingest Contract",
description:
"Salar requests and parses the uploaded contract document to extract key sections and clauses.",
nextActions: ["request_contract_upload"],
nextStageIds: ["summarise"],
},


summarise: {
id: "summarise",
label: "Summarise Contract",
description:
"Salar generates a structured summary of the contract, highlighting important areas and potential risks.",
nextActions: ["confirm_summary"],
nextStageIds: ["analysis_path"],
},


analysis_path: {
id: "analysis_path",
label: "Choose Analysis Path",
description:
"Salar presents available analysis paths (e.g., risk analysis, commercial fit, compliance insights).",
nextActions: ["choose_analysis_path"],
nextStageIds: ["refine"],
},


refine: {
id: "refine",
label: "Refine Contract Analysis",
description:
"Salar deepens the chosen analysis path, providing refined insight and incorporating user feedback.",
nextActions: ["refine_contract_analysis"],
nextStageIds: ["finalise"],
},


finalise: {
id: "finalise",
label: "Finalise Contract Pack",
description:
"Salar prepares the final contract analysis pack and generates downloadable assets.",
nextActions: ["finalise_contract_pack"],
nextStageIds: [],
isTerminal: true,
},
},


nextActionToStage: {
clarify_contract_context: "clarify",
request_contract_upload: "ingest",
confirm_summary: "summarise",
choose_analysis_path: "analysis_path",
refine_contract_analysis: "refine",
finalise_contract_pack: "finalise",
},
};