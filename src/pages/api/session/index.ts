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
      sizeLimit: "25mb", // Allow large JSON uploads (for base64 files)
    },
  },
};

/**
 * Handles both JSON (base64) and multipart (form-data) uploads.
 * Supports CCC, FMC, and Builder companion routes.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let input = "";
    let mode = "";
    let intent = "";
    let tone = "";
    let extractedText = "";

    // 🟢 CASE 1: JSON payload (from unified chat)
    if (req.headers["content-type"]?.includes("application/json")) {
      const body = req.body || {};
      input = body.input || "";
      mode = body.mode || "";
      intent = body.intent || "";
      tone = body.tone || (await getTone()) || "neutral";

      // Handle base64 file upload
      if (body.filePayload) {
        try {
          extractedText = await parseUploadedFile(body.filePayload);
        } catch (err: any) {
          console.error("❌ JSON file parse error:", err);
          return res.status(400).json({
            ok: false,
            error: "A parsing disruption occurred. Try a different file.",
          });
        }
      }
    }

    // 🟠 CASE 2: Multipart form upload (legacy support)
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

      // Parse uploaded file if any
      if (fields.filePayload) {
        extractedText = await parseUploadedFile(fields.filePayload);
      } else if (files?.file) {
        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
        extractedText = await parseUploadedFile(uploadedFile, uploadedFile.mimetype);
      }
    }

    // 🔴 CASE 3: Invalid request type
    else {
      return res.status(400).json({
        ok: false,
        error: "Unsupported content type. Use JSON or multipart/form-data.",
      });
    }

    // 🧭 Route to the appropriate Companion
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
        return res.status(400).json({ ok: false, error: "Invalid companion mode." });
    }

    // 📎 Generate downloadable attachments (PDF/DOCX/XLSX)
    const attachments: any[] = [];
    if (result?.outputText) {
      attachments.push(await createPDF(result.outputText));
      attachments.push(await createDocx(result.outputText));
      if (mode === "ccc") attachments.push(await createXlsx());
    }

    // ✅ Successful response
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