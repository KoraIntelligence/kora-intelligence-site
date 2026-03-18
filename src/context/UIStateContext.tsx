// src/context/UIStateContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { Attachment } from "@/types/chat";

interface UIStateContextShape {
  showIdentity: boolean;
  setShowIdentity: (v: boolean) => void;

  previewAttachment: Attachment | null;
  setPreviewAttachment: (a: Attachment | null) => void;

  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;

  topBarHeight: number;
  setTopBarHeight: (h: number) => void;

  // NEW: tone & guest flag for UI-level state
  tone: string;
  setTone: (v: string) => void;
  isGuest: boolean;
}

const UIStateContext = createContext<UIStateContextShape | null>(null);

export function UIStateProvider({ children }: { children: React.ReactNode }) {
  const [showIdentity, setShowIdentity] = useState(false);
  const [previewAttachment, setPreviewAttachment] =
    useState<Attachment | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Future-proof: workflow bar height or any top bar
  const [topBarHeight, setTopBarHeight] = useState(64);

  // NEW: tone + guest
  const [tone, setToneRaw] = useState<string>("calm");
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Persist tone to localStorage whenever it changes
  const setTone = React.useCallback((v: string) => {
    localStorage.setItem("kora_tone", v);
    setToneRaw(v);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const guestFlag = localStorage.getItem("guest_mode") === "true";
    setIsGuest(guestFlag);
    // Restore tone from localStorage on mount
    const storedTone = localStorage.getItem("kora_tone");
    if (storedTone) setToneRaw(storedTone);
  }, []);

  return (
    <UIStateContext.Provider
      value={{
        showIdentity,
        setShowIdentity,
        previewAttachment,
        setPreviewAttachment,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        topBarHeight,
        setTopBarHeight,
        tone,
        setTone,
        isGuest,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState() {
  const ctx = useContext(UIStateContext);
  if (!ctx)
    throw new Error("useUIState must be used within <UIStateProvider>");
  return ctx;
}