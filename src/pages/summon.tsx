import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { companions } from '@/data/companions';

export default function SummonPage() {
  const router = useRouter();
  const { companion } = router.query;
  const [iframeError, setIframeError] = useState(false);

  const isReady = typeof companion === 'string' && companion in companions;
  const selected = isReady ? companions[companion as string] : null;

  return (
    <>
      <Head>
        <title>Summon a Companion – Kora Portal</title>
        <meta name="description" content="Enter the Sohbat Chamber. Whisper with a Companion." />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100 py-20 px-6 flex flex-col items-center justify-start text-center space-y-8">
        {/* Companion Selection */}
        {!selected && (
          <>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-amber-600">
              Who would you like to summon?
            </h1>

            <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
              {Object.values(companions)
                // Removed .mode filter — all companions are summonable now
                .filter((c) => ['ccc', 'fmc', 'builder'].includes(c.slug))
                .map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => router.push(`/summon?companion=${c.slug}`)}
                    className="p-6 bg-white rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition flex flex-col items-center space-y-2 dark:bg-neutral-900 dark:border-amber-700"
                  >
                    <img
                      src={`/assets/glyphs/glyph-${c.slug}.png`}
                      alt={`${c.title} glyph`}
                      className="h-10 w-10"
                    />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {c.title}
                    </h2>
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">
                      {c.tagline}
                    </p>
                  </button>
                ))}
            </div>
          </>
        )}

        {/* Summoned Companion Chamber */}
        {selected && (
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-amber-600">
              You have summoned {selected.title}
            </h1>

            <img
              src={`/assets/glyphs/glyph-${selected.slug}.png`}
              alt={`${selected.title} glyph`}
              className="mx-auto h-12 w-12 opacity-90"
            />

            <p className="italic text-gray-600 dark:text-gray-400 text-sm mb-4">
              {selected.tagline}
            </p>

            <div className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-600 rounded-xl p-2 shadow-lg">
              <iframe
                src={`/companions/${selected.slug}/chat`}
                className="w-full h-[600px] rounded-lg"
                allow="clipboard-write; clipboard-read"
                loading="lazy"
                onError={() => setIframeError(true)}
              />
              {iframeError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                  Chat interface failed to load.
                </p>
              )}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center italic">
              You are in a Sohbat chamber — a ritual space of dialogue, not automation.
            </p>
          </div>
        )}
      </main>
    </>
  );
}