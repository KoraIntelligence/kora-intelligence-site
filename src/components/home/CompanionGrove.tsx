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
      className="bg-neutral-50 dark:bg-gray-900 pt-24 pb-24 px-6 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {companions.map((companion) => (
          <div
            key={companion.slug}
            className="p-6 bg-white dark:bg-emerald-950 rounded-2xl text-center shadow-sm font-serif text-gray-900 dark:text-emerald-200 transition duration-300 ease-in-out hover:opacity-80 transform hover:scale-105"
          >
            <Link href={`/companions/${companion.slug}`} legacyBehavior>
              <a className="text-amber-600 text-lg font-serif hover:text-indigo-600 hover:underline transition-opacity duration-300 ease-in-out">
                {companion.label}
              </a>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
