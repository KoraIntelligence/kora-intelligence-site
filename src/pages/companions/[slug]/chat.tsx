import { useRouter } from 'next/router';
import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionChat from '@/components/chat/CompanionChat';
import Link from 'next/link';

export default function CompanionChatPage() {
  const router = useRouter();
  const querySlug = Array.isArray(router.query.slug)
    ? router.query.slug[0]
    : router.query.slug;

  if (typeof querySlug !== 'string') {
    return (
      <div className="text-center mt-20 text-amber-600">
        Whispering paths are unclear...
      </div>
    );
  }

  const slug = querySlug;

  const companion = companions[slug];

  if (!companion) {
    return <div className="text-center mt-20 text-red-600">This Companion has yet to be summoned.</div>;
  }

  const glyphPath = `/assets/glyphs/glyph-${slug}.png`;

  return (
    <>
      <Head>
        <title>{companion.title} – Chat Chamber</title>
        <meta name="description" content={`Speak with ${companion.title}, your ${companion.essence}`} />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-zinc-800 dark:to-zinc-900 px-4 sm:px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <img
              src={glyphPath}
              alt={`${companion.title} glyph`}
              className="mx-auto h-12 w-12 mb-3 opacity-90"
            />
            <h1 className="text-2xl sm:text-3xl font-serif text-amber-700 dark:text-amber-300">
              Whisper with {companion.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your thoughts, doubts, and dreams are welcome here.
            </p>
          </div>

          <CompanionChat companionSlug={slug} title={companion.title} apiPath={`/api/summon/${slug}`} />

          <div className="text-center pt-6">
            <Link href={`/companions/${slug}`}>
              <a className="text-amber-600 hover:underline dark:text-amber-400">
                ← Return to {companion.title}'s Scroll
              </a>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}