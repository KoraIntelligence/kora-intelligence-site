// src/pages/api/session/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";

import { runCCC } from "./companions/ccc";
import { runFMC } from "./companions/fmc";
import { runBuilder } from "./companions/builder";

import { parseUploadedFile } from "./utils/parseFiles";
import { createPDF, createDocx, createXlsx } from "./utils/generateDocs";
import { getTone } from "./memory/tone";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb", // allow large JSON base64 uploads
    },
  },
};

/**
 * Universal handler:
 * - Accepts JSON (preferred: {input, mode, filePayload, tone, intent})
 * - Fallback: multipart (legacy, only if Formidable installed)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    let input = "";
    let mode = "";
    let intent = "";
    let tone = "";
    let extractedText = "";

    // 🔹 CASE 1 — JSON (new chat upload)
    if (req.headers["content-type"]?.includes("application/json")) {
      const body = req.body || {};
      input = body.input || "";
      mode = body.mode || "";
      intent = body.intent || "";
      tone = body.tone || (await getTone()) || "neutral";

      // If file payload is provided (base64)
      if (body.filePayload) {
        try {
          extractedText = await parseUploadedFile(body.filePayload);
        } catch (err: any) {
          console.error("File parse error:", err);
          return res
            .status(400)
            .json({ error: "File parsing failed. Try a different file." });
        }
      }
    }

    // 🔹 CASE 2 — Multipart (legacy fallback)
    else if (req.headers["content-type"]?.includes("multipart/form-data")) {
      const formidable = (await import("formidable")).default;
      const form = formidable({
        multiples: false,
        uploadDir: path.join(process.cwd(), "tmp"),
        keepExtensions: true,
      });

      const { fields, files }: any = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      input = fields.input || "";
      mode = fields.mode || "";
      intent = fields.intent || "";
      tone = fields.tone || (await getTone()) || "neutral";

      if (files?.file) {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const filePath = file.filepath;
        const mimeType = file.mimetype || "application/pdf";
        extractedText = await parseUploadedFile(filePath, mimeType);
      }
    } else {
      return res.status(400).json({
        error: "Unsupported content type. Use JSON or multipart/form-data.",
      });
    }

    // 🧭 Route to appropriate Companion
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
        return res.status(400).json({ error: "Invalid companion mode." });
    }

    // 📎 Generate attachments if needed
    const attachments: any[] = [];
    if (result.outputText) {
      attachments.push(await createPDF(result.outputText));
      attachments.push(await createDocx(result.outputText));
      if (mode === "ccc") attachments.push(await createXlsx());
    }

    res.status(200).json({
      ok: true,
      mode,
      reply: result.outputText,
      attachments,
      meta: result.meta || {},
    });
  } catch (err: any) {
    console.error("❌ Unified session error:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Internal Server Error",
    });
  }
}