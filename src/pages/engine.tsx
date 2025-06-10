import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CompanionEngine() {
  const [showChoice, setShowChoice] = useState(false);
  const [beginFullRitual, setBeginFullRitual] = useState(false);

  const [formData, setFormData] = useState({
    journey: '',
    need: '',
    feel: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Head>
        <title>Companion Engine – Kora</title>
        <meta name="description" content="Enter the divining pool. Let the Companion Engine guide your next step." />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-green-900 via-white to-amber-100 flex items-center justify-center p-8">
        <AnimatePresence>
          {!showChoice && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 max-w-2xl"
            >
              <p className="text-3xl md:text-4xl font-serif text-gray-800 leading-relaxed">
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

          {showChoice && !beginFullRitual && (
            <motion.div
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 max-w-xl w-full bg-white/80 p-8 rounded-lg shadow-md"
            >
              <p className="text-xl font-serif text-gray-700">
                Not all paths begin the same way.<br />Choose the doorway that feels most alive today:
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-2">
                <button
                  onClick={() => setBeginFullRitual(true)}
                  className="bg-green-700 text-white font-semibold px-6 py-3 rounded hover:bg-green-800 transition"
                >
                  ✦ Begin Full Ritual
                </button>
                <Link
                  href="/companions"
                  className="bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded hover:bg-gray-300 transition text-center"
                >
                  ⟡ Go Straight to Companions
                </Link>
              </div>
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
                onClick={() => alert('Send to n8n webhook →')}
                className="bg-amber-700 text-white font-semibold px-5 py-2 rounded-md hover:bg-amber-800 transition w-full"
              >
                Reflect and Continue →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}