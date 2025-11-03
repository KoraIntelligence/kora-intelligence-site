// src/pages/api/session/utils/parseFiles.ts
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import pdf from "pdf-parse-fixed";

/**
 * When using TypeScript, keep a tiny declaration to silence type warnings:
 *   // src/types/pdf-modules.d.ts (or global.d.ts)
 *   declare module "pdf-parse-fixed";
 */

type UploadedFilePayload = {
  name: string;             // e.g. "tender.pdf"
  type: string;             // e.g. "application/pdf"
  contentBase64: string;    // raw base64 string (no data: prefix)
};

// -------- Overloads --------
export async function parseUploadedFile(
  file: UploadedFilePayload
): Promise<string>;
export async function parseUploadedFile(
  filePath: string,
  mimeType: string
): Promise<string>;

// -------- Implementation --------
export async function parseUploadedFile(
  a: UploadedFilePayload | string,
  b?: string
): Promise<string> {
  // mode A: base64 payload from client
  const isPayload = typeof a === "object" && a !== null && "contentBase64" in a;

  // Normalized inputs
  let mimeType = "";
  let ext = "";
  let buffer: Buffer;

  try {
    if (isPayload) {
      const { name, type, contentBase64 } = a as UploadedFilePayload;
      buffer = Buffer.from(contentBase64, "base64");
      mimeType = (type || "").toLowerCase();
      ext = (name || "").toLowerCase();
    } else {
      // mode B: legacy disk path + mimeType
      const filePath = a as string;
      mimeType = (b || "").toLowerCase();
      ext = filePath.toLowerCase();
      buffer = await fs.readFile(filePath);
    }

    // -------- PDF --------
    if (mimeType.includes("pdf") || ext.endsWith(".pdf")) {
      const out = await pdf(buffer);
      return (out?.text || "").trim();
    }

    // -------- DOCX --------
    if (
      mimeType.includes("officedocument.wordprocessingml") ||
      mimeType.includes("word") ||
      ext.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return (result?.value || "").trim();
    }

    // -------- XLSX --------
    if (
      mimeType.includes("officedocument.spreadsheetml") ||
      mimeType.includes("excel") ||
      ext.endsWith(".xlsx")
    ) {
      const wb = XLSX.read(buffer, { type: "buffer" });
      const lines: string[] = [];
      wb.SheetNames.forEach((sheetName) => {
        const sheet = wb.Sheets[sheetName];
        if (!sheet) return;
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        lines.push(`Sheet: ${sheetName}`);
        for (const row of rows) {
          if (!row) continue;
          lines.push(String(row.map((c) => (c == null ? "" : c)).join("\t")));
        }
      });
      return lines.join("\n").trim();
    }

    throw new Error(`Unsupported file type: ${mimeType || ext}`);
  } catch (err: any) {
    console.error("Parsing error:", err?.message || err);
    throw new Error("File parsing failed.");
  }
}