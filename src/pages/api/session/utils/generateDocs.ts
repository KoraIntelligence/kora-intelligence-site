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

export async function createXlsx(markdown: string) {
  const wb = new Workbook();

  const tableData = extractFirstTable(markdown);

  // ----------------------------------------------------
  // Sheet 1: Pricing Table (if any table present)
  // ----------------------------------------------------
  if (tableData.length) {
    const ws = wb.addWorksheet("Pricing Table");

    tableData.forEach((row) => ws.addRow(row));

    // Autosize-ish column widths based on header length
    const colCount = tableData[0]?.length || 0;
    for (let i = 1; i <= colCount; i++) {
      const headerText = tableData[0][i - 1] || "";
      const baseWidth = Math.max(12, Math.min(40, headerText.length + 5));
      ws.getColumn(i).width = baseWidth;
    }

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE5E7EB" }, // light gray
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add thin borders for rest of table
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  }

  // ----------------------------------------------------
  // Sheet 2: Notes (always present)
  // ----------------------------------------------------
  const wsNotes = wb.addWorksheet("Notes");
  wsNotes.columns = [{ header: "Notes", width: 100 }];

  const lines = (markdown || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (!lines.length) {
    wsNotes.addRow(["No additional notes."]);
  } else {
    for (const line of lines) {
      const row = wsNotes.addRow([line]);
      row.alignment = { wrapText: true, vertical: "top" };
    }
  }

  const buffer = await wb.xlsx.writeBuffer();

  return bufferToDataUrl(
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `kora_pricing_${Date.now()}.xlsx`
  );
}