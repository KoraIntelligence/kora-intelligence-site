import Head from "next/head";
import dynamic from "next/dynamic";

// Import the unified chat dynamically (avoids any SSR issues)
const CompanionChatUnified = dynamic(
  () => import("@/components/chat/CompanionChatUnified"),
  { ssr: false }
);

export default function UnifiedChatTest() {
  const mockCompanion = {
    slug: "fmc",
    title: "Full Spectrum Marketing Companion",
    tagline: "From blank page to brand clarity — in your voice.",
  };

  return (
    <>
      <Head>
        <title>Unified Chat Test | Kora Intelligence</title>
      </Head>

      <main className="min-h-screen bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6 text-amber-600">
            Unified Chat Playground
          </h1>
          <p className="text-gray-500 mb-8">
            This page is for internal pilot testing only.
          </p>

          <CompanionChatUnified />
        </div>
      </main>
    </>
  );
}