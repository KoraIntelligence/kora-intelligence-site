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
   - Case A: Salar JSON  (<pricing>{...}</pricing> or raw JSON)
   - Case B: Markdown tables
   - Case C: Old pipe-separated tables
------------------------------------------------------- */

type PricingSheetJSON = {
  name?: string;
  columns?: any[];
  rows?: any[][];
};

type PricingJSON = {
  sheets?: PricingSheetJSON[];
};

/** Coerce arbitrary cell value into something ExcelJS accepts (string/number/null). */
function toCellValue(value: any): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  return String(value);
}

/** Try to parse Salar pricing JSON, with or without <pricing> wrapper. */
function tryParsePricingJSON(raw: string): PricingJSON | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let jsonText = trimmed;

  // Handle <pricing> ... </pricing>
  if (trimmed.startsWith("<pricing")) {
    const open = trimmed.indexOf(">");
    const close = trimmed.lastIndexOf("</pricing>");
    if (open !== -1 && close !== -1 && close > open) {
      jsonText = trimmed.slice(open + 1, close).trim();
    }
  }

  try {
    const parsed = JSON.parse(jsonText);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as any).sheets)
    ) {
      return parsed as PricingJSON;
    }
    return null;
  } catch {
    return null;
  }
}

/** Extract ALL markdown tables as 2D arrays of strings. */
function extractMarkdownTables(markdown: string): string[][][] {
  const tree = parseMarkdown(markdown);
  const tables: string[][][] = [];

  for (const node of tree.children || []) {
    if (node.type !== "table") continue;

    const rows: string[][] = [];
    for (const rowNode of node.children || []) {
      const cells: string[] = [];
      for (const cellNode of rowNode.children || []) {
        const text = mdNodeToPlain(cellNode);
        cells.push((typeof text === "string" ? text : "").trim());
      }
      if (cells.length) {
        rows.push(cells);
      }
    }

    if (rows.length) {
      tables.push(rows);
    }
  }

  return tables;
}

/** Very simple fallback: parse lines that look like pipe tables. */
function extractPipeTables(markdown: string): string[][] {
  const lines = (markdown || "")
    .split(/\r?\n/)
    .map((l) => (typeof l === "string" ? l.trim() : ""))
    .filter((l) => l.includes("|"));

  const rows: string[][] = [];

  for (const line of lines) {
    const cells = line
      .split("|")
      .map((c) => (typeof c === "string" ? c.trim() : ""))
      .filter((x) => x.length > 0);

    // Skip pure separator rows like | --- | --- |
    if (cells.length && cells.every((c) => /^-+$/.test(c))) continue;

    if (cells.length) {
      rows.push(cells);
    }
  }

  return rows;
}

/** Auto-size columns based on content length (basic, but good enough). */
function autosizeColumns(ws: any) {
  if (!ws.columns) return;

  ws.columns.forEach((col: any) => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, (cell: any) => {
      const v = cell.value;
      if (v === null || v === undefined) return;
      const len = String(v).length;
      if (len > maxLength) maxLength = len;
    });
    col.width = maxLength + 2;
  });
}

/** Apply simple header styling to row 1. */
function styleHeaderRow(ws: any) {
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
}

/* -------------------------------------------------------
   Main XLSX export — tables only
------------------------------------------------------- */
export async function createXlsx(markdownOrJson: string) {
  const wb = new Workbook();
  const input = markdownOrJson || "";

  /* ---------------------------------------------
     CASE A: Salar JSON (preferred)
  --------------------------------------------- */
  const pricing = tryParsePricingJSON(input);

  if (pricing && Array.isArray(pricing.sheets) && pricing.sheets.length > 0) {
    pricing.sheets.forEach((sheet, index) => {
      const ws = wb.addWorksheet(sheet.name || `Sheet ${index + 1}`);

      // Header row from "columns" if present
      if (Array.isArray(sheet.columns) && sheet.columns.length > 0) {
        const headerValues = sheet.columns.map((c) =>
          typeof c === "string" ? c : c == null ? "" : String(c)
        );
        ws.addRow(headerValues);
      }

      // Data rows
      if (Array.isArray(sheet.rows)) {
        for (const row of sheet.rows) {
          if (!Array.isArray(row)) continue;
          const values = row.map(toCellValue);
          ws.addRow(values);
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

  /* ---------------------------------------------
     CASE B: Markdown tables
  --------------------------------------------- */
  const mdTables = extractMarkdownTables(input);

  if (mdTables.length > 0) {
    mdTables.forEach((table, tIndex) => {
      const ws = wb.addWorksheet(
        tIndex === 0 ? "Pricing Table" : `Table ${tIndex + 1}`
      );

      if (!table.length) return;

      // First row is header, rest is body
      const [header, ...body] = table;

      ws.addRow(
        header.map((h) => (typeof h === "string" ? h : String(h ?? "")))
      );

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

  /* ---------------------------------------------
     CASE C: Fallback — pipe-style tables
  --------------------------------------------- */
  const pipeRows = extractPipeTables(input);

  const ws = wb.addWorksheet("Pricing Table");

  if (pipeRows.length > 0) {
    const [header, ...body] = pipeRows;
    ws.addRow(header);
    for (const row of body) {
      ws.addRow(row.map(toCellValue));
    }
    styleHeaderRow(ws);
    autosizeColumns(ws);
  } else {
    // No tabular data at all — put a friendly note
    ws.addRow(["No tabular pricing data was detected in this message."]);
    autosizeColumns(ws);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return bufferToDataUrl(
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `kora_pricing_${Date.now()}.xlsx`
  );
}