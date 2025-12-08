// pages/auth/callback.ts
import { GetServerSideProps } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);

  // finalize sign-in and populate cookies
  await supabase.auth.getSession();

  return {
    redirect: {
      destination: "/mvp",
      permanent: false,
    },
  };
};

export default function Callback() {
  return null;
}