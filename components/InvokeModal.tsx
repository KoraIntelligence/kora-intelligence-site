import { useState } from 'react';
import Link from 'next/link';

export default function InvokeModal() {
  const [open, setOpen] = useState(false);
  const companions = [
    { name: "FMC", slug: "fmc" },
    { name: "CCC", slug: "ccc" },
    { name: "Whisperer", slug: "whisperer" },
    { name: "Alchemist", slug: "alchemist" },
    { name: "Cartographer", slug: "cartographer" },
    { name: "Dreamer", slug: "dreamer" },
    { name: "Pathbreaker", slug: "pathbreaker" },
    { name: "Builder", slug: "builder" }
  ];

  return (
    <>
      <button
        className="fixed bottom-6 right-6 p-3 bg-amber-600 text-white rounded-full shadow"
        onClick={() => setOpen(!open)}
      >
        🌀 Invoke
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Invoke a Companion</h2>
            <ul className="space-y-3">
              {companions.map(c => (
                <li key={c.slug}>
                  <Link href={`/companions/${c.slug}`}>
                    <span className="block text-amber-600 hover:underline text-center">
                      {c.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="text-center mt-4">
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
