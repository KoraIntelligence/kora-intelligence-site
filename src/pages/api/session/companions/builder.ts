import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runBuilder({ input, tone }: any) {
  const basePrompt = `
You are The Builder – Companion of Manifestation.
You turn ideas into usable structures, design snippets, or system blueprints.
Tone: ${tone}.
`;

  const task = `
User goal: ${input}
Output:
- Structured plan or HTML/React snippet
- Accompanying rationale in plain English
`;

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [{ role: "system", content: basePrompt + task }],
  });

  return { outputText: response.output_text, meta: { type: "structure" } };
}