import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-center px-6 space-y-6">
      <div className="text-6xl">🌀</div>
      <h1 className="text-3xl text-amber-600 font-semibold">This path hasn’t been drawn yet.</h1>
      <p className="text-gray-700 dark:text-gray-200 font-serif">You’ve reached a quiet clearing. Return when the way reveals itself.</p>
      <Link href="/" className="text-indigo-600 hover:underline">Return Home</Link>
    </main>
  );
}
