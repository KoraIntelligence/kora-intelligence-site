// src/pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";

export default function OAuthCallback() {
  const router = useRouter();
  const user = useUser();
  const [status, setStatus] = useState<string>("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Wait up to ~10s for Supabase to hydrate the session cookie -> useUser() becomes truthy.
      const start = Date.now();
      while (!cancelled && !user && Date.now() - start < 10_000) {
        await new Promise((r) => setTimeout(r, 250));
      }

      if (cancelled) return;

      if (!user) {
        // Session never appeared -> send back to auth instead of pushing to /mvp in a broken state.
        setStatus("Sign-in did not complete. Returning to login…");
        router.replace("/auth?error=session_missing");
        return;
      }

      try {
        setStatus("Syncing profile…");
        const r = await fetch("/api/user/ensureProfile", { method: "POST" });

        if (!r.ok) {
          const text = await r.text().catch(() => "");
          throw new Error(`ensureProfile failed: ${r.status} ${text}`);
        }

        setStatus("Redirecting…");
        router.replace("/mvp");
      } catch (e) {
        console.error(e);
        setStatus("Profile sync failed. Returning to login…");
        router.replace("/auth?error=profile_sync_failed");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [user, router]);

  return <p style={{ padding: 40 }}>{status}</p>;
}