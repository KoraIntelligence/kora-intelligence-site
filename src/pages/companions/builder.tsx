import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';
import CompanionInvocation from '@/components/companions/CompanionInvocation';

export default function BuilderPage() {
  const companion = companions['builder'];

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        
        {companion.mode === 'hybrid' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Prompt Summon</h2>
              <CompanionInvocation
                companionSlug={companion.slug}
                companionTitle={companion.title}
                webhookUrl={companion.webhookUrl!}
                questions={companion.questions || []}
              />
            </div>
            <div>
             <div className="mt-6 text-center">
               <a
              href={`/companions/${companion.slug}/chat`}
              className="text-amber-700 underline hover:text-amber-800 transition font-serif"
              >
              → Enter Sohbat with {companion.title}
              </a>
            </div>
            </div>
          </section>
        )}
      </CompanionScrollLayout>
    </>
  );
}
