import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-3">
          <Image
            src="/kora-logo.png"
            alt="Kora Intelligence logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-serif text-gray-900 dark:text-white">
            Kora Intelligence
          </span>
        </div>
        <div className="space-x-6 text-sm font-medium text-gray-800 dark:text-gray-200">
          <Link href="/">Home</Link>
          <Link href="/about">Our Story</Link>
          <Link href="/companions">Meet the Companions</Link>
          <Link href="/dispatch">Dispatch</Link>
          <Link href="/support">
            <button className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700">
              Begin
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
