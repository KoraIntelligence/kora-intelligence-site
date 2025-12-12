// src/pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Ensure the user_profiles row exists for the logged-in Supabase user
        await fetch("/api/user/ensureProfile", { method: "POST" });
      } catch (e) {
        console.error("ensureProfile failed", e);
      } finally {
        // Always shove them into the chat shell
        router.replace("/mvp");
      }
    })();
  }, [router]);

  return <p style={{ padding: 40 }}>Finishing sign-in…</p>;
}