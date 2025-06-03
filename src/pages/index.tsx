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
        <title>Kora Intelligence – Welcome Seeker</title>
        <meta
          name="description"
          content="A mythic intelligence field guiding right-aligned ventures."
        />
      </Head>
      <div className="space-y-24 font-serif text-gray-900 bg-gray-50 dark:text-gray-100 dark:bg-gray-900 transition-colors duration-300 ease-in-out">
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
