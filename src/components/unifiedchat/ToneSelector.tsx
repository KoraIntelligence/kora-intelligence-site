// src/components/unifiedchat/ToneSelector.tsx
import React from "react";
import {
  COMPANION_TONES,
  CompanionKey,
  ToneOption,
} from "@/companions/config/tones";
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

  /* ---------------------------------------
     ACCENT THEME MAP
  --------------------------------------- */
  const accent = {
    text: isSalar
      ? "text-amber-700 dark:text-amber-300"
      : "text-teal-700 dark:text-teal-300",
    ring: isSalar
      ? "focus:ring-amber-400 dark:focus:ring-amber-500"
      : "focus:ring-teal-400 dark:focus:ring-teal-500",
    bgHover: isSalar
      ? "hover:bg-amber-50 dark:hover:bg-amber-900/30"
      : "hover:bg-teal-50 dark:hover:bg-teal-900/30",
  };

  return (
    <div className="relative inline-block w-48">
      {/* Label */}
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
        Tone
      </div>

      <div className="relative">
        {/* SELECT INPUT */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full appearance-none px-3 py-2 rounded-lg
            border text-sm cursor-pointer
            border-gray-300 dark:border-neutral-700
            bg-white dark:bg-neutral-900
            text-gray-800 dark:text-gray-200
            transition-all
            ${accent.ring}
          `}
        >
          {toneOptions.map((t: ToneOption) => (
            <option
              key={t.value}
              value={t.value}
              className="bg-white dark:bg-neutral-900"
            >
              {t.label}
              {t.scope === "companion" ? " ★" : ""}
            </option>
          ))}
        </select>

        {/* Dropdown icon */}
        <ChevronDown
          size={18}
          className="
            absolute right-3 top-2.5
            text-gray-500 dark:text-gray-400
            pointer-events-none
          "
        />
      </div>

      {/* Legend */}
      <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
        <span className="font-medium">★ Companion Tone</span> — specialised for{" "}
        <span className={`${accent.text} font-medium`}>
          {companion === "salar" ? "Salar" : "Lyra"}
        </span>
      </div>
    </div>
  );
}