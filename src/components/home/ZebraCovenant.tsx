import React from 'react';
import Link from 'next/link';

export default function ZebraCovenant() {
  return (
    <section
      aria-label="Closing Call to Action"
      className="bg-amber-600 dark:bg-amber-500 text-white py-24 px-6 sm:px-12 text-center transition-colors duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Meet the AI Companion That Writes and Prices Like You Do.
        </h2>
        <p className="text-lg sm:text-xl font-light max-w-2xl mx-auto">
          Don’t settle for generic AI outputs.  
          Choose a Companion who understands your voice, your market, and your rhythm.  
          Get your first draft in under 60 seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/companions/lyra"
            className="px-6 py-3 rounded-xl bg-white text-amber-600 font-semibold shadow-md hover:bg-gray-100 transition"
          >
            Try Lyra Now →
          </Link>
          <Link
            href="/companions/salar"
            className="px-6 py-3 rounded-xl bg-amber-700 text-white font-semibold shadow-md hover:bg-amber-800 transition"
          >
            Explore Salar →
          </Link>
          
        </div>

        <p className="text-sm opacity-80 mt-6">
          No setup. No pressure. Just your voice, echoed back.
        </p>
      </div>
    </section>
  );
}
