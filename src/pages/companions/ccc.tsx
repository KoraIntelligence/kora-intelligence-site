import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';

export default function CCCPage() {
  const companion = companions['ccc'];

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.tagline} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        {/* Intentionally left empty.
            This page is now informational-only (no chat CTA). */}
      </CompanionScrollLayout>
    </>
  );
}