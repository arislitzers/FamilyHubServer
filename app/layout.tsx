import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/contexts/app-providers';
import { SITE } from '@/constants/site';
import '@/styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Android/Google-style emoji glyphs, used as a fallback font
            wherever text is rendered (see styles/globals.css) so any
            emoji — typed, pasted, or inserted via the emoji picker —
            renders consistently in that style regardless of the
            visitor's OS. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- that
            rule predates the App Router; a <link> in the root layout is
            the correct way to load a font globally here, not a per-page
            mistake. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap"
        />
      </head>
      <body className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
