import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { companions, companionSlugs, Companion } from '../../data/companions';

type PageProps = { companion: Companion };

export default function CompanionPage({ companion }: PageProps) {
  const { glyph, title, essence, access, summoning, origin } = companion;

  return (
    <>
      <Head>
        <title>{`${title} – Kora Companion`}</title>
        <meta name="description" content={essence} />
      </Head>
      <main className="pt-24 pb-32 px-6 max-w-3xl mx-auto space-y-16 text-center bg-white dark:bg-neutral-900">
        <h1 className="text-amber-600 text-3xl sm:text-4xl font-semibold mb-6 flex flex-col items-center">
          <span className="text-5xl hover:opacity-75 transition duration-300 ease-in-out">{glyph}</span>
          {title}
        </h1>
        <p className="text-base sm:text-lg font-serif text-gray-800 dark:text-gray-100">{essence}</p>
        <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm mt-4">
          {access} Access
        </span>
        {summoning && (
          <ul className="list-disc list-inside space-y-1 text-base sm:text-lg font-serif text-gray-800 dark:text-gray-100">
            {summoning.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        )}
        {origin && (
          <p className="italic bg-amber-50 dark:bg-amber-900 rounded-md p-4 text-sm font-serif">{origin}</p>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = companionSlugs.map((slug) => ({ params: { slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const companion = companions[slug];
  if (!companion) {
    return { notFound: true };
  }
  return { props: { companion } };
};
