"use client";

import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function SupabaseSessionGate({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      // Check if user is logged in
      const { data } = await supabase.auth.getSession();

      if (!data?.session) {
        // No session → redirect to login
        router.replace("/auth");
        return;
      }

      // Ensure user profile exists
      await fetch("/api/user/ensureProfile", { method: "POST" });

      setReady(true);
    }

    init();
  }, []);

  if (!ready) {
    return (
      <div style={{ padding: 40 }}>
        <p>Loading your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}