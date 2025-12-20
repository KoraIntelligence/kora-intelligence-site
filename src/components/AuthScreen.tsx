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
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-md p-8 max-w-md w-full space-y-6">
        <h1 className="text-2xl font-semibold text-center text-amber-700">
          Welcome to Kora Intelligence
        </h1>

        {/* PROMO CODE */}
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          required
          placeholder="Promo code"
          className="w-full border rounded-md p-2"
        />

        {/* GOOGLE */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-200 rounded-lg py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
        >
          <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="text-center text-gray-400 text-sm">or</div>

        {/* MAGIC LINK */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Your email"
            className="w-full border rounded-md p-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 rounded-md"
          >
            {loading ? "Sending…" : "Send Magic Link"}
          </button>
        </form>

        {/* GUEST */}
        <div className="text-center">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="text-sm underline"
          >
            Continue as Guest
          </button>
        </div>

        {message && <p className="text-center text-sm">{message}</p>}
      </div>
    </main>
  );
}