import React from "react";
import { X } from "lucide-react";

type IdentityOverlayProps = {
  isOpen: boolean;
  mode: string;                 // ← ADD THIS
  onClose: () => void;

  identity?: {
    persona?: string;
    tone?: string;
    mode?: string;
    description?: string;
    systemPrompt?: string;
    [key: string]: any;
  };

  companion: "salar" | "lyra";
};

export default function IdentityOverlay({
  isOpen,
  onClose,
  identity,
  companion,
}: IdentityOverlayProps) {
  if (!isOpen) return null;

  const color =
    companion === "salar"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-teal-700 bg-teal-50 border-teal-200";

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[380px] max-w-full shadow-xl border-l bg-white transform transition-all duration-300 ease-out 
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${color}`}
        >
          <h2 className="text-lg font-semibold">
            {companion === "salar" ? "Salar Identity" : "Lyra Identity"}
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 h-[calc(100%-70px)] overflow-y-auto space-y-6">
          {/* Persona */}
          {identity?.persona && (
            <section>
              <h3 className="text-sm font-semibold mb-1 text-gray-700">
                Persona
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {identity.persona}
              </p>
            </section>
          )}

          {/* Tone */}
          {identity?.tone && (
            <section>
              <h3 className="text-sm font-semibold mb-1 text-gray-700">Tone</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {identity.tone}
              </p>
            </section>
          )}

          {/* Mode */}
          {identity?.mode && (
            <section>
              <h3 className="text-sm font-semibold mb-1 text-gray-700">
                Active Mode
              </h3>
              <p className="text-sm text-gray-600 capitalize">{identity.mode}</p>
            </section>
          )}

          {/* Description */}
          {identity?.description && (
            <section>
              <h3 className="text-sm font-semibold mb-1 text-gray-700">
                Description
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {identity.description}
              </p>
            </section>
          )}

          {/* System Prompt (Collapsible?) — for now always shown */}
          {identity?.systemPrompt && (
            <section>
              <h3 className="text-sm font-semibold mb-1 text-gray-700">
                System Prompt
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap text-xs text-gray-700">
                {identity.systemPrompt}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}