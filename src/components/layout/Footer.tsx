import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-zinc-800 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
      <Image
        src="/kora-logo.png"
        alt="Kora Logo"
        width={40}
        height={40}
        className="mx-auto mb-3 opacity-80 hover:opacity-100 transition-opacity"
      />
      <p className="text-sm">Kora Intelligence</p>
      <p className="text-xs mt-1">Rooted in clarity</p>
      <p className="text-xs mt-1">© {new Date().getFullYear()} A project of Paths Unknown</p>

      <nav className="flex justify-center gap-6 mt-4">
        <Link href="/companions" className="hover:opacity-70 transition">Companions</Link>
        <Link href="/dispatch" className="hover:opacity-70 transition">Dispatches</Link>
        <Link href="/privacy" className="hover:opacity-70 transition">Privacy</Link>
      </nav>
    </footer>
  );
}
