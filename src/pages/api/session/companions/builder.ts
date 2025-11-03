// src/companions/logic/runBuilder.ts
import OpenAI from "openai";
import { BUILDER_PROFILE } from "../../../../companions/config/builder";
import { SHARED_CODEX } from "../../../../companions/config/shared";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runBuilder({
  input,
  extractedText = "",
  tone = "precise",
  intent = "component_design",
}: {
  input: string;
  extractedText?: string;
  tone?: string;
  intent?: string;
}) {
  const prompt = `
${BUILDER_PROFILE.invocation}

You are ${BUILDER_PROFILE.name}, ${BUILDER_PROFILE.archetype}.
Act in alignment with the Codex: ${SHARED_CODEX.ethos.purpose}
Tone: ${tone || BUILDER_PROFILE.tone.base}

User request:
"""
${input}
"""

If any reference or design document was uploaded:
"""
${extractedText || "No file uploaded."}
"""

Respond in the following structure:

1. Intent Summary  
2. Wireframe Outline  
3. HTML/Tailwind Component (well formatted)  
4. Notes for Refinement

Return code within triple backticks for rendering.`;

  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  const outputText = completion.output_text || "Builder could not form a response.";

  return {
    outputText,
    meta: { companion: "Builder", tone, intent },
    attachments: [],
  };
}