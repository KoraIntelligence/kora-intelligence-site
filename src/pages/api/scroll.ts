import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { messages, companionSlug, title } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'No messages to render' });
  }

  // 1. Render HTML template
  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Georgia, serif;
            padding: 40px;
            background: #fdf7e2;
          }
          h1 {
            text-align: center;
            font-size: 24px;
            color: #333;
          }
          .glyph {
            text-align: center;
            margin-bottom: 20px;
          }
          .message {
            margin-bottom: 15px;
            border-left: 4px solid #d4a373;
            padding-left: 10px;
          }
          .sender {
            font-weight: bold;
            color: #6b4f3b;
          }
          .timestamp {
            font-size: 10px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="glyph">
          <img src="https://koraintelligence.com/assets/glyphs/glyph-${companionSlug}.png" alt="Glyph" height="60" />
        </div>
        <h1>Sohbat Scroll – ${title || 'Companion'}</h1>
        ${messages
          .map(
            (m: any) => `
            <div class="message">
              <div class="sender">${m.sender}</div>
              <div class="content">${m.content}</div>
              <div class="timestamp">${m.timestamp}</div>
            </div>
          `
          )
          .join('')}
      </body>
    </html>
  `;

  // 2. Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // 3. Generate PDF
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();

  // 4. Send PDF as file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title || 'sohbat'}.pdf"`);

  res.send(pdfBuffer);
}