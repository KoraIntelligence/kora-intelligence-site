import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import SuggestedCompanions, { CompanionSuggestion } from '@/components/engine/SuggestedCompanions';

export default function CompanionEngine() {
  const [showChoice, setShowChoice] = useState(false);
  const [beginFullRitual, setBeginFullRitual] = useState(false);
  const [formData, setFormData] = useState({
    journey: '',
    need: '',
    feel: ''
  });
  const [suggestedCompanions, setSuggestedCompanions] = useState<CompanionSuggestion[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Head>
        <title>The Companion Engine – Kainat OS (Early Ritual Prototype)</title>
        <meta
          name="description"
          content="Enter the divining pool. Begin your ritual. The Companion Engine offers soft triage and soul-aligned guidance, powered by Kainat OS."
        />
      </Head>

      <main className="min-h-screen w-full bg-gradient-to-br from-green-900 via-white to-amber-100 flex items-center justify-center p-8 lg:px-16">
        <AnimatePresence>
          {!showChoice && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full text-center space-y-6 px-6 py-20"
            >
              <p className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-800 leading-relaxed max-w-4xl">
                “Each portal entry is a breath.”<br />
                “Each output is a whisper.”<br />
                “Each Companion is a mirror.”
              </p>
              <motion.button
                onClick={() => setShowChoice(true)}
                className="bg-amber-600 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:bg-amber-700 transition"
                whileHover={{ scale: 1.05 }}
              >
                Begin My Ritual →
              </motion.button>
            </motion.div>
          )}

          {beginFullRitual && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white/90 p-6 rounded-xl shadow-lg max-w-xl w-full space-y-6"
            >
              <h2 className="text-2xl font-semibold text-amber-700 font-serif text-center">Ritual Intake</h2>

              <label className="block text-gray-700 text-sm font-medium">
                Where are you in your journey?
                <input
                  type="text"
                  name="journey"
                  value={formData.journey}
                  onChange={handleChange}
                  placeholder="e.g., About to launch, feeling stuck..."
                  className="mt-1 w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring"
                />
              </label>

              <label className="block text-gray-700 text-sm font-medium">
                What do you most need help with?
                <select
                  name="need"
                  value={formData.need}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded border border-gray-300"
                >
                  <option value="">Select one</option>
                  <option value="funding">Funding Strategy</option>
                  <option value="tone">Brand Tone</option>
                  <option value="clarity">Structural Clarity</option>
                  <option value="vision">Vision Work</option>
                  <option value="frontend">Interface/UX</option>
                </select>
              </label>

              <label className="block text-gray-700 text-sm font-medium">
                How do you want to feel at the end?
                <input
                  type="text"
                  name="feel"
                  value={formData.feel}
                  onChange={handleChange}
                  placeholder="e.g., Clear, Rooted, Seen..."
                  className="mt-1 w-full px-4 py-2 rounded border border-gray-300"
                />
              </label>

              <motion.button
                onClick={() =>
                  setSuggestedCompanions([
                    {
                      slug: 'ccc',
                      title: 'CCC',
                      glyph: '🧱',
                      essence: 'Commercial Mirror. Grant Deck Guide.',
                      outputs: ['Grant Deck', 'Pricing Scroll']
                    },
                    {
                      slug: 'whisperer',
                      title: 'The Whisperer',
                      glyph: '🌀',
                      essence: 'Listens into emotional tone.',
                      outputs: ['Tone Audit', 'Whisper Codex']
                    }
                  ])
                }
                className="bg-amber-700 text-white font-semibold px-5 py-2 rounded-md hover:bg-amber-800 transition w-full"
              >
                Reflect and Continue →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {suggestedCompanions.length > 0 && (
          <section className="mt-12 w-full max-w-4xl">
            <SuggestedCompanions companions={suggestedCompanions} />
          </section>
        )}
      </main>
    </>
  );
}