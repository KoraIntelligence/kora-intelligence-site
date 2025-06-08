import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layouts/CompanionScrollLayout';

export default function WhispererPage() {
  const companion = companions['whisperer'];

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        {companion.mode === 'prompt' && (
          <section>
            <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">Summon Ritual</h2>
            <form className="max-w-md mx-auto space-y-4">
              <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
                Intention
                <input
                  type="text"
                  name="intention"
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                />
              </label>
              <button
                type="submit"
                className="w-full py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 transition"
              >
                Begin the Ritual
              </button>
            </form>
          </section>
        )}

        {companion.mode === 'chat' && (
          <section>
            <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">
              Whisper with {companion.title}
            </h2>
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
              <form className="max-w-md mx-auto space-y-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Signal
                  <input
                    type="text"
                    name="signal"
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  />
                </label>
              </form>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-600 mb-2 text-center">
                Chat with {companion.title}
              </h2>
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
