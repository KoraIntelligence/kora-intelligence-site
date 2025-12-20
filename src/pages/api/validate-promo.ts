// src/pages/api/validate-promo.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body as { code?: string };

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing promo code" });
    }

    const normalizedCode = code.trim().toUpperCase();

    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Promo lookup error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!promo) {
      return res.status(400).json({ error: "Invalid promo code" });
    }

    // ✅ Handle expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.status(400).json({ error: "Promo code expired" });
    }

    // ✅ Handle usage limit ONLY if max_uses is set
    if (
      typeof promo.max_uses === "number" &&
      promo.uses >= promo.max_uses
    ) {
      return res.status(400).json({ error: "Promo code fully used" });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      valid: true,
      code: promo.code,
    });
  } catch (err) {
    console.error("validate-promo error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}