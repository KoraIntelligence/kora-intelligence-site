import { useRouter } from 'next/router';
import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';
import CompanionRitual from '@/components/invocation/CompanionRitual';

export default function CompanionPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (typeof slug !== 'string') {
    return null;
  }

  const companion = companions[slug];

  if (!companion) {
    return <p className="text-center mt-20">Companion not found.</p>;
  }

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>
      <CompanionScrollLayout companion={companion}>
        {['ccc', 'fmc', 'builder'].includes(companion.slug) && (
          <CompanionRitual companion={companion} />
        )}
        {/* Removed empty conditional block that caused error */}
        {companion.mode === 'chat' && (
          <section>
            <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Whisper with {companion.title}</h2>
            <iframe
              src="https://chat.openai.com/embed?model=gpt-4"
              className="w-full h-[500px] border rounded-md"
            />
          </section>
        )}
        {companion.mode === 'chat' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Prompt Summon</h2>

            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Chat with {companion.title}</h2>
              <iframe
                src="https://chat.openai.com/embed?model=gpt-4"
                className="w-full h-[500px] border rounded-md"
              />
            </div>
          </section>
        )}
      </CompanionScrollLayout>
    </>
  );
}
