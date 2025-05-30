import Head from 'next/head';

export default function About() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Head>
        <title>About - Kora Intelligence</title>
      </Head>
      <h1 className="text-2xl font-bold">About</h1>
    </div>
  );
}
