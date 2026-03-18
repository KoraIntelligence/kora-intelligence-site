// src/components/home/WhisperOfArrival.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WhisperOfArrival() {
  return (
    <section
      aria-label="Kora Intelligence — Hero"
      className="relative flex flex-col min-h-screen items-center justify-center text-center px-6 -mt-14 bg-[#080808] overflow-hidden"
    >
      {/* Ambient gradient layers */}
      <div
        className="absolute bottom-0 left-0 w-[60vw] h-[60vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 0% 100%, rgba(245,158,11,0.10) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[60vw] h-[60vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 100% 100%, rgba(20,184,166,0.10) 0%, transparent 70%)',
        }}
      />
      {/* Center blend */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40vw] h-[30vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(120,100,50,0.05) 0%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[10px] tracking-[0.25em] uppercase text-white/35 font-medium mb-7"
        >
          Kora Intelligence
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-[3.5rem] font-semibold tracking-tight text-white leading-[1.12]"
        >
          The AI companions for
          <br />
          <span
            className="relative inline-block"
            style={{
              background: 'linear-gradient(90deg, #f59e0b 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            commercial work.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-[15px] text-white/45 leading-relaxed max-w-md mx-auto"
        >
          Salar handles proposals, pricing, and deals.
          Lyra handles campaigns, messaging, and outreach.
          Both produce outputs you can actually use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/companions"
            className="
              inline-flex items-center gap-2
              px-7 py-3 rounded-full
              bg-amber-500 hover:bg-amber-400
              text-white text-[13px] font-semibold
              transition-colors duration-150 shadow-lg
            "
          >
            Choose Your Companion
          </Link>
          <Link
            href="/mvp"
            className="
              inline-flex items-center
              px-5 py-3 rounded-full
              text-white/45 hover:text-white/70
              text-[13px] font-medium
              transition-colors duration-150
            "
          >
            Try the MVP →
          </Link>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] tracking-[0.2em] uppercase text-white/20">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}
