// src/components/home/RitualEchoes.tsx
// Static typographic quotes — no contentlayer dependency
import React from 'react';
import { motion } from 'framer-motion';

const QUOTES = [
  {
    text: 'Finally, a tool that produces something I can actually send to a client.',
    attribution: 'Early access user — Proposal Builder',
    accentColor: 'text-amber-500/60',
  },
  {
    text: 'Lyra nailed our brand voice on the second message.',
    attribution: 'Early access user — Messaging Advisor',
    accentColor: 'text-teal-500/60',
  },
  {
    text: 'The pricing model came out cleaner than anything I would have built in Excel.',
    attribution: 'Early access user — Pricing & Estimation',
    accentColor: 'text-amber-500/60',
  },
];

export default function RitualEchoes() {
  return (
    <section
      aria-label="What users say"
      className="bg-[#080808] py-24 px-6 sm:px-12 border-t border-neutral-800/50"
    >
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-[10px] tracking-[0.22em] uppercase text-white/25 font-medium text-center mb-16"
        >
          Early access
        </motion.p>

        {/* Quotes */}
        <div className="space-y-16">
          {QUOTES.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <p
                className="
                  text-xl md:text-2xl
                  font-light italic
                  text-white/65
                  leading-relaxed
                  tracking-tight
                "
              >
                &ldquo;{q.text}&rdquo;
              </p>
              <p className={`mt-4 text-[10px] tracking-[0.18em] uppercase font-medium ${q.accentColor}`}>
                {q.attribution}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
