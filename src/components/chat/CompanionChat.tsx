import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';

interface Message {
  id: number;
  sender: 'user' | 'companion' | 'system';
  content: string;
  timestamp: string;
}

interface CompanionChatProps {
  companionSlug: string;
  title?: string;
  apiPath: string;
  persistentCTA?: boolean;
}

export default function CompanionChat({
  companionSlug,
  title,
  apiPath,
  persistentCTA = false,
}: CompanionChatProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isOpen, setIsOpen] = useState(!persistentCTA);
  const [generatedImage, setGeneratedImage] = useState<null | {
    url: string;
    prompt: string;
  }>(null);
  const [imageCount, setImageCount] = useState(0);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const access = Cookies.get('sohbat_access');
    if (access) {
      setIsLoggedIn(true);
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
        alert('Session start failed.');
      }
    } else {
      alert('Invalid email or promo code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: Message = { id: Date.now(), sender: 'user', content: input, timestamp };
    setMessages((prev) => [...prev, userMsg, {
      id: Date.now() + 1,
      sender: 'system',
      content: 'Summoning reply...',
      timestamp
    }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      let replyText = res.ok ? data.reply : '⚠️ The Companion fell silent. Please try again.';

      if (data.tool_call === 'generate_image' && data.tool_args?.prompt) {
        if (imageCount >= 3) {
          replyText += '\n(⚠️ Image limit reached for this session)';
        } else {
          const imgRes = await fetch('/api/images/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: data.tool_args.prompt,
              size: data.tool_args.size || '512x512',
              styleHints: data.tool_args.styleHints || [],
            }),
          });
          const imgData = await imgRes.json();
          setGeneratedImage({ url: imgData.imageUrl, prompt: imgData.promptUsed });
          setImageCount((count) => count + 1);

          setMessages((prev) => [
            ...prev.filter((m) => m.sender !== 'system'),
            { id: Date.now() + 1, sender: 'companion', content: replyText, timestamp: new Date().toLocaleTimeString() },
            {
              id: Date.now() + 2,
              sender: 'companion',
              content: `🖼️ Image generated: ${imgData.promptUsed}\n\n![Generated Image](${imgData.imageUrl})`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
          return;
        }
      }

      setGeneratedImage(null);
      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== 'system'),
        { id: Date.now() + 1, sender: 'companion', content: replyText, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (err) {
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

  if (!isLoggedIn) {
    return (
      <div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Promo" />
        <button onClick={handleLogin}>Enter Sohbat →</button>
      </div>
    );
  }

  return (
    <div>
      <div ref={chatContainerRef} style={{ height: '400px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {generatedImage && (
        <div>
          <h4>🎨 AI Image</h4>
          <img src={generatedImage.url} alt="Generated" style={{ width: '100%' }} />
          <p>Prompt: {generatedImage.prompt}</p>
          <a href={generatedImage.url} download>Download</a>
          <button onClick={() => setGeneratedImage(null)}>Clear</button>
          <button disabled>Use in document (coming soon)</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type..." disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? 'Summoning...' : 'Send'}</button>
      </form>

      <p>🖼️ Image slots remaining: {3 - imageCount}</p>
    </div>
  );
}
