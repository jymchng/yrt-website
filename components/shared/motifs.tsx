import { cn } from '@/lib/utils';

/**
 * Design-system §6.13: a 24px technical grid, hairline lines, masked with a
 * linear alpha fade to the page background. Pure atmosphere — `aria-hidden`,
 * `pointer-events-none`, and nothing legible may depend on it.
 */
export function GridField({ className, id }: { className?: string; id: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}>
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--color-hairline)" strokeWidth="1" />
        </pattern>
        <radialGradient id={`${id}-fade`} cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} mask={`url(#${id}-mask)`} />
    </svg>
  );
}

/**
 * Design-system §1.3: the river/current motif — a low-contrast field of
 * hairline curves that drifts horizontally at ≤4% opacity, `aria-hidden`, and
 * stops dead under `prefers-reduced-motion` (the global CSS block flattens the
 * animation; the static frame remains).
 */
export function RiverField({ className, opacity = 0.04 }: { className?: string; opacity?: number }) {
  const lines = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg
        className="motif-drift h-full w-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        style={{ opacity }}
        focusable="false"
      >
        {lines.map((line) => (
          <path
            key={line}
            d={`M-100 ${60 + line * 48} C 200 ${20 + line * 48}, 420 ${140 + line * 40}, 700 ${70 + line * 46} S 1080 ${150 + line * 34}, 1300 ${60 + line * 48}`}
            fill="none"
            stroke="var(--color-text-primary)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}
