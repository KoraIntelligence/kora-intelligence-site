import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createPagesServerClient({ req, res });

  // This exchanges the OAuth / magic-link code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(req.url!);

  if (error) {
    console.error("Auth callback error:", error);
    return res.redirect("/auth?error=auth_callback_failed");
  }

  // At this point:
  // - session cookie is set
  // - useUser() WILL hydrate
  return res.redirect("/auth/callback");
}