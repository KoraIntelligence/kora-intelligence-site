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
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing promo code" });
    }

    // 🔑 NORMALISE INPUT
    const normalizedCode = code.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Promo lookup error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!data) {
      return res.status(400).json({ error: "Invalid promo code" });
    }

    // ⏰ Expiry check (NULL-safe)
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ error: "Promo code expired" });
    }

    // 🔢 Usage check (NULL-safe)
    if (
      typeof data.max_uses === "number" &&
      data.uses >= data.max_uses
    ) {
      return res.status(400).json({ error: "Promo code fully used" });
    }

    return res.status(200).json({
      valid: true,
      promo: {
        code: data.code,
        maxUses: data.max_uses,
        uses: data.uses,
        expiresAt: data.expires_at,
      },
    });
  } catch (err: any) {
    console.error("validate-promo error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}