// Dispatch posts are being rebuilt — coming soon.
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function DispatchPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Kora Dispatch</title>
      </Head>
      <div className="pt-32 pb-32 px-6 text-center text-gray-400 dark:text-gray-600">
        <p className="text-sm">Coming soon.</p>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps() {
  return { props: {} };
}
