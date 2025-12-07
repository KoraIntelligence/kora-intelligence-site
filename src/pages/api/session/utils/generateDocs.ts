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
   🧩 Wrap HTML in PREMIUM PDF template
------------------------------------------------------- */
function wrapHtml(bodyHtml: string, title = "Kora Document") {
  // Premium, minimal, typography-first styling
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>

  <style>
    :root {
      --kora-bg: #ffffff;
      --kora-fg: #111827;
      --kora-muted: #6b7280;
      --kora-border: #e5e7eb;
      --kora-border-soft: #f3f4f6;
      --kora-accent-soft: #f9fafb;
      --kora-radius: 8px;
    }

    body {
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "SF Pro Text",
        "Segoe UI",
        "Noto Color Emoji",
        "Apple Color Emoji",
        sans-serif;
      padding: 40px;
      font-size: 14px;
      line-height: 1.7;
      color: var(--kora-fg);
      background: var(--kora-bg);
    }

    h1 {
      font-size: 26px;
      letter-spacing: -0.02em;
      padding-bottom: 6px;
      margin: 0 0 18px;
      border-bottom: 1px solid var(--kora-border);
    }

    h2 {
      font-size: 20px;
      letter-spacing: -0.01em;
      margin: 22px 0 10px;
    }

    h3 {
      font-size: 17px;
      letter-spacing: -0.01em;
      margin: 18px 0 8px;
    }

    p {
      margin: 6px 0 10px;
      color: var(--kora-fg);
    }

    small, .muted {
      color: var(--kora-muted);
    }

    ul, ol {
      padding-left: 22px;
      margin: 4px 0 10px;
    }

    li {
      margin: 2px 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 18px 0;
      font-size: 13px;
      border-radius: var(--kora-radius);
      overflow: hidden;
    }

    th, td {
      border: 1px solid var(--kora-border);
      padding: 7px 10px;
      vertical-align: top;
    }

    th {
      background: var(--kora-border-soft);
      font-weight: 600;
      text-align: left;
    }

    tr:nth-child(even) td {
      background: #fcfcfd;
    }

    code {
      font-family:
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        "Liberation Mono",
        "Courier New",
        monospace;
      font-size: 13px;
    }

    .pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--kora-accent-soft);
      border: 1px solid var(--kora-border-soft);
      font-size: 11px;
      color: var(--kora-muted);
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
   Premium but safe – no exotic styling, just hierarchy.
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
            spacing: { before: 260, after: 140 },
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
        for (const item of node.children || []) {
          if (!item || item.type !== "listItem") continue;

          const itemParas = (item.children || []).filter(
            (c: MdNode) => c.type === "paragraph"
          );

          for (const p of itemParas) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "• " }),
                  ...mdInlineToRuns(p.children),
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
              (cellNode: MdNode) => {
                const paras =
                  (cellNode.children || [])
                    .filter((c: MdNode) => c.type === "paragraph")
                    .map(
                      (p: MdNode) =>
                        new Paragraph({
                          children: mdInlineToRuns(p.children || []),
                        })
                    ) || [];

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
        break;
    }
  }

  if (!children.length) {
    children.push(new Paragraph("Empty document"));
  }

  return children;
}

/* -------------------------------------------------------
   🧩 DOCX generator
------------------------------------------------------- */
export async function createDocx(markdown: string) {
  const children = markdownToDocxChildren(markdown || "Empty");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
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
   - Case B: Markdown tables (with headings → sheet names)
   - Case C: Pipe-style tables
   Premium styling applied to all sheets.
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
  if (typeof v === "number") return v;
  if (typeof v === "string") return v;
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
    if (parsed && Array.isArray((parsed as any).sheets)) {
      return parsed as PricingJSON;
    }
  } catch (_) {
    return null;
  }
  return null;
}

/** Extract ALL markdown tables (for simple fallback use) */
function extractMarkdownTables(markdown: string): string[][][] {
  const tree = parseMarkdown(markdown);
  const tables: string[][][] = [];

  for (const node of tree.children || []) {
    if (node.type !== "table") continue;

    const rows: string[][] = [];
    for (const rowNode of node.children as MdNode[]) {
      const cells: string[] = [];
      for (const cellNode of rowNode.children as MdNode[]) {
        const txt = mdNodeToPlain(cellNode) || "";
        cells.push(txt.trim());
      }
      if (cells.length) rows.push(cells);
    }

    if (rows.length) tables.push(rows);
  }

  return tables;
}

/** Extract markdown tables + nearest heading (for sheet names) */
function extractMarkdownTablesWithHeadings(markdown: string): {
  name: string | null;
  rows: string[][];
}[] {
  const tree = parseMarkdown(markdown);
  const result: { name: string | null; rows: string[][] }[] = [];
  let currentHeading: string | null = null;

  for (const node of tree.children || []) {
    if (node.type === "heading") {
      const text = mdNodeToPlain(node).trim();
      if (text) currentHeading = text;
      continue;
    }

    if (node.type === "table") {
      const rows: string[][] = [];
      for (const rowNode of node.children as MdNode[]) {
        const cells: string[] = [];
        for (const cellNode of rowNode.children as MdNode[]) {
          const txt = mdNodeToPlain(cellNode) || "";
          cells.push(txt.trim());
        }
        if (cells.length) rows.push(cells);
      }

      if (rows.length) {
        result.push({
          name: currentHeading || null,
          rows,
        });
      }
    }
  }

  return result;
}

/** Extract pipe-style markdown tables as final fallback */
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

/** Premium styling for header + grid */
function applyPremiumTableStyle(ws: any) {
  const header = ws.getRow(1);
  header.font = { bold: true, size: 12 };
  header.alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true,
  };
  header.eachCell((cell: any) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" }, // light grey
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
  });

  ws.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return;
    row.eachCell((cell: any) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFF3F4F6" } },
        left: { style: "thin", color: { argb: "FFF3F4F6" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFF3F4F6" } },
      };

      if (typeof cell.value === "number") {
        // Generic premium numeric format
        cell.numFmt = "#,##0.00";
        cell.alignment = {
          ...(cell.alignment || {}),
          horizontal: "right",
        };
      }
    });
  });
}

/* -------------------------------------------------------
   Main XLSX generation (Premium)
------------------------------------------------------- */
export async function createXlsx(markdownOrJson: string) {
  console.log("🟦 XLSX: Starting createXlsx()");

  const wb = new Workbook();
  const input =
    typeof markdownOrJson === "string"
      ? markdownOrJson
      : String(markdownOrJson ?? "");

  console.log(
    "🟦 XLSX: Raw input (first 400 chars):",
    input.slice(0, 400)
  );

  // -------------------------
  // CASE B: Markdown tables (preferred)
  // -------------------------
  const tablesWithHeadings = extractMarkdownTablesWithHeadings(input);

  if (tablesWithHeadings.length > 0) {
    console.log(
      "🟩 XLSX: Using markdown tables with headings:",
      tablesWithHeadings.length
    );

    tablesWithHeadings.forEach((entry, i) => {
      const sheetName =
        entry.name && entry.name.length <= 28
          ? entry.name
          : entry.name
          ? entry.name.slice(0, 25) + "..."
          : tablesWithHeadings.length === 1
          ? "Pricing"
          : `Table ${i + 1}`;

      const ws = wb.addWorksheet(sheetName);
      const [header, ...body] = entry.rows;

      ws.addRow(header.map(toCellValue));
      body.forEach((row) => ws.addRow(row.map(toCellValue)));

      applyPremiumTableStyle(ws);
      autosizeColumns(ws);
    });

    const buffer = await wb.xlsx.writeBuffer();
    return bufferToDataUrl(
      Buffer.from(buffer),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      `kora_pricing_${Date.now()}.xlsx`
    );
  }

  // -------------------------
  // CASE A: Salar JSON
  // -------------------------
  const pricing = tryParsePricingJSON(input);
  console.log("🟦 XLSX: Parsed JSON pricing:", pricing);

  if (pricing?.sheets?.length) {
    console.log("🟩 XLSX: Using JSON sheets");

    pricing.sheets.forEach((sheet, i) => {
      const ws = wb.addWorksheet(sheet.name || `Sheet ${i + 1}`);

      if (Array.isArray(sheet.columns)) {
        ws.addRow(sheet.columns.map(toCellValue));
      }

      if (Array.isArray(sheet.rows)) {
        for (const row of sheet.rows) {
          ws.addRow(row.map(toCellValue));
        }
      }

      applyPremiumTableStyle(ws);
      autosizeColumns(ws);
    });

    const buffer = await wb.xlsx.writeBuffer();
    return bufferToDataUrl(
      Buffer.from(buffer),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      `kora_pricing_${Date.now()}.xlsx`
    );
  }

  // -------------------------
  // CASE C: Pipe-style tables
  // -------------------------
  console.log("🟨 XLSX: Falling back to pipe-table extraction");
  const pipeRows = extractPipeTables(input);
  const ws = wb.addWorksheet("Pricing");

  if (pipeRows.length) {
    const [header, ...body] = pipeRows;
    ws.addRow(header.map(toCellValue));
    body.forEach((row) => ws.addRow(row.map(toCellValue)));
  } else {
    ws.addRow(["No tabular pricing data detected."]);
  }

  applyPremiumTableStyle(ws);
  autosizeColumns(ws);

  const buffer = await wb.xlsx.writeBuffer();
  return bufferToDataUrl(
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `kora_pricing_${Date.now()}.xlsx`
  );
}