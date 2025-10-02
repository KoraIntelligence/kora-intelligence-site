import Image from 'next/image';
import Link from 'next/link';
import { Companion } from '@/data/companions';

interface CompanionScrollLayoutProps {
  companion: Companion;
  children?: React.ReactNode;
}

export default function CompanionScrollLayout({
  companion,
  children,
}: CompanionScrollLayoutProps) {
  const slug = companion.slug;

  return (
    <main className="pt-24 pb-32 px-6 sm:px-12 max-w-5xl mx-auto space-y-16 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="text-center space-y-6">
        <Image
          src={`/assets/glyphs/glyph-${slug}.png`}
          alt={`${companion.title} glyph`}
          width={128}
          height={128}
          className="mx-auto mb-4 rounded-full"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          {companion.title}
        </h1>
        {companion.essence && (
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {companion.essence}
          </p>
        )}
        <span className="inline-block px-3 py-1 mt-2 rounded-full bg-amber-100 text-amber-800 text-sm">
          {companion.access}
        </span>
      </header>

      {/* Translation */}
      {companion.translation && (
        <section className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-amber-600">Real-World Translation</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {companion.translation}
          </p>
        </section>
      )}

      {/* Services */}
      {companion.services && (
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-6">Services</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {companion.services.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 shadow hover:shadow-md transition"
              >
                <p className="text-base text-gray-700 dark:text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tools */}
      {companion.tools && (
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-6">Tools & Methods</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {companion.tools.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 shadow hover:shadow-md transition"
              >
                <p className="text-base text-gray-700 dark:text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Offerings */}
      {companion.offerings && (
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-6">Offerings</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {companion.offerings.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 shadow hover:shadow-md transition"
              >
                <p className="text-base text-gray-700 dark:text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summoning */}
      {companion.summoning && (
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-6">How to Engage</h2>
          <ol className="list-decimal list-inside space-y-2 text-lg text-gray-700 dark:text-gray-300">
            {companion.summoning.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Origin */}
      {companion.origin && (
        <section>
          <h2 className="text-2xl font-bold text-amber-600 mb-6">Origin</h2>
          <p className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-6 text-base text-gray-700 dark:text-gray-300">
            {companion.origin}
          </p>
        </section>
      )}

      {/* Nested Scroll Content */}
      {children}

      {/* CTA */}
      <div className="text-center">
        <Link
          href={`/companions/${companion.slug}/chat`}
          className="px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold shadow-md hover:bg-amber-700 transition"
        >
          Chat with {companion.title} →
        </Link>
      </div>

      {/* Tags */}
      {companion.tags && (
        <section className="pt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          {companion.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block mx-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-800"
            >
              #{tag}
            </span>
          ))}
        </section>
      )}
    </main>
  );
}

