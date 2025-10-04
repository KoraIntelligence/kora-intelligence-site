import React from 'react';
import Link from 'next/link';

export default function CallToPresence() {
  return (
    <section
      aria-label="Explore More"
      className="bg-white dark:bg-gray-900 py-16 px-6 sm:px-12 transition-colors ease-in-out duration-500 border-t border-gray-200 dark:border-zinc-800"
    >
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
          Not ready to dive in yet?  
          Explore our Companions and Dispatches to see how Kora can support your journey.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/companions"
            className="inline-block bg-amber-100 hover:bg-amber-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-transform duration-300 ease-in-out text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 hover:scale-105"
          >
            Meet the Companions →
          </Link>

          <Link
            href="/dispatch"
            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-transform duration-300 ease-in-out text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 hover:scale-105"
          >
            Read Dispatches →
          </Link>
        </div>
      </div>
    </section>
  );
}