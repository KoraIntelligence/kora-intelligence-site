import OpenAI from "openai";
import { BUILDER_PROFILE } from "../../../../companions/config/builder";
import { SHARED_CODEX } from "../../../../companions/config/shared";
import { createPDF, createDocx } from "../../../api/session/utils/generateDocs";

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
  let prompt = "";

  /* ----------------------------------------------------------
     🧠 STEP 1 — Build intent-specific prompt
  ---------------------------------------------------------- */
  if (intent === "component_design") {
    prompt = `
${BUILDER_PROFILE.invocation}

You are ${BUILDER_PROFILE.name}, ${BUILDER_PROFILE.archetype}.
Act in alignment with the Codex: ${SHARED_CODEX.ethos.purpose}.
Tone: ${tone || BUILDER_PROFILE.tone.base}.

User request:
"""
${input}
"""

Reference or design brief (if any):
"""
${extractedText || "No reference uploaded."}
"""

Generate a complete HTML component using TailwindCSS.

Respond in this structure:
1. Design Summary  
2. Layout & Wireframe Outline  
3. HTML/Tailwind Code (within triple backticks)  
4. Implementation Notes  

Keep it responsive, semantic, and production-ready.
`;
  }

  if (intent === "refine_component") {
    prompt = `
${BUILDER_PROFILE.invocation}

You are ${BUILDER_PROFILE.name}, ${BUILDER_PROFILE.archetype}.
Act in alignment with the Codex: ${SHARED_CODEX.ethos.purpose}.
Tone: ${tone}.

The user has provided existing code and refinement instructions.

User input:
"""
${input}
"""

Uploaded reference (if any):
"""
${extractedText || "None"}
"""

Return:
1. Updated Component Code (in triple backticks)
2. Summary of changes
3. Notes for future refinement
`;
  }

  if (intent === "generate_notes") {
    prompt = `
${BUILDER_PROFILE.invocation}

Analyze the provided concept or layout idea and produce:
1. Design feedback  
2. Suggested improvements  
3. Accessibility recommendations  
4. Technical next steps

Input:
"""
${input}
"""
`;
  }

  /* ----------------------------------------------------------
     ✨ STEP 2 — Generate response from OpenAI
  ---------------------------------------------------------- */
  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  const outputText =
    completion.output_text || "Builder could not form a response.";

  /* ----------------------------------------------------------
     🧩 STEP 3 — Extract and prepare preview attachments
  ---------------------------------------------------------- */
  const attachments: any[] = [];

  // Try to detect the code block from the output
  const codeMatch = outputText.match(/```(?:html|HTML|tailwind)?([\s\S]*?)```/);
  const htmlCode = codeMatch ? codeMatch[1].trim() : "";

  if (htmlCode) {
    attachments.push({
      kind: "html",
      content: htmlCode,
      title: "Live Preview (Tailwind Component)",
    });

    // Also prepare a downloadable .html file
    const htmlBlob = Buffer.from(htmlCode);
    attachments.push({
      kind: "docx", // fallback format for now (we’ll support .html in frontend)
      filename: `builder_component_${Date.now()}.html`,
      dataUrl: `data:text/html;base64,${htmlBlob.toString("base64")}`,
    });
  }

  if (intent === "generate_notes") {
    const pdf = await createPDF(outputText);
    const docx = await createDocx(outputText);
    attachments.push(pdf, docx);
  }

  /* ----------------------------------------------------------
     🔁 STEP 4 — Define nextActions
  ---------------------------------------------------------- */
  const nextActions =
    intent === "component_design"
      ? ["refine_component", "generate_notes"]
      : intent === "refine_component"
      ? ["generate_notes"]
      : [];

  /* ----------------------------------------------------------
     🧾 STEP 5 — Return structured response
  ---------------------------------------------------------- */
  return {
    outputText,
    meta: { companion: "Builder", tone, intent, nextActions },
    attachments,
  };
}