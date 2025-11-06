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

// 🚪 Clean, complete logout
const handleLogout = async () => {
  try {
    const isGuest = localStorage.getItem("guest_mode") === "true";

    if (isGuest) {
      localStorage.removeItem("guest_mode");
    } else {
      // Clears every active Supabase session (all tabs, all scopes)
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
    }

    // Purge any residual app data
    localStorage.clear();
    sessionStorage.clear();

    // Remove any lingering auth cookies (cross-domain safe)
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    });

    // Force a full reload so Supabase re-hydrates cleanly
    window.location.replace("/auth");
  } catch (err: any) {
    console.error("Logout error:", err.message);
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