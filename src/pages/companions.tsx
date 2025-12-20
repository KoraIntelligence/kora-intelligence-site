import Link from 'next/link';
import Image from 'next/image';
import { companions, Companion } from '../data/companions';

export default function CompanionsPage() {
  return (
    <main className="pt-24 pb-32 px-6 max-w-6xl mx-auto text-center text-gray-800 dark:text-gray-100">
      {/* Page Header */}
      <header className="space-y-4 mb-12">
        <h1 className="text-amber-600 text-3xl sm:text-4xl md:text-5xl font-bold">
          The Companions of Kora
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Meet the two active Companions shaping the Grove today -  
          <span className="font-semibold"> Lyra </span> for brand clarity and 
          <span className="font-semibold"> Salar </span> for pricing and continuity.
        </p>
        <Link
          href="/pages/mvp"
          className="inline-block mt-6 px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
        >
          Begin My Conversation →
        </Link>
      </header>

      {/* Companion Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {Object.values(companions)
          .filter((companion: Companion) =>
            ['lyra', 'salar'].includes(companion.slug)
          )
          .map((companion: Companion) => (
            <Link
              key={companion.slug}
              href={`/companions/${companion.slug}`}
              className="group bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-300 flex flex-col items-center border border-transparent hover:border-amber-300 dark:hover:border-amber-500"
            >
              <Image
                src={`/assets/glyphs/glyph-${companion.slug}.png`}
                alt={`${companion.title} glyph`}
                width={96}
                height={96}
                className="mx-auto mb-4 rounded-full transition-transform duration-300 group-hover:scale-105"
              />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {companion.title}
              </h2>
              {companion.tagline && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                  {companion.tagline}
                </p>
              )}
            </Link>
          ))}
      </section>
    </main>
  );
}
