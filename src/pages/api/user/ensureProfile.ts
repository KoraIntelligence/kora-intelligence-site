import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { getOrCreateUserProfile } from "@/lib/memory";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    const guestHeader = req.headers["x-guest"];

    // ── Case 1: Guest mode
    if (guestHeader === "true") {
      const { data: guest, error: guestError } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("email", "guest@kora.local")
        .single();

      if (guestError && guestError.code !== "PGRST116") throw guestError;

      if (!guest) {
        await supabaseAdmin.from("user_profiles").insert([
          {
            email: "guest@kora.local",
            name: "Guest User",
            current_tone: "calm",
          },
        ]);
        console.log("✅ Guest profile ensured");
      }

      return res.status(200).json({ ok: true, mode: "guest" });
    }

    // ── Case 2: Authenticated Supabase user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return res.status(401).json({ ok: false, error: "Not authenticated" });

    await getOrCreateUserProfile(user.id, user.email || "unknown");

    return res.status(200).json({ ok: true, mode: "auth" });
  } catch (err: any) {
    console.error("ensureProfile error:", err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || "Internal error" });
  }
}