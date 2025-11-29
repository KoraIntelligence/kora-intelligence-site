// src/components/unifiedchat/ToneSelector.tsx
import React from "react";
import { COMPANION_TONES, CompanionKey, ToneOption } from "@/companions/config/tones";
import { ChevronDown } from "lucide-react";

interface ToneSelectorProps {
  companion: CompanionKey;
  value: string;
  onChange: (tone: string) => void;
}

export default function ToneSelector({
  companion,
  value,
  onChange,
}: ToneSelectorProps) {
  const config = COMPANION_TONES[companion];
  const toneOptions = config.options;

  const isSalar = companion === "salar";

  const theme = {
    ring: isSalar ? "focus:ring-amber-400" : "focus:ring-teal-400",
    text: isSalar ? "text-amber-700" : "text-teal-700",
    hover: isSalar ? "hover:bg-amber-50" : "hover:bg-teal-50",
    bg: isSalar ? "bg-amber-50" : "bg-teal-50",
  };

  return (
    <div className="relative inline-block w-48">
      {/* Current selection */}
      <div className="text-xs font-semibold text-gray-600 mb-1">
        Tone
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full appearance-none px-3 py-2 rounded-lg border text-sm
            border-gray-300 bg-white cursor-pointer
            ${theme.ring} ${theme.text}
          `}
        >
          {toneOptions.map((t: ToneOption) => (
            <option key={t.value} value={t.value}>
              {t.label}
              {t.scope === "companion" ? " ★" : ""}
            </option>
          ))}
        </select>

        {/* Dropdown icon */}
        <ChevronDown
          size={18}
          className="absolute right-3 top-2.5 text-gray-500 pointer-events-none"
        />
      </div>

      {/* Legend */}
      <div className="mt-2 text-[10px] text-gray-500 leading-relaxed">
        <span className="font-medium">★ Companion Tone</span> — specialised for{" "}
        <span className={theme.text}>
          {companion === "salar" ? "Salar" : "Lyra"}
        </span>
      </div>
    </div>
  );
}