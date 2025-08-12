import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Define message type
export type Message = {
  id: number;
  sender: 'user' | 'companion' | 'system';
  content: string;
  timestamp: string;
};

// Define props for CompanionChat component
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!persistentCTA);
  const [generatedImage, setGeneratedImage] = useState<{ url: string; prompt: string } | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const access = Cookies.get('sohbat_access');
    if (access) setIsLoggedIn(true);
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

  useEffect(scrollToBottom, [messages]);

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
      { id: Date.now() + 0.5, sender: 'system', content: 'Summoning reply...', timestamp },
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

      if (res.ok) {
        replyText = data.reply;
        if (data.imageUrl && data.promptUsed) {
          setGeneratedImage({ url: data.imageUrl, prompt: data.promptUsed });
        } else {
          setGeneratedImage(null);
        }
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
            { id: Date.now() + 1, sender: 'companion', content: replyText, timestamp: new Date().toLocaleTimeString() },
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

      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== 'system'),
        { id: Date.now() + 1, sender: 'companion', content: replyText, timestamp: new Date().toLocaleTimeString() },
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

  // Show gate if not logged in
  if (!isLoggedIn) {
    return <div>/* Gate UI remains unchanged */</div>;
  }

  return <div>/* Chat UI remains unchanged */</div>;
}