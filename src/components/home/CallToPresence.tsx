import React from 'react';
import Link from 'next/link';

export default function CallToPresence() {
  return (
    <section
      aria-label="Invitation to Walk"
      className="bg-white dark:bg-gray-900 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <p className="text-base sm:text-lg md:text-xl text-center max-w-prose mx-auto font-serif text-gray-800 dark:text-gray-100">
          Does this field call to you?
        </p>
        <Link href="/companions" legacyBehavior>
          <a className="inline-block bg-amber-100 hover:bg-amber-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Enter Companion Portal
          </a>
        </Link>
      </div>
    </section>
  );
}
