import CompanionEngineCTA from './CompanionEngineCTA';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { companions, Companion } from '../../data/companions';

export default function CompanionGrove() {
  return (
    <section
      id="companions"
      aria-label="Meet the Companions"
      className="scroll-mt-24 bg-neutral-50 dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Meet Your Companions
        </h2>
        <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Start with the three active Companions, each designed to support a core function:
          brand messaging (FMC), pricing and funding (CCC), or digital product flows (Builder).
        </p>
      </div>

      {/* Companion Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {Object.values(companions)
          .filter((companion: Companion) =>
            ['fmc', 'ccc', 'builder'].includes(companion.slug)
          )
          .map((companion: Companion) => (
            <Link
              key={companion.slug}
              href={`/companions/${companion.slug}`}
              className="group bg-white dark:bg-neutral-800 rounded-2xl text-center shadow hover:shadow-xl transition-all duration-300 p-6 border border-transparent hover:border-amber-300 dark:hover:border-amber-500 flex flex-col items-center justify-between"
            >
              <Image
                src={`/assets/glyphs/glyph-${companion.slug}.png`}
                alt={`${companion.title} – AI Companion glyph`}
                width={96}
                height={96}
                className="mb-4 rounded-full transition-transform duration-300 group-hover:scale-105"
              />

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {companion.title}
              </h3>

              {/* Use tagline instead of essence */}
              {companion.tagline && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {companion.tagline}
                </p>
              )}
            </Link>
          ))}
      </div>

      {/* CTA */}
      <div className="mt-20">
        <CompanionEngineCTA />
      </div>
    </section>
  );
}