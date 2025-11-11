// src/companions/logic/runFMC.ts
import OpenAI from "openai";
import { FMC_PROFILE } from "../../../../companions/config/fmc";
import { SHARED_CODEX } from "../../../../companions/config/shared";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// 🪄 Canva Integration Placeholder (Phase 2b)
// Add your Canva API key in your environment variables: process.env.CANVA_API_KEY
const CANVA_API_KEY = process.env.CANVA_API_KEY || "YOUR_CANVA_KEY_HERE";

export async function runFMC({
  input,
  extractedText = "",
  tone = "warm",
  intent = "marketing_copy",
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
  if (intent === "marketing_copy") {
    prompt = `
${FMC_PROFILE.invocation}

You are ${FMC_PROFILE.name}, ${FMC_PROFILE.archetype}.
Act in alignment with the Codex: ${SHARED_CODEX.ethos.purpose}.
Tone: ${tone || FMC_PROFILE.tone.base}.

User input:
"""
${input}
"""

Brand or Campaign Text (if any):
"""
${extractedText || "No uploaded material."}
"""

Respond as a creative strategist crafting compelling brand copy.

Output format:
1. Campaign Essence  
2. Tone Palette  
3. Key Messaging Themes  
4. Visual Hook (for preview card)
5. CTA suggestion (short, human)

Keep your language crisp, emotionally intelligent, and brand-coherent.
`;
  }

  if (intent === "generate_variations") {
    prompt = `
${FMC_PROFILE.invocation}

Generate 3 creative variations of the following marketing message.
Each version should reflect ${tone} tone but express a different angle.

Input:
"""
${input}
"""

RFQ / Brand Brief (if available):
"""
${extractedText || "N/A"}
"""

Output clearly as:
• Variation 1:
• Variation 2:
• Variation 3:
`;
  }

  if (intent === "render_visual") {
    prompt = `
${FMC_PROFILE.invocation}

Create a short text summary describing the ideal visual layout for this campaign — 
as if briefing a Canva designer.

Include:
- Title (for the card)
- Tagline or Headline
- Visual Style Summary (colors, mood, layout)
- Imagery Suggestions

User Input:
"""
${input}
"""

Brand cues (if uploaded):
"""
${extractedText || "No brand document uploaded."}
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
    completion.output_text || "FMC was unable to generate a response.";

  /* ----------------------------------------------------------
     🎨 STEP 3 — Handle attachments and Canva stub integration
  ---------------------------------------------------------- */
  const attachments: any[] = [];

  if (intent === "marketing_copy") {
    attachments.push({
      kind: "preview",
      title: "Campaign Preview",
      body: outputText.slice(0, 800),
    });
  }

  if (intent === "render_visual") {
    // Canva API integration stub — replace this later with live call
    let canvaShareUrl = null;

    try {
      if (CANVA_API_KEY && CANVA_API_KEY !== "YOUR_CANVA_KEY_HERE") {
        // Placeholder for actual Canva integration (Phase 2b)
        // You’ll later use the Canva Create Design API here
        canvaShareUrl = `https://www.canva.com/create?utm_source=kora_preview`;
      } else {
        console.warn("⚠️ Canva API key missing — returning placeholder link");
      }
    } catch (err) {
      console.error("❌ Canva stub failed:", err);
    }

    attachments.push({
      kind: "preview",
      title: "Visual Concept (Canva Ready)",
      body: outputText,
      canvaUrl: canvaShareUrl,
    });
  }

  /* ----------------------------------------------------------
     🔁 STEP 4 — Define next actions
  ---------------------------------------------------------- */
  const nextActions =
    intent === "marketing_copy"
      ? ["render_visual", "generate_variations"]
      : intent === "render_visual"
      ? []
      : [];

  /* ----------------------------------------------------------
     🧾 STEP 5 — Return structured response
  ---------------------------------------------------------- */
  return {
    outputText,
    meta: { companion: "FMC", tone, intent, nextActions },
    attachments,
  };
}