// src/companions/orchestrators/lyra.ts
// =====================================================================
// LYRA ORCHESTRATOR — Handles all Lyra Modes
// =====================================================================

import { getWorkflow } from "../workflows";
import { loadIdentity } from "../identity/loader";
import OpenAI from "openai";

// Prompt Packs
import { LYRA_CREATIVE_CHAT_PROMPTS } from "../prompts/lyra/creative_chat";
import { LYRA_MESSAGING_PROMPTS } from "../prompts/lyra/messaging";
import { LYRA_CAMPAIGN_PROMPTS } from "../prompts/lyra/campaign";
import { LYRA_OUTREACH_PROMPTS } from "../prompts/lyra/outreach";
import { LYRA_NURTURE_PROMPTS } from "../prompts/lyra/nurture";

// Attachment builders
import {
  createPDF,
  createDocx,
  createXlsx,
} from "../../pages/api/session/utils/generateDocs";

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
// OPENAI CLIENT
// =====================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// =====================================================================
// PROMPT ROUTER
// =====================================================================

function resolvePrompt(
  pack: LyraPromptPack,
  mode: LyraMode,
  nextAction?: string
): string {
  if (!nextAction) return pack.system;

  switch (nextAction) {
    case "clarify_requirements":
    case "ask_questions":
      return pack.clarify || pack.error;

    case "finalise_pack":
      return pack.finalise || pack.error;

    // ---- Creative Chat ----
    case "refine_idea":
      return pack.refine || pack.error;
    case "explore_options":
      return pack.explore || pack.draft || pack.error;
    case "summarise":
      return pack.finalise || pack.error;
    case "switch_mode":
      return pack.system;

    // ---- Messaging ----
    case "draft_concepts":
      return pack.draft || pack.error;
    case "refine_direction":
      return pack.refine || pack.error;

    // ---- Campaign ----
    case "content_plan":
      return pack.contentPlan || pack.error;
    case "kv_direction":
      return pack.kvDirection || pack.error;

    // ---- Outreach ----
    case "request_csv":
      return pack.clarify || pack.error;
    case "segment_data":
      return pack.segmentation || pack.error;
    case "draft_outreach":
      return pack.outreachSequence || pack.draft || pack.error;
    case "refine_outreach":
      return pack.refine || pack.error;

    // ---- Nurture ----
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
// MAIN ORCHESTRATOR
// =====================================================================

export async function runLyra(orchestratorInput: LyraOrchestratorInput) {
  const {
    mode,
    input,
    extractedText,
    tone,
    nextAction,
    conversationHistory,
  } = orchestratorInput;

  const safeHistory = Array.isArray(conversationHistory)
    ? conversationHistory
    : [];

  const pack = PACKS[mode];
  if (!pack) throw new Error(`Unknown Lyra mode: ${mode}`);

  const identity: any = loadIdentity("lyra", mode);

  const toneText =
    (typeof identity.tone === "string"
      ? identity.tone
      : identity.tone?.base) || "warm, clear, brand-conscious";

  const promptBlock = resolvePrompt(pack, mode, nextAction);

  const historyBlock =
    safeHistory.length > 0
      ? `
Previous conversation:
${safeHistory
  .slice(-8)
  .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
  .join("\n\n")}
`
      : "";

  function formatConversation(hist: any[]) {
    return hist
      .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
      .join("\n");
  }

  const memoryBlock = safeHistory.length
    ? `\nHere is the conversation so far:\n${formatConversation(safeHistory)}\n`
    : "";

  const fullPrompt = `
${promptBlock}

You are LYRA in mode **${mode}**
Persona: ${identity.persona || "Creative Partner"}
Base Tone: ${toneText}

${memoryBlock}
${historyBlock}

User Input:
"""
${input}
"""

Uploaded Text:
"""
${extractedText || "N/A"}
"""

Tone: ${tone}
`;

  // -------------------------------------------------------------------
  // OPENAI
  // -------------------------------------------------------------------

  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: fullPrompt,
  });

  const outputText =
    completion.output_text || "Lyra was unable to generate a response.";

  // -------------------------------------------------------------------
  // ATTACHMENTS (PDF / DOCX / XLSX)
  // -------------------------------------------------------------------

  const attachments: any[] = [];

  if (nextAction && pack.attachments?.final) {
    for (const type of pack.attachments.final) {
      if (type === "pdf") attachments.push(await createPDF(outputText));
      if (type === "docx") attachments.push(await createDocx(outputText));
      if (type === "xlsx") attachments.push(await createXlsx(outputText));
    }
  }

  // -------------------------------------------------------------------
  // WORKFLOW METADATA
  // -------------------------------------------------------------------

  const workflow = getWorkflow("lyra", mode);
  let workflowMeta: any = undefined;

  if (workflow) {
    const stageId =
      (nextAction && workflow.nextActionToStage[nextAction]) ||
      workflow.initialStageId;

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
      memory: { shortTerm: safeHistory.slice(-6) },
      workflow: workflowMeta,
    },
  };
}