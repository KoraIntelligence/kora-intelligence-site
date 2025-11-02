import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export async function parseUploadedFile(filePayload: any): Promise<string> {
  const { dataUrl, filename, mime } = filePayload;
  const base64Data = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");
  const tempPath = path.join(process.cwd(), "tmp", filename);
  fs.mkdirSync(path.dirname(tempPath), { recursive: true });
  fs.writeFileSync(tempPath, buffer);

  try {
    if (mime.includes("pdf")) {
      const parsed = await pdfParse(buffer);
      return parsed.text;
    }
    if (mime.includes("word")) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    }
    if (mime.includes("spreadsheetml")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      return XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    }
    return buffer.toString("utf-8");
  } finally {
    fs.unlinkSync(tempPath);
  }
}