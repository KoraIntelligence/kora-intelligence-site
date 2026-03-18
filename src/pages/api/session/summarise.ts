// src/pages/api/session/summarise.ts
// Summarises the current session so context can hand over to a new companion/mode.

import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { getMessages } from "@/lib/memory";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.body;

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  try {
    const messages = await getMessages(sessionId);

    if (!messages || messages.length === 0) {
      return res.status(200).json({ summary: "" });
    }

    // Take last 8 messages for summarisation
    const recent = messages.slice(-8);
    const transcript = recent
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Summarise this conversation in 5 bullet points. Be specific and factual. Include: topic discussed, stage reached, key decisions made, key context or facts shared, and what the user needs next.

Conversation:
${transcript}

Reply only with the 5 bullet points. No preamble.`,
        },
      ],
    });

    const summary =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    // Persist to sessions.summary column
    if (summary) {
      await supabaseAdmin
        .from("sessions")
        .update({ summary, last_updated: new Date().toISOString() })
        .eq("id", sessionId);
    }

    return res.status(200).json({ summary });
  } catch (err: any) {
    console.error("❌ summarise.ts error:", err);
    return res.status(500).json({ error: err?.message || "Summarisation failed" });
  }
}
