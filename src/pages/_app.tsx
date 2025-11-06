// src/pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/layout/Layout";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSession } from "@supabase/auth-helpers-react";

import { getOrCreateUserProfile } from "@/lib/memory";

// 🧩 Local helper component that ensures user profiles exist
function ProfileSync() {
  const session = useSession();

  useEffect(() => {
    const ensureProfile = async () => {
      if (session?.user) {
        try {
          const { id, email } = session.user;
          await getOrCreateUserProfile(id, email);
        } catch (err: any) {
          console.error("⚠️ Failed to sync user profile:", err.message);
        }
      }
    };
    ensureProfile();
  }, [session]);

  return null; // no UI
}

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ThemeProvider attribute="class">
        <Layout>
          {/* 🧩 Automatically ensure user profile is created for any login (Google, magic link, etc.) */}
          <ProfileSync />
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionContextProvider>
  );
}


