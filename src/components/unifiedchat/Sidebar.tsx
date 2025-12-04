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

  const accent = isLyra
    ? { base: "teal", bg: "bg-teal-600", light: "bg-teal-50", border: "border-teal-600", text: "text-teal-700" }
    : { base: "amber", bg: "bg-amber-600", light: "bg-amber-50", border: "border-amber-600", text: "text-amber-700" };

  const activeBtn = `${accent.bg} text-white border ${accent.border} shadow-sm`;
  const inactiveBtn = "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100";

  return (
    <div className="flex flex-col gap-8 p-4 text-sm select-none">

      {/* Companion Switch */}
      <div className="flex gap-2 w-full">
        {(["salar", "lyra"] as const).map((c) => {
          const isActive = c === companion;
          const label = c === "salar" ? "Salar" : "Lyra";

          return (
            <button
              key={c}
              className={`flex-1 py-2 rounded-xl text-sm transition-all ${isActive ? activeBtn : inactiveBtn}`}
              onClick={() => setCompanion(c)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Mode Selector */}
      <div>
        <h2 className="text-xs font-semibold text-gray-600 mb-3">Modes</h2>

        <div className="flex flex-col gap-2">
          {Object.entries(modeLabels).map(([key, label]) => {
            const isActive = isLyra ? key === lyraMode : key === salarMode;

            return (
              <button
                key={key}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
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
        <div className="pt-4 border-t border-gray-200">
          {toneSelector}
        </div>
      )}

      {/* Filler for bottom spacing */}
      <div className="flex-1" />
    </div>
  );
}