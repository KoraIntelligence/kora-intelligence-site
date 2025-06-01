import Head from 'next/head';

export default function CCC() {
  return (
    <>
      <Head>
        <title>🧱 CCC – Commercial Continuity Companion | Kora</title>
      </Head>
      <main className="bg-neutral-50 dark:bg-neutral-900 min-h-screen pt-24 pb-24 px-6 space-y-12 transition-colors duration-300">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl text-amber-600 font-serif mb-4">🧱 CCC – Commercial Continuity Companion</h1>
          <p className="text-gray-800 dark:text-gray-100 font-serif italic mb-2">
            Grounds and scales soul-rooted ventures.
          </p>
          <p className="text-gray-700 dark:text-gray-200 font-sans">
            This section will grow into a deeper scroll about their purpose, who they support, and how they work.
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-8 font-mono">Public Access</p>
        </div>
      </main>
    </>
  );
}
