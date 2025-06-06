import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { companions, Companion } from '@/data/companions';

export default function CompanionPage({ companion }: { companion: Companion }) {
  const { slug } = companion;
  return (
    <>
      <Head>
        <title>{companion.title} – Kora Companion</title>
        <meta name="description" content={companion.essence} />
      </Head>
      <main className="pt-24 pb-32 px-6 max-w-3xl mx-auto space-y-16 text-gray-900 dark:text-gray-100 font-serif">
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center space-y-2">
            <Image
              src={`/assets/glyphs/glyph-${slug}.png`}
              alt={`${companion.title} glyph`}
              width={64}
              height={64}
              className="rounded-full hover:opacity-75 transition duration-300 ease-in-out"
            />
            <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold">
              {companion.title}
            </h1>
          </div>
          <p className="italic text-lg sm:text-xl">{companion.essence}</p>
          <span className="inline-block px-3 py-1 mt-2 rounded-full bg-amber-100 text-amber-800 text-sm">
            {companion.access}
          </span>
        </div>

        {companion.translation && (
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-center text-amber-700">Real-World Translation</h2>
            <p className="text-base italic text-center">{companion.translation}</p>
          </section>
        )}

        {companion.services && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Services</h2>
            <ul className="list-disc list-inside space-y-1">
              {companion.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </section>
        )}

        {companion.tools && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Tools & Methods</h2>
            <ul className="list-disc list-inside space-y-1">
              {companion.tools.map((tool, index) => (
                <li key={index}>{tool}</li>
              ))}
            </ul>
          </section>
        )}

        {companion.summoning && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Summoning Instructions</h2>
            <ol className="list-decimal list-inside space-y-1">
              {companion.summoning.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {companion.origin && (
          <section>
            <h2 className="text-lg font-semibold text-amber-700 mb-2">Origin</h2>
            <p className="italic bg-amber-50 dark:bg-amber-900 rounded-md p-4 text-sm">{companion.origin}</p>
          </section>
        )}

        {companion.tags && (
          <section className="pt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            {companion.tags.map((tag, index) => (
              <span key={index} className="inline-block mx-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-800">
                #{tag}
              </span>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(companions)
    .filter((slug) => slug !== 'fmc' && slug !== 'ccc')
    .map((slug) => ({
      params: { slug }
    }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const companion = companions[slug];
  return {
    props: { companion }
  };
};
