// src/screens/ChatScreen.tsx

import React from "react";

import ChatLayout from "@/components/unifiedchat/ChatLayout";
import ChatWindow from "@/components/unifiedchat/ChatWindow";
import Sidebar from "@/components/unifiedchat/Sidebar";
import IdentityOverlay from "@/components/unifiedchat/IdentityOverlay";
import ToneSelector from "@/components/unifiedchat/ToneSelector";


import { useCompanion } from "@/context/CompanionContext";
import { useChatSession } from "@/context/ChatSessionContext";
import { useUIState } from "@/context/UIStateContext";

export default function ChatScreen() {
  /* CONTEXT HOOKS */
  const {
    companion,
    setCompanion,
    salarMode,
    setSalarMode,
    lyraMode,
    setLyraMode,
  } = useCompanion();

  const { showIdentity, setShowIdentity } = useUIState();

  const {
    messages,
    sending,
    uploadFile,
    sendMessage,
  } = useChatSession();

  
  const { tone, setTone } = useUIState(); // 👈 add this line
   /* Tone selector lives in UI state */
  const toneSelectorNode = (
    <ToneSelector
      companion={companion}
      value={tone}
      onChange={setTone}
    />
  );

  /* SIDEBAR NODE */
  const sidebarNode = (
    <Sidebar
      companion={companion}
      setCompanion={setCompanion}
      salarMode={salarMode}
      setSalarMode={setSalarMode}
      lyraMode={lyraMode}
      setLyraMode={setLyraMode}
      toneSelector={toneSelectorNode}
    />
  );

  /* CHAT WINDOW */
  const chatWindowNode = (
    <ChatWindow
      messages={messages}
      onSend={sendMessage}
      onUpload={uploadFile}
      sending={sending}
      companion={companion}
    />
  );

  /* IDENTITY OVERLAY */
  const identityOverlayNode =
    showIdentity ? (
      <IdentityOverlay
        isOpen={showIdentity}
        companion={companion}
        mode={companion === "salar" ? salarMode : lyraMode}
        onClose={() => setShowIdentity(false)}
      />
    ) : null;

  return (
    <ChatLayout
      sidebar={sidebarNode}
      chatWindow={chatWindowNode}
      identityOverlay={identityOverlayNode}
    />
  );
}