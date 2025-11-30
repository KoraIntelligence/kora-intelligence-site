// ====================================================================
//  COMPANION ROUTER (Salar + Lyra)
// ====================================================================

import type { NextApiRequest, NextApiResponse } from "next";

import { runSalar } from "../../companions/orchestrators/salar";
import { runLyra } from "../../companions/orchestrators/lyra";
import { loadIdentity } from "../../companions/identity/loader";

// Router-level type — very loose on purpose
interface RouterResponse {
  reply: string;
  attachments: any[];
  meta: Record<string, any>;
}

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
    } = req.body;

    if (companion !== "salar" && companion !== "lyra") {
      return res.status(400).json({ error: `Unknown companion: ${companion}` });
    }

    const identity = loadIdentity(companion, mode);

    // ---- RUN ORCHESTRATOR -----------------------------------------
    const orchestratorResult =
      companion === "salar"
        ? await runSalar({ mode, input, extractedText, tone, nextAction } as any)
        : await runLyra({ mode, input, extractedText, tone, nextAction } as any);

    // ---- NORMALIZE INTO ROUTER RESPONSE ----------------------------
    const response: RouterResponse = {
      reply: orchestratorResult.reply,
      attachments: orchestratorResult.attachments || [],
      meta: {
        ...(orchestratorResult.meta || {}),
        identity, // attach full identity bundle
      },
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error("Companion Router Error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}