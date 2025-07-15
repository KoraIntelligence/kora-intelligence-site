import Head from 'next/head';
import {
  WhisperOfArrival,
  CompassFlame,
  CompanionGrove,
  RitualEchoes,
  ZebraCovenant,
  CallToPresence,
} from '../components/home';

export default function Home() {
  return (
    <>
      <Head>
        <title>Kora Intelligence | AI Companions for Founders Who Lead with Clarity</title>
        <meta
          name="description"
          content="Emotional operating systems for startups. Discover AI companions for marketing, grant writing, and clarity in scale."
        />
        <meta property="og:title" content="Kora Intelligence – AI Companions for Calm Growth" />
        <meta
          property="og:description"
          content="Meet your AI companions for resonance, grant clarity, and founder alignment."
        />
        <meta property="og:image" content="/og-default.png" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="space-y-24 font-serif text-gray-800 dark:text-gray-100 bg-white dark:bg-neutral-900 transition-colors duration-300 ease-in-out">
        <WhisperOfArrival />
        <CompassFlame />
        <CompanionGrove />
        <RitualEchoes />
        <ZebraCovenant />
        <CallToPresence />
      </div>
    </>
  );
}
