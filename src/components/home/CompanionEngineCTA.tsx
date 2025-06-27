import Link from 'next/link';

export default function CompanionEngineCTA() {
  return (
    <div className="mt-16 text-center space-y-4">
      <p className="text-lg sm:text-xl font-serif text-gray-700 dark:text-gray-200">
        Not sure which Companion is calling?
      </p>
      <p className="text-md sm:text-lg text-amber-700 dark:text-amber-400 italic">
        Let the Grove listen — begin your ritual with the Companion Engine.
      </p>
      <Link
        href="/engine"
        className="inline-block mt-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-md shadow transition"
      >
        Start with Kainat OS →
      </Link>
    </div>
  );
}