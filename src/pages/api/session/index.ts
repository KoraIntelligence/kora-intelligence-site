import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

import { runCCC } from "./companions/ccc";
import { runFMC } from "./companions/fmc";
import { runBuilder } from "./companions/builder";

import { parseUploadedFile } from "./utils/parseFiles";
import { createPDF, createDocx, createXlsx } from "./utils/generateDocs";
import { getTone } from "./memory/tone";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false, // required for formidable (file uploads)
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Utility to parse multipart form-data (files + JSON fields)
async function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  const form = formidable({ multiples: false, uploadDir: path.join(process.cwd(), "tmp"), keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { fields, files } = await parseForm(req);
    const { input, mode, tone: userTone, intent } = fields;

    // Tone fallback
    const tone = userTone || (await getTone()) || "neutral";

    // Parse uploaded file if present
    let extractedText = "";
    if (files?.file) {
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      const filePath = uploadedFile.filepath;
      const mimeType = uploadedFile.mimetype || "application/pdf";
      extractedText = await parseUploadedFile(filePath, mimeType);
    }

    // Route to correct companion
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

    // Generate document attachments
    const attachments: any[] = [];
    if (result.outputText) {
      const pdfFile = await createPDF(result.outputText);
      const docxFile = await createDocx(result.outputText);
      attachments.push(pdfFile, docxFile);

      if (mode === "ccc") {
        const xlsxFile = await createXlsx();
        attachments.push(xlsxFile);
      }
    }

    res.status(200).json({
      mode,
      reply: result.outputText,
      attachments,
      meta: result.meta || {},
    });
  } catch (err: any) {
    console.error("Error in unified /api/session:", err);
    res.status(500).json({ error: err.message || "A parsing disruption occurred" });
  }
}