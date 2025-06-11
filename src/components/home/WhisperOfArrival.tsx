import { useEffect, useState } from 'react';

export default function WhisperOfArrival() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Welcome Seeker, Kora is listening';
  const typingSpeed = 100; // ms per character

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) clearInterval(interval);
    }, typingSpeed);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      aria-label="Welcome Invocation"
      className="flex min-h-screen items-center justify-center transition-colors duration-500 px-6 sm:px-12 pt-24 pb-32"
    >
      <div className="bg-white text-black dark:bg-zinc-900 dark:text-white p-8 rounded-md">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-center">
          {displayedText}
          <span className="animate-pulse ml-1">.</span>
        </h1>
      </div>
    </section>
  );
}
