import CompanionEngineCTA from './CompanionEngineCTA';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { companions, Companion } from '@/data/companions';

export default function CompanionGrove() {
  return (
    <section
      aria-label="Companion Grid"
      className="bg-neutral-50 dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Object.values(companions).map((companion: Companion) => (
          <Link
            key={companion.slug}
            href={`/companions/${companion.slug}`}
            className="p-4 sm:p-6 bg-white dark:bg-neutral-800 rounded-lg text-center shadow hover:shadow-md transition flex flex-col items-center"
          >
            <Image
              src={`/assets/glyphs/glyph-${companion.slug}.png`}
              alt={`${companion.title} glyph`}
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
