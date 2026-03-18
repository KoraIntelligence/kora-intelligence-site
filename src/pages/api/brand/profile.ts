// src/pages/api/brand/profile.ts
// GET  → fetch current user's brand profile
// POST → upsert current user's brand profile

import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { getBrandProfile, upsertBrandProfile } from "@/lib/memory";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = user.id;

  if (req.method === "GET") {
    const profile = await getBrandProfile(userId);
    return res.status(200).json({ profile: profile ?? null });
  }

  // POST — upsert
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const {
    brand_name,
    industry,
    tone_keywords,
    messaging_pillars,
    target_audience,
    brand_voice_notes,
  } = body;

  const result = await upsertBrandProfile({
    user_id: userId,
    brand_name: brand_name ?? null,
    industry: industry ?? null,
    tone_keywords: Array.isArray(tone_keywords) ? tone_keywords : null,
    messaging_pillars: Array.isArray(messaging_pillars) ? messaging_pillars : null,
    target_audience: target_audience ?? null,
    brand_voice_notes: brand_voice_notes ?? null,
  });

  if (!result.ok) {
    return res.status(500).json({ error: "Failed to save brand profile" });
  }

  return res.status(200).json({ ok: true });
}
