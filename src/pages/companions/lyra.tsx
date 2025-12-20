import Head from 'next/head';
import { companions } from '@/data/companions';
import CompanionScrollLayout from '@/components/layout/CompanionScrollLayout';

export default function LyraPage() {
  const companion = companions['lyra'];

  // Safety guard — prevents build-time crash if data is missing
  if (!companion) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.tagline} />
      </Head>

      <CompanionScrollLayout companion={companion}>
        {/* Informational-only page.
            Chat entry is intentionally handled elsewhere (e.g. /mvp). */}
      </CompanionScrollLayout>
    </>
  );
}