import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="scroll-smooth">
      <Head>
        <link rel="icon" href="/kora-logo.png" type="image/png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}