"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function AuthScreen() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* ------------------------------------------------------ */
  /* AUTO-REDIRECT — GUEST ONLY (ALLOWED)                    */
  /* ------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      localStorage.getItem("guest_mode") === "true" &&
      localStorage.getItem("promo_ok") === "true"
    ) {
      router.replace("/mvp");
    }
  }, [router]);

  /* ------------------------------------------------------ */
  /* PROMO CODE VALIDATION                                  */
  /* ------------------------------------------------------ */
  const validatePromo = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setMessage("❌ Invalid promo code.");
        return false;
      }

      localStorage.setItem("promo_ok", "true");
      return true;
    } catch (err) {
      console.error("Promo validation error:", err);
      setMessage("❌ Failed to validate promo code.");
      return false;
    }
  };

  /* ------------------------------------------------------ */
  /* MAGIC LINK                                             */
  /* ------------------------------------------------------ */
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!(await validatePromo())) {
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage("✅ Magic link sent! Check your inbox.");
    } catch (err) {
      console.error("Magic link error:", err);
      setMessage("❌ Failed to send magic link.");
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

    if (!(await validatePromo())) {
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // Supabase handles redirect
    } catch (err) {
      console.error("Google login error:", err);
      setMessage("❌ Google sign-in failed.");
      setLoading(false);
    }
  };

  /* ------------------------------------------------------ */
  /* GUEST LOGIN                                            */
  /* ------------------------------------------------------ */
  const handleGuestLogin = async () => {
    setLoading(true);
    setMessage(null);

    if (!(await validatePromo())) {
      setLoading(false);
      return;
    }

    localStorage.setItem("guest_mode", "true");
    router.replace("/mvp");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#171717]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-yellow-500/5 blur-3xl" />
      </div>

      <div className="relative bg-[#171717] border border-neutral-800 rounded-2xl p-8 max-w-md w-full space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-gray-100">
            Welcome to Kora Intelligence
          </h1>
          <p className="text-xs text-gray-500">Early access · Promo code required</p>
        </div>

        {/* PROMO CODE */}
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          required
          placeholder="Promo code"
          className="w-full bg-[#222222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-yellow-500/50 transition-colors"
        />

        {/* GOOGLE */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 border border-neutral-700 bg-[#222222] text-gray-300 rounded-lg py-2.5 text-sm hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
        >
          <img src="/icons/google.svg" alt="Google" className="w-4 h-4" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* MAGIC LINK */}
        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Your email"
            className="w-full bg-[#222222] border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Magic Link"}
          </button>
        </form>

        {/* GUEST */}
        <div className="text-center">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors"
          >
            Continue as Guest
          </button>
        </div>

        {message && (
          <p className="text-center text-xs text-gray-400">{message}</p>
        )}
      </div>
    </main>
  );
}