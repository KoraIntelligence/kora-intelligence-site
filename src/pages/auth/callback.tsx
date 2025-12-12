// src/pages/auth/callback.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function OAuthCallback() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      try {
        // 🔑 This is the missing step:
        // Wait for Supabase to finish exchanging the OAuth / magic-link code
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          throw new Error("No Supabase session after callback");
        }

        // Ensure user_profiles row exists
        const res = await fetch("/api/user/ensureProfile", {
          method: "POST",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`ensureProfile failed: ${text}`);
        }

        if (!cancelled) {
          router.replace("/mvp");
        }
      } catch (err: any) {
        console.error("OAuth callback failed:", err);
        setError(err.message || "Authentication failed");
      }
    }

    finishAuth();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div style={{ padding: 40 }}>
      <p>Finishing sign-in…</p>
      {error && (
        <p style={{ color: "red", marginTop: 16 }}>
          {error}
        </p>
      )}
    </div>
  );
}