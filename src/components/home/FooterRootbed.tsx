import React from 'react';
import Link from 'next/link';

export default function FooterRootbed() {
  return (
    <footer className="bg-slate-200 dark:bg-gray-900 pt-8 pb-8 text-center text-gray-700 dark:text-gray-300 transition-colors ease-in-out duration-500">
      <div className="space-x-4">
        <Link href="/ip" legacyBehavior>
          <a className="hover:opacity-80 transition-opacity duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">IP</a>
        </Link>
        <Link href="/contact" legacyBehavior>
          <a className="hover:opacity-80 transition-opacity duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Contact</a>
        </Link>
        <Link href="/archive" legacyBehavior>
          <a className="hover:opacity-80 transition-opacity duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Archive</a>
        </Link>
      </div>
    </footer>
  );
}
