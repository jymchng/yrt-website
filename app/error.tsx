'use client';

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

/**
 * Design-system §14.3. A route-level error boundary: it must be a client
 * component to receive `reset()` and the digest. The digest is shown in a mono
 * diagnostic line so a report can be matched to a server log.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[52ch] flex-col items-start gap-5 px-4 py-[clamp(96px,14vh,160px)]">
      <p className="font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase">Error</p>
      <h1 className="text-h2 text-text-primary">Something broke in the pipeline.</h1>
      <p className="text-body text-text-secondary">
        An unexpected error stopped this page from rendering. Retrying is usually enough; if it is not, the diagnostic
        below can be quoted in a report.
      </p>
      {error.digest ? (
        <p className="w-full rounded-sm border border-border bg-surface-1 px-3 py-2 font-mono text-caption text-text-tertiary">
          digest: {error.digest}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button type="button" onClick={reset} className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          Try again
        </button>
        <Link href="/" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
