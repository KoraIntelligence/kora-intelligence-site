import Link from 'next/link';
import { companions, Companion } from '../data/companions';

export default function CompanionsPage() {
  return (
    <main className="pt-24 pb-32 px-6 max-w-6xl mx-auto space-y-16 text-center">
      <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold">
        The Companions of Kora
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Object.values(companions).map((companion: Companion) => (
          <Link
            key={companion.slug}
            href={`/companions/${companion.slug}`}
            className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all flex flex-col items-center space-y-2"
          >
            <div className="text-4xl">{companion.glyph}</div>
            <h2 className="font-serif text-lg text-gray-900 dark:text-white">
              {companion.title}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              {companion.essence}
            </p>
            <span className="inline-block mt-2 px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
              Access: {companion.access}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
