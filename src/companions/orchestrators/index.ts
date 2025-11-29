// ====================================================================
//  COMPANION ROUTER (Salar + Lyra)
//  Entry point for all companion conversations.
// ====================================================================

import type { NextApiRequest, NextApiResponse } from "next";

import { runSalar } from "../../companions/orchestrators/salar";
import { runLyra } from "../../companions/orchestrators/lyra";

// Identity Loader (optional for embedding into prompts soon)
import { loadIdentity } from "../../companions/identity/loader";

// Types
interface CompanionRequest {
  companion: "salar" | "lyra";
  mode: string;
  input: string;
  extractedText?: string;
  tone?: string;
  nextAction?: string;
}

// ====================================================================
//  API HANDLER
// ====================================================================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      companion,
      mode,
      input,
      extractedText = "",
      tone = "neutral",
      nextAction,
    } = req.body as CompanionRequest;

    // --------------------------------------------------------------
    // Validate Companion
    // --------------------------------------------------------------
    if (companion !== "salar" && companion !== "lyra") {
      return res.status(400).json({
        error: `Unknown companion: ${companion}`,
      });
    }

    // --------------------------------------------------------------
    // Validate Mode
    // --------------------------------------------------------------
    const validModes =
      companion === "salar"
        ? [
            "commercial_chat",
            "proposal",
            "contract_advice",
            "pricing",
            "strategy",
          ]
        : [
            "creative_chat",
            "messaging",
            "campaign",
            "outreach",
            "nurture",
          ];

    if (!validModes.includes(mode)) {
      return res.status(400).json({
        error: `Invalid mode "${mode}" for companion "${companion}"`,
      });
    }

    // --------------------------------------------------------------
    // OPTIONAL: Load identity block (future integration)
    // --------------------------------------------------------------
    const identity = loadIdentity(companion, mode);

    // --------------------------------------------------------------
    // RUN COMPANION ORCHESTRATOR
    // --------------------------------------------------------------
    let response;

    if (companion === "salar") {
      response = await runSalar({
        mode: mode as any,
        input,
        extractedText,
        tone,
        nextAction,
      });
    } else {
      response = await runLyra({
        mode: mode as any,
        input,
        extractedText,
        tone,
        nextAction,
      });
    }

    // Attach identity so front-end / flowchart can display it
    response.meta.identity = identity;

    return res.status(200).json(response);
  } catch (err: any) {
    console.error("Companion Router Error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}