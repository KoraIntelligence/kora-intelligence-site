// src/companions/orchestrators/salar.ts
// ======================================================
//  SALAR ORCHESTRATOR — Handles all 5 Salar Modes
//  Modes: commercial_chat | proposal | contract_advice | pricing | strategy
// ======================================================

import OpenAI from "openai";

import { getWorkflow } from "../workflows";

// Prompt Packs
import { SALAR_COMMERCIAL_CHAT_PROMPTS } from "../prompts/salar/commercial_chat";
import { SALAR_PROPOSAL_PROMPTS } from "../prompts/salar/proposal";
import { SALAR_CONTRACT_PROMPTS } from "../prompts/salar/contract_advice";
import { SALAR_PRICING_PROMPTS } from "../prompts/salar/pricing";
import { SALAR_STRATEGY_PROMPTS } from "../prompts/salar/strategy";

// Identity loader
import type { CompanionIdentity } from "../identity/loader";
import { loadIdentity } from "../identity/loader";

// Attachments (for workflow modes)
import {
  createPDF,
  createDocx,
  createXlsx,
} from "../../pages/api/session/utils/generateDocs";

// ======================================================
//  TYPES
// ======================================================

export type SalarMode =
  | "commercial_chat"
  | "proposal_builder"
  | "contract_advisor"
  | "pricing_estimation"
  | "commercial_strategist";

export interface SalarOrchestratorInput {
  mode: SalarMode;
  input: string;
  extractedText: string;
  tone: string;
  nextAction?: string;
  conversationHistory?: { role: string; content: string; meta?: any | null }[];
}

// Each prompt file must conform to:
export interface SalarPromptPack {
  mode: SalarMode;

  system: string;
  error: string;

  // Optional workflow phases
  clarify?: string;
  documentHandling?: string;
  summary?: string;
  focus?: string;
  draft?: string;
  refine?: string;
  finalise?: string;

  // Optional deep-dive paths
  paths?: Record<string, string>;

  // Strategy mode deep dives
  requestContext?: string;
  insight?: string;
  deepDive?: Record<string, string>;

  // Pricing-specific
  requestTemplate?: string;
  analyseTemplate?: string;
  pricingStrategy?: string;

  // Next actions
  nextActions: Record<string, string[]>;

  // Attachments
  attachments?: {
    draft?: string[];
    final?: string[];
  };
}

// ======================================================
//  REGISTRY
// ======================================================

const PACKS: Record<SalarMode, SalarPromptPack> = {
  commercial_chat: SALAR_COMMERCIAL_CHAT_PROMPTS,
  proposal_builder: SALAR_PROPOSAL_PROMPTS,
  contract_advisor: SALAR_CONTRACT_PROMPTS,
  pricing_estimation: SALAR_PRICING_PROMPTS,
  commercial_strategist: SALAR_STRATEGY_PROMPTS,
};

// ======================================================
//  OPENAI CLIENT
// ======================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ======================================================
//  PROMPT RESOLUTION
// ======================================================

function resolvePrompt(
  pack: SalarPromptPack,
  nextAction?: string
): string {
  // ----- MODE 0: FREEFORM COMMERCIAL CHAT -----
  if (pack.mode === "commercial_chat") {
    switch (nextAction) {
      case "refine_thinking":
        return pack.refine || pack.error;

      case "explore_options":
        return pack.focus || pack.summary || pack.system;

      case "summarise":
        return pack.finalise || pack.summary || pack.system;

      case "switch_mode":
        return `You may switch to a structured mode: proposal, contract_advice, pricing, or strategy.`;

      default:
        return pack.system;
    }
  }

  // ----- WORKFLOW MODES -----
  if (!nextAction) return pack.system;

  switch (nextAction) {
    // ------- Proposal -------
    case "clarify_requirements":
      return pack.clarify || pack.error;

    case "generate_draft_proposal":
      return pack.draft || pack.error;

    case "refine_proposal":
      return pack.refine || pack.error;

    case "finalise_proposal":
      return pack.finalise || pack.error;

    // ------- Contract -------
    case "clarify_contract_context":
      return pack.clarify || pack.error;

    case "request_contract_upload":
      return pack.documentHandling || pack.error;

    case "confirm_summary":
      return pack.summary || pack.error;

    case "choose_analysis_path":
      return pack.focus || pack.error;

    case "refine_contract_analysis":
      return pack.refine || pack.error;

    case "finalise_contract_pack":
      return pack.finalise || pack.error;

    // ------- Pricing -------
    case "clarify_pricing_requirements":
      return pack.clarify || pack.error;

    case "request_pricing_template":
      return pack.documentHandling || pack.error;

    case "analyse_pricing_template":
      return pack.summary || pack.error;

    case "set_pricing_strategy":
      return pack.focus || pack.error;

    case "generate_pricing_draft":
      return pack.draft || pack.error;

    case "refine_pricing":
      return pack.refine || pack.error;

    case "finalise_pricing":
      return pack.finalise || pack.error;

    // ------- Strategy -------
    case "request_context":
      return pack.clarify || pack.error;

    case "provide_insight":
      return pack.summary || pack.system;

    case "deep_dive_analysis":
      return pack.focus || pack.error;

    case "refine_strategy":
      return pack.refine || pack.error;

    case "finalise_strategy_summary":
      return pack.finalise || pack.error;

    default:
      return pack.system;
  }
}

// ======================================================
//  MAIN FUNCTION
// ======================================================

export async function runSalar(input: SalarOrchestratorInput) {
  const { mode, input: userInput, extractedText, tone, nextAction, conversationHistory } = input;
  const pack = PACKS[mode];

  if (!pack) throw new Error(`Unknown Salar mode: ${mode}`);

  // ----- 1) Load identity (SHARED + SALAR + MODE OVERLAY) -----
  const identity: CompanionIdentity = loadIdentity("salar", mode);

  const toneText =
    typeof identity.tone === "string"
      ? identity.tone
      : identity.tone?.base ?? "";

  const behavioursList: string[] =
    (identity.behaviour as string[]) ||
    (identity.behaviours as string[]) ||
    [];

  const identityPrompt = `
========================
KORA IDENTITY LAYER 3.0
Companion: Salar — Commercial Intelligence Companion
Mode: ${mode}
Persona: ${identity.persona ?? "Commercial Partner"}
Tone: ${toneText || "Warm professionalism, calm confidence"}
========================

Key Behaviours:
${
  behavioursList.length
    ? behavioursList.map((b) => `• ${b}`).join("\n")
    : ""
}

Shared Codex:
${identity.codex ?? ""}

--------------------------------------------------
`;

  // ----- 2) Resolve mode-specific prompt -----
  const prompt = resolvePrompt(pack, nextAction || undefined);

    const historyBlock =
    conversationHistory && conversationHistory.length
      ? `
Previous conversation (latest last):
${conversationHistory
  .slice(-8)
  .map(
    (turn) =>
      `${turn.role.toUpperCase()}: ${turn.content}`
  )
  .join("\n\n")}
`
      : "";


  function formatConversation(history: any[]) {
  if (!history || history.length === 0) return "";
  return history
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`)
    .join("\n");
}

const memoryBlock = conversationHistory?.length
  ? `\nHere is the conversation so far:\n${formatConversation(conversationHistory)}\n`
  : "";

  
  // ----- 3) Build final prompt -----
  const fullPrompt = `
${identityPrompt}

${memoryBlock}

${prompt}

${historyBlock}

User Input:
"""
${userInput}
"""

Uploaded Text:
"""
${extractedText || "N/A"}
"""

Requested Tone: ${tone}
`;

  // ----- 4) Call OpenAI -----
  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: fullPrompt,
  });

  const outputText =
    completion.output_text || "Salar was unable to generate a response.";

  // ======================================================
  //  ATTACHMENTS (workflow modes only, NOT commercial_chat)
  // ======================================================

  const attachments: any[] = [];

  if (
    mode !== "commercial_chat" &&
    nextAction?.startsWith("finalise") &&
    pack.attachments
  ) {
    const finalAttachments = pack.attachments.final || [];

    for (const type of finalAttachments) {
      if (type === "docx") attachments.push(await createDocx(outputText));
      if (type === "pdf") attachments.push(await createPDF(outputText));
      if (type === "xlsx") attachments.push(await createXlsx(outputText));
    }
  }

  // ----- 5) Flatten nextActions and build identity meta -----
  const flatNextActions: string[] = Object.values(
    pack.nextActions || {}
  ).flat();

  const identityMeta = {
    persona: identity.persona ?? "Commercial Partner",
    title: "Commercial Intelligence Companion",
    mode,
    toneBase: toneText || "Warm professionalism, calm confidence",
  };

  // ----- 6) Attach workflow metadata (if workflow defined) -----
  const workflow = getWorkflow("salar", mode);
  let workflowMeta: any = undefined;

  if (workflow) {
    const stageIdFromAction =
      (nextAction && workflow.nextActionToStage[nextAction]) ||
      workflow.initialStageId;

    const stage = workflow.stages[stageIdFromAction];

    if (stage) {
      workflowMeta = {
        stageId: stage.id,
        stageLabel: stage.label,
        stageDescription: stage.description,
        nextStageIds: stage.nextStageIds,
        isTerminal: !!stage.isTerminal,
      };
    }
  }

  // ----- 7) Return canonical response -----
  return {
    reply: outputText,
    attachments,
    meta: {
      companion: "salar",
      mode,
      tone,
      nextActions: flatNextActions,
      identity: identityMeta,
      memory: {
        shortTerm: [],
      },
      workflow: workflowMeta,
    },
  };
}