import { SALAR_PROPOSAL_WORKFLOW } from "./salar/proposal_builder";
import { SALAR_CONTRACT_WORKFLOW } from "./salar/contract_advisor";
import { SALAR_PRICING_WORKFLOW } from "./salar/pricing_estimation";
import { SALAR_STRATEGIST_WORKFLOW } from "./salar/commercial_strategist";

import { LYRA_MESSAGING_WORKFLOW } from "./lyra/messaging_advisor";
import { LYRA_CAMPAIGN_WORKFLOW } from "./lyra/campaign_builder";
import { LYRA_OUTREACH_WORKFLOW } from "./lyra/lead_outreach";
import { LYRA_NURTURE_WORKFLOW } from "./lyra/customer_nurture";

export interface GenericWorkflowStage {
  id: string;
  label: string;
  description: string;
  nextActions: string[];
  nextStageIds: string[];
  isTerminal?: boolean;
}

export interface GenericWorkflow {
  mode: string;
  stages: Record<string, GenericWorkflowStage>;
  nextActionToStage: Record<string, string>;
  initialStageId: string;
}

const WORKFLOWS: Record<string, GenericWorkflow> = {
  // Salar workflows
  "salar:proposal_builder":
    SALAR_PROPOSAL_WORKFLOW as unknown as GenericWorkflow,
  "salar:contract_advisor":
    SALAR_CONTRACT_WORKFLOW as unknown as GenericWorkflow,
  "salar:pricing_estimation":
    SALAR_PRICING_WORKFLOW as unknown as GenericWorkflow,
  "salar:commercial_strategist":
    SALAR_STRATEGIST_WORKFLOW as unknown as GenericWorkflow,

  // Lyra workflows
  "lyra:messaging_advisor":
    LYRA_MESSAGING_WORKFLOW as unknown as GenericWorkflow,
  "lyra:campaign_builder":
    LYRA_CAMPAIGN_WORKFLOW as unknown as GenericWorkflow,
  "lyra:lead_outreach":
    LYRA_OUTREACH_WORKFLOW as unknown as GenericWorkflow,
  "lyra:customer_nurture":
    LYRA_NURTURE_WORKFLOW as unknown as GenericWorkflow,
};

export function getWorkflow(
  companion: "salar" | "lyra",
  mode: string
): GenericWorkflow | null {
  return WORKFLOWS[`${companion}:${mode}`] ?? null;
}