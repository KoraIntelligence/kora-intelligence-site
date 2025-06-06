import React from 'react';

export default function RitualEchoes() {
  return (
    <section
      aria-label="Current Dispatch"
      className="bg-white dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-4 text-gray-700 dark:text-gray-100 font-serif">
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-amber-600 font-semibold mb-6 text-center">Latest Dispatch</h2>
        <p className="text-base sm:text-lg md:text-xl text-center max-w-prose mx-auto font-serif text-gray-800 dark:text-gray-100">
          This space will echo the most recent ritual dispatch. Markdown or Notion
          sourced content will live here soon.
        </p>
      </div>
    </section>
  );
}
