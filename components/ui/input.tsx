import * as React from 'react';

import { cn } from '@/lib/utils';

/** Design-system §6.7 — 44px height, `border-strong`, 2px radius, card fill. */
export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full rounded-sm border border-border-strong bg-surface-card px-3 text-small text-text-primary',
        'transition-colors duration-[var(--duration-base)] placeholder:text-text-tertiary',
        'hover:border-border-hover',
        'aria-invalid:border-negative',
        'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-1 disabled:text-text-tertiary',
        className,
      )}
      {...props}
    />
  );
}
