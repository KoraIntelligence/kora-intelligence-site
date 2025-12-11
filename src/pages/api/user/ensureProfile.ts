// src/pages/api/user/ensureProfile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    const isGuest = req.headers["x-guest"] === "true";

    /* ---------------------------------------- */
    /* CASE 1 — GUEST SESSION                   */
    /* ---------------------------------------- */
    if (isGuest) {
      // We keep a single shared guest profile (by email).
      const guestEmail = "guest@kora.local";

      const { data: existingGuest, error: guestError } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("email", guestEmail)
        .maybeSingle();

      if (guestError && guestError.code !== "PGRST116") {
        throw guestError;
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

    /* ---------------------------------------- */
    /* CASE 2 — AUTHENTICATED USER              */
    /* ---------------------------------------- */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }

    const userId = user.id;
    const email = user.email ?? null;

    // Look up by *id* so it lines up with foreign key in sessions.user_id
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (!existing) {
      await supabaseAdmin.from("user_profiles").insert([
        {
          id: userId,
          email,
          name: email ? email.split("@")[0] : "Anonymous",
          current_tone: "calm",
        },
      ]);
    }

    return res.status(200).json({ ok: true, mode: "auth" });
  } catch (err: any) {
    console.error("ensureProfile error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Internal error" });
  }
}