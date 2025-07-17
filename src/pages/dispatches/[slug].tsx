import { allDispatches } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function DispatchPage({ post }: { post: any }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const MDXContent = useMDXComponent(post.body.code);

  return (
    <>
      <Head>
        <title>{post.title} – Kora Dispatch</title>
        <meta name="description" content={post.description} />
      </Head>
      <div className="pt-24 pb-32 px-6 sm:px-12 max-w-3xl mx-auto font-serif text-gray-800 dark:text-gray-100 space-y-6 prose prose-amber dark:prose-invert">
        <h1 className="text-4xl sm:text-5xl font-semibold text-amber-600">{post.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          {post.date} — by {post.authors?.join(', ')}
        </p>
        <article className="pt-6">
          <MDXContent />
        </article>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = allDispatches.map((p: any) => ({
    params: { slug: p.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: any }) {
  const post = allDispatches.find((p: any) => p.slug === params.slug);
  return { props: { post } };
}