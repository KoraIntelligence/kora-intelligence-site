/* --------------------------------------------------------
   MVP.tsx — Clean Shell Version (Option A)

   All business logic now lives in:
   - ChatSessionContext
   - CompanionContext
   - UIStateContext
   - ChatScreen.tsx

   MVP simply mounts the whole chat app.
--------------------------------------------------------- */

import React from "react";

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
return (
<CompanionProvider>
<UIStateProvider>
<WrappedChat />
</UIStateProvider>
</CompanionProvider>
);
}