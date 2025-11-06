// src/pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/layout/Layout";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSession } from "@supabase/auth-helpers-react";

function ProfileSync() {
  const session = useSession();

  useEffect(() => {
    const ensureProfile = async () => {
      if (session?.user) {
        try {
          await fetch("/api/user/ensureProfile", { method: "POST" });
        } catch (err: any) {
          console.error("⚠️ Failed to ensure user profile:", err.message);
        }
      }
    };
    ensureProfile();
  }, [session?.user]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <ThemeProvider attribute="class">
        <Layout>
          <ProfileSync />
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionContextProvider>
  );
}


