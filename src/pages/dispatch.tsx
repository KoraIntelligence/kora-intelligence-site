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
  const files = fs.readdirSync(dirPath);

  const posts = files.map((filename) => {
    const filePath = path.join(dirPath, filename);
    const source = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(source);

    return {
      slug: filename.replace(/\.mdx?$/, ''),
      ...data,
    };
  });

  return {
    props: {
      posts,
    },
  };
}

export default function Dispatch({ posts }: { posts: PostMeta[] }) {
  return (
    <>
      <Head>
        <title>Dispatches from the Field – Kora Intelligence</title>
        <meta name="description" content="Signals, whispers, and updates from the intelligence field." />
      </Head>

      <div className="pt-24 pb-32 px-4 sm:px-6 max-w-prose mx-auto space-y-16 font-serif text-gray-800 dark:text-gray-100">
        <section className="text-center">
          <h1 className="text-amber-600 text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
            Dispatches from the Field
          </h1>
          <p className="text-base sm:text-lg md:text-xl italic">
            Echoes, updates, and signals from the mythic system.
          </p>
        </section>

        <section className="space-y-12">
          {posts.map((post) => (
            <div key={post.slug} className="space-y-2 border-l-4 pl-4 border-amber-400">
              <Link
                href={`/dispatch/${post.slug}`}
                className="text-xl font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                By {post.authors.join(', ')} — {post.date}
              </p>
              <p className="text-base text-gray-700 dark:text-gray-300">{post.description}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}