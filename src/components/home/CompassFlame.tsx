import React from 'react';

const slides = [
  'Guardian of the Threshold',
  'Bearer of Mythic Flame',
  'Guide through Shadows',
];

export default function CompassFlame() {
  return (
    <section
      aria-label="Sacred Mythos"
      className="bg-white dark:bg-gray-900 pt-16 pb-16 transition-colors ease-in-out duration-500"
    >
      <div className="flex overflow-x-auto space-x-4 px-4">
        {slides.map((text, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-64 h-40 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-center font-serif text-gray-700 dark:text-gray-100 transition-opacity duration-300 ease-in-out hover:opacity-80"
          >
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}
