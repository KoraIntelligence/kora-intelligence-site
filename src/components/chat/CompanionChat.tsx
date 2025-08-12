import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CompanionChatProps {
  companionSlug: string;
  title?: string;
  apiPath: string;
  persistentCTA?: boolean;
}

type Message = {
  id: number;
  sender: 'user' | 'companion' | 'system';
  content: string;
  timestamp: string;
};

export default function CompanionChat({
  companionSlug,
  title,
  apiPath,
  persistentCTA = false,
}: CompanionChatProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!persistentCTA);
  const [generatedImage, setGeneratedImage] = useState<{ url: string; prompt: string } | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const access = Cookies.get('sohbat_access');
    if (access) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    const promoValid = promoCode.trim().toUpperCase() === 'KORA2024';
    const emailValid = email.includes('@') && email.includes('.');

    if (promoValid && emailValid) {
      try {
        const startSession = await fetch('/api/session/start', { method: 'POST' });
        const { sessionId } = await startSession.json();

        Cookies.set('sohbat_access', 'true', { expires: 0.125 });
        Cookies.set('sohbat_session_id', sessionId);
        setIsLoggedIn(true);
        alert('Access granted. Welcome to the Sohbat.');
      } catch (error) {
        console.error('Session start failed:', error);
        alert('Something went wrong while starting your session.');
      }
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
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      let replyText = '⚠️ The Companion fell silent. Please try again.';

      if (res.status === 429) {
        setRateLimited(true);
        replyText = '⏳ You have reached the rate limit. Please wait before continuing.';
      } else if (res.ok) {
        replyText = data.reply;
        setRateLimited(false);

        if (data.imageUrl && data.promptUsed) {
          setGeneratedImage({ url: data.imageUrl, prompt: data.promptUsed });
        } else {
          setGeneratedImage(null);
        }

        if (data.tool_call === 'generate_image' && data.tool_args?.prompt) {
          try {
            const imageRes = await fetch('/api/images/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: data.tool_args.prompt,
                size: data.tool_args.size || '512x512',
                styleHints: data.tool_args.styleHints || [],
              }),
            });

            const imageData = await imageRes.json();

            setMessages((prev) => [
              ...prev.filter((m) => m.sender !== 'system'),
              {
                id: Date.now() + 1,
                sender: 'companion',
                content: replyText,
                timestamp: new Date().toLocaleTimeString(),
              },
              {
                id: Date.now() + 2,
                sender: 'companion',
                content: `🖼️ Image generated: ${imageData.promptUsed}\n\n![Generated Image](${imageData.imageUrl})`,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
            return;
          } catch (error) {
            console.error('Image generation failed:', error);
          }
        }
      } else {
        setGeneratedImage(null);
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== 'system'),
        {
          id: Date.now() + 1,
          sender: 'companion',
          content: replyText,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== 'system'),
        {
          id: Date.now() + 1,
          sender: 'companion',
          content: '💥 A ritual disruption occurred. Try again soon.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
    setLoading(false);
  };

  const handleSaveScroll = async () => {
    if (typeof window === 'undefined' || !chatContainerRef.current) return;
    const messagesDiv = chatContainerRef.current.querySelector('.messages');
    if (!messagesDiv) return;

    const canvas = await html2canvas(messagesDiv as HTMLElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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

  return (
    <div>
      <div ref={chatContainerRef} className="messages overflow-y-auto max-h-[400px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 my-2 rounded ${msg.sender === 'user' ? 'text-right bg-amber-100' : 'text-left bg-white'}`}>
            <p>{msg.content}</p>
            <p className="text-xs text-gray-400">{msg.timestamp}</p>
          </div>
        ))}
        {generatedImage && (
          <div className="mt-4">
            <p>🎨 Generated Image Prompt: {generatedImage.prompt}</p>
            <img src={generatedImage.url} alt="Generated" className="max-w-full h-auto" />
            <a href={generatedImage.url} download className="text-blue-500 underline text-sm">Download</a>
          </div>
        )}
        {rateLimited && <p className="text-red-500 text-sm mt-2">Rate limit reached. Try again later.</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 border p-2 rounded"
          placeholder="Type your whisper..."
        />
        <button disabled={loading} className="bg-amber-700 text-white px-4 py-2 rounded">
          {loading ? 'Summoning...' : 'Send'}
        </button>
      </form>

      <button onClick={handleSaveScroll} className="mt-4 text-blue-600 underline">📜 Save this Sohbat as a Scroll</button>

      <div className="mt-4">
        <h3 className="text-sm font-bold">✍️ Feedback for this Sohbat</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Leave your thoughts..."
          rows={2}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleFeedbackSubmit}
          className="mt-2 bg-amber-700 text-white px-4 py-1 rounded"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
