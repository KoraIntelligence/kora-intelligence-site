// src/companions/orchestrators/lyra.ts
// =====================================================================
// LYRA ORCHESTRATOR — Handles all Lyra Modes
// Migrated to Anthropic Claude (claude-sonnet-4-6)
// =====================================================================

import Anthropic from "@anthropic-ai/sdk";
import { getWorkflow } from "../workflows";
import { loadIdentity } from "../identity/loader";

import { LYRA_CREATIVE_CHAT_PROMPTS } from "../prompts/lyra/creative_chat";
import { LYRA_MESSAGING_PROMPTS } from "../prompts/lyra/messaging";
import { LYRA_CAMPAIGN_PROMPTS } from "../prompts/lyra/campaign";
import { LYRA_OUTREACH_PROMPTS } from "../prompts/lyra/outreach";
import { LYRA_NURTURE_PROMPTS } from "../prompts/lyra/nurture";

import { createPDF, createDocx, createXlsx } from "../../pages/api/session/utils/generateDocs";

// =====================================================================
// TYPES
// =====================================================================

export type LyraMode =
  | "creative_chat"
  | "messaging_advisor"
  | "campaign_builder"
  | "lead_outreach"
  | "customer_nurture";

export interface LyraOrchestratorInput {
  mode: LyraMode;
  input: string;
  extractedText: string;
  tone: string;
  nextAction?: string;
  conversationHistory?: { role: string; content: string; meta?: any | null }[];
  brandContext?: string;
  handoverContext?: string;
}

export interface LyraPromptPack {
  mode: LyraMode;
  system: string;
  error: string;
  clarify?: string;
  draft?: string;
  refine?: string;
  finalise?: string;

  context?: string;
  explore?: string;
  contentPlan?: string;
  kvDirection?: string;
  dataIngestion?: string;
  segmentation?: string;
  outreachSequence?: string;
  narrativeArc?: string;
  emailDrafts?: string;

  nextActions: Record<string, string[]>;

  attachments?: {
    draft?: string[];
    refinement?: string[];
    final?: string[];
  };
}

// =====================================================================
// REGISTRY
// =====================================================================

const PACKS: Record<LyraMode, LyraPromptPack> = {
  creative_chat: LYRA_CREATIVE_CHAT_PROMPTS,
  messaging_advisor: LYRA_MESSAGING_PROMPTS,
  campaign_builder: LYRA_CAMPAIGN_PROMPTS,
  lead_outreach: LYRA_OUTREACH_PROMPTS,
  customer_nurture: LYRA_NURTURE_PROMPTS,
};

// =====================================================================
// ANTHROPIC CLIENT
// =====================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = process.env.KORA_MODEL || "claude-sonnet-4-6";

// =====================================================================
// PROMPT ROUTER
// =====================================================================

function resolvePrompt(pack: LyraPromptPack, mode: LyraMode, nextAction?: string): string {
  if (!nextAction) return pack.system;

  switch (nextAction) {
    case "clarify_requirements":
    case "ask_questions":
      return pack.clarify || pack.error;
    case "finalise_pack":
      return pack.finalise || pack.error;
    case "refine_idea":
      return pack.refine || pack.error;
    case "explore_options":
      return pack.explore || pack.draft || pack.error;
    case "summarise":
      return pack.finalise || pack.error;
    case "switch_mode":
      return pack.system;
    case "draft_concepts":
      return pack.draft || pack.error;
    case "refine_direction":
      return pack.refine || pack.error;
    case "content_plan":
      return pack.contentPlan || pack.error;
    case "kv_direction":
      return pack.kvDirection || pack.error;
    case "request_csv":
      return pack.clarify || pack.error;
    case "segment_data":
      return pack.segmentation || pack.error;
    case "draft_outreach":
      return pack.outreachSequence || pack.draft || pack.error;
    case "refine_outreach":
      return pack.refine || pack.error;
    case "draft_arc":
      return pack.narrativeArc || pack.draft || pack.error;
    case "draft_emails":
      return pack.emailDrafts || pack.draft || pack.error;
    case "refine_emails":
      return pack.refine || pack.error;
    default:
      return pack.system;
  }
}

// =====================================================================
// BUILD SYSTEM PROMPT
// =====================================================================

function buildSystemPrompt(
  identity: any,
  pack: LyraPromptPack,
  nextAction: string | undefined,
  brandContext: string,
  handoverContext: string,
  mode: LyraMode,
  tone: string
): string {
  const toneText =
    (typeof identity.tone === "string" ? identity.tone : identity.tone?.base) ||
    "warm, clear, brand-conscious";

  const identityBlock = `You are Lyra, Kora's brand and marketing intelligence companion.
Persona: ${identity.persona || "Creative Partner"}
Mode: ${mode}
Tone: ${toneText}
${identity.codex ? "\n" + identity.codex : ""}`;

  const modeInstructions = resolvePrompt(pack, mode, nextAction);

  const brandBlock = brandContext
    ? `\n\n---\nBRAND CONTEXT:\n${brandContext}\n---`
    : "";

  const handoverBlock = handoverContext
    ? `\n\n---\nCONTEXT FROM PREVIOUS CONVERSATION:\n${handoverContext}\n---`
    : "";

  const toneBlock = `\nRequested tone: ${tone}`;

  return `${identityBlock}\n\n${modeInstructions}${brandBlock}${handoverBlock}${toneBlock}`;
}

// =====================================================================
// BUILD MESSAGES
// =====================================================================

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

  let currentContent = userInput || "";
  if (extractedText) {
    currentContent += `\n\nUploaded document:\n"""\n${extractedText}\n"""`;
  }
  if (currentContent.trim()) {
    messages.push({ role: "user", content: currentContent.trim() });
  }

  if (messages.length === 0) {
    messages.push({ role: "user", content: "(start)" });
  }

  return messages;
}

// =====================================================================
// MAIN ORCHESTRATOR (non-streaming)
// =====================================================================

export async function runLyra(orchestratorInput: LyraOrchestratorInput) {
  const {
    mode,
    input,
    extractedText,
    tone,
    nextAction,
    conversationHistory = [],
    brandContext = "",
    handoverContext = "",
  } = orchestratorInput;

  const pack = PACKS[mode];
  if (!pack) throw new Error(`Unknown Lyra mode: ${mode}`);

  const identity: any = loadIdentity("lyra", mode);

  const systemPrompt = buildSystemPrompt(
    identity, pack, nextAction, brandContext, handoverContext, mode, tone
  );

  const messages = buildMessages(conversationHistory, input, extractedText);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: systemPrompt,
    messages,
  });

  const outputText =
    response.content[0]?.type === "text"
      ? response.content[0].text
      : "Lyra was unable to generate a response.";

  const attachments: any[] = [];

  if (nextAction && pack.attachments?.final) {
    for (const type of pack.attachments.final) {
      if (type === "pdf") attachments.push(await createPDF(outputText));
      if (type === "docx") attachments.push(await createDocx(outputText));
      if (type === "xlsx") attachments.push(await createXlsx(outputText));
    }
  }

  const workflow = getWorkflow("lyra", mode);
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
    (typeof identity.tone === "string" ? identity.tone : identity.tone?.base) ||
    "warm, clear, brand-conscious";

  const flatNextActions = Object.values(pack.nextActions || {}).flat();

  return {
    reply: outputText,
    attachments,
    meta: {
      companion: "lyra",
      mode,
      tone,
      nextActions: flatNextActions,
      identity: {
        persona: identity.persona || "Creative Partner",
        title: "Brand & Marketing Intelligence Companion",
        mode,
        toneBase: toneText,
      },
      memory: { shortTerm: conversationHistory.slice(-6) },
      workflow: workflowMeta,
    },
  };
}

// =====================================================================
// STREAMING PLAN
// =====================================================================

export type LyraStreamingPlanInput = LyraOrchestratorInput;

export function buildLyraStreamingPlan(orchestratorInput: LyraStreamingPlanInput) {
  const {
    mode,
    input,
    extractedText,
    tone,
    nextAction,
    conversationHistory = [],
    brandContext = "",
    handoverContext = "",
  } = orchestratorInput;

  const pack = PACKS[mode];
  if (!pack) throw new Error(`Unknown Lyra mode: ${mode}`);

  const identity: any = loadIdentity("lyra", mode);

  const systemPrompt = buildSystemPrompt(
    identity, pack, nextAction, brandContext, handoverContext, mode, tone
  );

  const messages = buildMessages(conversationHistory, input, extractedText);

  const attachmentTypes =
    nextAction && pack.attachments?.final ? pack.attachments.final : [];

  const workflow = getWorkflow("lyra", mode);
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
    (typeof identity.tone === "string" ? identity.tone : identity.tone?.base) ||
    "warm, clear, brand-conscious";

  const flatNextActions = Object.values(pack.nextActions || {}).flat();

  return {
    model: MODEL,
    system: systemPrompt,
    messages,
    buildAttachments: async (finalText: string) => {
      const attachments: any[] = [];
      for (const type of attachmentTypes) {
        if (type === "pdf") attachments.push(await createPDF(finalText));
        if (type === "docx") attachments.push(await createDocx(finalText));
        if (type === "xlsx") attachments.push(await createXlsx(finalText));
      }
      return attachments;
    },
    buildMeta: (_finalText: string) => ({
      companion: "lyra",
      mode,
      tone,
      nextActions: flatNextActions,
      identity: {
        persona: identity.persona || "Creative Partner",
        title: "Brand & Marketing Intelligence Companion",
        mode,
        toneBase: toneText,
      },
      memory: { shortTerm: conversationHistory.slice(-6) },
      workflow: workflowMeta,
    }),
  };
}
