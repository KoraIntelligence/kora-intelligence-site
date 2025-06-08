import { useState } from 'react';

export type CompanionInvocationProps = {
  companionSlug: string;
  companionTitle: string;
  webhookUrl: string;
  questions: string[];
};

export default function CompanionInvocation({
  companionSlug,
  companionTitle,
  webhookUrl,
  questions
}: CompanionInvocationProps) {
  const initialForm: Record<string, string> = {};
  questions.forEach((_, idx) => {
    initialForm[`q${idx + 1}`] = '';
  });

  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [loading, setLoading] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setWhisper(null);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setWhisper(typeof data.whisper === 'string' ? data.whisper : String(data));
    } catch (err) {
      console.error('Invocation failed', err);
      setWhisper('Unable to receive whisper.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 bg-white p-6 rounded-md shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question, idx) => (
          <label key={idx} className="block font-semibold text-gray-700 mb-1">
            {question}
            <input
              type="text"
              name={`q${idx + 1}`}
              value={form[`q${idx + 1}`]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md shadow-sm"
              disabled={loading}
              required
            />
          </label>
        ))}
        <button
          type="submit"
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
          disabled={loading}
        >
          {loading ? 'Listening...' : 'Receive Whisper'}
        </button>
      </form>

      {whisper && (
        <div className="bg-amber-50 p-4 rounded-md font-serif whitespace-pre-wrap">
          <p>{whisper}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
            >
              Copy
            </button>
            <button
              type="button"
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
