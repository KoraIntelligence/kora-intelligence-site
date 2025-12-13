"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SupabaseSessionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data, error } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error || !data?.session) {
        // No authenticated session → return to auth
        router.replace("/auth");
        return;
      }

      // Session exists.
      // Profile is assumed to already exist (created in /auth/callback).
      setReady(true);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  if (!ready) {
    return (
      <div style={{ padding: 40 }}>
        <p>Loading your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}