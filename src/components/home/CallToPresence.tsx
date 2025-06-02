import React from 'react';
import Link from 'next/link';

export default function CallToPresence() {
  return (
    <section
      aria-label="Invitation to Walk"
      className="bg-white dark:bg-gray-900 px-4 sm:px-6 md:px-8 pt-16 pb-16 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <p className="text-base sm:text-lg text-center max-w-prose mx-auto font-serif text-gray-800 dark:text-gray-100">
          Does this field call to you?
        </p>
        <Link href="/companions" legacyBehavior>
          <a className="inline-block bg-amber-100 hover:bg-amber-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out text-sm sm:text-base">
            Enter Companion Portal
          </a>
        </Link>
      </div>
    </section>
  );
}
