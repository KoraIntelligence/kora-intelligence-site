import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';

export default function AlchemistPage() {
  const companion = companions['alchemist'];

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        <section className="space-y-8">
          <div className="mt-6 text-center">
            <a
              href={`/companions/${companion.slug}/chat`}
              className="text-amber-700 underline hover:text-amber-800 transition font-serif"
            >
              → Enter Sohbat with {companion.title}
            </a>
            <div className="pt-4 text-center text-sm text-gray-600 dark:text-gray-300">
  <p className="italic mb-2">Begin with a whisper:</p>
  <div className="space-y-2">
    {[
      "What are you holding but not saying?",
      "Describe a moment that felt off — in tone, in timing, in texture.",
      "What would you like the Alchemist to transform?"
    ].map((prompt, idx) => (
      <button
        key={idx}
        onClick={() => {
          // Later: prefill in chat input or copy to clipboard
          navigator.clipboard.writeText(prompt);
        }}
        className="block w-full bg-amber-100 dark:bg-amber-800 rounded-md px-4 py-2 hover:bg-amber-200 dark:hover:bg-amber-700 transition text-gray-800 dark:text-gray-100 text-sm"
      >
        {prompt}
      </button>
    ))}
  </div>
</div>
          </div>
        </section>
      </CompanionScrollLayout>
    </>
  );
}