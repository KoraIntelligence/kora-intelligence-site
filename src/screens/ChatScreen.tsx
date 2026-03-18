// src/screens/ChatScreen.tsx

import React from "react";

import ChatLayout from "@/components/unifiedchat/ChatLayout";
import ChatWindow from "@/components/unifiedchat/ChatWindow";
import Sidebar from "@/components/unifiedchat/Sidebar";
import IdentityOverlay from "@/components/unifiedchat/IdentityOverlay";
import ToneSelector from "@/components/unifiedchat/ToneSelector";
import WorkflowTopBar from "@/components/unifiedchat/WorkflowTopBar";
import DeliverablesPanel from "@/components/unifiedchat/DeliverablesPanel";
import ModeSelectorOverlay from "@/components/unifiedchat/ModeSelectorOverlay";
import OnboardingDialog from "@/components/unifiedchat/OnboardingDialog";

import { useCompanion } from "@/context/CompanionContext";
import { useChatSession } from "@/context/ChatSessionContext";
import { useUIState } from "@/context/UIStateContext";

export default function ChatScreen() {
  /* ------------------------------------------------------ */
  /* CONTEXT HOOKS                                          */
  /* ------------------------------------------------------ */
  const [deliverablesOpen, setDeliverablesOpen] = React.useState(false);
  const [modeSelectorOpen, setModeSelectorOpen] = React.useState(false);
  const [onboardingOpen, setOnboardingOpen] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('kora_onboarded') !== 'true';
  });

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

  const { messages, sending, uploadFile, sendMessage, userId } = useChatSession();

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
      onSwitchMode={() => setModeSelectorOpen(true)}
    />
  );

  /* ------------------------------------------------------ */
  /* TOP BAR (standalone, given to ChatLayout)              */
  /* ------------------------------------------------------ */
  const workflowTopBarNode = (
    <WorkflowTopBar
      companion={companion}
      messages={messages as any}
      onOpenDeliverables={() => setDeliverablesOpen(true)}
    />
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
    <>
      <ChatLayout
        sidebar={sidebarNode}
        topBar={workflowTopBarNode}
        chatWindow={chatWindowNode}
        identityOverlay={identityOverlayNode}
      />
      <DeliverablesPanel
        open={deliverablesOpen}
        onClose={() => setDeliverablesOpen(false)}
        companion={companion}
        mode={companion === "salar" ? salarMode : lyraMode}
        exports={[]}
      />
      <ModeSelectorOverlay
        isOpen={modeSelectorOpen}
        companion={companion}
        activeMode={companion === "salar" ? salarMode : lyraMode}
        onSelect={(mode) => {
          if (companion === "salar") setSalarMode(mode as any);
          else setLyraMode(mode as any);
        }}
        onClose={() => setModeSelectorOpen(false)}
      />
      <OnboardingDialog
        isOpen={onboardingOpen}
        companion={companion}
        onComplete={(tone, brandName, industry) => {
          setTone(tone as any);
          setOnboardingOpen(false);
          localStorage.setItem("kora_onboarded", "true");
          // Persist brand data to Supabase if user is authenticated
          if ((brandName || industry) && userId) {
            fetch("/api/brand/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, brandName, industry }),
            }).catch(() => {});
          }
        }}
        onModeSelect={(mode) => {
          if (companion === "salar") setSalarMode(mode as any);
          else setLyraMode(mode as any);
        }}
        onClose={() => {
          setOnboardingOpen(false);
          localStorage.setItem("kora_onboarded", "true");
        }}
      />
    </>
  );
}