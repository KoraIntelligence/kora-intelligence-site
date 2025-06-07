import Head from 'next/head';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Begin Your Journey – Kora Intelligence</title>
        <meta name="description" content="Whisper into the Grove and begin your Companion journey." />
      </Head>
      <div className="pt-24 pb-32 px-6 max-w-3xl mx-auto space-y-12 text-center font-serif text-gray-800 dark:text-gray-100">
        <h1 className="text-amber-600 text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">Begin Your Journey</h1>
        <p className="text-base sm:text-lg md:text-xl italic">
          Share what stirs, ask what calls, or simply name your presence.
        </p>
        <div className="mt-12">
          <iframe
            src="https://tally.so/r/wo1N01"
            loading="lazy"
            width="100%"
            height="600"
            frameBorder="0"
            title="Begin Your Journey Form"
            className="rounded-xl border-2 border-amber-200"
          ></iframe>
        </div>
      </div>
    </>
  );
}
