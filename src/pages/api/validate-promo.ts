// src/pages/api/validate-promo.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Data =
  | {
      valid: true;
      code: string;
    }
  | {
      valid: false;
      reason:
        | "missing_code"
        | "not_found"
        | "inactive"
        | "expired"
        | "max_uses_reached";
    };

function parseBody(req: NextApiRequest): any {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | { error: string }>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);

    // Accept either { code } or { promoCode } to avoid frontend mismatch
    const raw = (body?.code ?? body?.promoCode ?? "") as string;

    const code = String(raw || "")
      .trim()
      .toUpperCase();

    // ✅ IMPORTANT: do NOT 400 on empty; just return valid:false
    if (!code) {
      return res.status(200).json({ valid: false, reason: "missing_code" });
    }

    // Pull the promo code row
    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("code,is_active,uses,max_uses,expires_at")
      .eq("code", code)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("validate-promo db error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!data) {
      return res.status(200).json({ valid: false, reason: "not_found" });
    }

    if (!data.is_active) {
      return res.status(200).json({ valid: false, reason: "inactive" });
    }

    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at).getTime();
      if (Number.isFinite(expiresAt) && Date.now() > expiresAt) {
        return res.status(200).json({ valid: false, reason: "expired" });
      }
    }

    // max_uses can be null => unlimited
    if (data.max_uses != null) {
      const uses = Number(data.uses ?? 0);
      const maxUses = Number(data.max_uses);

      if (Number.isFinite(maxUses) && uses >= maxUses) {
        return res.status(200).json({ valid: false, reason: "max_uses_reached" });
      }
    }

    return res.status(200).json({ valid: true, code: data.code });
  } catch (e: any) {
    console.error("validate-promo error:", e);
    return res.status(500).json({ error: "Unknown server error" });
  }
}