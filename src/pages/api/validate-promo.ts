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
    const { code } = req.body ?? {};

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing promo code" });
    }

    const normalizedCode = code.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .maybeSingle(); // ✅ IMPORTANT (not .single())

    if (error) {
      console.error("Promo lookup error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!data) {
      return res.status(400).json({ valid: false });
    }

    // Optional expiry check
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ valid: false });
    }

    // Optional usage limit check
    if (data.max_uses && data.uses >= data.max_uses) {
      return res.status(400).json({ valid: false });
    }

    return res.status(200).json({
      valid: true,
      promo: {
        id: data.id,
        code: data.code,
      },
    });
  } catch (err) {
    console.error("validate-promo fatal:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}