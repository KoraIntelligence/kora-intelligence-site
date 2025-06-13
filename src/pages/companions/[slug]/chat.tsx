import { useRouter } from 'next/router';
import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionChat from '@/components/chat/CompanionChat';
import Link from 'next/link';

export default function CompanionChatPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (typeof slug !== 'string') return null;

  const companion = companions[slug];
  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-4xl font-serif text-amber-700 mb-4">This path hasn’t been drawn yet.</p>
          <p className="text-gray-600">You’ve reached a quiet clearing. Return when the way reveals itself.</p>
          <Link href="/" className="mt-6 inline-block text-amber-700 underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sohbat with {companion.title} – Kora</title>
        <meta name="description" content={`Sohbat space with ${companion.title}`} />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-100 py-12 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center">
            <p className="text-4xl font-serif text-amber-800">Sohbat with {companion.title}</p>
            <p className="text-sm text-gray-500 mt-2 italic">
              You are in a dialogue chamber — not a chatbot. Speak slow. Speak true.
            </p>
            <Link href={`/companions/${slug}`} className="text-sm mt-4 inline-block text-amber-600 underline">
              ← Return to Companion Scroll
            </Link>
          </div>

          <div className="bg-white/90 rounded-xl border border-amber-300 p-6 shadow-md">
            <CompanionChat
              companionSlug={companion.slug}
              title={companion.title}
              apiPath={`/api/summon/${slug}`}
            />
          </div>
        </div>
      </main>
    </>
  );
}