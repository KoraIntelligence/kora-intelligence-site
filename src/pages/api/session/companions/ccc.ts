// src/companions/logic/runCCC.ts
import OpenAI from "openai";
import { CCC_PROFILE } from "../../../../companions/config/ccc";
import { SHARED_CODEX } from "../../../../companions/config/shared";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runCCC({
  input,
  extractedText = "",
  tone = "calm",
  intent = "proposal_analysis",
}: {
  input: string;
  extractedText?: string;
  tone?: string;
  intent?: string;
}) {
  const prompt = `
${CCC_PROFILE.invocation}

You are ${CCC_PROFILE.name}, ${CCC_PROFILE.archetype}.
Act in alignment with the Codex: ${SHARED_CODEX.ethos.purpose}
Tone: ${tone || CCC_PROFILE.tone.base}

User input:
"""
${input}
"""

If any RFQ/RFP text was uploaded:
"""
${extractedText || "No file uploaded."}
"""

Respond in a structured and analytical format:

1. Executive Summary  
2. Risk and Reward Overview  
3. Commercial Recommendation  
4. Next Step Invitation (optional)

Keep responses structured, and calm.`;

  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  const outputText = completion.output_text || "CCC could not form a response.";

  return {
    outputText,
    meta: { companion: "CCC", tone, intent },
    attachments: [],
  };
}