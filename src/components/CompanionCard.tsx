// src/components/CompanionCard.tsx
import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type CompanionCardProps = {
  companion: 'salar' | 'lyra';
  isActive: boolean;
  isOtherActive: boolean;
  hasDwelled: boolean;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggle: () => void;
  onBegin: () => void;
};

const MODES: Record<'salar' | 'lyra', string[]> = {
  salar: [
    'Commercial Chat',
    'Proposal Builder',
    'Contract Advisor',
    'Pricing & Estimation',
    'Commercial Strategist',
  ],
  lyra: [
    'Creative Chat',
    'Messaging Advisor',
    'Campaign Builder',
    'Lead Outreach',
    'Customer Nurture',
  ],
};

const DATA = {
  salar: {
    name: 'Salar',
    letter: 'S',
    tagline: 'Commercial clarity for proposals, pricing, and contracts.',
    ambientGradient:
      'radial-gradient(ellipse 65% 65% at 50% 45%, rgba(245,158,11,0.11) 0%, transparent 70%)',
    accentText: 'text-yellow-500',
    accentBorderColor: 'rgba(245,158,11,0.35)',
    accentBgColor: 'rgba(245,158,11,0.09)',
    glowColor: 'rgba(245,158,11,0.2)',
    ctaClass: 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600',
    pillBorder: 'border-yellow-500/30',
    pillText: 'text-yellow-600/70 dark:text-yellow-400/60',
  },
  lyra: {
    name: 'Lyra',
    letter: 'L',
    tagline: 'Clear messaging, campaigns, and outreach — in your voice.',
    ambientGradient:
      'radial-gradient(ellipse 65% 65% at 50% 45%, rgba(20,184,166,0.11) 0%, transparent 70%)',
    accentText: 'text-teal-500',
    accentBorderColor: 'rgba(20,184,166,0.35)',
    accentBgColor: 'rgba(20,184,166,0.09)',
    glowColor: 'rgba(20,184,166,0.2)',
    ctaClass: 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600',
    pillBorder: 'border-teal-500/30',
    pillText: 'text-teal-600/70 dark:text-teal-400/60',
  },
};

export default function CompanionCard({
  companion,
  isActive,
  isOtherActive,
  hasDwelled,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onToggle,
  onBegin,
}: CompanionCardProps) {
  const d = DATA[companion];
  const modes = MODES[companion];

  // Show mode pills + CTA when dwelled (desktop) or expanded (mobile)
  const showContent = hasDwelled || isExpanded;

  return (
    <motion.div
      className="relative overflow-hidden bg-[#111111] cursor-pointer"
      initial={false}
      animate={{
        flex: isActive ? 1.2 : isOtherActive ? 0.8 : 1,
        opacity: isOtherActive ? 0.65 : 1,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onToggle}
    >
      {/* Ambient companion glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: d.ambientGradient,
          opacity: isActive ? 1.6 : 1,
        }}
      />

      {/* Subtle edge accent — a 1px inset border suggestion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: isActive
            ? `inset 0 0 0 1px ${d.accentBorderColor}`
            : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[280px] md:min-h-0 px-8 py-14 gap-7 text-center">

        {/* Glyph */}
        <motion.div
          animate={
            isActive
              ? { scale: 1.08, rotate: 3 }
              : { scale: 1, rotate: 0 }
          }
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            background: d.accentBgColor,
            borderColor: d.accentBorderColor,
            boxShadow: isActive ? `0 0 32px 0 ${d.glowColor}` : 'none',
          }}
          className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full border overflow-hidden transition-shadow duration-300"
        >
          <Image
            src={`/assets/glyphs/glyph-${companion}.png`}
            alt={companion}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Name + tagline */}
        <div className="space-y-2">
          <h2 className={`text-xl md:text-2xl font-semibold tracking-tight ${d.accentText}`}>
            {d.name}
          </h2>
          <p className="text-[12px] md:text-[13px] text-gray-500 max-w-[190px] leading-relaxed">
            {d.tagline}
          </p>
        </div>

        {/* Mode pills — fade in on dwell / expand */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              key="modes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-1.5 w-full max-w-[188px]"
            >
              {modes.map((mode, i) => (
                <motion.span
                  key={mode}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.045 }}
                  className={`
                    text-[10px] tracking-wide text-center py-1 px-3 rounded-full
                    border ${d.pillBorder} ${d.pillText}
                  `}
                >
                  {mode}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA — fades in slightly after mode pills */}
        <AnimatePresence>
          {showContent && (
            <motion.button
              key="cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.22, delay: 0.12 }}
              onClick={(e) => {
                e.stopPropagation();
                onBegin();
              }}
              className={`
                ${d.ctaClass}
                text-white text-[13px] font-semibold
                px-7 py-2.5 rounded-full
                transition-colors duration-150
                shadow-lg
              `}
            >
              Begin with {d.name}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Tap hint for mobile when not expanded */}
        <AnimatePresence>
          {!showContent && (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="text-[9px] tracking-widest uppercase text-gray-600 md:hidden"
            >
              Tap to explore
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
