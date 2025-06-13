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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'companion',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } else {
        throw new Error(data.error || 'Companion fell silent.');
      }
    } catch (err) {
      setMessages(prev => [
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
    <div className="bg-white dark:bg-zinc-900/90 rounded-xl shadow-xl p-6 space-y-4 w-full max-w-5xl mx-auto border border-amber-300">
      {title && (
        <h2 className="text-center text-xl font-serif text-amber-700 dark:text-amber-300">
          Speak with {title}
        </h2>
      )}

      <div className="max-h-[600px] overflow-y-auto space-y-3 p-4 border border-amber-100 rounded-lg bg-white/70 dark:bg-zinc-800/60 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm font-serif p-3 rounded-md ${
              msg.sender === 'user'
                ? 'bg-amber-100 text-right'
                : 'bg-amber-50 text-left border-l-4 border-amber-400 dark:bg-zinc-700/50'
            }`}
          >
            <p>{msg.content}</p>
            <span className="block text-gray-500 text-xs mt-1">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your whisper..."
          className="flex-1 px-4 py-3 border border-amber-300 rounded shadow-inner dark:bg-zinc-800 dark:text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-700 text-white px-5 py-2 rounded hover:bg-amber-800 transition"
        >
          {loading ? 'Whispering...' : 'Send'}
        </button>
      </form>
    </div>
  );
}