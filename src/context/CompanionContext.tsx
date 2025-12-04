// src/context/CompanionContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { SalarMode } from "@/companions/orchestrators/salar";
import type { LyraMode } from "@/companions/orchestrators/lyra";

type Companion = "salar" | "lyra";

interface CompanionState {
  companion: Companion;
  setCompanion: (c: Companion) => void;

  salarMode: SalarMode;
  setSalarMode: (m: SalarMode) => void;

  lyraMode: LyraMode;
  setLyraMode: (m: LyraMode) => void;

  theme: {
    accent: string;       // amber-600 or teal-600
    accentLight: string;  // amber-50 or teal-50
    border: string;       // border-amber-600 or border-teal-600
  };
}

const CompanionContext = createContext<CompanionState | null>(null);

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const [companion, setCompanion] = useState<Companion>("salar");
  const [salarMode, setSalarMode] = useState<SalarMode>("commercial_chat");
  const [lyraMode, setLyraMode] = useState<LyraMode>("creative_chat");

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "kora_companion_state",
      JSON.stringify({ companion, salarMode, lyraMode })
    );
  }, [companion, salarMode, lyraMode]);

  // Load on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("kora_companion_state");
    if (!raw) return;

    try {
      const state = JSON.parse(raw);
      if (state.companion) setCompanion(state.companion);
      if (state.salarMode) setSalarMode(state.salarMode);
      if (state.lyraMode) setLyraMode(state.lyraMode);
    } catch {}
  }, []);

  const theme =
    companion === "lyra"
      ? {
          accent: "teal-600",
          accentLight: "teal-50",
          border: "border-teal-600",
        }
      : {
          accent: "amber-600",
          accentLight: "amber-50",
          border: "border-amber-600",
        };

  return (
    <CompanionContext.Provider
      value={{
        companion,
        setCompanion,
        salarMode,
        setSalarMode,
        lyraMode,
        setLyraMode,
        theme,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion() {
  const ctx = useContext(CompanionContext);
  if (!ctx) throw new Error("useCompanion must be used inside <CompanionProvider>");
  return ctx;
}