import CompanionEngineCTA from './CompanionEngineCTA';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { companions, Companion } from '@/data/companions';

export default function CompanionGrove() {
  return (
    <section
      aria-label="Meet the Companions"
      className="bg-neutral-50 dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Meet Your Companions
        </h2>
        <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
          Start with the three active guides: FMC for brand clarity, CCC for commercial structure, and The Builder for turning vision into flows.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.values(companions)
          .filter((companion: Companion) =>
            ['fmc', 'ccc', 'builder'].includes(companion.slug)
          )
          .map((companion: Companion) => (
            <Link
              key={companion.slug}
              href={`/companions/${companion.slug}`}
              className="p-4 sm:p-6 bg-white dark:bg-neutral-800 rounded-lg text-center shadow hover:shadow-md transition flex flex-col items-center"
            >
              <Image
                src={`/assets/glyphs/glyph-${companion.slug}.png`}
                alt={`${companion.title} – AI Companion glyph`}
                width={128}
                height={128}
                className="mx-auto mb-3 rounded-full"
              />
              <h3 className="mt-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                {companion.title}
              </h3>
              {companion.essence && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {companion.essence}
                </p>
              )}
            </Link>
          ))}
      </div>

      <CompanionEngineCTA />
    </section>
  );
}