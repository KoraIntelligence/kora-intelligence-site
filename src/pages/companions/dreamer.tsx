import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';

export default function DreamerPage() {
  const companion = companions['dreamer'];

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
          </div>
        </section>
      </CompanionScrollLayout>
    </>
  );
}