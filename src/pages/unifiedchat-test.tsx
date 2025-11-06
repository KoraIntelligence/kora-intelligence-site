import { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

// Dynamically import the unified chat (avoids SSR issues)
const CompanionChatUnified = dynamic(
  () => import("@/components/chat/CompanionChatUnified"),
  { ssr: false }
);

export default function UnifiedChatPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [isGuest, setIsGuest] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🧭 Detect guest mode and handle redirect logic
  useEffect(() => {
    const guestFlag = localStorage.getItem("guest_mode") === "true";
    setIsGuest(guestFlag);

    if (!guestFlag && !session) {
      router.push("/auth");
    }

    setCheckingAuth(false);
  }, [session, router]);

  // 🚪 Logout function (works for both guest + signed-in users)
  const handleLogout = async () => {
    try {
      const isGuest = localStorage.getItem("guest_mode") === "true";

      if (isGuest) {
        localStorage.removeItem("guest_mode");
        localStorage.clear();
      } else {
        await supabase.auth.signOut();
      }

      router.push("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // ⏳ Prevent flicker during session check
  if (checkingAuth) return null;

  return (
    <>
      <Head>
        <title>Unified Chat Environment | Kora Intelligence</title>
        <meta
          name="description"
          content="Pilot testing of the unified Kora Companion chat environment."
        />
      </Head>

      <main className="min-h-screen bg-amber-50 text-gray-800 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 bg-white/70 backdrop-blur-md rounded-xl px-4 py-3 shadow-sm border border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-amber-700">
              Unified Chat Environment
            </h1>
            <p className="text-sm text-gray-600">
              {isGuest ? (
                <>
                  You’re exploring as a{" "}
                  <span className="font-medium text-amber-800">Guest</span>.{" "}
                  <span className="ml-1 text-gray-500">
                    Your chat will reset when you leave this session.
                  </span>
                </>
              ) : (
                <>
                  You’re signed in as{" "}
                  <span className="font-medium text-amber-800">
                    {session?.user?.email}
                  </span>
                  .{" "}
                  <span className="ml-1 text-gray-500">
                    Your interactions are now being tracked for this pilot.
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-md transition"
          >
            Logout
          </button>
        </header>

        {/* Unified Chat */}
        <section className="max-w-4xl mx-auto">
          <CompanionChatUnified />
        </section>
      </main>
    </>
  );
}