// ======================================================
//  SALAR — PROMPT PACK REGISTRY (ALL 5 MODES)
// ======================================================

import { SALAR_COMMERCIAL_CHAT_PROMPTS } from "./commercial_chat";
import { SALAR_CONTRACT_PROMPTS } from "./contract_advice";
import { SALAR_PRICING_PROMPTS } from "./pricing";
import { SALAR_PROPOSAL_PROMPTS } from "./proposal";
import { SALAR_STRATEGY_PROMPTS } from "./strategy";

export const SALAR_PROMPT_REGISTRY = {
  commercial_chat: SALAR_COMMERCIAL_CHAT_PROMPTS,
  proposal: SALAR_PROPOSAL_PROMPTS,
  contract_advice: SALAR_CONTRACT_PROMPTS,
  pricing: SALAR_PRICING_PROMPTS,
  strategy: SALAR_STRATEGY_PROMPTS,
};

// Export individual named exports (optional, but convenient)
export {
  SALAR_COMMERCIAL_CHAT_PROMPTS,
  SALAR_PROPOSAL_PROMPTS,
  SALAR_CONTRACT_PROMPTS,
  SALAR_PRICING_PROMPTS,
  SALAR_STRATEGY_PROMPTS,
};