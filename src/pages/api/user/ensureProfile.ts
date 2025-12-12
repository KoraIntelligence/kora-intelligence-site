// src/pages/api/user/ensureProfile.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    const isGuest = req.headers["x-guest"] === "true";

    /* ======================================================
       GUEST MODE
       - Shared guest profile
       - Must exist so sessions.user_id FK does NOT explode
    ====================================================== */
    if (isGuest) {
      const guestEmail = "guest@kora.local";

      const { data: existingGuest, error } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("email", guestEmail)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!existingGuest) {
        await supabaseAdmin.from("user_profiles").insert([
          {
            email: guestEmail,
            name: "Guest User",
            current_tone: "calm",
          },
        ]);
      }

      return res.status(200).json({ ok: true, mode: "guest" });
    }

    /* ======================================================
       AUTHENTICATED USER
       - user_profiles.id MUST equal auth.users.id
       - This is REQUIRED for sessions FK
    ====================================================== */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({
        ok: false,
        error: "Not authenticated",
      });
    }

    const userId = user.id;
    const email = user.email ?? null;

    const { data: existingProfile, error: fetchError } =
      await supabaseAdmin
        .from("user_profiles")
        .select("id, email")
        .eq("id", userId)
        .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (!existingProfile) {
      await supabaseAdmin.from("user_profiles").insert([
        {
          id: userId, // 🔑 critical: FK target for sessions.user_id
          email,
          name: email ? email.split("@")[0] : "Anonymous",
          current_tone: "calm",
        },
      ]);
    } else if (email && existingProfile.email !== email) {
      // Keep email in sync (Google can change casing etc.)
      await supabaseAdmin
        .from("user_profiles")
        .update({ email })
        .eq("id", userId);
    }

    return res.status(200).json({ ok: true, mode: "auth" });
  } catch (err: any) {
    console.error("❌ ensureProfile error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Internal error",
    });
  }
}