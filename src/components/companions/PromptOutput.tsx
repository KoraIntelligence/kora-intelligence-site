import { useEffect, useState } from 'react';

export default function PromptOutput({ whisper, timestamp }: { whisper: string; timestamp?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);
  return (
    <div
      className={`mt-6 p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900 rounded-md shadow-inner text-gray-900 dark:text-gray-100 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <p className="whitespace-pre-line">{whisper}</p>
      {timestamp && (
        <p className="text-sm text-right mt-2 text-gray-600 dark:text-gray-400">{timestamp}</p>
      )}
      <p className="text-sm italic text-center mt-1 text-gray-700 dark:text-gray-300">
        Companion FMC has spoken.
      </p>
    </div>
  );
}
