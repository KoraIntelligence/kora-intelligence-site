// src/pages/api/fmc/render.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1️⃣ Validate method
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    // 2️⃣ Check API key
    const CANVA_API_KEY = process.env.CANVA_API_KEY;
    if (!CANVA_API_KEY) {
      throw new Error("Missing CANVA_API_KEY in environment variables.");
    }

    // 3️⃣ Parse incoming body
    const { title, body, brandHints } = req.body || {};
    if (!title && !body) {
      return res.status(400).json({ ok: false, error: "Missing title or body." });
    }

    // 4️⃣ Prepare payload for Canva render (stub for now)
    const payload = {
      title: title || "Untitled Visual",
      body: body || "No content provided.",
      brandHints: brandHints || {},
    };

    console.log("🎨 Canva Render Payload:", payload);

    // 5️⃣ Simulate Canva API call
    // Once your Canva app is approved for API access, replace this section with:
    // const response = await fetch("https://api.canva.com/v1/designs", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${CANVA_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     name: title,
    //     description: body,
    //     template_data: brandHints,
    //   }),
    // });
    // const result = await response.json();

    // 6️⃣ Temporary mock for demo
    const mockUrl = `https://www.canva.com/design/DA-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const result = {
      ok: true,
      url: mockUrl,
      preview: {
        title: payload.title,
        body: payload.body,
      },
    };

    console.log("✅ Canva Render Mock Result:", result);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Canva Render Error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}