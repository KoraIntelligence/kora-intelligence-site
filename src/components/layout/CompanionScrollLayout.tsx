import Image from 'next/image';
import { Companion } from '@/data/companions';

interface CompanionScrollLayoutProps {
  companion: Companion;
  children?: React.ReactNode;
}

export default function CompanionScrollLayout({
  companion,
  children
}: CompanionScrollLayoutProps) {
  const slug = companion.slug;

  return (
    <main className="pt-24 pb-32 px-4 sm:px-6 max-w-prose mx-auto space-y-16 text-gray-900 dark:text-gray-100 font-serif">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-full flex justify-center">
          <Image
            src={`/assets/glyphs/glyph-${slug}.png`}
            alt={`${companion.title} glyph`}
            width={128}
            height={128}
            className="mx-auto mb-4 rounded-full hover:opacity-75 transition duration-300 ease-in-out"
          />
        </div>
        <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold">{companion.title}</h1>
        <p className="italic text-lg sm:text-xl">{companion.essence}</p>
        <span className="inline-block px-3 py-1 mt-2 rounded-full bg-amber-100 text-amber-800 text-sm">
          {companion.access}
        </span>
      </div>

      {/* Translation */}
      {companion.translation && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-center text-amber-700">Real-World Translation</h2>
          <p className="text-base italic text-center">{companion.translation}</p>
        </section>
      )}

      {/* Services */}
      {companion.services && (
        <section>
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Services</h2>
          <ul className="list-disc list-inside space-y-1">
            {companion.services.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Tools */}
      {companion.tools && (
        <section>
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Tools & Methods</h2>
          <ul className="list-disc list-inside space-y-1">
            {companion.tools.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Offerings */}
      {companion.offerings && (
        <section>
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Offerings</h2>
          <ul className="list-disc list-inside space-y-1">
            {companion.offerings.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Summoning */}
      {companion.summoning && (
        <section>
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Summoning Ritual</h2>
          <ul className="list-decimal list-inside space-y-1">
            {companion.summoning.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Origin */}
      {companion.origin && (
        <section>
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Origin</h2>
          <p className="italic bg-amber-50 dark:bg-amber-900 rounded-md p-4 text-sm">
            {companion.origin}
          </p>
        </section>
      )}

      {/* Nested Scroll Content */}
      {children}

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
