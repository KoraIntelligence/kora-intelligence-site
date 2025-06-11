import { useState } from 'react';
import { ritualPrompts } from '@/data/ritualPrompts';
import { Companion } from '@/data/companions';

interface CompanionRitualProps {
  companion: Companion;
}

export default function CompanionRitual({ companion }: CompanionRitualProps) {
  const prompts = ritualPrompts[companion.slug] || [];

  const initialForm: Record<string, string> = {};
  prompts.forEach((_, idx) => {
    initialForm[`q${idx + 1}`] = '';
  });

  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [loading, setLoading] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWhisper(null);
    try {
      const res = await fetch(
        `https://koraintelligence.app.n8n.cloud/webhook/companion-invoke/${companion.slug}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        let message = `Ritual failed (${res.status})`;
        if (res.status === 400) {
          message = 'Some responses were incomplete. Please revise.';
        } else if (res.status >= 500) {
          message = 'The spirits misfired. Please try again later.';
        }
        setError(message);
        return;
      }

      const data = await res.json();
      setWhisper(typeof data.whisper === 'string' ? data.whisper : String(data));
    } catch (err) {
      console.error(err);
      setError('A network error disturbed the ritual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4 mt-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        {prompts.map((prompt, idx) => (
          <label key={idx} className="block font-serif text-sm text-gray-700">
            {prompt}
            <input
              type="text"
              name={`q${idx + 1}`}
              value={form[`q${idx + 1}`]}
              onChange={handleChange}
              placeholder={prompt}
              className="transition-all duration-300 mt-1 w-full border border-amber-300 rounded px-3 py-2 bg-white shadow-inner placeholder-opacity-0 focus:placeholder-opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
              disabled={loading}
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 active:bg-amber-800 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {loading ? 'Listening...' : 'Whisper'}
        </button>
      </form>

      {error && (
        <div className="text-red-600 font-serif space-y-2">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="underline text-sm hover:text-red-700"
          >
            Try Again →
          </button>
        </div>
      )}

      {whisper && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 font-serif italic shadow-inner rounded">
          {whisper}
        </div>
      )}
    </section>
  );
}
