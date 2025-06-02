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
          <a className="inline-block px-4 py-2 text-sm sm:text-base rounded transition-opacity hover:opacity-80 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900">
            Enter Companion Portal
          </a>
        </Link>
      </div>
    </section>
  );
}
