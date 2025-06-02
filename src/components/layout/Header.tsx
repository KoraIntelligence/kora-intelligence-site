import Link from 'next/link';

// TODO: Add mobile nav toggle with Headless UI

export default function Header() {
  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="text-xl font-serif">Kora Intelligence</div>
        <div className="space-x-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/companions">Companions</Link>
          <Link href="/support">Support</Link>
          <Link href="/dispatch">Dispatch</Link>
        </div>
      </div>
    </nav>
  );
}
