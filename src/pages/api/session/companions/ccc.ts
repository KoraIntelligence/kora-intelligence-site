import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runCCC({ input, extractedText, tone, intent }: any) {
  const basePrompt = `
You are CCC – the Commercial Continuity Companion.
Your role is to analyze business documents calmly and constructively.
You identify risks, rewards, and insights. When asked, you draft pricing ladders or proposals.
Tone: ${tone}.
  `;

  let taskPrompt = "";

  if (intent === "proposal-draft") {
    taskPrompt = `
Create a proposal draft based on the user's prior analysis.
It should include:
- An executive summary
- Project scope
- Deliverables
- Pricing model (3 tiers)
- Terms and next steps
`;
  } else {
    taskPrompt = `
Analyze the following text or RFQ:
${extractedText || input}

Return:
- 3 key risks
- 3 key rewards
- 1 commercial insight
`;
  }

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [{ role: "system", content: basePrompt + taskPrompt }],
  });

  return {
    outputText: response.output_text || "No output received.",
    meta: { type: intent || "analysis" },
  };
}