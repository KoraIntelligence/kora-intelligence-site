"use client";

import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPanel() {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, []);

  const handleEmailLogin = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        },
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (err: any) {
      console.error("Auth error:", err.message);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="bg-white shadow-md border border-amber-200 rounded-3xl p-8 max-w-md w-full space-y-6">
        <h1 className="text-2xl font-semibold text-center text-amber-700">
          Welcome to Kora Intelligence
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Sign in below to start your session with your Companion.
        </p>

        {!emailSent ? (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#b45309",
                    brandAccent: "#92400e",
                    inputBackground: "#fff",
                    inputBorder: "#fcd34d",
                  },
                },
              },
            }}
            providers={["google"]}
            view="magic_link"
            showLinks={false}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email address",
                  email_input_placeholder: "you@example.com",
                  button_label: "Send Magic Link",
                },
              },
            }}
            theme="light"
          />
        ) : (
          <div className="text-center space-y-3">
            <p className="text-amber-700 font-medium">
              ✉️ Magic link sent to your email!
            </p>
            <p className="text-sm text-gray-500">
              Please check your inbox and click the link to continue.
            </p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}