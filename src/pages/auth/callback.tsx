// src/pages/auth/callback.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function OAuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let cancelled = false;

    const finalizeAuth = async () => {
      try {
        // 1. Wait for Supabase session to be available
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error("No Supabase session in callback", sessionError);
          router.replace("/auth?error=no_session");
          return;
        }

        // 2. Ensure user_profiles row exists (REQUIRED for FK safety)
        const res = await fetch("/api/user/ensureProfile", {
          method: "POST",
          credentials: "same-origin",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("ensureProfile failed:", res.status, text);
          router.replace("/auth?error=profile_sync_failed");
          return;
        }

        // 3. Safe to enter app
        if (!cancelled) {
          router.replace("/mvp");
        }
      } catch (err) {
        console.error("OAuth callback fatal error:", err);
        router.replace("/auth?error=callback_exception");
      }
    };

    finalizeAuth();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <p style={{ padding: 40 }}>
      Finishing sign-in…
    </p>
  );
}