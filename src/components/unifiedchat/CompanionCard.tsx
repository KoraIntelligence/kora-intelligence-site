// src/components/unifiedchat/CompanionCard.tsx
import React from "react";
import { ChevronRight } from "lucide-react";

interface CompanionCardProps {
  companion: "salar" | "lyra";
  mode: string;
  tone: string;
  identity?: any;
  onOpenIdentity: () => void;
}

export default function CompanionCard({
  companion,
  mode,
  tone,
  identity,
  onOpenIdentity,
}: CompanionCardProps) {
  const isSalar = companion === "salar";

  const theme = {
    bg: isSalar ? "bg-amber-50" : "bg-teal-50",
    border: isSalar ? "border-amber-300" : "border-teal-300",
    text: isSalar ? "text-amber-700" : "text-teal-700",
    badge: isSalar
      ? "bg-amber-600 text-white"
      : "bg-teal-600 text-white",
  };

  const avatar = isSalar
    ? "/avatars/salar.png"
    : "/avatars/lyra.png";

  return (
    <div
      className={`w-full p-4 rounded-2xl border ${theme.border} ${theme.bg} shadow-sm flex items-center gap-3`}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-white overflow-hidden shadow">
        <img
          src={avatar}
          alt={companion}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <p className={`font-semibold text-sm ${theme.text}`}>
          {isSalar ? "Salar — Commercial Intelligence" : "Lyra — Brand Intelligence"}
        </p>

        <p className="text-xs text-gray-600 capitalize mt-0.5">
          Mode: {mode.replace(/_/g, " ")}
        </p>

        <p className="text-xs text-gray-500">Tone: {tone}</p>
      </div>

      {/* Identity Button */}
      <button
        onClick={onOpenIdentity}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${theme.badge} hover:opacity-90 transition`}
      >
        Identity
        <ChevronRight size={14} />
      </button>
    </div>
  );
}