// =====================================================================
// LYRA ORCHESTRATOR — Handles all 5 Lyra Modes
// Modes: creative_chat | messaging | campaign | outreach | nurture
// =====================================================================

import { loadIdentity } from "../identity/loader";

import OpenAI from "openai";

// Prompt Packs
import { LYRA_CREATIVE_CHAT_PROMPTS } from "../prompts/lyra/creative_chat";
import { LYRA_MESSAGING_PROMPTS } from "../prompts/lyra/messaging";
import { LYRA_CAMPAIGN_PROMPTS } from "../prompts/lyra/campaign";
import { LYRA_OUTREACH_PROMPTS } from "../prompts/lyra/outreach";
import { LYRA_NURTURE_PROMPTS } from "../prompts/lyra/nurture";

// Attachments (PDF / DOCX / XLSX)
// (Lyra currently uses pdf/txt; txt is ignored for now.)
import {
  createPDF,
  createDocx,
  createXlsx,
} from "../../pages/api/session/utils/generateDocs";

// =====================================================================
//  TYPES
// =====================================================================

export type LyraMode =
  | "creative_chat"
  | "messaging"
  | "campaign"
  | "outreach"
  | "nurture";

export interface LyraOrchestratorInput {
  mode: LyraMode;
  input: string;
  extractedText: string;
  tone: string;
  nextAction?: string;
}

// Shape that each Lyra prompt pack follows
export interface LyraPromptPack {
  mode: LyraMode;

  // Core
  system: string;
  error: string;

  // Generic phases
  clarify?: string;
  draft?: string;
  refine?: string;
  finalise?: string;

  // Freeform / creative chat
  context?: string;
  explore?: string;

  // Campaign-specific
  contentPlan?: string;
  kvDirection?: string;

  // Outreach-specific
  dataIngestion?: string;
  segmentation?: string;
  outreachSequence?: string;

  // Nurture-specific
  narrativeArc?: string;
  emailDrafts?: string;

  // Next action map (UI / flowchart)
  nextActions: Record<string, string[]>;

  // Attachments per stage
  attachments?: {
    draft?: string[];
    refinement?: string[];
    final?: string[];
  };
}

// =====================================================================
//  REGISTRY
// =====================================================================

const PACKS: Record<LyraMode, LyraPromptPack> = {
  creative_chat: LYRA_CREATIVE_CHAT_PROMPTS,
  messaging: LYRA_MESSAGING_PROMPTS,
  campaign: LYRA_CAMPAIGN_PROMPTS,
  outreach: LYRA_OUTREACH_PROMPTS,
  nurture: LYRA_NURTURE_PROMPTS,
};

// =====================================================================
//  OPENAI CLIENT
// =====================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// =====================================================================
//  PROMPT RESOLVER — maps nextAction → correct prompt block
// =====================================================================

function resolvePrompt(
  pack: LyraPromptPack,
  mode: LyraMode,
  nextAction?: string
): string {
  // First turn / no explicit nextAction → use system prompt
  if (!nextAction) return pack.system;

  switch (nextAction) {
    // ======================================================
    //  SHARED / GENERIC PATTERNS
    // ======================================================
    case "clarify_requirements":
    case "ask_questions":
      return pack.clarify || pack.error;

    case "finalise_pack":
      return pack.finalise || pack.error;

    // ======================================================
    //  MODE 0 — CREATIVE CHAT
    //  NextActions:
    //  - refine_idea
    //  - explore_options
    //  - summarise
    //  - switch_mode
    // ======================================================
    case "refine_idea":
      return pack.refine || pack.error;

    case "explore_options":
      return pack.explore || pack.draft || pack.error;

    case "summarise":
      return pack.finalise || pack.error;

    case "switch_mode":
      // Just reset to system identity / reset conversation framing
      return pack.system;

    // ======================================================
    //  MODE 1 — MESSAGING ADVISOR
    //  NextActions:
    //  - ask_questions
    //  - draft_concepts
    //  - refine_direction
    //  - finalise_pack
    // ======================================================
    case "draft_concepts":
      return pack.draft || pack.error;

    case "refine_direction":
      return pack.refine || pack.error;

    // ======================================================
    //  MODE 2 — CAMPAIGN BUILDER
    //  NextActions:
    //  - ask_questions
    //  - draft_concepts
    //  - refine_direction
    //  - content_plan
    //  - kv_direction
    //  - finalise_pack
    // ======================================================
    case "content_plan":
      return pack.contentPlan || pack.error;

    case "kv_direction":
      return pack.kvDirection || pack.error;

    // ======================================================
    //  MODE 3 — OUTREACH & SEGMENTATION
    //  NextActions:
    //  - request_csv
    //  - segment_data
    //  - draft_outreach
    //  - refine_outreach
    //  - finalise_pack
    // ======================================================
    case "request_csv":
      return pack.clarify || pack.error;

    case "segment_data":
      return pack.segmentation || pack.error;

    case "draft_outreach":
      return pack.outreachSequence || pack.draft || pack.error;

    case "refine_outreach":
      return pack.refine || pack.error;

    // ======================================================
    //  MODE 4 — NURTURE
    //  NextActions:
    //  - ask_questions
    //  - draft_arc
    //  - draft_emails
    //  - refine_emails
    //  - finalise_pack
    // ======================================================
    case "draft_arc":
      return pack.narrativeArc || pack.draft || pack.error;

    case "draft_emails":
      return pack.emailDrafts || pack.draft || pack.error;

    case "refine_emails":
      return pack.refine || pack.error;

    default:
      // Fallback: go back to system prompt
      return pack.system;
  }
}

// =====================================================================
//  MAIN ORCHESTRATOR FUNCTION
// =====================================================================

export async function runLyra(orchestratorInput: LyraOrchestratorInput) {
  const { mode, input, extractedText, tone, nextAction } = orchestratorInput;

  const pack = PACKS[mode];
  if (!pack) {
    throw new Error(`Unknown Lyra mode: ${mode}`);
  }

  // ----- Identity + tone extraction -----
  const identity = loadIdentity("lyra", mode);

  const toneText =
    (typeof identity.tone === "string"
      ? identity.tone
      : identity.tone?.base) || "warm, clear, brand-conscious";

  // ----- Prompt resolution -----
  const promptBlock = resolvePrompt(pack, mode, nextAction);

  // ----- Build final prompt -----
  const fullPrompt = `
${promptBlock}

You are operating as **Lyra** in mode: **${mode}**.
Persona: ${identity.persona || "Creative Partner"}
Base Tone: ${toneText}

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

  // ----- OpenAI Response -----
  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: fullPrompt,
  });

  const outputText =
    completion.output_text || "Lyra was unable to generate a response.";

  // =====================================================================
  //  ATTACHMENTS — MUST COME *AFTER* outputText + pack are defined!
  // =====================================================================

  const attachments: any[] = [];

  if (nextAction && nextAction.startsWith("finalise") && pack.attachments) {
    const finalAttachments = pack.attachments.final || [];

    for (const type of finalAttachments) {
      if (type === "pdf") {
        attachments.push(await createPDF(outputText));
      }
      if (type === "docx") {
        attachments.push(await createDocx(outputText));
      }
      if (type === "xlsx") {
        attachments.push(await createXlsx(outputText));
      }
      // TXT is handled on frontend — raw outputText.
    }
  }

  // ----- Return payload -----
  return {
    outputText,
    attachments,
    meta: {
      companion: "Lyra",
      mode,
      nextActions: pack.nextActions,
      identity: {
        mode,
        persona: identity.persona,
        tone: toneText,
      },
    },
  };
}