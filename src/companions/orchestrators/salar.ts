// src/companions/orchestrators/salar.ts
// ======================================================
//  SALAR ORCHESTRATOR — Handles all 5 Salar Modes
//  Modes: commercial_chat | proposal | contract_advice | pricing | strategy
// ======================================================

import OpenAI from "openai";
import { getWorkflow } from "../workflows";
import { SALAR_COMMERCIAL_CHAT_PROMPTS } from "../prompts/salar/commercial_chat";
import { SALAR_PROPOSAL_PROMPTS } from "../prompts/salar/proposal";
import { SALAR_CONTRACT_PROMPTS } from "../prompts/salar/contract_advice";
import { SALAR_PRICING_PROMPTS } from "../prompts/salar/pricing";
import { SALAR_STRATEGY_PROMPTS } from "../prompts/salar/strategy";
import type { CompanionIdentity } from "../identity/loader";
import { loadIdentity } from "../identity/loader";
import { createPDF, createDocx, createXlsx } from "../../pages/api/session/utils/generateDocs";

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

export interface SalarPromptPack {
  mode: SalarMode;
  system: string;
  error: string;

  clarify?: string;
  documentHandling?: string;
  summary?: string;
  focus?: string;
  draft?: string;
  refine?: string;
  finalise?: string;

  paths?: Record<string, string>;
  requestContext?: string;
  insight?: string;
  deepDive?: Record<string, string>;
  requestTemplate?: string;
  analyseTemplate?: string;
  pricingStrategy?: string;
  nextActions: Record<string, string[]>;

  attachments?: {
    draft?: string[];
    final?: string[];
  };
}

const PACKS: Record<SalarMode, SalarPromptPack> = {
  commercial_chat: SALAR_COMMERCIAL_CHAT_PROMPTS,
  proposal_builder: SALAR_PROPOSAL_PROMPTS,
  contract_advisor: SALAR_CONTRACT_PROMPTS,
  pricing_estimation: SALAR_PRICING_PROMPTS,
  commercial_strategist: SALAR_STRATEGY_PROMPTS,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function resolvePrompt(pack: SalarPromptPack, nextAction?: string): string {
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

  if (!nextAction) return pack.system;

  switch (nextAction) {
    case "clarify_requirements":
      return pack.clarify || pack.error;
    case "generate_draft_proposal":
      return pack.draft || pack.error;
    case "refine_proposal":
      return pack.refine || pack.error;
    case "finalise_proposal":
      return pack.finalise || pack.error;
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

async function extractPricingStructure(output: string) {
  // Expecting the model to include a JSON block inside <pricing> tags
  const match = output.match(/<pricing>([\s\S]*?)<\/pricing>/);

  if (!match) {
    // fallback: dump raw text
    return {
      sheets: [
        {
          name: "Pricing Output",
          rows: output.split("\n").map((line) => [line])
        }
      ]
    };
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    // fallback to text again
    return {
      sheets: [
        {
          name: "Pricing Output",
          rows: output.split("\n").map((line) => [line])
        }
      ]
    };
  }
}

export async function runSalar(input: SalarOrchestratorInput) {
  const {
    mode,
    input: userInput,
    extractedText,
    tone,
    nextAction,
    conversationHistory,
  } = input;

  const safeHistory = Array.isArray(conversationHistory)
    ? conversationHistory
    : [];

  const pack = PACKS[mode];
  if (!pack) throw new Error(`Unknown Salar mode: ${mode}`);

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
${behavioursList.length ? behavioursList.map((b) => `• ${b}`).join("\n") : ""}

Shared Codex:
${identity.codex ?? ""}
--------------------------------------------------
`;

  const prompt = resolvePrompt(pack, nextAction || undefined);

  const formatConversation = (arr: any[]) =>
    arr.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join("\n");

  const memoryBlock =
    safeHistory.length > 0
      ? `\nHere is the conversation so far:\n${formatConversation(
          safeHistory
        )}\n`
      : "";

  const fullPrompt = `
${identityPrompt}
${memoryBlock}

${prompt}

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

  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: fullPrompt,
  });

  const outputText =
    completion.output_text || "Salar was unable to generate a response.";

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
      if (type === "xlsx") {
  const structured = await extractPricingStructure(outputText);
  attachments.push(await createXlsx(structured));
}}
  }

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

  const identityMeta = {
    persona: identity.persona ?? "Commercial Partner",
    title: "Commercial Intelligence Companion",
    mode,
    toneBase: toneText,
  };

  return {
    reply: outputText,
    attachments,
    meta: {
      companion: "salar",
      mode,
      tone,
      nextActions: Array.isArray(pack.nextActions)
        ? pack.nextActions
        : Object.values(pack.nextActions || {}).flat(),
      identity: identityMeta,
      memory: { shortTerm: safeHistory.slice(-6) },
      workflow: workflowMeta,
    },
  };
}