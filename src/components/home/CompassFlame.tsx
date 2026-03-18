// src/components/home/CompassFlame.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, GitBranch, Layers } from 'lucide-react';

const PROPS = [
  {
    icon: FileText,
    label: 'Structured outputs',
    description: 'Every response becomes a document you can export, refine, and send to a client.',
    iconColor: 'text-amber-500',
  },
  {
    icon: GitBranch,
    label: 'Workflow-guided',
    description: 'Move through clarify, draft, refine, and export — step by step, every time.',
    iconColor: 'text-teal-500',
  },
  {
    icon: Layers,
    label: 'Specialist intelligence',
    description: 'Two companions trained specifically for commercial and marketing work.',
    iconColor: 'text-amber-500',
  },
];

export default function CompassFlame() {
  return (
    <section
      id="how-it-works"
      className="bg-[#0d0d0d] py-24 px-6 sm:px-12 border-t border-neutral-800/50"
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
            Why Kora
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Not a chatbot. A working tool.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROPS.map((prop, i) => (
            <motion.div
              key={prop.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.09 }}
              className="
                rounded-xl p-5
                bg-white/[0.025]
                border border-white/[0.07]
              "
            >
              <prop.icon
                size={18}
                className={`${prop.iconColor} mb-4`}
                strokeWidth={1.75}
              />
              <p className="text-[13px] font-semibold text-white/85 mb-1.5 leading-snug">
                {prop.label}
              </p>
              <p className="text-[12px] text-white/40 leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
