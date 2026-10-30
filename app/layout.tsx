import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { SkipLink } from '@/components/layout/skip-link';
import { siteMeta } from '@/lib/site';

/**
 * Design-system §3: Geist Sans + Geist Mono, self-hosted by `next/font` so there
 * is no runtime request to Google. The two CSS variables are referenced by the
 * `@theme` block, so they must sit on `<html>`, not a nested element.
 */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteMeta.name} — ${siteMeta.tagline}`,
    template: `%s — ${siteMeta.name}`,
  },
  description: siteMeta.description,
  applicationName: siteMeta.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: siteMeta.name,
    title: `${siteMeta.name} — ${siteMeta.tagline}`,
    description: siteMeta.description,
    locale: siteMeta.locale,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteMeta.name} — ${siteMeta.tagline}`,
    description: siteMeta.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#09090B',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-text-primary antialiased">
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="focus-visible:outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
