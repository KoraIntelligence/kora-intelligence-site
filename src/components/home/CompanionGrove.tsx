import React from 'react';

const companions = [
  'Whisperer',
  'Cartographer',
  'Dreamer',
  'Harbinger',
];

export default function CompanionGrove() {
  return (
    <section className="bg-slate-50 dark:bg-gray-800 pt-16 pb-16 transition-colors ease-in-out duration-500">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {companions.map((role) => (
          <div
            key={role}
            className="p-4 bg-white dark:bg-gray-700 rounded-lg text-center shadow-sm font-serif text-gray-800 dark:text-gray-200 transition-opacity duration-300 ease-in-out hover:opacity-80"
          >
            {role}
          </div>
        ))}
      </div>
    </section>
  );
}
