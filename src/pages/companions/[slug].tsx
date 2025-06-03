import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { companions, companionSlugs, Companion } from '../../data/companions';

type PageProps = { companion: Companion };

export default function CompanionPage({ companion }: PageProps) {
  const {
    glyph,
    title,
    essence,
    access,
    summoning,
    origin,
    offerings,
    tools,
    tags
  } = companion;

  return (
    <>
      <Head>
        <title>{`${title} – Kora Companion`}</title>
        <meta name="description" content={essence} />
      </Head>
      <main className="pt-24 pb-32 px-6 max-w-3xl mx-auto space-y-12 text-center font-serif text-gray-800 dark:text-gray-100">
        <h1 className="text-3xl sm:text-4xl md:text-5xl text-center hover:animate-pulse">
          {glyph} {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-center italic mt-2">{essence}</p>
        <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm mt-4">
          {access}
        </span>

        {offerings && (
          <section className="space-y-2 pt-8 text-left">
            <h2 className="text-amber-600 font-bold">Offerings:</h2>
            <ul className="list-disc list-inside font-serif">
              {offerings.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {tools && (
          <section className="space-y-2 pt-8 text-left">
            <h2 className="text-amber-600 font-bold">Scrolls & Tools:</h2>
            <ul className="list-disc list-inside font-serif">
              {tools.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {summoning && (
          <section className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 space-y-2 mt-8">
            <h2 className="text-amber-600 font-bold">To summon the Builder:</h2>
            <ul className="list-disc list-inside font-serif">
              {summoning.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </section>
        )}

        {origin && (
          <p className="italic bg-amber-50 dark:bg-amber-900 p-4 rounded-lg font-serif mt-8">
            {origin}
          </p>
        )}

        {tags && (
          <div className="pt-6 text-sm text-gray-600 dark:text-gray-400 space-x-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
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
