import { useEffect, useState } from 'react';

export default function WhisperOfArrival() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText =
    'AI Companions for Founders Who Think in Feelings and Function'; // Pivoted positioning
  const typingSpeed = 80;

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
      className="flex flex-col min-h-screen items-center justify-center text-center transition-colors duration-500 px-6 sm:px-12 pt-24 pb-32"
    >
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
        {displayedText}
        <span
          aria-hidden="true"
          className="animate-pulse ml-1 text-amber-600 dark:text-amber-400"
        >
          .
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
        Faster than an agency. More human than a prompt. <br />
        Kora helps you write, price, and build — with tone and soul.
      </p>

      <div className="mt-10">
        <a
          href="#companions"
          className="px-6 py-3 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 transition-colors duration-300 shadow-lg"
        >
          Try a Companion →
        </a>
      </div>
    </section>
  );
}

