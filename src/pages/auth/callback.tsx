// src/pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function verify() {
      // Ensure Supabase has set the session cookie
      await fetch("/api/user/ensureProfile", { method: "POST" });

      router.replace("/mvp");
    }

    verify();
  }, []);

  return <p style={{ padding: 40 }}>Finishing sign-in…</p>;
}