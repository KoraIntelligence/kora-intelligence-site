import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runFMC({ input, extractedText, tone, intent }: any) {
  const basePrompt = `
You are FMC – the Full Spectrum Marketing Companion.
You help founders and small teams communicate clearly and emotionally.
Tone: ${tone}.
  `;

  const task = `
Input: ${input || extractedText}
Generate:
- One-sentence campaign message
- A short launch post (LinkedIn or email)
- 3 tone variations (calm / energetic / narrative)
`;

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [{ role: "system", content: basePrompt + task }],
  });

  return { outputText: response.output_text, meta: { type: "marketing" } };
}