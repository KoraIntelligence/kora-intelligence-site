import type { NextApiRequest, NextApiResponse } from "next";
import { runCCC } from "./companions/ccc";
import { runFMC } from "./companions/fmc";
import { runBuilder } from "./companions/builder";
import { parseUploadedFile } from "./utils/parseFiles";
import { createPDF, createDocx, createXlsx } from "./utils/generateDocs";
import { getTone } from "./memory/tone";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { input, mode, filePayload, tone: userTone, intent } = req.body;

    // Tone memory fallback
    const tone = userTone || (await getTone()) || "neutral";

    // Parse uploaded file if any
    let extractedText = "";
    if (filePayload) extractedText = await parseUploadedFile(filePayload);

    // Companion routing
    let result;
    switch (mode) {
      case "ccc":
        result = await runCCC({ input, extractedText, tone, intent });
        break;
      case "fmc":
        result = await runFMC({ input, extractedText, tone, intent });
        break;
      case "builder":
        result = await runBuilder({ input, extractedText, tone, intent });
        break;
      default:
        return res.status(400).json({ error: "Invalid mode" });
    }

    // Generate optional attachments
    const attachments = [];
    if (result.outputText) {
      attachments.push(createPDF(result.outputText));
      attachments.push(createDocx(result.outputText));
      if (mode === "ccc") attachments.push(createXlsx());
    }

    res.status(200).json({
      mode,
      reply: result.outputText,
      attachments,
      meta: result.meta || {},
    });
  } catch (err: any) {
    console.error("Error in unified /api/session:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}