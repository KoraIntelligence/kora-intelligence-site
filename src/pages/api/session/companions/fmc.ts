// src/companions/logic/runFMC.ts
import OpenAI from "openai";
import { FMC_PROFILE } from "../../../../companions/config/fmc";
import { SHARED_CODEX } from "../../../../companions/config/shared";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runFMC({
  input,
  extractedText = "",
  tone = "warm",
  intent = "campaign_creation",
}: {
  input: string;
  extractedText?: string;
  tone?: string;
  intent?: string;
}) {
  const prompt = `
${FMC_PROFILE.invocation}

You are ${FMC_PROFILE.name}, ${FMC_PROFILE.archetype}.
Act in alignment with the Codex: ${SHARED_CODEX.ethos.purpose}
Tone: ${tone || FMC_PROFILE.tone.base}

User input:
"""
${input}
"""

If any marketing brief or brand doc was uploaded:
"""
${extractedText || "No file uploaded."}
"""

Respond as a creative strategist. Use this format:

1. Campaign Essence  
2. Tone Palette  
3. Key Messaging Themes  
4. Suggested Visual Concept (Canva-ready summary)

Keep it inspiring, emotionally intelligent, and structured.`;

  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  const outputText = completion.output_text || "FMC could not form a response.";

  return {
    outputText,
    meta: { companion: "FMC", tone, intent },
    attachments: [],
  };
}