import React from 'react';

const values = [
  'Seek truth softly',
  'Honor the zebra path',
  'Walk with humility',
];

export default function ZebraCovenant() {
  return (
    <section
      aria-label="Covenant Ritual"
      className="bg-slate-50 dark:bg-gray-800 px-4 sm:px-6 md:px-8 pt-16 pb-16 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <ul className="space-y-4 text-center">
          {values.map((value, idx) => (
            <li
              key={idx}
              className="font-serif text-lg text-gray-800 dark:text-gray-200 transition-opacity duration-300 ease-in-out hover:opacity-80"
            >
              {value}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
