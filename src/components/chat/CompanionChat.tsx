import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';

type Message = {
  id: number;
  sender: 'user' | 'companion' | 'system';
  content: string;
  timestamp: string;
};

interface CompanionChatProps {
  companionSlug: string;
  title?: string;
  apiPath: string;
  persistentCTA?: boolean; // Floating CTA toggle
}

export default function CompanionChat(props: CompanionChatProps) {
  const {
    companionSlug,
    title,
    apiPath,
    persistentCTA = false,
  } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!persistentCTA);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Gate: 3 hour session cookie
  useEffect(() => {
    if (!Cookies.get('sohbat_access')) {
      Cookies.set('sohbat_access', 'true', { expires: 0.125 }); // ~3 hours
    }
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      content: input,
      timestamp,
    };

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: Date.now() + 0.5,
        sender: 'system',
        content: 'Summoning reply...',
        timestamp,
      },
    ]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const replyText = res.ok
        ? data.reply
        : '⚠️ The Companion fell silent. Please try again.';

      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== 'system'),
        {
          id: Date.now() + 1,
          sender: 'companion',
          content: replyText,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== 'system'),
        {
          id: Date.now() + 1,
          sender: 'companion',
          content: '💥 A ritual disruption occurred. Try again soon.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save Scroll — clean capture, no-print safe
  const handleSaveScroll = async () => {
    if (typeof window === 'undefined' || !chatContainerRef.current) return;

    const html2pdf = (await import('html2pdf.js')).default;

    const container = chatContainerRef.current;
    const originalHeight = container.style.height;
    const originalOverflow = container.style.overflow;

    container.style.height = 'auto';
    container.style.overflow = 'visible';

    html2pdf()
      .from(container)
      .set({
        margin: 0.5,
        filename: `${title || 'Sohbat'}.pdf`,
        html2canvas: {
          scale: 1,
          svgRendering: true,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'portrait',
          font: 'helvetica',
        },
        pagebreak: {
          mode: ['avoid-all'],
          before: '.no-print',
        },
      })
      .save()
      .finally(() => {
        container.style.height = originalHeight;
        container.style.overflow = originalOverflow;
      });
  };

  // ✅ Feedback submit (just logs for now)
  const handleFeedbackSubmit = () => {
    console.log('Feedback:', feedback);
    alert('Thank you for your feedback!');
    setFeedback('');
  };

  return (
    <>
      {persistentCTA && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-full shadow-lg transition no-print"
        >
          Speak with a Companion
        </button>
      )}

      {(!persistentCTA || isOpen) && (
        <div
          className={`${
            persistentCTA
              ? 'fixed bottom-20 right-6 z-50 w-full max-w-md animate-fadeIn'
              : ''
          }`}
        >
          {persistentCTA && (
            <div className="flex justify-end mb-1 no-print">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-amber-500 underline mr-1"
              >
                Close
              </button>
            </div>
          )}

          <div
            ref={chatContainerRef}
            className="bg-gradient-to-br from-white/80 to-amber-50/20 ring-1 ring-amber-100/20 rounded-xl shadow-md p-6 space-y-6"
          >
            {title && (
              <h2 className="text-center text-xl font-ritual text-amber-700 dark:text-amber-400">
                Speak with {title}
              </h2>
            )}

            <div
              className="overflow-y-auto space-y-4 p-4 rounded-lg bg-white/80 dark:bg-zinc-800 border border-amber-100 dark:border-zinc-700"
              style={{ height: '450px', scrollBehavior: 'smooth' }}
            >
              {messages.map((msg) =>
                msg.sender === 'system' ? (
                  <p
                    key={msg.id}
                    className="text-xs font-system text-zinc-500 flex items-center gap-1"
                  >
                    <Image src="/icons/scroll.svg" alt="scroll" width={16} height={16} />
                    {msg.content}
                  </p>
                ) : (
                  <div
                    key={msg.id}
                    className={`relative p-3 rounded-lg text-sm font-serif whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-amber-100 text-gray-800 text-right dark:bg-amber-200'
                        : 'bg-amber-50 text-left border-l-4 border-amber-400 dark:bg-zinc-700 dark:border-amber-500 dark:text-gray-100'
                    }`}
                  >
                    {msg.sender === 'companion' && (
                      <span className="absolute top-1 right-2 opacity-30 dark:opacity-60 filter dark:brightness-150">
                        <img
                          src={`/assets/glyphs/glyph-${companionSlug}.png`}
                          alt={`${companionSlug} glyph`}
                          className="h-12 w-12"
                        />
                      </span>
                    )}
                    <p>{msg.content}</p>
                    <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                )
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 no-print">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your whisper..."
                className="flex-1 px-4 py-2 border rounded shadow-inner bg-white dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
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

            {messages.length > 0 && (
              <button
                onClick={handleSaveScroll}
                className="text-center text-sm text-amber-700 hover:underline mt-4 block no-print"
              >
                📜 Save this Sohbat as a Scroll
              </button>
            )}

            {title && (
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                Powered by{' '}
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {title}
                </span>{' '}
                • Companion of the Grove
              </div>
            )}
          </div>

          {/* ✅ Feedback area outside PDF capture */}
          <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-zinc-800 border border-amber-100 dark:border-zinc-700 no-print">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
              ✍️ Feedback for this Sohbat
            </h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave your thoughts..."
              rows={2}
              className="w-full p-2 rounded border border-gray-300 dark:border-zinc-600"
            />
            <button
              onClick={handleFeedbackSubmit}
              className="mt-2 bg-amber-700 text-white px-4 py-1 rounded hover:bg-amber-800 transition"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </>
  );
}