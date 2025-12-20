import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false });
  }

  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ valid: false });
    }

    const now = new Date().toISOString();

    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", code.trim())
      .single();

    if (error || !promo) {
      return res.status(200).json({ valid: false });
    }

    if (!promo.is_active) {
      return res.status(200).json({ valid: false });
    }

    if (promo.expires_at && promo.expires_at < now) {
      return res.status(200).json({ valid: false });
    }

    if (
      promo.max_uses !== null &&
      promo.uses >= promo.max_uses
    ) {
      return res.status(200).json({ valid: false });
    }

    return res.status(200).json({
      valid: true,
    });
  } catch (err) {
    console.error("validate-promo error:", err);
    return res.status(500).json({ valid: false });
  }
}