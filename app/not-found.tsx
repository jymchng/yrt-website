import Link from 'next/link';
import type { Metadata } from 'next';

import { Eyebrow } from '@/components/shared/primitives';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page does not exist. Yishun has no river; this URL has no page.',
  robots: { index: false, follow: false },
};

/** Design-system §14.3: one shared "system page" template. */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[52ch] flex-col items-start gap-5 px-4 py-[clamp(96px,14vh,160px)]">
      <Eyebrow>404</Eyebrow>
      <h1 className="text-h2 text-text-primary">This page has no river either.</h1>
      <p className="text-body text-text-secondary">
        The link may be outdated, or the page may never have existed. Neither is a reflection on you.
      </p>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Link href="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          Back to home
        </Link>
        <Link href="/research" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          Browse research
        </Link>
      </div>
    </div>
  );
}
