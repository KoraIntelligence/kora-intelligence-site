// src/companions/identity/loader.ts
// ===============================================================
//  COMPANION IDENTITY LOADER
//  Kora Shared Codex → Base Identity → Mode Identity
// ===============================================================

import { SHARED_CODEX } from "../codex/shared";

// ---- Base Companion Identities ----
import { LYRA_IDENTITY } from "./lyra";
import { SALAR_IDENTITY } from "./salar";

// ---- Lyra Mode Identities ----
import { LYRA_CREATIVE_CHAT_IDENTITY } from "../modes/lyra/creative_chat";
import { LYRA_MESSAGING_IDENTITY } from "../modes/lyra/messaging_advisor";
import { LYRA_CAMPAIGN_IDENTITY } from "../modes/lyra/campaign_builder";
import { LYRA_OUTREACH_IDENTITY } from "../modes/lyra/lead_outreach";
import { LYRA_NURTURE_IDENTITY } from "../modes/lyra/customer_nurture";

// ---- Salar Mode Identities ----
import { SALAR_COMMERCIAL_CHAT_IDENTITY } from "../modes/salar/commercial_chat";
import { SALAR_MODE_PROPOSAL } from "../modes/salar/proposal_builder";
import { SALAR_MODE_CONTRACT } from "../modes/salar/contract_advisor";
import { SALAR_MODE_PRICING } from "../modes/salar/pricing_estimation";
import { SALAR_MODE_STRATEGY } from "../modes/salar/commercial_strategist";

// ===============================================================
//  MODE UNIONS
// ===============================================================

export type SalarModes =
  | "commercial_chat"
  | "proposal_builder"
  | "contract_advisor"
  | "pricing_estimation"
  | "commercial_strategist";

export type LyraModes =
  | "creative_chat"
  | "messaging_advisor"
  | "campaign_builder"
  | "lead_outreach"
  | "customer_nurture";

// ===============================================================
//  FLEXIBLE IDENTITY TYPE
//  (Deliberately permissive so scrolls can stay rich & textual)
// ===============================================================

export interface CompanionIdentity {
  // high-level fields
  codex?: any;
  coreIdentity?: string;
  purpose?: string;

  // tone can be simple string OR structured object
  tone?: string | { base?: string; texture?: string; priority?: string[] };

  // temperament can be free-form text or structured later
  temperament?: any;
  communication?: any;

  // behaviours can be a block of text or a list
  behaviours?: string | string[];
  behaviour?: string | string[];

  strengths?: string[] | string;
  boundaries?: string[] | string;

  capabilities?: any;
  style?: any;
  ethics?: any;
  modes?: any;

  // mode-level fields
  mode?: string;
  persona?: string;

  meta?: any;

  // allow additional scroll keys without TS complaining
  [key: string]: any;
}

// A config for each companion: base scroll + per-mode overlays
type CompanionConfig<M extends string> = {
  base: CompanionIdentity;
  modes: Record<M, CompanionIdentity>;
};

// ===============================================================
//  REGISTRY — Base Companion Identity + All Modes
// ===============================================================

export const IDENTITY_REGISTRY: {
  lyra: CompanionConfig<LyraModes>;
  salar: CompanionConfig<SalarModes>;
} = {
  lyra: {
    base: LYRA_IDENTITY as CompanionIdentity,
    modes: {
      creative_chat: LYRA_CREATIVE_CHAT_IDENTITY as CompanionIdentity,
      messaging_advisor: LYRA_MESSAGING_IDENTITY as CompanionIdentity,
      campaign_builder: LYRA_CAMPAIGN_IDENTITY as CompanionIdentity,
      lead_outreach: LYRA_OUTREACH_IDENTITY as CompanionIdentity,
      customer_nurture: LYRA_NURTURE_IDENTITY as CompanionIdentity,
    },
  },

  salar: {
    base: SALAR_IDENTITY as CompanionIdentity,
    modes: {
      commercial_chat: SALAR_COMMERCIAL_CHAT_IDENTITY as CompanionIdentity,
      proposal_builder: SALAR_MODE_PROPOSAL as CompanionIdentity,
      contract_advisor: SALAR_MODE_CONTRACT as CompanionIdentity,
      pricing_estimation: SALAR_MODE_PRICING as CompanionIdentity,
      commercial_strategist: SALAR_MODE_STRATEGY as CompanionIdentity,
    },
  },
};

// ===============================================================
//  LOADER FUNCTION — merges Shared Codex + Base + Mode Identity
// ===============================================================

export function loadIdentity(
  companion: "lyra" | "salar",
  mode?: string
): CompanionIdentity {
  const config = IDENTITY_REGISTRY[companion];
  if (!config) {
    throw new Error(`❌ Unknown companion: ${companion}`);
  }

  // --- Base identity only (no specific mode requested) ---
  if (!mode) {
    return {
      ...config.base,
      codex: SHARED_CODEX.core,
    };
  }

  const modeIdentity =
    (config.modes as Record<string, CompanionIdentity>)[mode];

  if (!modeIdentity) {
    throw new Error(
      `❌ Mode "${mode}" does not exist for companion "${companion}".`
    );
  }

  // --- Merge layers: Shared Codex + Base Identity + Mode Identity ---
  return {
    ...config.base,
    ...modeIdentity,
    codex: SHARED_CODEX.core,
  };
}