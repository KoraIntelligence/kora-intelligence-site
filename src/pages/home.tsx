import Head from 'next/head';
import {
  WhisperOfArrival,
  CompanionGrove,
  CompassFlame,
  RitualEchoes,
  CallToPresence,
} from '../components/home';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Kora Intelligence</title>
      </Head>
      <div className="bg-[#080808]">
        <WhisperOfArrival />
        <CompanionGrove />
        <CompassFlame />
        <RitualEchoes />
        <CallToPresence />
      </div>
    </>
  );
}
