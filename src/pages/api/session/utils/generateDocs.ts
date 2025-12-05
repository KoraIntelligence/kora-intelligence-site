// src/pages/api/session/utils/generateDocs.ts
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { Workbook } from "exceljs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

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
   🧩 Markdown → HTML (for PDF engine)
------------------------------------------------------- */
async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .process(markdown || "Empty document");

  return String(file);
}

/* -------------------------------------------------------
   🧩 Wrap HTML in styled PDF template
------------------------------------------------------- */
function wrapHtml(bodyHtml: string, title = "Kora Document") {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>

  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 40px;
      font-size: 14px;
      line-height: 1.6;
      color: #1f2937;
    }
    h1 {
      font-size: 26px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 6px;
    }
    h2 { font-size: 22px; }
    h3 { font-size: 18px; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 6px 10px;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

/* -------------------------------------------------------
   🧩 PDF Generator — Markdown → HTML → PDF
------------------------------------------------------- */
export async function createPDF(markdown: string) {
  const html = wrapHtml(await markdownToHtml(markdown));

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "32px", bottom: "32px", left: "24px", right: "24px" }
    });

    return bufferToDataUrl(
      Buffer.from(pdf),
      "application/pdf",
      `kora_${Date.now()}.pdf`
    );
  } finally {
    await browser.close();
  }
}

/* -------------------------------------------------------
   🧩 Markdown → DOCX (Structured)
------------------------------------------------------- */
type MdNode = any;

function mdInlineToRuns(nodes: MdNode[] = []) {
  const runs: TextRun[] = [];
  for (const node of nodes) {
    if (!node) continue;

    switch (node.type) {
      case "text":
        runs.push(new TextRun(node.value || ""));
        break;

      case "strong":
        runs.push(
          new TextRun({
            text: node.children.map((c: any) => c.value).join(""),
            bold: true,
          })
        );
        break;

      case "emphasis":
        runs.push(
          new TextRun({
            text: node.children.map((c: any) => c.value).join(""),
            italics: true,
          })
        );
        break;

      default:
        if (node.children) runs.push(...mdInlineToRuns(node.children));
    }
  }

  return runs;
}

function markdownToDocxChildren(markdown: string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const children: any[] = [];

  for (const node of tree.children) {
    switch (node.type) {
      case "heading":
        children.push(
          new Paragraph({
            children: mdInlineToRuns(node.children),
            heading:
              node.depth === 1
                ? HeadingLevel.HEADING_1
                : node.depth === 2
                ? HeadingLevel.HEADING_2
                : HeadingLevel.HEADING_3,
            spacing: { after: 200 },
          })
        );
        break;

      case "paragraph":
        children.push(
          new Paragraph({
            children: mdInlineToRuns(node.children),
            spacing: { after: 120 },
          })
        );
        break;

      case "table": {
        const rows = node.children.map((row: any) => {
          const cells = row.children.map((cell: any) => {
            const paras = cell.children
              .filter((c: any) => c.type === "paragraph")
              .map(
                (p: any) =>
                  new Paragraph({
                    children: mdInlineToRuns(p.children),
                  })
              );

            return new TableCell({
              children: paras.length ? paras : [new Paragraph("")],
            });
          });

          return new TableRow({ children: cells });
        });

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          })
        );
        break;
      }

      default:
        break;
    }
  }

  return children;
}

export async function createDocx(markdown: string) {
  const children = markdownToDocxChildren(markdown || "Empty");
  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);

  return bufferToDataUrl(
    buffer,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    `kora_document_${Date.now()}.docx`
  );
}

/* -------------------------------------------------------
   🧩 XLSX Generator — Structured Pricing Sheet
------------------------------------------------------- */
export async function createXlsx(markdown: string) {
  const wb = new Workbook();
  const ws = wb.addWorksheet("Pricing");

  // Basic formatting
  ws.columns = [
    { header: "Item", width: 40 },
    { header: "Cost", width: 15 },
    { header: "Notes", width: 40 },
  ];

  ws.getRow(1).font = { bold: true };

  // Parse Markdown into simple row structure
  // Tables will be detected automatically
  const lines = markdown.split("\n");

  for (const line of lines) {
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      if (cells.length >= 2) ws.addRow(cells);
    }
  }

  const buffer = await wb.xlsx.writeBuffer();

  return bufferToDataUrl(
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `kora_pricing_${Date.now()}.xlsx`
  );
}