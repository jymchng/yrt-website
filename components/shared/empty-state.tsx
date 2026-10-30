import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

/** Design-system §6.4: dashed hairline, mono headline, one recovery action. */
export function EmptyState({
  headline,
  body,
  actionHref,
  actionLabel,
}: {
  headline: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border-strong px-6 py-16 text-center">
      <p className="font-mono text-eyebrow tracking-[0.14em] text-text-secondary uppercase">{headline}</p>
      <p className="max-w-[52ch] text-body-sm text-text-secondary">{body}</p>
      <Link href={actionHref} className={buttonVariants({ variant: 'secondary', size: 'md' })}>
        {actionLabel}
      </Link>
    </div>
  );
}
