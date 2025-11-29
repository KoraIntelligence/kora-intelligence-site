// src/companions/config/tones.ts

export type CompanionKey = "salar" | "lyra";

export type ToneOption = {
  value: string;
  label: string;
  description?: string;
  scope?: "companion" | "global";
};

export type CompanionToneConfig = {
  companion: CompanionKey;
  baseTone: string; // default tone value for this companion
  options: ToneOption[];
};

export const COMPANION_TONES: Record<CompanionKey, CompanionToneConfig> = {
  salar: {
    companion: "salar",
    baseTone: "calm_commercial",
    options: [
      // Companion-specific tones
      {
        value: "calm_commercial",
        label: "Calm Commercial",
        description: "Measured, steady, de-escalating.",
        scope: "companion",
      },
      {
        value: "assertive",
        label: "Assertive",
        description: "Stronger posture, still respectful.",
        scope: "companion",
      },
      {
        value: "executive",
        label: "Executive",
        description: "High-level, concise, decision-oriented.",
        scope: "companion",
      },
      {
        value: "neutral",
        label: "Neutral Professional",
        description: "Straight, factual, minimal colour.",
        scope: "companion",
      },

      // Global tones
      {
        value: "calm",
        label: "Calm",
        description: "Soft, steady, emotionally contained.",
        scope: "global",
      },
      {
        value: "confident",
        label: "Confident",
        description: "Clear, grounded, quietly strong.",
        scope: "global",
      },
      {
        value: "warm",
        label: "Warm",
        description: "Friendly, human, gently encouraging.",
        scope: "global",
      },
      {
        value: "precise",
        label: "Precise",
        description: "Tightly worded, low fluff.",
        scope: "global",
      },
      {
        value: "curious",
        label: "Curious",
        description: "Question-led, exploratory.",
        scope: "global",
      },
    ],
  },

  lyra: {
    companion: "lyra",
    baseTone: "warm_editorial",
    options: [
      // Companion-specific tones
      {
        value: "warm_editorial",
        label: "Warm Editorial",
        description: "Brand-conscious, thoughtful, articulate.",
        scope: "companion",
      },
      {
        value: "confident_creative",
        label: "Confident Creative",
        description: "Bolder, directional, still grounded.",
        scope: "companion",
      },
      {
        value: "soft_brand",
        label: "Soft Brand Voice",
        description: "Gentle, nurturing, relationship-first.",
        scope: "companion",
      },
      {
        value: "precise_strategy",
        label: "Precise Strategy",
        description: "Sharper, more analytical framing.",
        scope: "companion",
      },

      // Global tones
      {
        value: "calm",
        label: "Calm",
        description: "Soft, steady, emotionally contained.",
        scope: "global",
      },
      {
        value: "confident",
        label: "Confident",
        description: "Clear, grounded, quietly strong.",
        scope: "global",
      },
      {
        value: "warm",
        label: "Warm",
        description: "Friendly, human, gently encouraging.",
        scope: "global",
      },
      {
        value: "precise",
        label: "Precise",
        description: "Tightly worded, low fluff.",
        scope: "global",
      },
      {
        value: "curious",
        label: "Curious",
        description: "Question-led, exploratory.",
        scope: "global",
      },
    ],
  },
};