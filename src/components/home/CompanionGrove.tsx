import React from 'react';

const companions = [
  'Whisperer',
  'Cartographer',
  'Dreamer',
  'Harbinger',
];

export default function CompanionGrove() {
  return (
    <section
      aria-label="Companion Grid"
      className="bg-neutral-50 dark:bg-gray-900 pt-24 pb-24 px-6 transition-colors ease-in-out duration-500"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {companions.map((role) => (
          <div
            key={role}
            className="p-6 bg-white dark:bg-emerald-950 rounded-2xl text-center shadow-sm font-serif text-gray-900 dark:text-emerald-200 transition duration-300 ease-in-out hover:opacity-80"
          >
            <span className="text-amber-600 text-lg">{role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
