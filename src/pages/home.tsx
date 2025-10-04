import Head from 'next/head';
import {
  WhisperOfArrival,
  CompassFlame,
  CompanionGrove,
  ComparisonTable,
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
      <div className="font-serif text-gray-800 dark:text-gray-100 bg-white dark:bg-neutral-900 transition-colors ease-in-out duration-500">
        <WhisperOfArrival />
        <ComparisonTable />
        <CompanionGrove />  
        <CompassFlame />
        <RitualEchoes />
        <ZebraCovenant />
        <CallToPresence />
      </div>
    </>
  );
}
