import { useEffect, useState } from 'react';

export default function WhisperOfArrival() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Welcome Seeker, Kora is listening';
  const typingSpeed = 100; // Good rhythm

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
      aria-label="Welcome Invocation"
      className="flex min-h-screen items-center justify-center transition-colors duration-500 px-6 sm:px-12 pt-24 pb-32"
    >
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-center text-gray-700 dark:text-gray-300">
        {displayedText}
        <span className="animate-pulse ml-1">.</span>
      </h1>
    </section>
  );
}

