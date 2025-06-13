import { useRouter } from 'next/router';
import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionChat from '@/components/chat/CompanionChat';
import Link from 'next/link';

export default function CompanionChatPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (typeof slug !== 'string') {
    return null;
  }

  const companion = companions[slug];

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-center p-6">
        <div>
          <div className="text-4xl">🌀</div>
          <h2 className="text-2xl font-serif text-amber-700 mt-4">This path hasn’t been drawn yet.</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            You’ve reached a quiet clearing. Return when the way reveals itself.
          </p>
          <Link href="/" className="text-amber-600 underline mt-4 block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Define backend route per Companion
  const apiPath = `/api/summon/${slug}`;

  return (
    <>
      <Head>
        <title>Sohbat with {companion.title} – Kora Companion</title>
        <meta name="description" content={`Begin a ritual dialogue with ${companion.title}`} />
      </Head>

      <main className="min-h-screen bg-amber-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif text-amber-700">
              Sohbat with {companion.title}
            </h1>
            <p className="text-sm italic text-gray-600 dark:text-gray-300">
              You are in a dialogue chamber — not a chatbot. Speak slow. Speak true.
            </p>
            <Link href={`/companions/${slug}`} className="text-xs text-amber-600 underline">
              ← Return to Companion Scroll
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-amber-300">
            <CompanionChat
              companionSlug={slug}
              title={companion.title}
              apiPath={apiPath}
            />
          </div>
        </div>
      </main>
    </>
  );
}