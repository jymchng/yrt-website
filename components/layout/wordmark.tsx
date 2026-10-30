import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * Design-system §6.3: Geist Sans 600 wordmark with a 12px emerald river-slash
 * glyph — the site's one visual joke, made structural. The slash is decorative,
 * so it is `aria-hidden` and the text carries the accessible name.
 */
export function Wordmark({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const content = (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap font-sans text-body-sm font-semibold text-text-primary', className)}>
      <RiverSlash />
      <span>
        Yishun River Trading
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" className="inline-flex rounded-sm" aria-label="Yishun River Trading — home">
      {content}
    </Link>
  );
}

function RiverSlash() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true" focusable="false" className="shrink-0">
      <g stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="square">
        <line x1="2" y1="14" x2="6" y2="2" />
        <line x1="6.5" y1="14" x2="10.5" y2="2" opacity="0.55" />
      </g>
    </svg>
  );
}
