// src/pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function verify() {
      try {
        // This installs Supabase session cookie
        await fetch("/api/user/ensureProfile", { method: "POST" });

        router.replace("/mvp");
      } catch (err) {
        console.error("callback error:", err);
        router.replace("/auth?error=callback");
      }
    }

    verify();
  }, [router]);

  return <p style={{ padding: 40 }}>Finishing sign-in…</p>;
}