// src/pages/api/session/utils/parseFiles.ts
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

// Helper: read text from PDFs
async function extractFromPDF(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return data.text || "";
}

// Helper: read text from DOCX
async function extractFromDocx(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const { value } = await mammoth.extractRawText({ buffer });
  return value || "";
}

// Helper: read text from XLSX
async function extractFromXlsx(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const textParts: string[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    textParts.push(csv);
  });

  return textParts.join("\n\n");
}

// Main parse handler
export async function parseUploadedFile(filePath: string, mimeType: string) {
  try {
    if (mimeType.includes("pdf")) return await extractFromPDF(filePath);
    if (mimeType.includes("word") || filePath.endsWith(".docx"))
      return await extractFromDocx(filePath);
    if (mimeType.includes("spreadsheet") || filePath.endsWith(".xlsx"))
      return await extractFromXlsx(filePath);

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (err: any) {
    console.error("❌ File parse failed:", err.message);
    return ""; // Return blank text to prevent crash
  }
}