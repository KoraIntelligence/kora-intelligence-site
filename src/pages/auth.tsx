import Head from "next/head";
import AuthPanel from "@/components/AuthPanel";

export default function AuthPage() {
  return (
    <>
      <Head>
        <title>Login | Kora Intelligence</title>
        <meta
          name="description"
          content="Sign in to access your Companion chat environment."
        />
      </Head>
      <AuthPanel />
    </>
  );
}