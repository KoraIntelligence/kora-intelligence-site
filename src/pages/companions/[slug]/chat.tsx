import { useRouter } from 'next/router';
import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';
import CompanionInvocation from '@/components/companions/CompanionInvocation';
import CompanionChat from '@/components/chat/CompanionChat';
import Link from 'next/link';

export default function CompanionChatPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (typeof slug !== 'string') return null;

  const companion = companions[slug];
  if (!companion) {
    return <p className="text-center mt-20">Companion not found.</p>;
  }

  return (
    <>
      <Head>
        <title>{companion.title} – Chat with Companion</title>
        <meta name="description" content={`Whisper and invoke ${companion.title}`} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        <div className="mb-6">
          <Link href={`/companions/${companion.slug}`}>
            <span className="text-amber-600 hover:underline text-sm font-serif">&larr; Return to Companion Scroll</span>
          </Link>
        </div>

        {companion.mode === 'prompt' && companion.questions && companion.webhookUrl && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-amber-700 mb-2 text-center">Ritual Prompt (Optional)</h2>
            <CompanionInvocation
              companionSlug={companion.slug}
              companionTitle={companion.title}
              webhookUrl={companion.webhookUrl}
              questions={companion.questions}
            />
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-amber-700 mb-2 text-center">Whisper with {companion.title}</h2>
          <CompanionChat
            companionSlug={companion.slug}
            title={companion.title}
            apiPath={`/api/summon/${slug}`}
          />
        </section>
      </CompanionScrollLayout>
    </>
  );
}