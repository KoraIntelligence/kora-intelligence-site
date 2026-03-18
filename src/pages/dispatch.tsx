import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Head from 'next/head';

type PostMeta = {
  title: string;
  description: string;
  authors: string[];
  date: string;
  slug: string;
};

export async function getStaticProps() {
  const dirPath = path.join(process.cwd(), 'content', 'dispatch');

  let posts: PostMeta[] = [];

  try {
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

    posts = files.map((filename) => {
      const filePath = path.join(dirPath, filename);
      const source = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(source);

      return {
        slug: filename.replace(/\.mdx?$/, ''),
        title: data.title || 'Untitled',
        description: data.description || '',
        authors: Array.isArray(data.authors) ? data.authors : [],
        date: data.date || '',
      };
    });
  } catch {
    // Directory empty or missing — return no posts
  }

  return {
    props: { posts },
  };
}

export default function Dispatch({ posts }: { posts: PostMeta[] }) {
  return (
    <>
      <Head>
        <title>Dispatches – Kora Intelligence</title>
        <meta name="description" content="Signals and updates from the Kora Intelligence team." />
      </Head>

      <div className="pt-24 pb-32 px-4 sm:px-6 max-w-prose mx-auto space-y-16 font-serif text-gray-100">
        <section className="text-center">
          <h1 className="text-yellow-400 text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
            Dispatches
          </h1>
          <p className="text-base sm:text-lg italic text-gray-400">
            Signals, thinking, and updates from the Kora Intelligence team.
          </p>
        </section>

        {posts.length === 0 ? (
          <section className="text-center py-16">
            <p className="text-gray-500 text-sm tracking-widest uppercase">Coming soon</p>
            <p className="text-gray-600 mt-2 text-sm">The first dispatches are being written.</p>
          </section>
        ) : (
          <section className="space-y-12">
            {posts.map((post) => (
              <div key={post.slug} className="space-y-2 border-l-4 pl-4 border-yellow-500/40">
                <Link
                  href={`/dispatch/${post.slug}`}
                  className="text-xl font-semibold text-yellow-400 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-gray-500 italic">
                  By {post.authors.join(', ')} — {post.date}
                </p>
                <p className="text-base text-gray-300">{post.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
