// src/companions/logic/runCCC.ts
import OpenAI from "openai";
import { CCC_PROFILE } from "../../../../companions/config/ccc";
import { SHARED_CODEX } from "../../../../companions/config/shared";
import { createPDF, createDocx, createXlsx } from "../utils/generateDocs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runCCC({
  input,
  extractedText = "",
  tone = "calm",
  intent = "rfq_rfp_analysis",
}: {
  input: string;
  extractedText?: string;
  tone?: string;
  intent?: string;
}) {
  console.log(`📄 runCCC invoked with intent: ${intent}`);

  /* ----------------------------------------------------------
     🧭 STEP 1 — Shared personality & tone context
  ---------------------------------------------------------- */
  const baseContext = `
You are ${CCC_PROFILE.name}, ${CCC_PROFILE.archetype}.
Act in alignment with the Codex: ${SHARED_CODEX.ethos.purpose}.
Maintain a ${tone || CCC_PROFILE.tone.base} tone, consistent with ${CCC_PROFILE.tone.base}.

Uploaded RFQ (if any):
"""
${extractedText || "No RFQ text provided."}
"""
`;

  let prompt = "";

  /* ----------------------------------------------------------
     🧠 STEP 2 — Intent-specific prompt logic
  ---------------------------------------------------------- */
  if (intent === "rfq_rfp_analysis") {
    prompt = `
${CCC_PROFILE.invocation}

${baseContext}

Analyze the provided RFQ or request and respond in this structure:

1. Executive Summary  
2. Risk and Reward Overview  
3. Commercial Recommendation  
4. Next Step Invitation (CTA)

User input:
"""
${input}
"""

Keep it concise, structured, and empathetic.
`;
  }

  if (intent === "proposal_draft") {
    prompt = `
${CCC_PROFILE.invocation}

${baseContext}

You are preparing a proposal draft directly aligned with the user's RFQ or query.
Structure your response as:

1. Proposal Title  
2. Objectives and Understanding  
3. Approach and Methodology  
4. Deliverables  
5. Timeline and Milestones  
6. Team / Roles (if relevant)  
7. Pricing Notes (summary only)  
8. Next Steps

Respond in natural language, ready for a proposal document.

User input:
"""
${input}
"""
`;
  }

  if (intent === "pricing_sheet") {
    prompt = `
${CCC_PROFILE.invocation}

${baseContext}

Use all available context (user input and RFQ text) to outline a *tiered pricing structure*
for the proposed project. Each tier should differ in scope, deliverables, and price.

Return the data clearly as a CSV-style table (comma-separated):

Tier, Scope, Deliverables, Price, Notes

User input:
"""
${input}
"""
`;
  }

  /* ----------------------------------------------------------
     🧩 STEP 3 — Generate response via OpenAI
  ---------------------------------------------------------- */
  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  const outputText =
    completion.output_text ||
    `${CCC_PROFILE.name} could not generate a response.`;

  /* ----------------------------------------------------------
     🧱 STEP 4 — Create file attachments (PDF, DOCX, XLSX)
  ---------------------------------------------------------- */
  const attachments: any[] = [];

  if (intent === "rfq_rfp_analysis") {
    attachments.push(await createPDF(outputText));
  }

  if (intent === "proposal_draft") {
    const pdf = await createPDF(outputText);
    const docx = await createDocx(outputText);
    attachments.push(pdf, docx);
  }

  if (intent === "pricing_sheet") {
    const csvLines = outputText
      .split("\n")
      .map((line) => line.split(",").map((s) => s.trim()))
      .filter((arr) => arr.length > 1);

    const xlsx = await createXlsx(csvLines.length ? csvLines : outputText);
    const pdf = await createPDF(outputText);
    attachments.push(xlsx, pdf);
  }

  /* ----------------------------------------------------------
     🧾 STEP 5 — Define next actions (for CompanionChatUnified)
  ---------------------------------------------------------- */
  const nextActions =
    intent === "rfq_rfp_analysis"
      ? ["proposal_draft"]
      : intent === "proposal_draft"
      ? ["pricing_sheet"]
      : [];

  /* ----------------------------------------------------------
     ✅ STEP 6 — Return unified response
  ---------------------------------------------------------- */
  return {
    outputText,
    meta: { companion: "CCC", tone, intent, nextActions },
    attachments,
  };
}