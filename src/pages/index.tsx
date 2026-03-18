import Head from 'next/head';
import {
  WhisperOfArrival,
  CompanionGrove,
  CompassFlame,
  RitualEchoes,
  CallToPresence,
} from '../components/home';

export default function Home() {
  return (
    <>
      <Head>
        <title>Kora Intelligence — AI Companions for Commercial Teams</title>
        <meta
          name="description"
          content="Two AI companions for commercial and marketing teams. Salar handles proposals, pricing, and deals. Lyra handles campaigns, messaging, and outreach."
        />
        <meta property="og:title" content="Kora Intelligence — AI Companions for Commercial Teams" />
        <meta
          property="og:description"
          content="Structured outputs, workflow-guided intelligence. Built for teams that need real outputs, not chat."
        />
        <meta property="og:image" content="/og-default.png" />
        <meta property="og:type" content="website" />
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
