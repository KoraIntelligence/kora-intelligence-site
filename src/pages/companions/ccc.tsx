import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';
import CompanionInvocation from '@/components/companions/CompanionInvocation';
import SalarWhisper from '@/components/summon/SalarWhisper';

export default function CCCPage() {
  const companion = companions['ccc'];

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        {/* Ritual Prompt Form */}
        {companion.mode === 'prompt' && companion.questions && companion.webhookUrl && (
          <CompanionInvocation
            companionSlug={companion.slug}
            companionTitle={companion.title}
            webhookUrl={companion.webhookUrl!}
            questions={companion.questions}
          />
        )}



        {/* Optional Hybrid Mode */}
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
              <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Chat with {companion.title}</h2>
              <SalarWhisper />
            </div>
          </section>
        )}
      </CompanionScrollLayout>
    </>
  );
}
