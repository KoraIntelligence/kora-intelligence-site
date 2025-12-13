"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";

export default function AuthScreen() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profileEnsured, setProfileEnsured] = useState(false);

  /* ------------------------------------------------------ */
  /* AUTO-REDIRECT — GUEST ONLY (unchanged behaviour)       */
  /* ------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isGuest = localStorage.getItem("guest_mode") === "true";
    if (isGuest) {
      router.push("/mvp");
    }
  }, [router]);

  /* ------------------------------------------------------ */
  /* AUTH FLOW — WAIT FOR PROFILE BEFORE REDIRECT           */
  /* ------------------------------------------------------ */
  useEffect(() => {
    if (!user || profileEnsured) return;

    (async () => {
      try {
        const res = await fetch("/api/user/ensureProfile", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("ensureProfile failed");
        }

        setProfileEnsured(true);
        router.push("/mvp");
      } catch (err) {
        console.error("❌ ensureProfile error:", err);
        setMessage("❌ Failed to finish sign-in. Please retry.");
      }
    })();
  }, [user, profileEnsured, router]);

  /* ------------------------------------------------------ */
  /* MAGIC LINK                                             */
  /* ------------------------------------------------------ */
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;

      setMessage("✅ Magic link sent! Check your inbox.");
    } catch (err: any) {
      console.error("Magic link error:", err);
      setMessage("❌ Error sending magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------ */
  /* GOOGLE OAUTH                                           */
  /* ------------------------------------------------------ */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
      // redirect handled by Supabase → user effect handles the rest
    } catch (err: any) {
      console.error("Google login error:", err);
      setMessage("⚠️ Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  /* ------------------------------------------------------ */
  /* GUEST LOGIN (unchanged)                                */
  /* ------------------------------------------------------ */
  const handleGuestLogin = () => {
    if (typeof window === "undefined") return;
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

        {/* GOOGLE SIGN IN */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 rounded-lg py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
        >
          <img src="/icons/google.svg" className="w-5 h-5" />
          Continue with Google
        </button>

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

        {/* STATUS */}
        {message && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}