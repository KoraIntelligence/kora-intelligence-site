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
      const { data: existingGuest } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("email", "guest@kora.local")
        .maybeSingle();

      if (!existingGuest) {
        await supabaseAdmin.from("user_profiles").insert([
          {
            email: "guest@kora.local",
            name: "Guest User",
            current_tone: "calm",
          },
        ]);
      }

      return res.status(200).json({ ok: true, mode: "guest" });
    }

    /* ---------------------------------------- */
    /* CASE 2 — AUTH USER                       */
    /* ---------------------------------------- */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }

    const email = user.email || "unknown";

    // Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!existing) {
      await supabaseAdmin.from("user_profiles").insert([
        {
          email,
          name: email.split("@")[0], // simple default
          current_tone: "calm",
        },
      ]);
    }

    return res.status(200).json({ ok: true, mode: "auth" });
  } catch (err: any) {
    console.error("ensureProfile error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Internal error" });
  }
}