// src/companions/orchestrators/salar.ts
// ======================================================
//  SALAR ORCHESTRATOR — Handles all 5 Salar Modes
//  Migrated to Anthropic Claude (claude-sonnet-4-6)
// ======================================================

import Anthropic from "@anthropic-ai/sdk";
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
  brandContext?: string;
  handoverContext?: string;
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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = process.env.KORA_MODEL || "claude-sonnet-4-6";

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
  const match = output.match(/<pricing>([\s\S]*?)<\/pricing>/);
  if (!match) {
    return {
      sheets: [{ name: "Pricing Output", rows: output.split("\n").map((line) => [line]) }],
    };
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    return {
      sheets: [{ name: "Pricing Output", rows: output.split("\n").map((line) => [line]) }],
    };
  }
}

function normaliseForXlsx(input: any): string {
  if (!input) return "";
  if (typeof input === "object") {
    try { return JSON.stringify(input); } catch { return ""; }
  }
  return String(input);
}

// Build the system prompt (identity + mode instructions + brand context)
function buildSystemPrompt(
  identity: CompanionIdentity,
  pack: SalarPromptPack,
  nextAction: string | undefined,
  brandContext: string,
  handoverContext: string,
  mode: SalarMode,
  tone: string
): string {
  const toneText =
    typeof identity.tone === "string" ? identity.tone : identity.tone?.base ?? "";

  const behavioursList: string[] =
    (identity.behaviour as string[]) || (identity.behaviours as string[]) || [];

  const identityBlock = `You are Salar, Kora's commercial intelligence companion.
Persona: ${identity.persona ?? "Commercial Partner"}
Mode: ${mode}
Tone: ${toneText || "Warm professionalism, calm confidence"}
${behavioursList.length ? "\nKey behaviours:\n" + behavioursList.map((b) => `• ${b}`).join("\n") : ""}
${identity.codex ? "\n" + identity.codex : ""}`;

  const modeInstructions = resolvePrompt(pack, nextAction);

  const brandBlock = brandContext
    ? `\n\n---\nBRAND CONTEXT:\n${brandContext}\n---`
    : "";

  const handoverBlock = handoverContext
    ? `\n\n---\nCONTEXT FROM PREVIOUS CONVERSATION:\n${handoverContext}\n---`
    : "";

  const toneBlock = `\nRequested tone: ${tone}`;

  return `${identityBlock}\n\n${modeInstructions}${brandBlock}${handoverBlock}${toneBlock}`;
}

// Convert conversation history to Claude message format
function buildMessages(
  conversationHistory: { role: string; content: string }[],
  userInput: string,
  extractedText: string
): Array<{ role: "user" | "assistant"; content: string }> {
  const RECENT_TURNS = 8;
  const recentHistory = conversationHistory.slice(-RECENT_TURNS);

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const turn of recentHistory) {
    if (turn.role === "user" || turn.role === "assistant") {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  // Current user turn
  let currentContent = userInput || "";
  if (extractedText) {
    currentContent += `\n\nUploaded document:\n"""\n${extractedText}\n"""`;
  }
  if (currentContent.trim()) {
    messages.push({ role: "user", content: currentContent.trim() });
  }

  // Claude requires messages to alternate. If we somehow end with assistant, add a placeholder.
  // In practice this shouldn't happen but guard anyway.
  if (messages.length === 0) {
    messages.push({ role: "user", content: "(start)" });
  }

  return messages;
}

// ======================================================
// MAIN ORCHESTRATOR (non-streaming, used by unified.ts)
// ======================================================

export async function runSalar(input: SalarOrchestratorInput) {
  const {
    mode,
    input: userInput,
    extractedText,
    tone,
    nextAction,
    conversationHistory = [],
    brandContext = "",
    handoverContext = "",
  } = input;

  const pack = PACKS[mode];
  if (!pack) throw new Error(`Unknown Salar mode: ${mode}`);

  const identity: CompanionIdentity = loadIdentity("salar", mode);

  const systemPrompt = buildSystemPrompt(
    identity, pack, nextAction, brandContext, handoverContext, mode, tone
  );

  const messages = buildMessages(conversationHistory, userInput, extractedText);

  console.log(
    "🟨 runSalar: mode=%s, nextAction=%s, messages=%d",
    mode, nextAction, messages.length
  );

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: systemPrompt,
    messages,
  });

  const outputText =
    response.content[0]?.type === "text"
      ? response.content[0].text
      : "Salar was unable to generate a response.";

  const attachments: any[] = [];

  if (
    mode !== "commercial_chat" &&
    nextAction?.startsWith("finalise") &&
    pack.attachments
  ) {
    for (const type of pack.attachments.final || []) {
      if (type === "docx") attachments.push(await createDocx(outputText));
      if (type === "pdf") attachments.push(await createPDF(outputText));
      if (type === "xlsx") {
        try {
          const structured = await extractPricingStructure(outputText);
          attachments.push(await createXlsx(normaliseForXlsx(structured)));
        } catch (err) {
          console.error("❌ runSalar XLSX error:", err);
        }
      }
    }
  }

  const workflow = getWorkflow("salar", mode);
  let workflowMeta: any = undefined;

  if (workflow) {
    const stageId =
      (nextAction && workflow.nextActionToStage[nextAction]) || workflow.initialStageId;
    const stage = workflow.stages[stageId];
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

  const toneText =
    typeof identity.tone === "string" ? identity.tone : identity.tone?.base ?? "";

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
      identity: {
        persona: identity.persona ?? "Commercial Partner",
        title: "Commercial Intelligence Companion",
        mode,
        toneBase: toneText,
      },
      memory: { shortTerm: conversationHistory.slice(-6) },
      workflow: workflowMeta,
    },
  };
}

// ======================================================
// STREAMING PLAN (used by unified-stream.ts)
// Returns system + messages instead of fullPrompt
// ======================================================

export type SalarStreamingPlanInput = SalarOrchestratorInput;

export function buildSalarStreamingPlan(input: SalarStreamingPlanInput) {
  const {
    mode,
    input: userInput,
    extractedText,
    tone,
    nextAction,
    conversationHistory = [],
    brandContext = "",
    handoverContext = "",
  } = input;

  const pack = PACKS[mode];
  if (!pack) throw new Error(`Unknown Salar mode: ${mode}`);

  const identity: CompanionIdentity = loadIdentity("salar", mode);

  const systemPrompt = buildSystemPrompt(
    identity, pack, nextAction, brandContext, handoverContext, mode, tone
  );

  const messages = buildMessages(conversationHistory, userInput, extractedText);

  const shouldAttach =
    mode !== "commercial_chat" &&
    !!nextAction &&
    nextAction.startsWith("finalise") &&
    !!pack.attachments;

  const attachmentTypes = shouldAttach ? (pack.attachments?.final || []) : [];

  const workflow = getWorkflow("salar", mode);
  let workflowMeta: any = undefined;

  if (workflow) {
    const stageId =
      (nextAction && workflow.nextActionToStage[nextAction]) || workflow.initialStageId;
    const stage = workflow.stages[stageId];
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

  const toneText =
    typeof identity.tone === "string" ? identity.tone : identity.tone?.base ?? "";

  return {
    model: MODEL,
    system: systemPrompt,
    messages,
    buildAttachments: async (finalText: string) => {
      const attachments: any[] = [];
      for (const type of attachmentTypes) {
        if (type === "docx") attachments.push(await createDocx(finalText));
        if (type === "pdf") attachments.push(await createPDF(finalText));
        if (type === "xlsx") {
          try {
            const structured = await extractPricingStructure(finalText);
            attachments.push(await createXlsx(normaliseForXlsx(structured)));
          } catch (err) {
            console.error("❌ buildSalarStreamingPlan XLSX error:", err);
          }
        }
      }
      return attachments;
    },
    buildMeta: (_finalText: string) => ({
      companion: "salar",
      mode,
      tone,
      nextActions: Array.isArray(pack.nextActions)
        ? pack.nextActions
        : Object.values(pack.nextActions || {}).flat(),
      identity: {
        persona: identity.persona ?? "Commercial Partner",
        title: "Commercial Intelligence Companion",
        mode,
        toneBase: toneText,
      },
      memory: { shortTerm: conversationHistory.slice(-6) },
      workflow: workflowMeta,
    }),
  };
}
