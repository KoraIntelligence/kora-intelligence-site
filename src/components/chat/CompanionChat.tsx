import { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  sender: 'user' | 'companion';
  content: string;
  timestamp: string;
};

interface CompanionChatProps {
  companionSlug: string; // e.g., 'ccc', 'fmc'
  title?: string;
  apiPath: string; // e.g., '/api/summon/salar'
}

export default function CompanionChat({ companionSlug, title, apiPath }: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 250); // Slight delay for fluid UX
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: input,
      timestamp
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      const responseText = res.ok ? data.reply : '⚠️ The Companion fell silent. Please try again.';
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'companion',
          content: responseText,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
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
    <div className="bg-white/90 rounded-xl shadow-lg p-6 space-y-4 max-w-3xl mx-auto border border-amber-300">
      {title && (
        <h2 className="text-center text-xl font-serif text-amber-700">
          Speak with {title}
        </h2>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-3 p-3 border rounded bg-white/80">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm font-serif p-2 rounded-lg whitespace-pre-wrap ${
              msg.sender === 'user'
                ? 'bg-amber-100 text-right'
                : 'bg-amber-50 text-left border-l-4 border-amber-400'
            }`}
          >
            <p>{msg.content}</p>
            <span className="block text-gray-500 text-xs mt-1">
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your whisper..."
          className="flex-1 px-4 py-2 border rounded shadow-inner"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 transition"
        >
          {loading ? 'Summoning...' : 'Send'}
        </button>
      </form>
    </div>
  );
}