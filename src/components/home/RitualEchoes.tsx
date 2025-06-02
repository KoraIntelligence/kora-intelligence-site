import React from 'react';

export default function RitualEchoes() {
  return (
    <section
      aria-label="Current Dispatch"
      className="bg-white dark:bg-gray-900 px-4 sm:px-6 md:px-8 pt-16 pb-16 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-4 text-gray-700 dark:text-gray-100 font-serif">
        <h2 className="text-2xl sm:text-3xl text-amber-600 font-semibold mb-6 text-center">Latest Dispatch</h2>
        <p className="text-base sm:text-lg text-center max-w-prose mx-auto font-serif text-gray-800 dark:text-gray-100">
          This space will echo the most recent ritual dispatch. Markdown or Notion
          sourced content will live here soon.
        </p>
      </div>
    </section>
  );
}
