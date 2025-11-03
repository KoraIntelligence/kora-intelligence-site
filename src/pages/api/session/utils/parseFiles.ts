import mammoth from "mammoth";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import pdf from "pdf-parse-fixed";

export async function parseUploadedFile(filePath: string, mimeType: string) {
  try {
    // --- Handle PDF ---
    if (mimeType === "application/pdf") {
      const buffer = await fs.readFile(filePath);
      const data = await pdf(buffer);
      return data.text; // Extracted text
    }

    // --- Handle DOCX ---
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    // --- Handle XLSX ---
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const buffer = await fs.readFile(filePath);
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      return JSON.stringify(json, null, 2);
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (err: any) {
    console.error("Parsing error:", err.message);
    throw new Error("File parsing failed.");
  }
}