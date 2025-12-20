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
          Generic AI tools generate answers.  
          Kora is built to <span className="font-semibold">do the work with you</span> — using real workflows shaped by lived founder experience.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-lg rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-amber-600 text-white text-left">
              <th className="p-4 text-lg font-semibold">Capability</th>
              <th className="p-4 text-lg font-semibold">Generic AI Tools</th>
              <th className="p-4 text-lg font-semibold">Kora (Salar & Lyra)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Freeform question answering
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">✅</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">✅</td>
            </tr>

            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Guided journeys (workflows) for real business tasks
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>

            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Asks clarifying questions before generating
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">⚠️ Sometimes</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅ By design</td>
            </tr>

            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Built for proposals, pricing, contracts, and campaigns
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌ General-purpose</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅ Domain-specific</td>
            </tr>

            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Output formatted into usable documents
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌ Copy & paste required</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅ DOCX, PDF, XLSX, PNG</td>
            </tr>

            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Remembers context during complex work
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">⚠️ Limited</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅ Session-aware</td>
            </tr>

            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Prompt logic shaped by real founder journeys (workflows)
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅</td>
            </tr>

            <tr>
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                Supports calm, human-paced execution
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">❌ Output-first</td>
              <td className="p-4 text-amber-600 font-semibold dark:text-amber-400">✅ Process-first</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}