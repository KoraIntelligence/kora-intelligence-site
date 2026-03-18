// src/pages/companions.tsx
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CompanionCard from '@/components/CompanionCard';

type CompanionKey = 'salar' | 'lyra';

export default function CompanionsPage() {
  const router = useRouter();

  const [hovered, setHovered] = useState<CompanionKey | null>(null);
  const [dwelled, setDwelled] = useState<CompanionKey | null>(null);
  const [expanded, setExpanded] = useState<CompanionKey | null>(null);

  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (c: CompanionKey) => {
    setHovered(c);
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
    dwellTimer.current = setTimeout(() => setDwelled(c), 300);
  };

  const handleMouseLeave = () => {
    setHovered(null);
    setDwelled(null);
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
  };

  useEffect(() => {
    return () => {
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
    };
  }, []);

  const handleToggle = (c: CompanionKey) => {
    setExpanded((prev) => (prev === c ? null : c));
  };

  const handleBegin = (c: CompanionKey) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kora_companion', c);
    }
    router.push('/mvp');
  };

  return (
    <>
      <Head>
        <title>Choose Your Companion — Kora Intelligence</title>
        <meta
          name="description"
          content="Salar for commercial intelligence. Lyra for marketing intelligence. Choose your companion."
        />
      </Head>

      {/*
        Break out of the Layout's horizontal padding for full-bleed split.
        Layout's <main> has: px-4 sm:px-6 pt-24 pb-24
        We counteract horizontal padding with negative margins.
        -mb-24 cancels the bottom padding so the split reaches the footer edge.
      */}
      <div
        className="-mx-4 sm:-mx-6 -mb-24 overflow-hidden"
        style={{ minHeight: 'calc(100vh - 3.5rem)' }}
      >
        {/* Heading strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 text-center py-7 px-6 bg-[#0a0a0a] border-b border-neutral-800/60"
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-medium">
            Kora Intelligence
          </p>
          <h1 className="mt-1.5 text-lg md:text-xl font-semibold text-gray-100 tracking-tight">
            Choose your companion
          </h1>
        </motion.div>

        {/* Split */}
        <div
          className="flex flex-col md:flex-row"
          style={{ minHeight: 'calc(100vh - 3.5rem - 73px)' }}
        >
          <CompanionCard
            companion="salar"
            isActive={hovered === 'salar'}
            isOtherActive={hovered === 'lyra'}
            hasDwelled={dwelled === 'salar'}
            isExpanded={expanded === 'salar'}
            onMouseEnter={() => handleMouseEnter('salar')}
            onMouseLeave={handleMouseLeave}
            onToggle={() => handleToggle('salar')}
            onBegin={() => handleBegin('salar')}
          />

          {/* Vertical divider (desktop) / horizontal (mobile) */}
          <div className="hidden md:block w-px bg-neutral-800/80 flex-shrink-0" />
          <div className="md:hidden h-px bg-neutral-800/80 flex-shrink-0" />

          <CompanionCard
            companion="lyra"
            isActive={hovered === 'lyra'}
            isOtherActive={hovered === 'salar'}
            hasDwelled={dwelled === 'lyra'}
            isExpanded={expanded === 'lyra'}
            onMouseEnter={() => handleMouseEnter('lyra')}
            onMouseLeave={handleMouseLeave}
            onToggle={() => handleToggle('lyra')}
            onBegin={() => handleBegin('lyra')}
          />
        </div>
      </div>
    </>
  );
}
