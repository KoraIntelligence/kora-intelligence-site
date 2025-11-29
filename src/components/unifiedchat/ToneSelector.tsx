// src/components/unified-chat/ToneSelector.tsx
import React from "react";
import {
  COMPANION_TONES,
  CompanionKey,
  ToneOption,
} from "@/companions/config/tones";

type ToneSelectorProps = {
  companion: CompanionKey;
  value: string;
  onChange: (tone: string) => void;
};

export function ToneSelector({ companion, value, onChange }: ToneSelectorProps) {
  const config = COMPANION_TONES[companion];
  const options = config.options;

  const companionOptions = options.filter((o) => o.scope === "companion");
  const globalOptions = options.filter((o) => o.scope === "global");

  const renderGroup = (label: string, items: ToneOption[]) => {
    if (!items.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wide text-gray-400 mr-1">
          {label}
        </span>
        {items.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "px-3 py-1 rounded-full text-xs transition-all border",
                "flex items-center gap-1",
                isActive
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-amber-50",
              ].join(" ")}
            >
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          Tone &amp; Energy
        </span>
        <span className="text-[10px] text-gray-400">
          {companion === "salar"
            ? "Commercial rhythm"
            : "Brand & creative voice"}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/80 px-3 py-2">
        {renderGroup("Companion presets", companionOptions)}
        {renderGroup("Global", globalOptions)}
      </div>
    </div>
  );
}