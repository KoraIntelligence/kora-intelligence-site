// src/components/unifiedchat/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { SalarMode } from "@/companions/orchestrators/salar";
import { LyraMode } from "@/companions/orchestrators/lyra";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

interface SidebarProps {
  companion: "salar" | "lyra";
  setCompanion: (c: "salar" | "lyra") => void;

  salarMode: SalarMode;
  setSalarMode: (m: SalarMode) => void;

  lyraMode: LyraMode;
  setLyraMode: (m: LyraMode) => void;

  toneSelector?: React.ReactNode;
}

const SALAR_MODE_LABELS: Record<SalarMode, string> = {
  commercial_chat: "Commercial Chat",
  proposal_builder: "Proposal Builder",
  contract_advisor: "Contract Advisor",
  pricing_estimation: "Pricing & Estimation",
  commercial_strategist: "Commercial Strategist",
};

const LYRA_MODE_LABELS: Record<LyraMode, string> = {
  creative_chat: "Creative Chat",
  messaging_advisor: "Messaging Advisor",
  campaign_builder: "Campaign Builder",
  lead_outreach: "Lead Outreach",
  customer_nurture: "Customer Nurture",
};

export default function Sidebar({
  companion,
  setCompanion,
  salarMode,
  setSalarMode,
  lyraMode,
  setLyraMode,
  toneSelector,
}: SidebarProps) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const isLyra = companion === "lyra";
  const modeLabels = isLyra ? LYRA_MODE_LABELS : SALAR_MODE_LABELS;

  const [streamingEnabled, setStreamingEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kora_streaming");
    setStreamingEnabled(stored === "true");
  }, []);

  const toggleStreaming = () => {
    const next = !streamingEnabled;
    setStreamingEnabled(next);
    localStorage.setItem("kora_streaming", String(next));
  };

  const accent = isLyra
    ? {
        bg: "bg-teal-600 dark:bg-teal-500",
        light: "bg-teal-50 dark:bg-teal-900/30",
        border: "border-teal-600 dark:border-teal-400",
        text: "text-teal-700 dark:text-teal-300",
      }
    : {
        bg: "bg-amber-600 dark:bg-amber-500",
        light: "bg-amber-50 dark:bg-amber-900/30",
        border: "border-amber-600 dark:border-amber-400",
        text: "text-amber-700 dark:text-amber-300",
      };

  const activeBtn = `
    ${accent.bg} text-white border ${accent.border} shadow-sm
  `;

  const inactiveBtn = `
    bg-white text-gray-700 border border-gray-200 hover:bg-gray-100
    dark:bg-[#1b1b1b] dark:text-gray-200 dark:border-[#333333]
    dark:hover:bg-[#262626]
  `;

  const handleLogout = async () => {
    const isGuest = localStorage.getItem("guest_mode") === "true";

    if (isGuest) {
      localStorage.removeItem("guest_mode");
    } else {
      await supabase.auth.signOut({ scope: "global" });
    }

    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/auth";
  };

  return (
    <div className="flex flex-col gap-8 p-4 text-sm bg-gray-50 dark:bg-[#111111] h-full">
      {/* Companion Switch */}
      <div className="flex gap-2">
        {(["salar", "lyra"] as const).map((c) => (
          <button
            key={c}
            className={`flex-1 py-2 rounded-xl ${c === companion ? activeBtn : inactiveBtn}`}
            onClick={() => setCompanion(c)}
          >
            {c === "salar" ? "Salar" : "Lyra"}
          </button>
        ))}
      </div>

      {/* Mode Selector */}
      <div>
        <h2 className="text-xs font-semibold mb-3">Modes</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(modeLabels).map(([key, label]) => {
            const isActive = isLyra ? key === lyraMode : key === salarMode;
            return (
              <button
                key={key}
                className={`px-3 py-2 rounded-xl text-xs text-left ${
                  isActive ? activeBtn : inactiveBtn
                }`}
                onClick={() =>
                  isLyra
                    ? setLyraMode(key as LyraMode)
                    : setSalarMode(key as SalarMode)
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone Selector */}
      {toneSelector && (
        <div className="pt-4 border-t border-gray-200 dark:border-[#333333]">
          {toneSelector}
        </div>
      )}

      {/* Streaming Toggle */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#333333]">
        <label className="flex items-center justify-between text-xs cursor-pointer">
          <span>
            Streaming (Beta)
            <div className="text-[10px] text-gray-400">
              Token-by-token replies
            </div>
          </span>
          <input
            type="checkbox"
            checked={streamingEnabled}
            onChange={toggleStreaming}
            className="accent-amber-600"
          />
        </label>
      </div>

      <div className="flex-1" />

      {/* Logout */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#333333]">
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}