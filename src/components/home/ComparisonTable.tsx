import React from 'react';

export default function ComparisonTable() {
  return (
    <section
      id="comparison"
      className="pt-24 pb-32 px-6 sm:px-12 bg-white dark:bg-zinc-900 transition-colors duration-500"
    >
      <div className="max-w-5xl mx-auto text-center mb-12 space-y-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Why Choose Kora?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Generic AI tools give you output.  
          Kora Companions give you <span className="font-semibold">context, continuity, and a voice you recognize.</span>.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-lg rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-amber-600 text-white text-left">
              <th className="p-4 text-lg font-semibold">Feature</th>
              <th className="p-4 text-lg font-semibold">Generic AI Tools</th>
              <th className="p-4 text-lg font-semibold">Kora Companions</th>
            </tr>
          </thead>

          {/* Updated table rows below */}
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">Generic tone generation</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">✅</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">❌</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">Brand voice mirroring</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">In-session memory (keeps context while you work)</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">⚠️</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">Specialized for marketing, pricing, and building</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">Emotional UX cues (asks before it answers)</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">Output formatted into scrolls ready to use</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">Built from lived founder experience</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">Human-like rituals for focus + flow</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}