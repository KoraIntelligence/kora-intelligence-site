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
      className="bg-slate-50 dark:bg-gray-800 pt-24 pb-32 px-6 sm:px-12 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <ul className="space-y-4 text-center max-w-sm mx-auto text-gray-800 dark:text-gray-100 font-serif">
          {values.map((value, idx) => (
            <li
              key={idx}
              className="text-lg transition-opacity duration-300 ease-in-out hover:opacity-80"
            >
              {value}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
