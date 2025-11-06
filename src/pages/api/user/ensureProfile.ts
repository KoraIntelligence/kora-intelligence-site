import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { getOrCreateUserProfile } from "@/lib/memory";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const profile = await getOrCreateUserProfile(user.id, user.email || "unknown");
    return res.status(200).json({ ok: true, profile });
  } catch (err: any) {
    console.error("Error ensuring user profile:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}