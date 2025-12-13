// src/pages/api/user/ensureProfile.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const supabase = createPagesServerClient({ req, res });
    const isGuestHeader = req.headers["x-guest"] === "true";

    // ✅ AUTH FIRST: if cookies contain an authenticated user, we MUST ensure that profile
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (user && !authError) {
      const userId = user.id;
      const email = user.email ?? null;

      // Upsert is the safest: id MUST equal auth.users.id
      const { error: upsertError } = await supabaseAdmin
        .from("user_profiles")
        .upsert(
          {
            id: userId,
            email,
            name: email ? email.split("@")[0] : "Anonymous",
            current_tone: "calm",
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        console.error("❌ ensureProfile upsertError:", upsertError);
        return res.status(500).json({ ok: false, error: upsertError.message });
      }

      return res.status(200).json({ ok: true, mode: "auth", userId });
    }

    // ✅ Only if NOT authenticated do we allow guest mode
    if (isGuestHeader) {
      const guestEmail = "guest@kora.local";

      const { data: existingGuest, error: guestFetchError } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("email", guestEmail)
        .maybeSingle();

      if (guestFetchError) {
        console.error("❌ ensureProfile guestFetchError:", guestFetchError);
        return res.status(500).json({ ok: false, error: guestFetchError.message });
      }

      if (!existingGuest) {
        const { error: guestInsertError } = await supabaseAdmin.from("user_profiles").insert({
          email: guestEmail,
          name: "Guest User",
          current_tone: "calm",
        });

        if (guestInsertError) {
          console.error("❌ ensureProfile guestInsertError:", guestInsertError);
          return res.status(500).json({ ok: false, error: guestInsertError.message });
        }
      }

      return res.status(200).json({ ok: true, mode: "guest" });
    }

    // Neither authenticated nor explicitly guest
    return res.status(401).json({ ok: false, error: "Not authenticated" });
  } catch (err: any) {
    console.error("❌ ensureProfile fatal error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Internal error" });
  }
}