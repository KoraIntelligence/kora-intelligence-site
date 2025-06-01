import Head from 'next/head';

export default function Alchemist() {
  return (
    <>
      <Head>
        <title>🧪 The Alchemist | Kora</title>
      </Head>
      <main className="bg-neutral-50 dark:bg-neutral-900 min-h-screen pt-24 pb-24 px-6 space-y-12 transition-colors duration-300">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl text-amber-600 font-serif mb-4">🧪 The Alchemist</h1>
          <p className="text-gray-800 dark:text-gray-100 font-serif italic mb-2">
            Idea-to-opportunity intelligence, soul x market.
          </p>
          <p className="text-gray-700 dark:text-gray-200 font-sans">
            This section will grow into a deeper scroll about their purpose, who they support, and how they work.
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-8 font-mono">Ritual Access</p>
        </div>
      </main>
    </>
  );
}
