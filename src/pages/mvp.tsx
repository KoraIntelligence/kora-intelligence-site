/* --------------------------------------------------------
   MVP.tsx — Protected Shell

   - Uses Supabase session (useUser)
   - Respects guest_mode in localStorage
   - Redirects to /auth if user is neither logged-in nor guest
--------------------------------------------------------- */

import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";
import Header from "@/components/layout/Header";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

import ChatScreen from "@/screens/ChatScreen";

import { CompanionProvider } from "@/context/CompanionContext";
import { UIStateProvider, useUIState } from "@/context/UIStateContext";
import { ChatSessionProvider } from "@/context/ChatSessionContext";

function WrappedChat() {
  const { tone, isGuest } = useUIState();

  return (
    <ChatSessionProvider tone={tone} isGuest={isGuest}>
      <ChatScreen />
    </ChatSessionProvider>
  );
}

export default function MVP() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const guest =
        typeof window !== "undefined" &&
        window.localStorage.getItem("guest_mode") === "true";

      // If neither authenticated nor guest → redirect to /auth
      if (!user && !guest) {
        return router.replace("/auth");
      }

      // Authenticated users MUST have profile ensured
      if (user && !guest) {
        await fetch("/api/user/ensureProfile", { method: "POST" });
      }

      setReady(true);
    }

    init();
  }, [user]);

  // Prevent rendering chat before profile/session is ready
  if (!ready) {
    return (
      <div style={{ padding: 40 }}>
        <p>Loading your session…</p>
      </div>
    );
  }

  return (
    <CompanionProvider>
      <UIStateProvider>
        <WrappedChat />
      </UIStateProvider>
    </CompanionProvider>
  );
}

// Bypass default Layout — use a tight shell with Header + full-height chat area
MVP.getLayout = function getLayout(page: ReactNode) {
  return (
    <div className="flex flex-col h-screen bg-[#111111] overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden pt-14">
        {page}
      </div>
    </div>
  );
};