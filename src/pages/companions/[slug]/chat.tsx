import { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  sender: 'user' | 'companion';
  content: string;
  timestamp: string;
};

interface CompanionChatProps {
  companionSlug: string;
  title?: string;
  apiPath: string;
}

export default function CompanionChat({ companionSlug, title, apiPath }: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      content: input,
      timestamp
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'companion',
        content: res.ok ? data.reply : '⚠️ The Companion fell silent. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'companion',
          content: '💥 A ritual disruption occurred. Try again soon.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/90 rounded-xl shadow-xl px-8 py-6 max-w-5xl mx-auto border border-amber-300 space-y-6">
      {title && (
        <h2 className="text-center text-2xl font-serif text-amber-700 dark:text-amber-400">
          Speak with {title}
        </h2>
      )}

      <div className="h-[500px] overflow-y-auto space-y-4 p-4 border rounded-lg bg-white/70 dark:bg-zinc-800/70 transition-all">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-3xl px-4 py-3 rounded-lg text-sm font-serif shadow-sm ${
              msg.sender === 'user'
                ? 'ml-auto bg-amber-100 dark:bg-amber-900 text-right'
                : 'mr-auto bg-amber-50 dark:bg-zinc-700 border-l-4 border-amber-400'
            }`}
          >
            <p>{msg.content}</p>
            <div className="text-xs text-gray-500 mt-1">{msg.timestamp}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your whisper..."
          className="flex-1 px-4 py-3 border border-amber-300 dark:border-zinc-600 rounded-lg shadow-inner dark:bg-zinc-800"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-700 text-white px-5 py-2 rounded-lg hover:bg-amber-800 disabled:opacity-50 transition"
        >
          {loading ? 'Listening...' : 'Send'}
        </button>
      </form>
    </div>
  );
}