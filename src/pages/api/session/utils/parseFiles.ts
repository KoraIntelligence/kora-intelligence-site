// src/pages/api/session/utils/parseFiles.ts
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import pdf from "pdf-parse-fixed";
import path from "path";

/**
 * Universal parser for uploaded files (PDF, DOCX, XLSX)
 * Handles both base64 uploads (from browser) and local temporary files.
 */
export async function parseUploadedFile(
  filePayload: any,
  mimeType?: string
): Promise<string> {
  try {
    let buffer: Buffer;

    // --- CASE 1: Base64 input from frontend upload ---
    if (filePayload?.contentBase64) {
      const base64Data = filePayload.contentBase64.split(",").pop()!;
      buffer = Buffer.from(base64Data, "base64");
      mimeType = filePayload.type;
    }
    // --- CASE 2: Temp file (for server form uploads) ---
    else if (filePayload?.filepath) {
      buffer = await fs.readFile(filePayload.filepath);
      mimeType = filePayload.mimetype;
    }
    // --- CASE 3: Path provided (from index.ts temp storage) ---
    else if (typeof filePayload === "string") {
      buffer = await fs.readFile(filePayload);
    } else {
      throw new Error("Invalid file payload: no buffer or base64 data.");
    }

    // --- PDF ---
    if (mimeType?.includes("pdf")) {
      const data = await pdf(buffer);
      return data.text || "";
    }

    // --- DOCX ---
    if (
      mimeType?.includes("word") ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    // --- XLSX ---
    if (
      mimeType?.includes("spreadsheet") ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const allSheets = workbook.SheetNames.map((name) => {
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
        return `# Sheet: ${name}\n${csv}`;
      });
      return allSheets.join("\n\n");
    }

    throw new Error(`Unsupported file type: ${mimeType || "unknown"}`);
  } catch (err: any) {
    console.error("❌ File parsing error:", err.message || err);
    throw new Error("A parsing disruption occurred.");
  }
}