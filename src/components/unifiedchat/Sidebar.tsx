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
  onFileUpload?: (file: File) => void;
}

/* -------------------------------------------------- */
/* LABEL MAPS                                          */
/* -------------------------------------------------- */

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

/* -------------------------------------------------- */
/* COMPONENT                                           */
/* -------------------------------------------------- */

export default function Sidebar({
  companion,
  setCompanion,
  salarMode,
  setSalarMode,
  lyraMode,
  setLyraMode,
  toneSelector,
  onFileUpload,
}: SidebarProps) {
  const isLyra = companion === "lyra";
  const modeLabels = isLyra ? LYRA_MODE_LABELS : SALAR_MODE_LABELS;

  const accent = isLyra
    ? { bg: "bg-teal-600", border: "border-teal-600", text: "text-teal-700" }
    : { bg: "bg-amber-600", border: "border-amber-600", text: "text-amber-700" };

  const activePill = `${accent.bg} text-white border ${accent.border} shadow`;
  const inactivePill =
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100";

  return (
    <div className="flex flex-col gap-6 text-sm w-full">

      {/* ---------------------------------- */}
      {/* Companion Switch */}
      {/* ---------------------------------- */}
      <div className="flex gap-2 w-full">
        {(["salar", "lyra"] as const).map((c) => {
          const isActive = c === companion;
          const label = c === "salar" ? "Salar" : "Lyra";

          return (
            <button
              key={c}
              className={`flex-1 px-4 py-2 rounded-xl text-sm transition ${
                isActive ? activePill : inactivePill
              }`}
              onClick={() => setCompanion(c)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------- */}
      {/* Mode Selector */}
      {/* ---------------------------------- */}
      <div>
        <h2 className="text-xs font-semibold text-gray-600 mb-2">Modes</h2>

        <div className="flex flex-col gap-1">
          {Object.entries(modeLabels).map(([key, label]) => {
            const isActive = isLyra
              ? key === lyraMode
              : key === salarMode;

            return (
              <button
                key={key}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition border ${
                  isActive ? activePill : inactivePill
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

      {/* ---------------------------------- */}
      {/* Tone Selector */}
      {/* ---------------------------------- */}
      {toneSelector && (
        <div className="pt-4 border-t border-gray-200">
          {toneSelector}
        </div>
      )}

      {/* ---------------------------------- */}
      {/* File Upload (Global) */}
      {/* ---------------------------------- */}
      {onFileUpload && (
        <div className="pt-4 border-t border-gray-200">
          <label className="text-xs font-semibold text-gray-700">
            Upload Supporting File
            <span className="block text-gray-500 text-[11px]">
              PDF, DOCX, XLSX, CSV
            </span>
          </label>

          <input
            type="file"
            accept=".pdf,.docx,.xlsx,.csv"
            className="mt-2 text-xs"
            onChange={(e) =>
              e.target.files && onFileUpload(e.target.files[0])
            }
          />
        </div>
      )}

      {/* ---------------------------------- */}
      {/* Spare Area for Future (blank) */}
      {/* ---------------------------------- */}
      <div className="flex-1" />
    </div>
  );
}