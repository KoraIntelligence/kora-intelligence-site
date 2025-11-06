"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";

export default function AuthPanel() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

// 🧭 Redirect if already logged in or guest
useEffect(() => {
  const isGuest = localStorage.getItem("guest_mode") === "true";
  if (user || isGuest) router.push("/unifiedchat-test");
}, [user, router]);

  // ✉️ Magic Link Login
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/unifiedchat-test`,
        },
      });

      if (error) throw error;
      setMessage("✅ Magic link sent! Check your inbox.");
    } catch (err: any) {
      console.error("Magic link error:", err.message);
      setMessage("❌ Error sending magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);

    try {
    const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/unifiedchat-test`,
  },
});

      if (error) throw error;
    } catch (err: any) {
      console.error("Google login error:", err.message);
      setMessage("⚠️ Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  // 👤 Guest Login
  const handleGuestLogin = () => {
    localStorage.setItem("guest_mode", "true");
    router.push("/unifiedchat-test");
  };

// 🚪 Logout
const handleLogout = async () => {
  try {
    const isGuest = localStorage.getItem("guest_mode") === "true";

    if (isGuest) {
      localStorage.removeItem("guest_mode");
      setMessage("👋 Guest session ended.");
    } else {
      // Full Supabase logout for authenticated users
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setMessage("👋 Logged out successfully.");
    }

    // 🔹 Manually clear Supabase cookie to prevent auto-login
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 🔹 Clear all client-side state
    localStorage.clear();
    sessionStorage.clear();

    // 🔹 Redirect to login
    router.push("/auth");
  } catch (err: any) {
    console.error("Logout error:", err.message);
    setMessage("⚠️ Logout failed. Please refresh the page.");
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full space-y-6">
        {!user ? (
          <>
            <h1 className="text-2xl font-semibold text-amber-700 text-center">
              Welcome to Kora Intelligence
            </h1>
            <p className="text-sm text-gray-600 text-center">
              Sign in below to start your session with your Companion.
            </p>

            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
            >
              <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
              <span>Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center text-gray-400 text-sm">
              <span className="mx-2">or</span>
            </div>

            {/* Magic Link */}
            <form onSubmit={handleMagicLink} className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>

            {/* Guest Access */}
            <div className="text-center">
              <button
                onClick={handleGuestLogin}
                disabled={loading}
                className="text-sm text-amber-700 underline hover:text-amber-800"
              >
                Continue as Guest
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Logged-in State */}
            <div className="text-center space-y-3">
              <h2 className="text-lg font-semibold text-amber-700">
                You’re signed in
              </h2>
              <p className="text-sm text-gray-600">
                {user.email ? (
                  <>
                    as <span className="font-medium">{user.email}</span>
                  </>
                ) : (
                  "as a guest user."
                )}
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md transition"
              >
                Logout
              </button>
            </div>
          </>
        )}

        {message && (
          <div className="text-center text-sm text-gray-600 mt-4">{message}</div>
        )}
      </div>
    </main>
  );
}