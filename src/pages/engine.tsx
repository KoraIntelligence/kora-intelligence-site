import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import SuggestedCompanions, { CompanionSuggestion } from '@/components/engine/SuggestedCompanions';
import { companions } from '@/data/companions';

export default function CompanionEngine() {
  const [showChoice, setShowChoice] = useState(false);
  const [formData, setFormData] = useState({
    journey: '',
    need: [] as string[],
    feel: ''
  });
  const [suggestedCompanions, setSuggestedCompanions] = useState<CompanionSuggestion[]>([]);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [matchedSlugs, setMatchedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, options } = e.target as HTMLSelectElement;
    if (name === 'need') {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setFormData(prev => ({ ...prev, need: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const sendToKainat = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/kainat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journey: formData.journey,
          support: formData.need,
          feeling: formData.feel
        })
      });

      const data = await res.json();
      const scroll = data.scroll || 'No scroll returned.';
      setWhisper(scroll);

      // Match any companions mentioned in the scroll
      const mentioned = Object.values(companions).filter(c =>
        scroll.toLowerCase().includes(c.title.toLowerCase())
      ).map(c => c.slug);

      setMatchedSlugs(mentioned);
    } catch (err) {
      console.error(err);
      setError('Something went wrong retrieving the scroll.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    sendToKainat();
  };

  return (
    <>
      <Head>
        <title>The Companion Engine – Kainat OS</title>
        <meta name="description" content="Begin your ritual. The Companion Engine listens through Kainat OS." />
      </Head>

      <main className="min-h-screen w-full bg-gradient-to-br from-green-900 via-white to-amber-100 flex flex-col items-center justify-center p-8 lg:px-16 space-y-8">
        <AnimatePresence>
          {!showChoice && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 max-w-4xl"
            >
              <p className="text-4xl md:text-5xl font-serif text-gray-800 leading-relaxed">
                “Each portal entry is a breath.”<br />
                “Each output is a whisper.”<br />
                “Each Companion is a mirror.”
              </p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setShowChoice(true)}
                  className="bg-amber-600 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:bg-amber-700 transition"
                >
                  Begin My Ritual →
                </button>
                <button
                  onClick={() => window.location.href = '/companions'}
                  className="text-sm text-amber-800 underline"
                >
                  Or skip ritual and browse directly
                </button>
              </div>
            </motion.div>
          )}

          {showChoice && (
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
                  multiple
                  value={formData.need}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded border border-gray-300 h-40"
                >
                  {[
                    "Funding Strategy", "Grant Support", "Pricing Clarity", "Brand Tone", "Structural Clarity",
                    "Vision Work", "Investor Fit / Exit Planning", "Narrative Development", "Storytelling Support",
                    "Proposal Crafting", "Interface/UX", "Dispatch / Zine Creation", "Team Alignment",
                    "Ethical Framing", "Emotional Clarity"
                  ].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
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
                onClick={handleSubmit}
                className="bg-amber-700 text-white font-semibold px-5 py-2 rounded-md hover:bg-amber-800 transition w-full"
              >
                Reflect and Continue →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <p className="text-center text-amber-800 italic mt-6">The Grove is listening...</p>
        )}

        {error && (
          <p className="text-center text-red-600 mt-6">{error}</p>
        )}

        {whisper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-[url('/assets/textures/paper-grain.png')] bg-cover bg-center border border-amber-300 p-8 rounded-lg font-serif text-gray-800 shadow-lg max-w-3xl mx-auto whitespace-pre-wrap mt-8 space-y-4"
          >
            <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100">
              {whisper.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>

            {matchedSlugs.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-medium text-center text-amber-700">Those named in the scroll:</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {matchedSlugs.map(slug => {
                    const c = companions[slug];
                    return (
                      <div key={slug} className="bg-white/90 border border-amber-200 rounded-lg p-4 shadow-md text-center space-y-2">
                        <img src={`/assets/glyphs/glyph-${slug}.png`} alt={`${c.title} glyph`} className="h-12 w-12 mx-auto opacity-90" />
                        <h5 className="text-lg font-semibold">{c.title}</h5>
                        <a
                          href={`/companions/${slug}`}
                          className="inline-block bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded transition"
                        >
                          Meet {c.title}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </>
  );
}