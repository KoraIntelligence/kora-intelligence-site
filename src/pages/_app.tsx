import "../styles/globals.css";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";
import Layout from "../components/layout/Layout";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSession } from "@supabase/auth-helpers-react";

function ProfileSync() {
  const session = useSession();

  useEffect(() => {
    if (session === null) return; // Supabase still hydrating
    const sync = async () => {
      const isGuest = localStorage.getItem("guest_mode") === "true";
      try {
        await fetch("/api/user/ensureProfile", {
          method: "POST",
          headers: isGuest ? { "x-guest": "true" } : {},
        });
      } catch (err: any) {
        console.error("⚠️ ensureProfile failed:", err?.message || err);
      }
    };
    // small timeout helps Supabase finish setting cookies
    const t = setTimeout(sync, 500);
    return () => clearTimeout(t);
  }, [session]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  // Pages can export getLayout to opt out of the default Layout
  const getLayout: (page: ReactNode) => ReactNode =
    (Component as any).getLayout ??
    ((page: ReactNode) => <Layout>{page}</Layout>);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ThemeProvider attribute="class" defaultTheme="dark">
        <ProfileSync />
        {getLayout(<Component {...pageProps} />)}
      </ThemeProvider>
    </SessionContextProvider>
  );
}


