import * as React from 'react';

import { cn } from '@/lib/utils';

/** Design-system §6.8: card fill with a 1.2s pulse; static under reduced motion. */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-sm bg-surface-card motion-reduce:animate-none', className)}
      {...props}
    />
  );
}
