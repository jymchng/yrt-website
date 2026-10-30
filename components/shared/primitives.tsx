import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Design-system §3: eyebrows are `<p>` elements, never headings. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase', className)}>{children}</p>
  );
}

/**
 * Design-system §4.3: one shared page rhythm — eyebrow → headline → lead →
 * content — reused on every route rather than re-invented per page.
 */
export function Section({
  id,
  children,
  className,
  as: As = 'section',
  bleed = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div';
  bleed?: boolean;
}) {
  return (
    <As id={id} className={cn('relative', bleed ? '' : 'mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-12', className)}>
      {children}
    </As>
  );
}

/** Vertical rhythm is the primary grouping cue (§4.3). */
export function SectionShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('py-16 md:py-20 lg:py-[clamp(80px,8vw,128px)]', className)}>{children}</div>;
}

export function PageIntro({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-hairline pb-10 md:gap-5 lg:gap-6">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="max-w-[24ch] text-h1 text-text-primary">{title}</h1>
      <p className="max-w-[60ch] text-lead text-text-secondary">{lead}</p>
      {children}
    </div>
  );
}

/** Measure caps are hard limits: body 72ch, lead 60ch, caption 52ch (§3.1). */
export function Prose({ children, className, measure = 'body' }: { children: ReactNode; className?: string; measure?: 'body' | 'lead' | 'caption' | 'wide' }) {
  const width =
    measure === 'lead' ? 'max-w-[60ch]' : measure === 'caption' ? 'max-w-[52ch]' : measure === 'wide' ? 'max-w-[68ch]' : 'max-w-[72ch]';

  return <div className={cn('flex flex-col gap-4 text-body text-text-secondary', width, className)}>{children}</div>;
}

/** A figure always carries a caption; the chart islands supply their own frame. */
export function FigureFrame({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption: string;
  className?: string;
}) {
  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      {children}
      <figcaption className="max-w-[52ch] font-mono text-caption text-text-tertiary">{caption}</figcaption>
    </figure>
  );
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
