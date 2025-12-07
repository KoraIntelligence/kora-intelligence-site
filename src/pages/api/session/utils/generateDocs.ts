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
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 40px;
      font-size: 14px;
      line-height: 1.6;
      color: #1f2937;
    }
    h1 {
      font-size: 26px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }
    h2 { font-size: 22px; margin: 18px 0 8px; }
    h3 { font-size: 18px; margin: 16px 0 6px; }
    ul, ol {
      padding-left: 20px;
      margin: 4px 0 8px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 6px 10px;
      vertical-align: top;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 13px;
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
      margin: { top: "32px", bottom: "32px", left: "24px", right: "24px" },
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
   🧩 Common markdown AST helpers
------------------------------------------------------- */
type MdNode = any;

function parseMarkdown(markdown: string): MdNode {
  return unified().use(remarkParse).use(remarkGfm).parse(markdown || "");
}

function mdNodeToPlain(node: MdNode): string {
  if (!node) return "";
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value || "";
  }
  if (Array.isArray(node.children)) {
    return node.children.map(mdNodeToPlain).join("");
  }
  return "";
}

/* -------------------------------------------------------
   🧩 Markdown inline → DOCX TextRuns
------------------------------------------------------- */
function mdInlineToRuns(nodes: MdNode[] = []): TextRun[] {
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
            text: mdNodeToPlain(node),
            bold: true,
          })
        );
        break;

      case "emphasis":
        runs.push(
          new TextRun({
            text: mdNodeToPlain(node),
            italics: true,
          })
        );
        break;

      case "inlineCode":
        runs.push(
          new TextRun({
            text: node.value || "",
            font: "Courier New",
          })
        );
        break;

      default:
        if (node.children) {
          runs.push(...mdInlineToRuns(node.children));
        }
    }
  }

  return runs;
}

/* -------------------------------------------------------
   🧩 Markdown → DOCX (headings, paragraphs, tables, lists)
------------------------------------------------------- */
function markdownToDocxChildren(markdown: string): (Paragraph | Table)[] {
  const tree = parseMarkdown(markdown);
  const children: (Paragraph | Table)[] = [];

  for (const node of tree.children || []) {
    switch (node.type) {
      case "heading": {
        const level = node.depth || 1;
        const headingLevel =
          level === 1
            ? HeadingLevel.HEADING_1
            : level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3;

        children.push(
          new Paragraph({
            children: mdInlineToRuns(node.children),
            heading: headingLevel,
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      }

      case "paragraph": {
        children.push(
          new Paragraph({
            children: mdInlineToRuns(node.children),
            spacing: { before: 60, after: 120 },
          })
        );
        break;
      }

      case "list": {
        // Represent list items as bullet-style paragraphs (with "• ")
        for (const item of node.children || []) {
          if (!item || item.type !== "listItem") continue;

          const itemParas = (item.children || []).filter(
            (c: MdNode) => c.type === "paragraph"
          );

          if (!itemParas.length) continue;

          for (const p of itemParas) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "• ", bold: false }),
                  ...mdInlineToRuns(p.children || []),
                ],
                spacing: { before: 40, after: 40 },
              })
            );
          }
        }
        break;
      }

      case "table": {
        const rows: TableRow[] = (node.children || []).map(
          (row: MdNode, rowIndex: number) => {
            const cells: TableCell[] = (row.children || []).map(
              (cell: MdNode) => {
                const paras = (cell.children || [])
                  .filter((c: MdNode) => c.type === "paragraph")
                  .map(
                    (p: MdNode) =>
                      new Paragraph({
                        children: mdInlineToRuns(p.children || []),
                      })
                  );

                return new TableCell({
                  children: paras.length ? paras : [new Paragraph("")],
                });
              }
            );

            return new TableRow({
              children: cells,
              tableHeader: rowIndex === 0,
            });
          }
        );

        children.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows,
          })
        );
        break;
      }

      case "thematicBreak": {
        children.push(
          new Paragraph({
            children: [],
            spacing: { before: 200, after: 200 },
          })
        );
        break;
      }

      default:
        // Ignore other node types for now
        break;
    }
  }

  if (!children.length) {
    children.push(new Paragraph("Empty document"));
  }

  return children;
}

export async function createDocx(markdown: string) {
  const children = markdownToDocxChildren(markdown || "Empty");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // ~1 inch
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return bufferToDataUrl(
    buffer,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    `kora_document_${Date.now()}.docx`
  );
}

/* -------------------------------------------------------
   🧩 XLSX Generator — TABLES ONLY
   - Case A: Salar JSON (<pricing>{...}</pricing>)
   - Case B: Markdown tables
   - Case C: Pipe-style tables
------------------------------------------------------- */

type PricingSheetJSON = {
  name?: string;
  columns?: (string | null)[];
  rows?: any[][];
};

type PricingJSON = {
  sheets?: PricingSheetJSON[];
};

/** Ensure ExcelJS-compatible cell values */
function toCellValue(v: any): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" || typeof v === "number") return v;
  return String(v);
}

/** Try parsing Salar JSON, with optional <pricing> wrapper */
function tryParsePricingJSON(input: string): PricingJSON | null {
  if (!input) return null;
  let raw = input.trim();
  if (!raw.length) return null;

  // strip <pricing> wrapper if present
  if (raw.startsWith("<pricing")) {
    const open = raw.indexOf(">");
    const close = raw.lastIndexOf("</pricing>");
    if (open !== -1 && close !== -1 && close > open) {
      raw = raw.slice(open + 1, close).trim();
    }
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.sheets)) {
      return parsed as PricingJSON;
    }
  } catch (_) {
    return null;
  }
  return null;
}

/** Extract ALL markdown tables */
function extractMarkdownTables(markdown: string): string[][][] {
  const tree = parseMarkdown(markdown);
  const tables: string[][][] = [];

  for (const node of tree.children || []) {
    if (node.type !== "table") continue;

    const rows: string[][] = [];
    for (const rowNode of node.children || []) {
      const cells: string[] = [];
      for (const cellNode of rowNode.children || []) {
        const txt = mdNodeToPlain(cellNode) || "";
        cells.push(txt.trim());
      }
      if (cells.length) rows.push(cells);
    }

    if (rows.length) tables.push(rows);
  }

  return tables;
}

/** Extract pipe-style tables as fallback */
function extractPipeTables(markdown: string): string[][] {
  const lines = (markdown || "")
    .split(/\r?\n/)
    .map((l) => (typeof l === "string" ? l.trim() : ""))
    .filter((l) => l.includes("|"));

  const rows: string[][] = [];

  for (const line of lines) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (!cells.length) continue;
    if (cells.every((c) => /^-+$/.test(c))) continue; // separator row

    rows.push(cells);
  }

  return rows;
}

/** Auto-size columns */
function autosizeColumns(ws: any) {
  if (!ws.columns) return;

  ws.columns.forEach((col: any) => {
    let maxLen = 10;
    col.eachCell({ includeEmpty: true }, (cell: any) => {
      if (cell.value != null) {
        maxLen = Math.max(maxLen, String(cell.value).length);
      }
    });
    col.width = maxLen + 2;
  });
}

/** Bold + centered header */
function styleHeaderRow(ws: any) {
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
}

/* -------------------------------------------------------
   Main XLSX generation
------------------------------------------------------- */

export async function createXlsx(markdownOrJson: string) {
  const wb = new Workbook();
  const input = markdownOrJson || "";

  /* -------------------------
     CASE A: Salar JSON
  ------------------------- */
  const pricing = tryParsePricingJSON(input);

  if (pricing?.sheets?.length) {
    pricing.sheets.forEach((sheet, i) => {
      const ws = wb.addWorksheet(sheet.name || `Sheet ${i + 1}`);

      // Columns
      if (Array.isArray(sheet.columns)) {
        ws.addRow(sheet.columns.map((c) => (c == null ? "" : String(c))));
      }

      // Rows
      if (Array.isArray(sheet.rows)) {
        for (const row of sheet.rows) {
          ws.addRow(row.map(toCellValue));
        }
      }

      styleHeaderRow(ws);
      autosizeColumns(ws);
    });

    const buffer = await wb.xlsx.writeBuffer();
    return bufferToDataUrl(
      Buffer.from(buffer),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      `kora_pricing_${Date.now()}.xlsx`
    );
  }

  /* -------------------------
     CASE B: Markdown tables
  ------------------------- */
  const mdTables = extractMarkdownTables(input);

  if (mdTables.length > 0) {
    mdTables.forEach((table, i) => {
      const ws = wb.addWorksheet(i === 0 ? "Table" : `Table ${i + 1}`);

      const [header, ...body] = table;
      ws.addRow(header);

      for (const row of body) {
        ws.addRow(row.map(toCellValue));
      }

      styleHeaderRow(ws);
      autosizeColumns(ws);
    });

    const buffer = await wb.xlsx.writeBuffer();
    return bufferToDataUrl(
      Buffer.from(buffer),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      `kora_pricing_${Date.now()}.xlsx`
    );
  }

  /* -------------------------
     CASE C: Pipe fallback
  ------------------------- */
  const pipeRows = extractPipeTables(input);
  const ws = wb.addWorksheet("Pricing Table");

  if (pipeRows.length) {
    const [header, ...body] = pipeRows;
    ws.addRow(header);
    body.forEach((row) => ws.addRow(row.map(toCellValue)));
    styleHeaderRow(ws);
    autosizeColumns(ws);
  } else {
    ws.addRow(["No tabular pricing data detected."]);
    autosizeColumns(ws);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return bufferToDataUrl(
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `kora_pricing_${Date.now()}.xlsx`
  );
}