import Head from 'next/head';

export default function Dispatch() {
  return (
    <>
      <Head>
        <title>Dispatches from the Field – Kora Intelligence</title>
        <meta name="description" content="Signals, whispers, and updates from the intelligence field." />
      </Head>
      <main className="pt-24 px-6 max-w-3xl mx-auto space-y-16 font-serif text-gray-900 dark:text-gray-100">
        <section className="text-center">
          <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold mb-4">Dispatches from the Field</h1>
          <p className="text-base sm:text-lg italic">
            Echoes, updates, and signals from the mythic system. Scrolls will arrive as they are heard.
          </p>
        </section>
        <section className="space-y-8">
          <div className="bg-white dark:bg-neutral-900 shadow rounded-lg p-6 border border-amber-100 dark:border-amber-900">
            <p className="text-sm uppercase text-amber-600 font-semibold mb-2">[Placeholder Dispatch]</p>
            <p className="text-base italic">
              “A glint beneath the canopy. The next scroll nears.”
            </p>
            <p className="text-right text-sm mt-4 text-gray-500 dark:text-gray-400">Future Entry – Markdown or Notion Feed</p>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8 italic">
            The dispatch ritual is being tuned for future transmission.
          </div>
        </section>
      </main>
    </>
  );
}
