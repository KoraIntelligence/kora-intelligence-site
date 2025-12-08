// src/components/unifiedchat/Sidebar.tsx

import React from "react";
import { SalarMode } from "@/companions/orchestrators/salar";
import { LyraMode } from "@/companions/orchestrators/lyra";

interface SidebarProps {
  companion: "salar" | "lyra";
  setCompanion: (c: "salar" | "lyra") => void;

  salarMode: SalarMode;
  setSalarMode: (m: SalarMode) => void;

  lyraMode: LyraMode;
  setLyraMode: (m: LyraMode) => void;

  toneSelector?: React.ReactNode;
}

/* ----------------------- */
/* LABEL MAPS              */
/* ----------------------- */

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

/* ----------------------- */
/* COMPONENT               */
/* ----------------------- */

export default function Sidebar({
  companion,
  setCompanion,
  salarMode,
  setSalarMode,
  lyraMode,
  setLyraMode,
  toneSelector,
}: SidebarProps) {
  const isLyra = companion === "lyra";
  const modeLabels = isLyra ? LYRA_MODE_LABELS : SALAR_MODE_LABELS;

  /* Accent colours now match soft-dark system */
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

  /* ----------------------- */
  /* BUTTON STYLES           */
  /* ----------------------- */

  const activeBtn = `
    ${accent.bg}
    text-white
    border ${accent.border}
    shadow-sm
    dark:text-white
    transition-colors
  `;

  const inactiveBtn = `
    bg-white text-gray-700 border border-gray-200 hover:bg-gray-100
    dark:bg-[#1b1b1b] dark:text-gray-200 dark:border-[#333333] 
    dark:hover:bg-[#262626]
    transition-colors
  `;

  return (
    <div
      className="
        flex flex-col gap-8 p-4 text-sm select-none
        bg-gray-50 dark:bg-[#111111]
        text-gray-900 dark:text-gray-200
        h-full overflow-y-auto
        transition-colors
      "
    >
      {/* Companion Switch */}
      <div className="flex gap-2 w-full">
        {(["salar", "lyra"] as const).map((c) => {
          const isActive = c === companion;
          const label = c === "salar" ? "Salar" : "Lyra";

          return (
            <button
              key={c}
              className={`
                flex-1 py-2 rounded-xl text-sm
                ${isActive ? activeBtn : inactiveBtn}
              `}
              onClick={() => setCompanion(c)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Mode Selector */}
      <div>
        <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">
          Modes
        </h2>

        <div className="flex flex-col gap-2">
          {Object.entries(modeLabels).map(([key, label]) => {
            const isActive = isLyra ? key === lyraMode : key === salarMode;

            return (
              <button
                key={key}
                className={`
                  w-full text-left px-3 py-2 rounded-xl text-xs
                  ${isActive ? activeBtn : inactiveBtn}
                `}
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

      <div className="flex-1" />
    </div>
  );
}