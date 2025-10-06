import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';
import CompanionRitual from '@/components/invocation/CompanionRitual';

export default function CompanionPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Guard for missing slug (e.g., before hydration)
  if (typeof slug !== 'string') {
    return null;
  }

  const companion = companions[slug];

  // Fallback for invalid slug
  if (!companion) {
    return <p className="text-center mt-20 text-gray-700 dark:text-gray-300">Companion not found.</p>;
  }

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.tagline} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        {/* Render unique ritual section if the companion is one of the three active ones */}
        {['ccc', 'fmc', 'builder'].includes(companion.slug) && (
          <CompanionRitual companion={companion} />
        )}

        {/* CTA to Chat Chamber */}
        <section className="mt-12 text-center space-y-4">
          <h2 className="text-lg font-semibold text-amber-600 mb-2">
            Speak with {companion.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Continue your ritual in the Chat Chamber — a space for co-creation, reflection, and clarity.
          </p>
          <Link
            href={`/companions/${companion.slug}/chat`}
            className="inline-block bg-amber-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-amber-700 transition"
          >
            Enter Chat Chamber →
          </Link>
        </section>
      </CompanionScrollLayout>
    </>
  );
}
