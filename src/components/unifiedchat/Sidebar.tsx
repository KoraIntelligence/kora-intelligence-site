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

/* -------------------------------------- */
/* LABEL MAPS                              */
/* -------------------------------------- */

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

/* -------------------------------------- */
/* COMPONENT                               */
/* -------------------------------------- */

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
  const isSalar = companion === "salar";
  const activeModeList = isSalar ? SALAR_MODE_LABELS : LYRA_MODE_LABELS;

  const palette =
    companion === "lyra"
      ? "text-teal-700 bg-teal-50 border-teal-200"
      : "text-amber-700 bg-amber-50 border-amber-200";

  return (
    <div className="space-y-6 text-sm p-3">

      {/* ---------------------------------- */}
      {/* Companion Switch */}
      {/* ---------------------------------- */}
      <div className="flex gap-2">
        {(["salar", "lyra"] as const).map((c) => {
          const label = c === "salar" ? "Salar" : "Lyra";
          const isActive = c === companion;

          return (
            <button
              key={c}
              className={`flex-1 px-4 py-2 rounded-xl border text-sm transition
              ${isActive
                ? "bg-amber-600 text-white border-amber-600 shadow"
                : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
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
        <h2 className="text-xs font-semibold text-gray-600 mb-2">
          Modes
        </h2>

        <div className="space-y-1">
          {Object.entries(activeModeList).map(([key, label]) => {
            const isActive = isSalar
              ? key === salarMode
              : key === lyraMode;

            return (
              <button
                key={key}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition border
                ${isActive
                  ? `bg-amber-600 text-white border-amber-600`
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() =>
                  isSalar
                    ? setSalarMode(key as SalarMode)
                    : setLyraMode(key as LyraMode)
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

    </div>
  );
}