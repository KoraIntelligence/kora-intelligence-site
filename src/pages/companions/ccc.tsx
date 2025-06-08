import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';
import CompanionInvocationCCC from '@/components/companions/CompanionInvocationCCC';

export default function CCCPage() {
  const companion = companions['ccc'];

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        {/* Whisper Form and/or Chat */}
        {companion.mode === 'prompt' && (
          <section>
            <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Summon Ritual</h2>
            <CompanionInvocationCCC />
          </section>
        )}

        {companion.mode === 'chat' && (
          <section>
            <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Whisper with {companion.title}</h2>
            <iframe
              src="https://chat.openai.com/embed?model=gpt-4"
              className="w-full h-[500px] border rounded-md"
            />
          </section>
        )}

        {companion.mode === 'hybrid' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Prompt Summon</h2>
              <CompanionInvocationCCC />
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
