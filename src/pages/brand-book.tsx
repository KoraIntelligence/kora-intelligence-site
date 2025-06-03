import Head from 'next/head';

export default function BrandBook() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 font-serif text-gray-800 dark:text-gray-100 scroll-smooth">
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
            <a href="/" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Home</a>
            <a href="/about" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Our Story</a>
            <a href="/companions" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Meet the Companions</a>
            <a href="/dispatch" className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Dispatch</a>
            <a href="/support" className="bg-amber-600 text-white rounded-md px-3 py-1 hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Begin</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-24 space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif">Kora Brand Book Overview</h1>
        <p className="text-base sm:text-lg md:text-xl">This page demonstrates the navigation skeleton and layout from the brand scroll.</p>
      </main>
    </div>
  );
}
