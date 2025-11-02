import { Document, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export function createPDF(content: string) {
  const pdfPath = path.join(process.cwd(), "tmp", `kora_${Date.now()}.pdf`);
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(20).text("Kora Report", { align: "center" }).moveDown();
  doc.fontSize(12).text(content, { align: "left" });
  doc.end();
  const data = fs.readFileSync(pdfPath);
  fs.unlinkSync(pdfPath);
  return {
    kind: "pdf",
    filename: "Kora_Report.pdf",
    dataUrl: `data:application/pdf;base64,${data.toString("base64")}`,
  };
}

export async function createDocx(content: string) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ children: [new TextRun("Kora Report")] }),
          new Paragraph({ children: [new TextRun(content)] }),
        ],
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  return {
    kind: "docx",
    filename: "Kora_Report.docx",
    dataUrl: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString("base64")}`,
  };
}

export function createXlsx() {
  const workbook = XLSX.utils.book_new();
  const data = [
    ["Item", "Description", "Price (£)"],
    ["Discovery", "Initial consultation", 500],
    ["Build", "System architecture", 1500],
    ["Deploy", "Testing & delivery", 700],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, "Pricing");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return {
    kind: "xlsx",
    filename: "Kora_Pricing.xlsx",
    dataUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${Buffer.from(
      buffer
    ).toString("base64")}`,
  };
}