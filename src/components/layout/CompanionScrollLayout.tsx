import Image from 'next/image';
import Link from 'next/link';
// Use relative import to avoid alias resolution issues
import type { Companion } from '../../data/companions';

interface CompanionScrollLayoutProps {
  companion: Companion;
  children?: React.ReactNode;
}

export default function CompanionScrollLayout({
  companion,
  children,
}: CompanionScrollLayoutProps) {
  const slug = companion.slug;

  // Safer locals to avoid optional chaining inside JSX
  const audience = companion.for ?? [];
  const helps = companion.helps ?? [];
  const useCases = companion.useCases ?? [];
  const tools = companion.tools ?? [];

  return (
    <main className="pt-24 pb-32 px-6 sm:px-12 max-w-5xl mx-auto text-gray-900 dark:text-gray-100 transition-colors duration-500 space-y-24">
      {/* Header */}
      <header className="text-center space-y-6 animate-fade-in">
        <Image
          src={`/assets/glyphs/glyph-${slug}.png`}
          alt={`${companion.title} glyph`}
          width={128}
          height={128}
          className="mx-auto mb-4 rounded-full filter drop-shadow-sm dark:drop-shadow-none"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          {companion.title}
        </h1>
        {companion.tagline && (
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {companion.tagline}
          </p>
        )}
        <div className="h-[1px] w-20 mx-auto bg-amber-300 dark:bg-amber-600 opacity-70 rounded-full mt-4" />
      </header>

      {/* Description */}
      {companion.description && (
        <section className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in-delayed">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {companion.description}
          </p>
        </section>
      )}

      {/* Who It’s For */}
      {audience.length > 0 && (
        <section className="animate-fade-up">
          <h2 className="section-heading">Who It’s For</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {audience.map((person: string, index: number) => (
              <li
                key={index}
                className="p-4 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-amber-50 dark:border-zinc-700 hover:shadow-md transition-all duration-300"
              >
                {person}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* What It Helps You Do */}
      {helps.length > 0 && (
        <section className="animate-fade-up">
          <h2 className="section-heading">What It Helps You Do</h2>
          <ul className="space-y-3">
            {helps.map((help: string, index: number) => (
              <li
                key={index}
                className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border-l-4 border-amber-400 hover:translate-x-1 transition-transform"
              >
                {help}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* How It Works */}
      {companion.howItWorks && (
        <section className="animate-fade-up">
          <h2 className="section-heading">How It Works</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto text-center">
            {companion.howItWorks}
          </p>
        </section>
      )}

      {/* Example Use Cases */}
      {useCases.length > 0 && (
        <section className="animate-fade-up">
          <h2 className="section-heading">Example Use Cases</h2>
          <div className="overflow-x-auto rounded-2xl shadow border border-amber-100 dark:border-zinc-700">
            <table className="w-full border-collapse text-left bg-white dark:bg-zinc-900">
              <thead>
                <tr className="bg-amber-600 text-white">
                  <th className="p-4 text-lg font-semibold">Scenario</th>
                  <th className="p-4 text-lg font-semibold">Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {useCases.map(
                  (
                    uc: { case: string; output: string },
                    index: number
                  ) => (
                    <tr
                      key={index}
                      className="hover:bg-amber-50 dark:hover:bg-zinc-800/50 transition"
                    >
                      <td className="p-4 align-top">{uc.case}</td>
                      <td className="p-4 align-top text-gray-600 dark:text-gray-300">
                        {uc.output}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tools */}
      {tools.length > 0 && (
        <section className="animate-fade-up">
          <h2 className="section-heading">Tools at Their Disposal</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool: string, index: number) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-amber-50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-amber-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition"
              >
                {tool}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why They Exist */}
      {companion.whyItExists && (
        <section className="animate-fade-up">
          <h2 className="section-heading">Why They Exist</h2>
          <p className="italic bg-amber-50/60 dark:bg-zinc-800/60 border border-amber-100 dark:border-zinc-700 rounded-xl p-6 text-base text-gray-700 dark:text-gray-300">
            {companion.whyItExists}
          </p>
        </section>
      )}

      {/* Impact Line */}
      {companion.impact && (
        <section className="text-center max-w-3xl mx-auto animate-fade-in-delayed">
          <blockquote className="text-xl sm:text-2xl text-amber-700 dark:text-amber-400 italic font-medium leading-relaxed">
            “{companion.impact}”
          </blockquote>
        </section>
      )}

      {/* CTA */}
      {companion.cta && (
        <div className="text-center space-y-4 animate-fade-in-delayed">
          <p className="text-lg sm:text-xl font-medium">{companion.cta}</p>
          <Link
            href={`/companions/${companion.slug}/chat`}
            className="inline-block px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold shadow-md hover:bg-amber-700 transition-transform hover:scale-[1.02]"
          >
            Talk to {companion.title.split('(')[0].trim()} →
          </Link>
        </div>
      )}

      {/* Tags */}
      {companion.tags && companion.tags.length > 0 && (
        <section className="pt-4 text-sm text-center text-gray-600 dark:text-gray-400 animate-fade-in">
          {companion.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-block mx-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-800"
            >
              #{tag}
            </span>
          ))}
        </section>
      )}

      {children}
    </main>
  );
}

