import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo + Brand */}
        <div className="flex items-center space-x-3">
          <Image
            src="/kora-logo.png"
            alt="Kora Intelligence"
            width={40}
            height={40}
            className="rounded"
          />
          <span className="font-serif text-lg text-gray-900 dark:text-white">
            Kora Intelligence
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex space-x-6 text-sm font-medium text-gray-800 dark:text-gray-200">
          <Link href="/">Home</Link>
          <Link href="/companions">Companions</Link>
          <Link href="/support">Support</Link>
          <Link href="/dispatch">Dispatch</Link>
          <Link href="/about">About</Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="sm:hidden focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5h16.5M3.75 12h16.5m-16.5 7.5h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="sm:hidden transition-all bg-white dark:bg-gray-900 space-y-2 text-center py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/companions" onClick={() => setOpen(false)}>Companions</Link>
          <Link href="/support" onClick={() => setOpen(false)}>Support</Link>
          <Link href="/dispatch" onClick={() => setOpen(false)}>Dispatch</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
        </div>
      )}
    </nav>
  );
}
