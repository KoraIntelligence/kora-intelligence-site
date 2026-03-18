// src/components/home/CallToPresence.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CallToPresence() {
  return (
    <section
      aria-label="Choose Your Companion"
      className="relative overflow-hidden py-24 px-6 sm:px-12"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(10,10,10,1) 45%, rgba(20,184,166,0.15) 100%)',
        backgroundColor: '#090909',
      }}
    >
      {/* Subtle amber glow left */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Subtle teal glow right */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-[10px] tracking-[0.22em] uppercase text-white/30 font-medium mb-4"
        >
          Ready to start
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-3"
        >
          Choose your companion.
          <br />
          <span className="text-white/45 font-normal">Start producing real outputs.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-8"
        >
          <Link
            href="/companions"
            className="
              inline-flex items-center gap-2
              px-8 py-3.5 rounded-full
              bg-white text-[#0a0a0a]
              text-[13px] font-semibold tracking-wide
              hover:bg-white/90
              transition-colors duration-150
              shadow-lg
            "
          >
            Choose Your Companion
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 text-[11px] text-white/25"
        >
          Free to try · Early access · No credit card needed
        </motion.p>
      </div>
    </section>
  );
}
