// src/pages/api/session/utils/generateDocs.ts
import PDFDocument from "pdfkit";
import { Workbook } from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";

/* -------------------------------------------------------
   🧩 Helper — buffer → base64 data URL
------------------------------------------------------- */
function bufferToDataUrl(buffer: Buffer, mime: string, filename: string) {
  const base64 = buffer.toString("base64");
  return {
    kind: mime.includes("sheet")
      ? "xlsx"
      : mime.includes("word")
      ? "docx"
      : mime.includes("pdf")
      ? "pdf"
      : "bin",
    filename,
    dataUrl: `data:${mime};base64,${base64}`,
  };
}

/* -------------------------------------------------------
   🧩 Create PDF
------------------------------------------------------- */
export async function createPDF(text: string) {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  return new Promise((resolve) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const data = bufferToDataUrl(
        buffer,
        "application/pdf",
        `kora_proposal_${Date.now()}.pdf`
      );
      resolve(data);
    });

    doc.fontSize(20).text("Kora Proposal", { align: "center" }).moveDown();
    doc.fontSize(12).text(text || "Empty PDF document", { align: "left" });
    doc.end();
  });
}

/* -------------------------------------------------------
   🧩 Create DOCX
------------------------------------------------------- */
export async function createDocx(text: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun("Kora Proposal")],
          }),
          new Paragraph({
            children: [new TextRun(text || "Empty DOCX document")],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return bufferToDataUrl(
    buffer,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    `kora_proposal_${Date.now()}.docx`
  );
}

/* -------------------------------------------------------
   🧩 Create XLSX
   Accepts optional 2D array data or text fallback
------------------------------------------------------- */
export async function createXlsx(
  data?: (string | number)[][] | string
): Promise<{ kind: string; filename: string; dataUrl: string }> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet("Pricing");

  if (Array.isArray(data)) {
    data.forEach((row) => sheet.addRow(row));
  } else if (typeof data === "string") {
    sheet.addRow(["Generated Text"]);
    sheet.addRow([data]);
  } else {
    sheet.addRow(["No data provided"]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return bufferToDataUrl(
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `kora_pricing_${Date.now()}.xlsx`
  );
}