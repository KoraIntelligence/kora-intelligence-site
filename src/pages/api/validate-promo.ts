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
    // ✅ Robust body parsing (handles string + object)
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const rawCode = body?.code;

    if (!rawCode || typeof rawCode !== "string") {
      return res.status(400).json({ error: "Missing promo code" });
    }

    // ✅ NORMALISE (this is critical)
    const code = rawCode.trim().toUpperCase();

    // ✅ Query promo_codes table
    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: "Invalid promo code" });
    }

    // ✅ Expiry check
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ error: "Promo code expired" });
    }

    // ✅ Usage limit check
    if (
      typeof data.max_uses === "number" &&
      data.uses >= data.max_uses
    ) {
      return res.status(400).json({ error: "Promo code limit reached" });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      valid: true,
      code: data.code,
    });
  } catch (err) {
    console.error("❌ validate-promo error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}