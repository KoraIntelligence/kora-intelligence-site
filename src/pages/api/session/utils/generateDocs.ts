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
function markdownToDocxChildren(
  markdown: string
): (Paragraph | Table)[] {
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

          // listItem usually contains one or more paragraphs
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
   🧩 XLSX Generator — Pricing table + Notes sheet
------------------------------------------------------- */

/**
 * Extract first markdown table as a 2D string array.
 */
function extractFirstTable(markdown: string): string[][] {
  const tree = parseMarkdown(markdown);
  const tableNode =
    (tree.children || []).find((n: MdNode) => n.type === "table") ||
    null;

  if (!tableNode) return [];

  const rows: string[][] = [];

  for (const row of tableNode.children || []) {
    const cells: string[] = [];
    for (const cell of row.children || []) {
      const cellText = mdNodeToPlain(cell);
      cells.push(cellText.trim());
    }
    rows.push(cells);
  }

  return rows;
}

/* -------------------------------------------------------
   🧩 XLSX Generator — Single-Sheet Structured Export
   - Headings (H1/H2/H3)
   - Paragraphs
   - Lists
   - Tables
   - Notes stub at the end
------------------------------------------------------- */

const XLSX_MAX_COLUMNS = 8;

/** Create a neutral column layout suitable for paragraphs and tables. */
function initWorksheetColumns(ws: import("exceljs").Worksheet) {
  ws.columns = [
    { header: "", width: 60 }, // main narrative column
    { header: "", width: 20 },
    { header: "", width: 20 },
    { header: "", width: 20 },
    { header: "", width: 20 },
    { header: "", width: 20 },
    { header: "", width: 20 },
    { header: "", width: 20 },
  ];
}

/** Add a bit of vertical spacing. */
function addSpacing(ws: import("exceljs").Worksheet, lines = 1) {
  for (let i = 0; i < lines; i++) {
    ws.addRow([]);
  }
}

/** Add a heading row with level-aware styling. */
function addHeadingRow(
  ws: import("exceljs").Worksheet,
  text: string,
  level: 1 | 2 | 3
) {
  if (!text.trim()) return;

  const row = ws.addRow([text]);

  const size = level === 1 ? 20 : level === 2 ? 16 : 14;

  row.font = {
    bold: true,
    size,
  };

  row.alignment = { vertical: "middle", wrapText: true };

  // Optional subtle bottom border for H1
  if (level === 1) {
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  }
}

/** Add a paragraph in the first column, wrapped. */
function addParagraphRow(ws: import("exceljs").Worksheet, text: string) {
  const clean = text.trim();
  if (!clean) return;

  const row = ws.addRow([clean]);

  const cell = row.getCell(1);
  cell.alignment = { wrapText: true, vertical: "top" };
  cell.font = { size: 12 };
}

/** Add list items as bullet-style paragraphs. */
function addList(ws: import("exceljs").Worksheet, node: MdNode) {
  // node.type === "list"
  for (const item of node.children || []) {
    if (!item || item.type !== "listItem") continue;

    const paragraphs = (item.children || []).filter(
      (c: MdNode) => c.type === "paragraph"
    );

    for (const p of paragraphs) {
      const text = mdNodeToPlain(p);
      if (!text.trim()) continue;
      addParagraphRow(ws, `• ${text.trim()}`);
    }
  }
}

/** Add a markdown table as a styled Excel table block. */
function addTable(ws: import("exceljs").Worksheet, node: MdNode) {
  const rows: string[][] = [];

  for (const rowNode of node.children || []) {
    const cells: string[] = [];
    for (const cellNode of rowNode.children || []) {
      const cellText = mdNodeToPlain(cellNode).trim();
      cells.push(cellText);
    }

    if (cells.length === 0) continue;
    rows.push(cells.slice(0, XLSX_MAX_COLUMNS));
  }

  if (!rows.length) return;

  const header = rows[0];
  const body = rows.slice(1);

  // Header row
  const headerRow = ws.addRow(header);
  headerRow.font = { bold: true, size: 13 };
  headerRow.alignment = { wrapText: true, vertical: "middle" };
  headerRow.eachCell((cell) => {
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

  // Body rows
  body.forEach((cells, idx) => {
    const row = ws.addRow(cells);
    const isStriped = idx % 2 === 0;

    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: "top" };
      if (isStriped) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFAFAFA" },
        };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  });
}

/* -------------------------------------------------------
   Main XLSX export — markdown → single sheet
------------------------------------------------------- */
export async function createXlsx(markdownOrJson: string) {
  const wb = new Workbook();

  let parsed: any = null;

  // Detect <pricing> JSON payload
  if (markdownOrJson.trim().startsWith("<pricing")) {
    try {
      const jsonText = markdownOrJson
        .replace("<pricing>", "")
        .replace("</pricing>", "")
        .trim();

      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error("Failed to parse pricing JSON:", err);
    }
  }

  // ------------------------------------------------------------
  // CASE A → JSON STRUCTURED PRICING (New Salar Output)
  // ------------------------------------------------------------
  if (parsed?.sheets) {
    for (const sheet of parsed.sheets) {
      const ws = wb.addWorksheet(sheet.name || "Sheet");

      // Configure columns
      ws.columns = (sheet.columns || []).map((col: string) => ({
        header: col,
        width: Math.max(15, col.length + 4),
      }));

      // Insert rows
      for (const row of sheet.rows || []) {
        ws.addRow(row);
      }

      // Style header row
      const header = ws.getRow(1);
      header.font = { bold: true };
      header.alignment = { vertical: "middle", horizontal: "center" };
    }

    // Export
    const buffer = await wb.xlsx.writeBuffer();
    return bufferToDataUrl(
      Buffer.from(buffer),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      `kora_pricing_${Date.now()}.xlsx`
    );
  }

  // ------------------------------------------------------------
  // CASE B → FALLBACK: Old Markdown Table Mode
  // ------------------------------------------------------------
  const ws = wb.addWorksheet("Pricing Export");

  const lines = (markdownOrJson || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes("|"));

  for (const line of lines) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((x) => x.length > 0);

    if (cells.every((c) => /^[-]+$/.test(c))) continue;

    ws.addRow(cells);
  }

  ws.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  return bufferToDataUrl(
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `kora_pricing_${Date.now()}.xlsx`
  );
}