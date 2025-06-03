export default function Header() {
  return (
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
  );
}
