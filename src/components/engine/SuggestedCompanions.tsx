import { motion } from 'framer-motion';

export type CompanionSuggestion = {
  slug: string;
  title: string;
  glyph: string;
  essence: string;
  outputs: string[];
};

export default function SuggestedCompanions({ companions }: { companions: CompanionSuggestion[] }) {
  return (
    <section className="space-y-6 mt-8">
      <h3 className="text-2xl font-serif text-center text-amber-700">These Companions have answered your call</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        {companions.map((companion) => (
          <motion.div
            key={companion.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 border border-amber-200 bg-white rounded-xl shadow-md space-y-2"
          >
            <div className="text-3xl">{companion.glyph}</div>
            <h4 className="text-lg font-bold text-gray-800">{companion.title}</h4>
            <p className="text-sm text-gray-600">{companion.essence}</p>
            <ul className="text-sm text-gray-700 list-disc ml-5">
              {companion.outputs.map((o, idx) => (
                <li key={idx}>{o}</li>
              ))}
            </ul>
            <a
              href={`/companions/${companion.slug}`}
              className="inline-block mt-2 text-amber-700 font-semibold hover:underline"
            >
              Invoke {companion.title} →
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
