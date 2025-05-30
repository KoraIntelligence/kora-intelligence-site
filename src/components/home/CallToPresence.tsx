import React from 'react';
import Link from 'next/link';

export default function CallToPresence() {
  return (
    <section className="bg-white dark:bg-gray-900 pt-16 pb-16 transition-colors ease-in-out duration-500">
      <div className="text-center px-4">
        <p className="font-serif text-xl mb-6 text-gray-800 dark:text-gray-200">
          Does this field call to you?
        </p>
        <Link href="/companions" legacyBehavior>
          <a className="inline-block px-6 py-3 rounded bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 transition-opacity duration-300 ease-in-out hover:opacity-80">
            Enter Companion Portal
          </a>
        </Link>
      </div>
    </section>
  );
}
