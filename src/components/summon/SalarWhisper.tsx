import { useState } from 'react';

export default function SalarWhisper() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReply('');

    try {
      const res = await fetch('/api/summon/salar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setReply(data.reply);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Something went wrong while invoking Salar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-white/80 rounded-xl max-w-2xl mx-auto space-y-4 shadow">
      <h2 className="text-xl font-serif text-amber-700 text-center">Speak to Salar</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Salar something commercial, rhythmic, and true..."
          rows={4}
          className="w-full p-3 border border-amber-300 rounded shadow-inner"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
        >
          {loading ? 'Summoning...' : 'Invoke Salar'}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm font-serif">{error}</p>}

      {reply && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 italic font-serif rounded shadow">
          {reply}
        </div>
      )}
    </section>
  );
}