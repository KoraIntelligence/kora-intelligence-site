import { useRouter } from 'next/router';
import Head from 'next/head';
import { companions } from '@/data/companions';

export default function SummonPage() {
  const router = useRouter();
  const { companion } = router.query;

  const isReady = typeof companion === 'string' && companion in companions;
  const selected = isReady ? companions[companion as string] : null;

  return (
    <>
      <Head>
        <title>Summon a Companion – Kora Portal</title>
        <meta name="description" content="Enter the Sohbat Chamber. Whisper with a Companion." />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100 py-20 px-6 flex flex-col items-center justify-start text-center space-y-8">
        {!selected && (
          <>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-800">Who would you like to summon?</h1>
            <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
              {Object.values(companions)
                .filter((c) => c.mode === 'hybrid')
                .map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => router.push(`/summon?companion=${c.slug}`)}
                    className="p-6 bg-white rounded-xl shadow-md border border-amber-200 hover:shadow-lg transition flex flex-col items-center space-y-2"
                  >
                    <div className="text-4xl">{c.glyph}</div>
                    <h2 className="text-xl font-semibold">{c.title}</h2>
                    <p className="text-sm italic text-gray-600">{c.essence}</p>
                  </button>
                ))}
            </div>
          </>
        )}

        {selected && (
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-3xl md:text-4xl font-serif text-amber-800">
              You have summoned {selected.title}
            </h1>
            <p className="italic text-gray-600 text-sm mb-4">
              {selected.essence}
            </p>
            <iframe
              src={selected.chatEmbed}
              className="w-full h-[600px] border border-amber-300 rounded-xl shadow-lg"
              allow="clipboard-write; clipboard-read"
              loading="lazy"
            />
            <p className="text-xs text-gray-400 text-center italic">
              You are in a Sohbat chamber — a ritual space of dialogue, not automation.
            </p>
          </div>
        )}
      </main>
    </>
  );
}