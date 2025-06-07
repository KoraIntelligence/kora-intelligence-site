// src/components/home/WhisperOfArrival.tsx

export default function WhisperOfArrival() {
  return (
    <section
      aria-label="Welcome Invocation"
      className="flex min-h-screen items-center justify-center transition-colors duration-500 px-6 sm:px-12 pt-24 pb-32"
    >
      <div className="bg-white text-black dark:bg-zinc-900 dark:text-white p-8 rounded-md">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-center">
          Welcome, Seeker. Kora is listening.
        </h1>
      </div>
    </section>
  );
}
