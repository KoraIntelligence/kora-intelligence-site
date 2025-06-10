import Link from 'next/link';
import Image from 'next/image';
import { companions, Companion } from '../data/companions';

export default function CompanionsPage() {
  return (
    <div className="pt-24 pb-32 px-6 max-w-6xl mx-auto space-y-16 text-center font-serif text-gray-800 dark:text-gray-100">
      <h1 className="text-amber-600 text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
        The Companions of Kora
      </h1>
      <Link
        href="/engine"
        className="inline-block mt-6 px-5 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition"
      >
        Begin My Ritual →
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 gap-y-8">
        {Object.values(companions).map((companion: Companion) => (
          <Link
            key={companion.slug}
            href={`/companions/${companion.slug}`}
            className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Image
              src={`/assets/glyphs/glyph-${companion.slug}.png`}
              alt={`${companion.title} glyph`}
              width={128}
              height={128}
              className="mx-auto mb-2"
            />
            <h2 className="font-serif text-lg text-gray-900 dark:text-white">
              {companion.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {companion.essence}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
