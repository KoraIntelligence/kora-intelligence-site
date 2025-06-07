import { useState } from 'react';

export default function CompanionInvocationCCC() {
  const [form, setForm] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ whisper: any; timestamp: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Submitting CCC form...");
    setLoading(true);
    try {
      const res = await fetch(
        'https://koraintelligence.app.n8n.cloud/webhook/companion-invoke/ccc',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form })
        }
      );
      const raw = await res.json();
      const data = Array.isArray(raw) ? raw[0] : raw;
      console.log("Resolved CCC whisper data:", data);
      setResponse(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const prompts = [
    "What are you currently offering — and how do people usually hear about it?",
    "How are you pricing — and what part of that feels unclear, unsaid, or unstable?",
    "Have you had to say no to any clients, funders, or partners recently — and why?",
    "Are you applying to or considering a grant, pitch, or procurement call right now?",
    "What’s one moment in your commercial rhythm that feels consistently uneasy?"
  ];

  const renderWhisper = (whisper: any) => {
    if (typeof whisper === 'string') {
      return <p className="text-md whitespace-pre-line leading-relaxed">{whisper}</p>;
    }
    if (typeof whisper === 'object' && whisper !== null) {
      return (
        <div className="space-y-4">
          {Object.entries(whisper).map(([key, value], i) => (
            <div key={i}>
              <p className="font-semibold text-md text-purple-900 uppercase tracking-wide">{key}</p>
              <p className="text-sm text-slate-900 whitespace-pre-line mt-1">
                {Array.isArray(value)
                  ? value.join('\n')
                  : typeof value === 'object' && value !== null
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return <p className="italic text-sm text-gray-500">No valid whisper received.</p>;
  };

  return (
    <div className="max-w-md mx-auto space-y-4" aria-label="CCC prompt form">
      {['q1', 'q2', 'q3', 'q4', 'q5'].map((key, index) => (
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
      ))}
      <button
        onClick={handleSubmit}
        className="w-full py-2 bg-purple-700 text-white font-semibold rounded hover:bg-purple-800 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Listening...' : 'Receive Whisper'}
      </button>

      {response && response.whisper && (
        <div className="whisper-scroll bg-[url('/scroll-bg.png')] bg-cover border-double border-4 border-purple-900 rounded-xl mt-6 p-6 text-slate-800 space-y-4 shadow-lg">
          {renderWhisper(response.whisper)}
          <p className="text-xs text-purple-700 pt-2 border-t border-purple-300 mt-4">
            Companion CCC has spoken at{' '}
            {response.timestamp
              ? new Date(response.timestamp).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              : 'an unknown time'}
            .
          </p>
        </div>
      )}
    </div>
  );
}
      