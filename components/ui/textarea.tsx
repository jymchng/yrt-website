import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Design-system §6.7. Shares the Input anatomy with four additions: 128px
 * minimum height, vertical-only resize, `text-body` prose, and a mono counter
 * rendered after the limit is approached.
 */
export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-32 w-full resize-y rounded-sm border border-border-strong bg-surface-card px-3 py-2.5',
        'text-body text-text-primary transition-colors duration-[var(--duration-base)] placeholder:text-text-tertiary',
        'hover:border-border-hover',
        'aria-invalid:border-negative',
        className,
      )}
      {...props}
    />
  );
}
