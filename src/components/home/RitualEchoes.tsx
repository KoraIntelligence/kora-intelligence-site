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
      aria-label="Latest Dispatch"
      className="bg-white dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors duration-500"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-12">
          Latest Dispatch
        </h2>

        {latest ? (
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl shadow-md p-8 md:p-10 text-left space-y-6 transition hover:shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              {latest.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {latest.description}
            </p>
            <Link
              href={`/dispatch/${latest.slug}`}
              className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
            >
              Read Full Dispatch →
            </Link>
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 italic">
            The Grove is quiet for now — the next dispatch nears.
          </p>
        )}
      </div>
    </section>
  );
}
