import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const { companionSlug, title, apiPath, persistentCTA = false } = props;
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tone, setTone] = useState('');
  const [memoryCaptured, setMemoryCaptured] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!persistentCTA);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const access = Cookies.get('sohbat_access');
    if (access) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    const promoValid = promoCode.trim().toUpperCase() === 'KORA2024';
    const emailValid = email.includes('@') && email.includes('.');

    if (promoValid && emailValid) {
      Cookies.set('sohbat_access', 'true', { expires: 0.125 });
      setIsLoggedIn(true);
      alert('Access granted. Welcome to the Sohbat.');
    } else {
      alert('Invalid email or promo code.');
    }
  };

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
        body: JSON.stringify({
          message: input,
          memory: {
            name,
            role,
            purpose,
            tone,
          },
        }),
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

const handleSaveScroll = async () => {
  if (typeof window === 'undefined' || !chatContainerRef.current) return;

  const messagesDiv = chatContainerRef.current.querySelector('.messages') as HTMLElement;

  if (!messagesDiv) {
    console.error('No .messages element found.');
    return;
  }

  // Save original styles
  const originalHeight = messagesDiv.style.height;
  const originalOverflow = messagesDiv.style.overflow;

  // Expand to full height for snapshot
  messagesDiv.style.height = 'auto';
  messagesDiv.style.overflow = 'visible';

  await new Promise((resolve) => setTimeout(resolve, 100)); // wait for DOM to update

  const canvas = await html2canvas(messagesDiv, {
    scale: 2,
    useCORS: true,
    windowWidth: document.body.scrollWidth,
  });

  // Restore original scroll settings
  messagesDiv.style.height = originalHeight;
  messagesDiv.style.overflow = originalOverflow;

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Add remaining pages
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(`${title || 'Sohbat'}.pdf`);
};

  const handleFeedbackSubmit = () => {
    console.log('Feedback:', feedback);
    alert('Thank you for your feedback!');
    setFeedback('');
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-6 bg-grain dark:bg-dark border border-bronze rounded-lg shadow space-y-4">
        <h2 className="text-xl font-ritual text-dusk dark:text-scroll text-center">
          Sohbat Ritual Gate
        </h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-grove dark:border-bronze"
        />
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Promo Code"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-grove dark:border-bronze"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 transition"
        >
          Enter Sohbat →
        </button>
      </div>
    );
  }

  if (!memoryCaptured) {
    return (
      <div className="max-w-md mx-auto p-6 bg-grain dark:bg-dark border border-bronze rounded-lg shadow space-y-4">
        <h2 className="text-xl font-ritual text-dusk dark:text-scroll text-center">
          Share your whisper's shape
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What is your name?"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-grove dark:border-bronze"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="What role do you hold or seek?"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-grove dark:border-bronze"
        />
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What are you here to explore or build?"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-grove dark:border-bronze"
        />
        <input
          type="text"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="What tone would you like this Companion to adopt?"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:bg-grove dark:border-bronze"
        />
        <button
          onClick={() => setMemoryCaptured(true)}
          className="w-full bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 transition"
        >
          Begin Sohbat →
        </button>
      </div>
    );
  }
    {previewImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
    onClick={() => setPreviewImage(null)}
  >
    <img
      src={previewImage}
      alt="Full"
      className="max-w-[90%] max-h-[90%] rounded shadow-lg border-2 border-white"
    />
  </div>
)}
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
            className="bg-grain dark:bg-grove text-gray-800 dark:text-scroll border border-amber-100 dark:border-bronze rounded-xl shadow-md p-6 space-y-6"
          >
            {title && (
              <h2 className="text-center text-xl font-ritual text-dusk dark:text-scroll">
                Speak with {title}
              </h2>
            )}

            <div className="messages overflow-y-auto space-y-4 p-4 rounded-lg bg-white/80 dark:bg-grove border border-amber-100 dark:border-bronze"
              style={{ height: '450px', scrollBehavior: 'smooth' }}
            >
              {messages.map((msg) =>
                msg.sender === 'system' ? (
                  <p key={msg.id} className="text-xs font-system text-zinc-500 flex items-center gap-1">
                    <Image src="/icons/scroll.svg" alt="scroll" width={16} height={16} />
                    {msg.content}
                  </p>
                ) : (
                  <div key={msg.id}
                    className={`relative p-3 rounded-lg text-sm font-serif whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-amber-100 text-gray-800 text-right dark:bg-amber-200'
                        : 'bg-amber-50 text-left border-l-4 border-amber-400 dark:bg-grove dark:border-bronze dark:text-scroll'
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

{msg.content.includes('http') && (
  <>
    <img
      src={msg.content.trim()}
      alt="Generated"
      onClick={() => setPreviewImage(msg.content.trim())}
      className="cursor-pointer rounded border border-gray-300 shadow max-w-full mt-2"
    />

    {previewImage && (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full shadow-lg">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-2 right-2 text-black text-lg font-bold"
          >
            ✖
          </button>

          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-auto max-h-[80vh] object-contain"
          />

          <a
            href={previewImage}
            download="sohbat-image.png"
            className="block mt-4 text-center bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded transition"
          >
            📥 Download Image
          </a>
        </div>
      </div>
    )}
  </>
)}
                    <span className="block text-xs text-gray-600 dark:text-scroll mt-1">
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
                className="flex-1 px-4 py-2 border rounded shadow-inner bg-white dark:bg-dark dark:text-scroll dark:border-bronze"
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
              <div className="text-center text-xs text-gray-500 dark:text-scroll mt-4">
                Powered by{' '}
                <span className="font-semibold text-amber-700 dark:text-bronze">
                  {title}
                </span>{' '}
                • Companion of the Grove
              </div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-dark border border-amber-100 dark:border-bronze no-print">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-bronze mb-2">
              ✍️ Feedback for this Sohbat
            </h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave your thoughts..."
              rows={2}
              className="w-full p-2 rounded border border-gray-300 dark:border-bronze"
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

