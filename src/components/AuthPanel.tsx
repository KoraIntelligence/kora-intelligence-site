// src/components/AuthPanel.tsx
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function AuthPanel() {
  const supabase = useSupabaseClient();
  const user = useUser();

  async function handleLogin() {
    const email = prompt("Enter your email for a magic link:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ email });
    alert(error ? error.message : "Check your email for the login link!");
  }

  if (!user)
    return (
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
      >
        Login via Magic Link
      </button>
    );

  return (
    <div className="flex items-center gap-3 text-sm text-gray-700">
      <span>
        Signed in as <strong>{user.email}</strong>
      </span>
      <button
        onClick={() => supabase.auth.signOut()}
        className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700"
      >
        Logout
      </button>
    </div>
  );
}