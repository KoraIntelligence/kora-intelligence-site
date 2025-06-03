import Head from 'next/head';

export default function BrandBook() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-900 dark:text-white scroll-smooth">
      <Head>
        <title>Kora Brand Book</title>
      </Head>
      <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌀</span>
            <span className="text-xl font-semibold">Kora Intelligence</span>
          </div>
          <nav className="space-x-6 text-sm sm:text-base">
            <a href="/" className="hover:underline">Home</a>
            <a href="/our-story" className="hover:underline">Our Story</a>
            <a href="/companions" className="hover:underline">Meet the Companions</a>
            <a href="/dispatch" className="hover:underline">Dispatch</a>
            <a href="/contact" className="bg-amber-600 text-white rounded-md px-3 py-1 hover:opacity-90 transition">Begin</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-24 space-y-8">
        <h1 className="text-3xl font-serif">Kora Brand Book Overview</h1>
        <p className="text-lg">This page demonstrates the navigation skeleton and layout from the brand scroll.</p>
      </main>
    </div>
  );
}
