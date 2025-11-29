// ======================================================
//  LYRA — PROMPT PACK REGISTRY (ALL 5 MODES)
// ======================================================

// Mode 0 — Creative Chat
import { LYRA_CREATIVE_CHAT_PROMPTS } from "./creative_chat";

// Mode 1 — Messaging Advisor
import { LYRA_MESSAGING_PROMPTS } from "./messaging";

// Mode 2 — Campaign Builder
import { LYRA_CAMPAIGN_PROMPTS } from "./campaign";

// Mode 3 — Lead Outreach & Segmentation
import { LYRA_OUTREACH_PROMPTS } from "./outreach";

// Mode 4 — Customer Nurture
import { LYRA_NURTURE_PROMPTS } from "./nurture";


// ======================================================
//  REGISTRY
// ======================================================

export const LYRA_PROMPT_REGISTRY = {
  creative_chat: LYRA_CREATIVE_CHAT_PROMPTS,
  messaging_advisor: LYRA_MESSAGING_PROMPTS,
  campaign_builder: LYRA_CAMPAIGN_PROMPTS,
  outreach: LYRA_OUTREACH_PROMPTS,
  customer_nurture: LYRA_NURTURE_PROMPTS,
};


// ======================================================
//  INDIVIDUAL EXPORTS (optional but convenient)
// ======================================================

export {
  LYRA_CREATIVE_CHAT_PROMPTS,
  LYRA_MESSAGING_PROMPTS,
  LYRA_CAMPAIGN_PROMPTS,
  LYRA_OUTREACH_PROMPTS,
  LYRA_NURTURE_PROMPTS,
};