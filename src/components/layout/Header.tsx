import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <Image
            src="/kora-logo.png"
            alt="Kora Intelligence logo"
            width={32}
            height={32}
            className="transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-bold tracking-wide text-gray-900 dark:text-white">
            Kora Intelligence
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* Mobile toggle */}
          <button
            className="sm:hidden text-gray-800 dark:text-gray-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex space-x-6 text-sm font-medium text-gray-800 dark:text-gray-200">
            <Link href="/" className="hover:opacity-70 transition">Home</Link>
            <Link href="/our-story" className="hover:opacity-70 transition">Our Story</Link>
            <Link href="/companions" className="hover:opacity-70 transition">Companions</Link>
            <Link href="/labs" className="hover:opacity-70 transition">Labs</Link>
            <Link href="/dispatches" className="hover:opacity-70 transition">Dispatches</Link>
            <Link href="/contact" className="inline-block">
              <span className="bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 transition">
                Begin Your Journey
              </span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="sm:hidden px-4 pb-4" aria-label="Mobile navigation">
          <ul className="space-y-4 text-gray-800 dark:text-gray-200 text-sm font-medium">
            <li><Link href="/" className="hover:opacity-70 transition">Home</Link></li>
            <li><Link href="/our-story" className="hover:opacity-70 transition">Our Story</Link></li>
            <li><Link href="/companions" className="hover:opacity-70 transition">Companions</Link></li>
            <li><Link href="/labs" className="hover:opacity-70 transition">Labs</Link></li>
            <li><Link href="/dispatches" className="hover:opacity-70 transition">Dispatches</Link></li>
            <li><Link href="/contact" className="hover:opacity-70 transition">Begin Your Journey</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
