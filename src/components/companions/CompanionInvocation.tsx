import { useState } from 'react';
import PromptOutput from './PromptOutput';

type ResponsePayload = {
  whisper: string;
  companion: string;
  timestamp?: string;
};

export default function CompanionInvocation() {
  const [form, setForm] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponsePayload | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        'https://koraintelligence.app.n8n.cloud/webhook/webhook/companion-invoke/fmc',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companion: 'fmc', ...form })
        }
      );
      const data: ResponsePayload = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4" aria-label="FMC prompt form">
        <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
          What is your venture called, and what does it do at its core?
          <input
            type="text"
            name="q1"
            value={form.q1}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring disabled:opacity-50"
            disabled={loading}
            required
          />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
          Why did you start this work — what pain or longing drove it?
          <input
            type="text"
            name="q2"
            value={form.q2}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring disabled:opacity-50"
            disabled={loading}
            required
          />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
          Who is this for — and what do they hope to feel or solve?
          <input
            type="text"
            name="q3"
            value={form.q3}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring disabled:opacity-50"
            disabled={loading}
            required
          />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
          What challenges are you facing now in how you express or share this?
          <input
            type="text"
            name="q4"
            value={form.q4}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring disabled:opacity-50"
            disabled={loading}
            required
          />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
          In one sentence, how do you want your work to feel when someone encounters it?
          <input
            type="text"
            name="q5"
            value={form.q5}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring disabled:opacity-50"
            disabled={loading}
            required
          />
        </label>
        <button
          type="submit"
          className="w-full py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Listening...' : 'Receive Whisper'}
        </button>
      </form>
      {response?.whisper && (
        <PromptOutput whisper={response.whisper} timestamp={response.timestamp} />
      )}
    </div>
  );
}
