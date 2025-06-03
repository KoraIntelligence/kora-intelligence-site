import Head from 'next/head';

export default function Support() {
  return (
    <>
      <Head>
        <title>Signal the Grove – Kora Intelligence</title>
        <meta name="description" content="Reach out to the Grove with intention or inquiry." />
      </Head>
      <div className="pt-24 pb-32 px-6 max-w-3xl mx-auto space-y-12 text-center font-serif text-gray-800 dark:text-gray-100">
        <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold mb-6">Signal the Grove</h1>
        <p className="text-lg sm:text-xl italic">
          Share what stirs, ask what calls, or simply name your presence.
        </p>
        <div className="mt-12">
          <iframe
            src="https://tally.so/r/wo1N01"
            loading="lazy"
            width="100%"
            height="600"
            frameBorder="0"
            title="Signal the Grove Form"
            className="rounded-xl border-2 border-amber-200"
          ></iframe>
        </div>
      </div>
    </>
  );
}
