import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Design-system §6.9. A badge is a `<span>` carrying a word — never a control,
 * never colour-only. The 12% wash is a token (`--color-wash-*`) so no composite
 * hex leaks into component code; the border is the badge's own hue at 40%.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-eyebrow leading-[1.4] tracking-[0.02em] whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-wash-neutral text-text-secondary',
        simulated: 'border-accent/40 bg-wash-simulated text-accent',
        illustrative: 'border-info/40 bg-wash-illustrative text-info-text',
        caution: 'border-warning/40 bg-wash-caution text-warning',
        critical: 'border-negative/40 bg-wash-critical text-negative',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
