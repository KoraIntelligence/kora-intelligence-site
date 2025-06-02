import Head from 'next/head';
import Footer from '../components/layout/Footer';
import {
  WhisperOfArrival,
  CompassFlame,
  CompanionGrove,
  RitualEchoes,
  ZebraCovenant,
  CallToPresence,
} from '../components/home';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Kora Intelligence</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow font-serif text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 transition-colors ease-in-out duration-500">
          <WhisperOfArrival />
          <CompassFlame />
          <CompanionGrove />
          <RitualEchoes />
          <ZebraCovenant />
          <CallToPresence />
        </main>
        <Footer />
      </div>
    </>
  );
}
