import React from 'react';
import { MessageCircle, Sparkles, CheckCircle } from 'lucide-react';

export default function CompassFlame() {
  return (
    <section
      id="how-it-works"
      className="pt-24 pb-32 px-6 sm:px-12 text-center bg-gray-50 dark:bg-zinc-900 transition-colors duration-500"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          How Kora Works
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          You don’t need another AI tool. You need a Companion.  
          Every interaction begins as a simple chat - one that listens, remembers, and speaks in your voice.
        </p>

        <div className="grid gap-8 md:grid-cols-3 text-left max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 shadow-md">
            <MessageCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              1. Choose a Companion
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Select Salar or Lyra - each crafted to support a different part of your brand or business.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 shadow-md">
            <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              2. Start a Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Open a chat session and share what you need, from brand copy to pricing clarity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 shadow-md">
            <CheckCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              3. Receive Your Output
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get a copy-ready, tone-aligned response in real time. Whether it’s a launch plan or a pitch draft.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
