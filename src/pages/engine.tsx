import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { companions } from '@/data/companions';

export default function CompanionEngine() {
  const [showChoice, setShowChoice] = useState(false);
  const [formData, setFormData] = useState({ journey: '', need: [] as string[], feel: '' });
  const [whisper, setWhisper] = useState<string | null>(null);
  const [matchedSlugs, setMatchedSlugs] = useState<string[]>([]);
  const [primaryCompanion, setPrimaryCompanion] = useState<string | null>(null);
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
          feeling: formData.feel,
        }),
      });

      const data = await res.json();
      const scroll = data.scroll || 'No scroll returned.';
      setWhisper(scroll);

      const mentioned = Object.values(companions)
        .filter(c => scroll.toLowerCase().includes(c.title.toLowerCase()))
        .map(c => c.slug);
      setMatchedSlugs(mentioned);

      const suggestionMatches = [...scroll.matchAll(/Companion Suggested: ([\w\s\-]+)/g)];
      const suggestedTitles = suggestionMatches.map(match => match[1]?.trim().replace(/[^\w\s\-]/g, ''));
      const suggestedSlug = suggestedTitles
        .map(title =>
          Object.values(companions).find(c =>
            title.toLowerCase().includes(c.title.toLowerCase())
          )?.slug
        )
        .find(Boolean);

      setPrimaryCompanion(suggestedSlug || null);
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

      <main className="min-h-screen w-full bg-gradient-to-br from-green-900 via-white to-amber-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 flex flex-col items-center justify-center p-8 lg:px-16 space-y-8">
        <AnimatePresence>
          {!showChoice && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 max-w-4xl"
            >
              <p className="text-4xl md:text-5xl font-serif text-gray-800 dark:text-gray-200 leading-relaxed">
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
                  className="text-sm text-amber-800 dark:text-amber-400 underline"
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
              className="bg-white/90 dark:bg-zinc-800 p-6 rounded-xl shadow-lg max-w-xl w-full space-y-6"
            >
              <h2 className="text-2xl font-semibold text-amber-700 dark:text-amber-400 font-serif text-center">Ritual Intake</h2>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                What do you most need help with?
                <select
                  name="need"
                  multiple
                  value={formData.need}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded border border-gray-300 h-40 dark:bg-zinc-900 dark:border-zinc-600"
                >
                  {[
                    "Funding Clarity and Grant Navigation",
                    "Pricing Confidence & Value Mapping",
                    "Brand Tone & Voice Alignment",
                    "Storytelling & Narrative Craft",
                    "Interface & Ritual Design",
                    "Team Alignment & Structural Clarity",
                    "Emotional Pulse & Reflection",
                    "Strategic Invention & System Architecture"
                  ].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
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

        {loading && <p className="text-center text-amber-800 dark:text-amber-400 italic mt-6">The Grove is listening...</p>}
        {error && <p className="text-center text-red-600 mt-6">{error}</p>}

        {whisper && (
          <div className="max-w-3xl mx-auto mt-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative bg-[url('/assets/textures/parchment-soft.png')] bg-contain bg-top bg-no-repeat border border-amber-200 dark:border-amber-600 p-8 rounded-lg shadow-md font-scroll text-gray-800 dark:text-gray-100 space-y-4"
            >
              {whisper.split('\n').map((line, idx) => {
                const isSuggestion = line.includes('Companion Suggested: ');
                return (
                  <p
                    key={idx}
                    className={
                      isSuggestion
                        ? 'text-lg font-semibold text-amber-700 dark:text-amber-400 mt-4'
                        : idx === 0
                          ? 'text-xl sm:text-2xl font-semibold text-amber-700 dark:text-amber-400 mb-2'
                          : 'italic'
                    }
                  >
                    {line}
                  </p>
                );
              })}

              <div className="mt-8 text-center space-y-4">
                <h4 className="text-lg font-medium text-amber-700 dark:text-amber-400">
                  Your scroll has named the Companions.
                </h4>
                <p className="text-base text-gray-700 dark:text-gray-300 max-w-prose mx-auto italic">
                  Step into the Grove to meet them. Each Companion awaits with a voice and presence of their own.
                </p>
                <a
                  href="/companions"
                  className="inline-block bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-md transition font-medium"
                >
                  Meet the Companions →
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </>
  );
}