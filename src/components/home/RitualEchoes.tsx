import React from 'react';
import Link from 'next/link';
import { allDispatches } from 'contentlayer/generated';

export default function RitualEchoes() {
  const latest = allDispatches
    .sort((a: { date: string }, b: { date: string }) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

  return (
    <section
      aria-label="Current Dispatch"
      className="bg-white dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-6 text-gray-700 dark:text-gray-100 font-serif text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-amber-600 font-semibold">
          Latest Dispatch
        </h2>

        {latest ? (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {latest.title}
            </h3>
            <p className="italic text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-prose mx-auto">
              {latest.description}
            </p>
            <Link
              href={`/dispatch/${latest.slug}`}
              className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-md shadow transition"
            >
              Read Full Dispatch →
            </Link>
          </>
        ) : (
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 italic">
            The Grove is quiet for now — the next dispatch nears.
          </p>
        )}
      </div>
    </section>
  );
}
