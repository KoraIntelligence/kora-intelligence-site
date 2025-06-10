import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import SuggestedCompanions, { CompanionSuggestion } from '@/components/engine/SuggestedCompanions';
import { companions } from '@/data/companions';

export default function CompanionEngine() {
  const [showChoice, setShowChoice] = useState(false);
  const [beginFullRitual, setBeginFullRitual] = useState(false);
  const [formData, setFormData] = useState({
    journey: '',
    need: '',
    feel: ''
  });
  const [suggestedCompanions, setSuggestedCompanions] = useState<CompanionSuggestion[]>([]);
  const [revealedAt, setRevealedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const companionMap: Record<string, string[]> = {
    funding: ['ccc', 'pathbreaker'],
    tone: ['whisperer', 'fmc'],
    clarity: ['cartographer', 'builder'],
    vision: ['dreamer'],
    frontend: ['builder']
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendToWebhook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://koraintelligence.app.n8n.cloud/webhook/companion-invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q1: formData.journey,
          q2: formData.need,
          q3: formData.feel
        })
      });
      const data = await res.json();
      setWhisper(data.response?.whisper || 'No whisper returned.');
    } catch (err) {
      console.error(err);
      setError('Something went wrong retrieving the whisper.');
    } finally {
      setLoading(false);
    }
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

      <main className="min-h-screen w-full bg-gradient-to-br from-green-900 via-white to-amber-100 flex flex-col items-center justify-center p-8 lg:px-16 space-y-8">
        <AnimatePresence>
          {!showChoice && (
            <motion.div
              key="welcome"
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
              <motion.div className="flex flex-col items-center gap-4">
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
              </motion.div>
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
                onClick={() => {
                  const slugs = companionMap[formData.need] || [];
                  const picks = slugs.slice(0, 3).map((slug) => {
                    const c = companions[slug];
                    return {
                      slug: c.slug,
                      title: c.title,
                      glyph: c.glyph,
                      essence: c.essence,
                      outputs: c.services ? c.services.slice(0, 2) : []
                    } as CompanionSuggestion;
                  });
                  setSuggestedCompanions(picks);
                  setRevealedAt(new Date().toLocaleTimeString());
                  sendToWebhook();
                }}
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
            className="bg-amber-50 border border-amber-300 p-6 rounded-lg font-serif text-gray-800 shadow-md prose max-w-3xl mx-auto whitespace-pre-line mt-8"
          >
            {whisper}
          </motion.div>
        )}

        {suggestedCompanions.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 w-full max-w-4xl"
          >
            {revealedAt && (
              <p className="text-center text-sm text-gray-600 mb-4">
                Companions revealed at: {revealedAt}
              </p>
            )}
            <SuggestedCompanions companions={suggestedCompanions} />
          </motion.section>
        )}
      </main>
    </>
  );
}