import Head from "next/head";
import dynamic from "next/dynamic";
import { useSession } from "@supabase/auth-helpers-react";
import AuthPanel from "@/components/AuthPanel";

// Dynamically import to avoid SSR issues
const CompanionChatUnified = dynamic(
  () => import("@/components/chat/CompanionChatUnified"),
  { ssr: false }
);

export default function UnifiedChatPage() {
  const session = useSession();

  const mockCompanion = {
    slug: "fmc",
    title: "Full Spectrum Marketing Companion",
    tagline: "From blank page to brand clarity — in your voice.",
  };

  return (
    <>
      <Head>
        <title>Unified Chat | Kora Intelligence</title>
        <meta
          name="description"
          content="Pilot testing of the unified Kora Companion chat environment."
        />
      </Head>

      {/* If not signed in, show AuthPanel */}
      {!session ? (
        <AuthPanel />
      ) : (
        <main className="min-h-screen bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold mb-6 text-amber-600">
              Unified Chat Environment
            </h1>
            <p className="text-gray-500 mb-8">
              You’re signed in as{" "}
              <span className="text-amber-700 font-medium">
                {session.user?.email}
              </span>
              . Your interactions are now being tracked for this pilot.
            </p>

            <CompanionChatUnified />
          </div>
        </main>
      )}
    </>
  );
}