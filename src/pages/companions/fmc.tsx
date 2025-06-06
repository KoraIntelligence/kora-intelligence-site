import Head from 'next/head';
import { companions, Companion } from '@/data/companions';

export default function FMCPage() {
  const companion: Companion = companions['fmc'];
  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>
      <main className="pt-24 pb-32 px-6 max-w-3xl mx-auto space-y-16 text-gray-900 dark:text-gray-100 font-serif">
        <div className="text-center space-y-2">
          <div className="text-5xl">{companion.glyph}</div>
          <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold">{companion.title}</h1>
          <p className="italic text-lg sm:text-xl">{companion.essence}</p>
          <span className="inline-block px-3 py-1 mt-2 rounded-full bg-amber-100 text-amber-800 text-sm">
            {companion.access}
          </span>
        </div>

        {companion.translation && (
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-center text-amber-700">Real-World Translation</h2>
            <p className="text-base italic text-center">{companion.translation}</p>
          </section>
        )}

        {companion.services && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Services</h2>
            <ul className="list-disc list-inside space-y-1">
              {companion.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </section>
        )}

        {companion.tools && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Tools & Methods</h2>
            <ul className="list-disc list-inside space-y-1">
              {companion.tools.map((tool, index) => (
                <li key={index}>{tool}</li>
              ))}
            </ul>
          </section>
        )}

        {companion.summoning && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Summoning Instructions</h2>
            <ol className="list-decimal list-inside space-y-1">
              {companion.summoning.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {companion.origin && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Origin</h2>
            <p className="italic bg-amber-50 dark:bg-amber-900 rounded-md p-4 text-sm">{companion.origin}</p>
          </section>
        )}

        {companion.tags && (
          <section className="pt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            {companion.tags.map((tag, index) => (
              <span key={index} className="inline-block mx-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-800">
                #{tag}
              </span>
            ))}
          </section>
        )}

        <section className="pt-8 border-t border-gray-300 dark:border-gray-700 space-y-6">
          <h2 className="text-xl font-semibold text-amber-600 text-center">Summon FMC</h2>
          <p className="italic text-center text-gray-600 dark:text-gray-400">
            A quiet chamber opens. Ask what you need, and the Companion will respond.
          </p>
          <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://your-chat-tool-link.com/fmc"
              className="w-full h-full border-none"
              title="Summon FMC"
            />
          </div>
        </section>
      </main>
    </>
  );
}
