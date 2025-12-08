/* --------------------------------------------------------
   MVP.tsx — Protected Shell

   - Uses Supabase session (useUser)
   - Respects guest_mode in localStorage
   - Redirects to /auth if user is neither logged-in nor guest
--------------------------------------------------------- */

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";

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
  const router = useRouter();

  // Auth / guest gate
  useEffect(() => {
    // Only access localStorage in the browser
    const guest =
      typeof window !== "undefined" &&
      window.localStorage.getItem("guest_mode") === "true";

    // If not logged in and not a guest → go to /auth
    if (!user && !guest) {
      router.replace("/auth");
    }
  }, [user, router]);

  return (
    <CompanionProvider>
      <UIStateProvider>
        <WrappedChat />
      </UIStateProvider>
    </CompanionProvider>
  );
}