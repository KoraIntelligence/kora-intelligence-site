// src/pages/api/auth/callback.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return res.redirect("/auth?error=auth");
  }

  // Redirect to chat after successful login
  return res.redirect("/mvp");
}