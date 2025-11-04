// src/components/AuthPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function AuthPanel() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 🔁 Redirect logged-in users straight to the chat
  useEffect(() => {
    if (user) router.push("/unifiedchat-test");
  }, [user, router]);

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/unifiedchat-test` },
    });
    if (error) console.error("Google Sign-In Error:", error.message);
    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-amber-50">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-amber-700 mb-6">
          Welcome to Kora Intelligence
        </h1>

        {!user ? (
          <>
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white rounded-lg py-2.5 hover:bg-amber-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M488 261.8c0-17.8-1.5-35-4.3-51.8H249v98.1h135.7c-5.9 31.8-23.6 58.7-50.3 76.7l81.2 63c47.4-43.8 72.4-108.3 72.4-186z" />
                <path d="M249 492c67.5 0 124-22.4 165.3-60.8l-81.2-63c-22.5 15.1-51.1 24.2-84.1 24.2-64.7 0-119.6-43.7-139.3-102.4l-85.3 66.2C63.7 436.3 148.5 492 249 492z" />
                <path d="M109.7 289.9c-4.8-14.3-7.5-29.5-7.5-45.1s2.7-30.8 7.5-45.1L24.3 133.5C8.9 166.1 0 206 0 244.8s8.9 78.7 24.3 111.3l85.4-66.2z" />
                <path d="M249 97.9c36.8 0 69.8 12.7 95.8 37.6l71.6-71.6C373 23.2 316.5 0 249 0 148.5 0 63.7 55.7 24.3 133.5l85.4 66.2C129.4 141.6 184.3 97.9 249 97.9z" />
              </svg>
              {loading ? "Connecting..." : "Sign in with Google"}
            </button>
            <button
  onClick={() => router.push("/unifiedchat-test")}
  className="mt-4 text-amber-600 hover:underline"
>
  Continue as Guest
</button>
          </>
        ) : (
          <p className="text-gray-600">Redirecting to your Companion...</p>
        )}
      </div>
    </main>
  );
}