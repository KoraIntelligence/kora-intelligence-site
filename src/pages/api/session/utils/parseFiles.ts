import mammoth from "mammoth";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import pdf from "pdf-parse-fixed";

/**
 * Handles uploaded files (PDF, DOCX, XLSX)
 * Supports both filesystem uploads (formidable) and base64 payloads.
 */
export async function parseUploadedFile(
  filePayload: any,
  mimeType?: string
): Promise<string> {
  try {
    let buffer: Buffer;

    // Handle base64 input (from frontend)
    if (filePayload?.contentBase64) {
      const base64Data = filePayload.contentBase64.split(",").pop()!;
      buffer = Buffer.from(base64Data, "base64");
      mimeType = filePayload.type;
    }
    // Handle uploaded temp file (formidable)
    else if (filePayload?.filepath) {
      buffer = await fs.readFile(filePayload.filepath);
      mimeType = filePayload.mimetype;
    } else {
      throw new Error("Invalid file payload: missing content");
    }

    // --- Handle PDF ---
    if (mimeType === "application/pdf") {
      const data = await pdf(buffer);
      return data.text || "";
    }

    // --- Handle DOCX ---
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    // --- Handle XLSX ---
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      return JSON.stringify(json, null, 2);
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (err: any) {
    console.error("❌ File parsing error:", err);
    throw new Error("A parsing disruption occurred.");
  }
}