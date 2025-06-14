import { motion } from 'framer-motion';

export type CompanionSuggestion = {
  slug: string;
  title: string;
  glyph: string; // This is now treated as an image path
  essence: string;
  outputs: string[];
};

export default function SuggestedCompanions({ companions }: { companions: CompanionSuggestion[] }) {
  return (
    <section className="space-y-6 mt-8">
      <h3 className="text-2xl font-serif text-center text-amber-700">
        These Companions have answered your call
      </h3>

      <div className="grid gap-6 sm:grid-cols-2">
        {companions.map((companion, idx) => (
          <motion.div
            key={companion.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * (idx + 1), type: 'tween' }}
            className="rounded-xl shadow-md bg-white p-6 text-center space-y-3 border border-amber-200 hover:shadow-lg transition"
          >
            <img
              src={`/assets/glyphs/glyph-${companion.slug}.png`}
              alt={`${companion.title} glyph`}
              className="mx-auto h-12 w-12 opacity-90"
            />
            <h4 className="text-xl font-semibold">{companion.title}</h4>
            <p className="text-sm italic text-gray-600">{companion.essence}</p>

            <div className="flex justify-center gap-2 flex-wrap mt-2">
              {companion.outputs.map((output, oidx) => (
                <span
                  key={oidx}
                  className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full"
                >
                  {output}
                </span>
              ))}
            </div>

            <details className="text-left text-sm mt-4">
              <summary className="cursor-pointer text-amber-700 font-medium">See Ritual Outputs</summary>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-700">
                {companion.outputs.map((o, oidx) => (
                  <li key={oidx}>{o}</li>
                ))}
              </ul>
            </details>

            <a
              href={`/companions/${companion.slug}`}
              className="inline-block mt-4 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
            >
              Invoke Companion →
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
