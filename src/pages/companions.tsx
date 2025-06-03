import Link from 'next/link';
import { companions, Companion } from '../data/companions';

export default function CompanionsPage() {
  return (
    <div className="pt-24 pb-32 px-6 max-w-6xl mx-auto space-y-16 text-center">
      <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold mb-6">
        The Companions of Kora
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 gap-y-8">
        {Object.values(companions).map((companion: Companion) => (
          <Link
            key={companion.slug}
            href={`/companions/${companion.slug}`}
            className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all flex flex-col items-center space-y-2 group"
          >
            <div className="text-4xl mb-1">{companion.glyph}</div>
            <h2 className="font-serif text-lg text-gray-900 dark:text-white">
              {companion.title}
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-1 mt-2 inline-block">
              {companion.access}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-sm italic text-gray-700 dark:text-gray-300">
              {companion.essence}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
