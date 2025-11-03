// src/pages/api/auth/callback.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

/**
 * Handles Supabase auth redirect after login or signup (magic link or OAuth).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return res.redirect("/?error=auth");
  }

  // Redirect to home (or dashboard) when login succeeds
  return res.redirect("/");
}