// src/screens/ChatScreen.tsx

import React from "react";

import ChatLayout from "@/components/unifiedchat/ChatLayout";
import ChatWindow from "@/components/unifiedchat/ChatWindow";
import Sidebar from "@/components/unifiedchat/Sidebar";
import IdentityOverlay from "@/components/unifiedchat/IdentityOverlay";
import ToneSelector from "@/components/unifiedchat/ToneSelector";
import WorkflowTopBar from "@/components/unifiedchat/WorkflowTopBar";

import { useCompanion } from "@/context/CompanionContext";
import { useChatSession } from "@/context/ChatSessionContext";
import { useUIState } from "@/context/UIStateContext";

export default function ChatScreen() {
  /* ------------------------------------------------------ */
  /* CONTEXT HOOKS                                          */
  /* ------------------------------------------------------ */
  const {
    companion,
    setCompanion,
    salarMode,
    setSalarMode,
    lyraMode,
    setLyraMode,
  } = useCompanion();

  const {
    showIdentity,
    setShowIdentity,
    tone,
    setTone,
    topBarHeight, // <-- used to size ChatWindow correctly
  } = useUIState();

  const { messages, sending, uploadFile, sendMessage } = useChatSession();

  /* ------------------------------------------------------ */
  /* TONE SELECTOR                                          */
  /* ------------------------------------------------------ */
  const toneSelectorNode = (
    <ToneSelector companion={companion} value={tone} onChange={setTone} />
  );

  /* ------------------------------------------------------ */
  /* SIDEBAR                                                */
  /* ------------------------------------------------------ */
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

  /* ------------------------------------------------------ */
  /* TOP BAR (standalone, given to ChatLayout)              */
  /* ------------------------------------------------------ */
  const workflowTopBarNode = (
    <WorkflowTopBar companion={companion} messages={messages as any} />
  );

  /* ------------------------------------------------------ */
  /* CHAT WINDOW (already subtracts topBarHeight)           */
  /* ------------------------------------------------------ */
  const chatWindowNode = (
    <ChatWindow
      messages={messages}
      onSend={sendMessage}
      onUpload={uploadFile}
      sending={sending}
      companion={companion}
      topBarHeight={topBarHeight}
    />
  );

  /* ------------------------------------------------------ */
  /* IDENTITY OVERLAY                                       */
  /* ------------------------------------------------------ */
  const identityOverlayNode = showIdentity ? (
    <IdentityOverlay
      isOpen={showIdentity}
      companion={companion}
      mode={companion === "salar" ? salarMode : lyraMode}
      onClose={() => setShowIdentity(false)}
    />
  ) : null;

  /* ------------------------------------------------------ */
  /* FINAL RENDER                                           */
  /* ------------------------------------------------------ */
  return (
    <ChatLayout
      sidebar={sidebarNode}
      topBar={workflowTopBarNode}    // <-- use this (you were missing it)
      chatWindow={chatWindowNode}
      identityOverlay={identityOverlayNode}
    />
  );
}