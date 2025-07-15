import { useEffect, useState } from 'react';

export default function WhisperOfArrival() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'AI Companions for Founders Who Lead with Clarity'; // SEO-strong version
  const typingSpeed = 100;

  useEffect(() => {
    let index = 0;
    const typeNext = () => {
      setDisplayedText(fullText.slice(0, index + 1));
      index++;
      if (index < fullText.length) {
        setTimeout(typeNext, typingSpeed);
      }
    };
    typeNext();
  }, []);

  return (
    <section
      aria-label="Welcome Invocation for Kora Intelligence"
      className="flex min-h-screen items-center justify-center transition-colors duration-500 px-6 sm:px-12 pt-24 pb-32"
    >
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-center text-gray-700 dark:text-gray-300">
        {displayedText}
        <span
          aria-hidden="true"
          className="animate-pulse ml-1 text-amber-600 dark:text-amber-400"
        >
          .
        </span>
      </h1>
    </section>
  );
}

