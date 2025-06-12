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

      let data;
      try {
        data = await res.json()
      } catch (jsonErr){
        console.error('Failed to parse JSON:', jsonErr);
        return;
      }

      if (res.ok) {
        setReply(data.reply);
      } else {
        setError(data.error || 'Unknown error occurred while invoking CCC.');
      }
    } catch (err) {
      console.error('Invocation error:', err);
      setError('Something went wrong while invoking CCC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-white/90 rounded-xl max-w-2xl mx-auto space-y-4 shadow-md border border-amber-200">
      <h2 className="text-xl font-serif text-center text-amber-700">Speak with CCC</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Whisper your commercial tension, and let CCC listen..."
          rows={4}
          className="w-full p-3 border border-amber-300 rounded shadow-inner focus:outline-none"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition font-semibold"
        >
          {loading ? 'CCC is listening...' : 'Invoke CCC →'}
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm font-serif italic">{error}</p>
      )}

      {reply && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 italic font-serif rounded shadow">
          <p className="text-gray-800 whitespace-pre-line">{reply}</p>
        </div>
      )}
    </section>
  );
}