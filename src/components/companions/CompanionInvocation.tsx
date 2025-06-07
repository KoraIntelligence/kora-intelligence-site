import { useState } from 'react';

export default function CompanionInvocation() {
  const [form, setForm] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ whisper: string; timestamp: string } | null>(null);

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
        'https://koraintelligence.app.n8n.cloud/webhook/companion-invoke/fmc',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form })
        }
      );
      const data = await res.json();
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
        {['q1', 'q2', 'q3', 'q4', 'q5'].map((key, index) => {
          const prompts = [
            "What is your venture called, and what does it do at its core?",
            "Why did you start this work — what pain or longing drove it?",
            "Who is this for — and what do they hope to feel or solve?",
            "What challenges are you facing now in how you express or share this?",
            "In one sentence, how do you want your work to feel when someone encounters it?"
          ];
          return (
            <label key={key} className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
              {prompts[index]}
              <input
                type="text"
                name={key}
                value={form[key as keyof typeof form]}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring disabled:opacity-50"
                disabled={loading}
                required
              />
            </label>
          );
        })}
        <button
          type="submit"
          className="w-full py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Listening...' : 'Receive Whisper'}
        </button>
      </form>

      {response?.whisper && (
        <div className="whisper-output rounded-xl mt-6 p-4 bg-amber-50 border border-amber-200 text-slate-800 space-y-2 shadow-sm">
          <p className="text-md whitespace-pre-line leading-relaxed">{response.whisper}</p>
          <p className="text-xs text-gray-500">
            Companion FMC has spoken at{' '}
            {response.timestamp
              ? new Date(response.timestamp).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              : 'an unknown moment'}
            .
          </p>
        </div>
      )}
    </div>
  );
}
