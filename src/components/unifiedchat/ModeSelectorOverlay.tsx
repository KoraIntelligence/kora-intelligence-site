// src/components/unifiedchat/ModeSelectorOverlay.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ModeSelectorOverlayProps = {
  isOpen: boolean;
  companion: "salar" | "lyra";
  activeMode: string;
  onSelect: (mode: string) => void;
  onClose: () => void;
};

type ModeEntry = {
  label: string;
  description: string;
};

const SALAR_MODES: Record<string, ModeEntry> = {
  commercial_chat: {
    label: "Commercial Chat",
    description: "Strategic advice for deals, pricing, and growth",
  },
  proposal_builder: {
    label: "Proposal Builder",
    description: "End-to-end proposals from brief to final document",
  },
  contract_advisor: {
    label: "Contract Advisor",
    description: "Review, flag risks, and simplify contract language",
  },
  pricing_estimation: {
    label: "Pricing & Estimation",
    description: "Build structured pricing tables and cost models",
  },
  commercial_strategist: {
    label: "Commercial Strategist",
    description: "Market insight and commercial decision support",
  },
};

const LYRA_MODES: Record<string, ModeEntry> = {
  creative_chat: {
    label: "Creative Chat",
    description: "Rapid creative direction and concept development",
  },
  messaging_advisor: {
    label: "Messaging Advisor",
    description: "Sharpen brand voice, copy, and key messages",
  },
  campaign_builder: {
    label: "Campaign Builder",
    description: "Full campaign plans from objective to content calendar",
  },
  lead_outreach: {
    label: "Lead Outreach",
    description: "Personalised outreach sequences and email copy",
  },
  customer_nurture: {
    label: "Customer Nurture",
    description: "Nurture sequences and retention-focused content",
  },
};

export default function ModeSelectorOverlay({
  isOpen,
  companion,
  activeMode,
  onSelect,
  onClose,
}: ModeSelectorOverlayProps) {
  const isLyra = companion === "lyra";
  const companionName = isLyra ? "Lyra" : "Salar";
  const avatarLetter = isLyra ? "L" : "S";
  const modes = isLyra ? LYRA_MODES : SALAR_MODES;

  /* ── Accent tokens ─────────────────────────────────────── */
  const accentText = isLyra
    ? "text-teal-500 dark:text-teal-400"
    : "text-yellow-500 dark:text-yellow-400";

  const accentBgLight = isLyra ? "bg-teal-500/10" : "bg-yellow-500/10";

  const accentCardSelected = isLyra
    ? "bg-teal-500/[0.06] border-teal-500/60 dark:border-teal-400/50"
    : "bg-yellow-500/[0.06] border-yellow-500/60 dark:border-yellow-400/50";

  const ambientGradient = isLyra
    ? "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(20,184,166,0.06) 0%, transparent 70%)"
    : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)";

  /* ── ESC to dismiss ────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSelect = (modeKey: string) => {
    onSelect(modeKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ──────────────────────────────────────── */
        <motion.div
          key="mode-overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: `rgba(0,0,0,0.72)` }}
          onClick={onClose}
        >
          {/* Ambient companion glow behind card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: ambientGradient }}
          />

          {/* ── Card ───────────────────────────────────────── */}
          <motion.div
            key="mode-overlay-card"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative z-10
              max-w-lg w-full mx-4
              bg-white dark:bg-[#141414]
              border border-gray-100 dark:border-neutral-800
              rounded-2xl shadow-2xl
              p-6
            "
          >
            {/* ── Header ───────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-8 h-8 rounded-full flex-shrink-0
                  flex items-center justify-center
                  text-[13px] font-semibold
                  ${accentBgLight} ${accentText}
                `}
              >
                {avatarLetter}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {companionName}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-400 tracking-wide">
                  Intelligence
                </p>
              </div>
            </div>

            <p className="mt-4 mb-5 text-[13px] text-gray-500 dark:text-gray-500">
              What would you like to work on?
            </p>

            {/* ── Mode grid ────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(modes).map(([key, { label, description }], i) => {
                const isSelected = activeMode === key;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.04 }}
                    onClick={() => handleSelect(key)}
                    className={`
                      text-left rounded-xl border px-3 py-3
                      transition-all duration-150
                      ${
                        isSelected
                          ? `border-[1.5px] ${accentCardSelected}`
                          : `
                            bg-gray-50 dark:bg-[#1c1c1c]
                            border-gray-100 dark:border-neutral-800
                            hover:bg-white dark:hover:bg-[#222]
                            hover:border-gray-200 dark:hover:border-neutral-700
                            hover:shadow-sm
                          `
                      }
                    `}
                  >
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug">
                      {label}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                      {description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* ── Footer ───────────────────────────────────── */}
            <p className="mt-4 text-[10px] text-gray-400 dark:text-gray-400 text-center">
              Press ESC to dismiss
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
