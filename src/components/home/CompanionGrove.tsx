// src/components/home/CompanionGrove.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type CompanionEntry = {
  slug: 'salar' | 'lyra';
  name: string;
  letter: string;
  tagline: string;
  modes: string[];
  accentText: string;
  accentBgLight: string;
  accentBorderColor: string;
  glowColor: string;
};

const COMPANIONS: CompanionEntry[] = [
  {
    slug: 'salar',
    name: 'Salar',
    letter: 'S',
    tagline: 'Commercial intelligence for proposals, pricing, and contracts.',
    modes: ['Commercial Chat', 'Proposal Builder', 'Contract Advisor', 'Pricing & Estimation', 'Commercial Strategist'],
    accentText: 'text-amber-500',
    accentBgLight: 'bg-amber-500/10',
    accentBorderColor: 'rgba(245,158,11,0.25)',
    glowColor: 'rgba(245,158,11,0.06)',
  },
  {
    slug: 'lyra',
    name: 'Lyra',
    letter: 'L',
    tagline: 'Marketing intelligence for campaigns, messaging, and outreach.',
    modes: ['Creative Chat', 'Messaging Advisor', 'Campaign Builder', 'Lead Outreach', 'Customer Nurture'],
    accentText: 'text-teal-500',
    accentBgLight: 'bg-teal-500/10',
    accentBorderColor: 'rgba(20,184,166,0.25)',
    glowColor: 'rgba(20,184,166,0.06)',
  },
];

export default function CompanionGrove() {
  return (
    <section
      id="companions"
      aria-label="Meet the Companions"
      className="bg-[#0a0a0a] py-24 px-6 sm:px-12"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mb-12 text-center"
        >
          <p className="text-[10px] tracking-[0.22em] uppercase text-white/30 font-medium mb-3">
            Two companions
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Built for different work. Both built to deliver.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COMPANIONS.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Link
                href={`/companions/${c.slug}`}
                className="group block rounded-2xl p-6 h-full transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${c.accentBorderColor}`,
                  boxShadow: `0 0 40px 0 ${c.glowColor}`,
                }}
              >
                {/* Glyph + name */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`
                      w-9 h-9 rounded-full flex-shrink-0
                      flex items-center justify-center
                      text-[15px] font-bold
                      ${c.accentBgLight} ${c.accentText}
                    `}
                  >
                    {c.letter}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${c.accentText}`}>{c.name}</p>
                    <p className="text-[10px] tracking-widest uppercase text-white/30 mt-0.5">
                      Intelligence
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-[13px] text-white/55 leading-relaxed mb-5">
                  {c.tagline}
                </p>

                {/* Mode pills */}
                <div className="flex flex-wrap gap-1.5">
                  {c.modes.map((mode) => (
                    <span
                      key={mode}
                      className="text-[10px] px-2.5 py-1 rounded-full text-white/35 border border-white/10"
                    >
                      {mode}
                    </span>
                  ))}
                </div>

                {/* Arrow hint */}
                <p
                  className={`
                    mt-5 text-[11px] font-medium
                    ${c.accentText} opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                  `}
                >
                  View {c.name} →
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
