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
      sizeLimit: "25mb", // large enough for base64 uploads
    },
  },
};

/**
 * Unified API Handler with debug instrumentation
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("\n\n===============================");
  console.log("🚀 [API] /api/session — New request");
  console.log("🧾 Headers:", req.headers["content-type"]);

  if (req.method !== "POST") {
    console.log("⛔ Method not allowed");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let mode = "";
  let input = "";
  let intent = "";
  let tone = "";
  let extractedText = "";

  try {
    // ===============================
    // 🧩 CASE 1 — JSON (preferred)
    // ===============================
    if (req.headers["content-type"]?.includes("application/json")) {
      console.log("📦 Detected JSON payload");

      const body = req.body || {};
      input = body.input || "";
      mode = body.mode || "";
      intent = body.intent || "";
      tone = body.tone || (await getTone()) || "neutral";

      if (body.filePayload) {
        console.log("📄 FilePayload received:", {
          name: body.filePayload?.name,
          type: body.filePayload?.type,
        });

        const base64Data = body.filePayload?.contentBase64?.split(",").pop() || "";
        console.log("📏 Base64 length:", base64Data.length);

        try {
          extractedText = await parseUploadedFile(body.filePayload);
          console.log("✅ Parsed text length:", extractedText?.length || 0);
        } catch (err: any) {
          console.error("❌ parseUploadedFile failed:", err.message);
          return res
            .status(400)
            .json({ error: "File parsing failed", debug: err.message });
        }
      } else {
        console.log("⚠️ No filePayload present in request.");
      }
    }

    // ===============================
    // 🧩 CASE 2 — multipart (legacy fallback)
    // ===============================
    else if (req.headers["content-type"]?.includes("multipart/form-data")) {
      console.log("📦 Detected multipart/form-data upload");

      const formidable = (await import("formidable")).default;
      const uploadDir = "/tmp"; // ✅ works on Vercel
      const form = formidable({
      multiples: false,
      uploadDir,
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
        console.log("📄 Uploaded file (formidable):", {
          filepath: file.filepath,
          mimetype: file.mimetype,
        });
        extractedText = await parseUploadedFile(file.filepath, file.mimetype);
        console.log("✅ Parsed text length:", extractedText?.length || 0);
      } else {
        console.log("⚠️ No file found in multipart upload");
      }
    } else {
      console.log("❌ Unsupported content type:", req.headers["content-type"]);
      return res.status(400).json({
        error: "Unsupported content type. Use JSON or multipart/form-data.",
      });
    }

    // ===============================
    // 🧭 Route to appropriate Companion
    // ===============================
    console.log("🧭 Routing to companion:", mode);
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
        console.log("⚠️ Invalid mode received:", mode);
        return res.status(400).json({ error: "Invalid companion mode." });
    }

    // ===============================
    // 📎 Attachments (generate output files)
    // ===============================
    const attachments: any[] = [];
    if (result?.outputText) {
      console.log("🧾 Generating attachments for output text...");
      try {
        attachments.push(await createPDF(result.outputText));
        attachments.push(await createDocx(result.outputText));
        if (mode === "ccc") attachments.push(await createXlsx());
      } catch (err: any) {
        console.error("⚠️ Attachment generation failed:", err.message);
      }
    } else {
      console.log("⚠️ No outputText returned from companion");
    }

    // ===============================
    // ✅ Send success response
    // ===============================
    console.log("🟢 Returning response:", {
      mode,
      outputLength: result?.outputText?.length || 0,
      attachments: attachments.length,
    });

    res.status(200).json({
      ok: true,
      mode,
      reply: result.outputText,
      attachments,
      meta: result.meta || {},
    });
  } catch (err: any) {
    console.error("💥 Unhandled API Error:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Internal Server Error",
    });
  }

  console.log("===============================\n\n");
}