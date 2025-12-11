"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useSupabaseClient,
  useUser,
  useSession,
} from "@supabase/auth-helpers-react";

export default function AuthScreen() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const session = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ----------------------------
  // FIXED REDIRECT LOGIC
  // ----------------------------
  useEffect(() => {
    // Only redirect AFTER supabase has finished loading
    if (session === undefined) return;

    const isGuest = localStorage.getItem("guest_mode") === "true";

    if (session?.user || isGuest) {
      router.push("/mvp");
    }
  }, [session]);

  // ----------------------------
  // MAGIC LINK LOGIN
  // ----------------------------
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage("✅ Magic link sent! Check your inbox.");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error sending magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // GOOGLE SIGN-IN
  // ----------------------------
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Google login error:", err);
      setMessage("⚠️ Google sign-in failed.");
      setLoading(false);
    }
  };

  // ----------------------------
  // GUEST LOGIN
  // ----------------------------
  const handleGuestLogin = () => {
    localStorage.setItem("guest_mode", "true");
    router.push("/mvp");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-[#0d0d0d] transition-colors">
      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-md p-8 max-w-md w-full space-y-6 border border-gray-200 dark:border-gray-800">

        <h1 className="text-2xl font-semibold text-center text-amber-700 dark:text-amber-300">
          Welcome to Kora Intelligence
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Sign in below to start your session with your Companion.
        </p>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 rounded-lg py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
        >
          <img src="/icons/google.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center text-gray-400 text-sm">
          <span className="mx-2">or</span>
        </div>

        {/* MAGIC LINK */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 rounded-md p-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Magic Link"}
          </button>
        </form>

        {/* GUEST LOGIN */}
        <div className="text-center">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="text-sm text-amber-700 dark:text-amber-300 underline hover:text-amber-800"
          >
            Continue as Guest
          </button>
        </div>

        {message && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}