import { motion } from 'framer-motion';

export type CompanionSuggestion = {
  slug: string;
  title: string;
  glyph: string; // Image path segment (e.g. slug)
  essence: string;
  outputs: string[];
};

export default function SuggestedCompanions({ companions }: { companions: CompanionSuggestion[] }) {
  return (
    <section className="space-y-12 mt-16">
      <h3 className="text-2xl font-serif text-center text-amber-700 dark:text-amber-400">
        These Companions have answered your call
      </h3>

      <div className="grid gap-8 sm:grid-cols-2">
        {companions.map((companion, idx) => (
          <motion.div
            key={companion.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 * (idx + 1),
              type: 'tween',
              ease: 'easeOut',
              duration: 0.5,
            }}
            className="rounded-xl shadow-md bg-white/90 dark:bg-zinc-800 p-6 text-center space-y-4 border border-amber-200 dark:border-amber-600 hover:shadow-lg transition"
          >
            <div className="relative w-12 h-12 mx-auto mb-2">
              <img
                src={`/assets/glyphs/glyph-${companion.slug}.png`}
                alt={`${companion.title} glyph`}
                className="h-full w-full object-contain opacity-90 transition duration-200"
              />
              {/* Optional dark mode enhancement: glow */}
              <div className="absolute inset-0 rounded-full blur-sm opacity-10 bg-amber-200 dark:bg-amber-500" />
            </div>

            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{companion.title}</h4>
            <p className="text-sm italic text-gray-600 dark:text-gray-300">{companion.essence}</p>

            {companion.outputs.length > 0 && (
              <>
                <div className="flex justify-center gap-2 flex-wrap mt-2">
                  {companion.outputs.map((output, oidx) => (
                    <span
                      key={oidx}
                      className="bg-amber-100 text-amber-800 dark:bg-amber-200 dark:text-amber-900 text-xs px-3 py-1 rounded-full"
                    >
                      {output}
                    </span>
                  ))}
                </div>

                <details className="text-left text-sm mt-4 transition duration-200">
                  <summary className="cursor-pointer text-amber-700 dark:text-amber-300 font-medium">
                    See Ritual Outputs
                  </summary>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-700 dark:text-gray-200">
                    {companion.outputs.map((o, oidx) => (
                      <li key={oidx}>{o}</li>
                    ))}
                  </ul>
                </details>
              </>
            )}

            <a
              href={`/companions/${companion.slug}`}
              className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded transition"
            >
              Invoke Companion →
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
