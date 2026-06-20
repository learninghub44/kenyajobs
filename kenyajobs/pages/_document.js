import { Html, Head, Main, NextScript } from "next/document";

const SITE_URL  = "https://jobsworldwide.online";
const SITE_NAME = "JobsWorldwide";
const OG_DESC   = "Find your dream job worldwide. Thousands of opportunities across Africa, Europe, Asia and beyond — remote, entry level, graduate and work from home.";
const OG_IMAGE  = `${SITE_URL}/og-image.jpg`;

export default function Document() {
  const ADSENSE_CLIENT = "ca-pub-5486110003135324";
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ADSENSE_CLIENT;

  return (
    <Html lang="en">
      <Head>
        {/* ── Viewport & theme ── */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b2233" />
        <meta name="color-scheme" content="light" />

        {/* ── PWA & icons ── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ── Default Open Graph (overridden per-page via next/head) ── */}
        <meta property="og:site_name"   content={SITE_NAME} />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={SITE_URL} />
        <meta property="og:title"       content={`${SITE_NAME} — Find Jobs Worldwide`} />
        <meta property="og:description" content={OG_DESC} />
        <meta property="og:image"       content={OG_IMAGE} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale"      content="en_US" />

        {/* ── Twitter / X card ── */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:site"        content="@jobsworldwide" />
        <meta name="twitter:title"       content={`${SITE_NAME} — Find Jobs Worldwide`} />
        <meta name="twitter:description" content={OG_DESC} />
        <meta name="twitter:image"       content={OG_IMAGE} />

        {/* ── Google AdSense ── */}
        <meta name="google-adsense-account" content={adsenseClient} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
