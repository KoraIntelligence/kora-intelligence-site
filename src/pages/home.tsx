import Head from 'next/head';
import {
  WhisperOfArrival,
  CompassFlame,
  CompanionGrove,
  RitualEchoes,
  ZebraCovenant,
  CallToPresence,
  FooterRootbed,
} from '../components/home';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Kora Intelligence</title>
      </Head>
      <main className="font-serif text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 transition-colors ease-in-out duration-500">
        <WhisperOfArrival />
        <CompassFlame />
        <CompanionGrove />
        <RitualEchoes />
        <ZebraCovenant />
        <CallToPresence />
      </main>
      <FooterRootbed />
    </>
  );
}
