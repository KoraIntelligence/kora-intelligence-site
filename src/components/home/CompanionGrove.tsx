import React from 'react';
import Link from 'next/link';

const companions = [
  { label: 'Whisperer', slug: 'whisperer' },
  { label: 'Cartographer', slug: 'cartographer' },
  { label: 'Dreamer', slug: 'dreamer' },
  { label: 'Builder', slug: 'builder' },
  { label: 'CCC', slug: 'ccc' },
  { label: 'FMC', slug: 'fmc' },
  { label: 'Alchemist', slug: 'alchemist' },
  { label: 'Pathbreaker', slug: 'pathbreaker' },
];

export default function CompanionGrove() {
  return (
    <section
      aria-label="Companion Grid"
      className="bg-neutral-50 dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {companions.map((companion) => (
          <Link
            key={companion.slug}
            href={`/companions/${companion.slug}`}
            legacyBehavior
          >
            <a className="block p-4 py-3 px-4 text-base sm:text-lg bg-emerald-950 text-emerald-100 hover:bg-emerald-800 transition-all rounded-lg text-center shadow-sm font-serif hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
              {companion.label}
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
