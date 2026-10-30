import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Design-system §6.1. Every variant uses token classes only; there is no
 * `focus-visible:ring-*` here because the global rule in `app/globals.css`
 * provides the single 2px ring at a 2px offset (§2.4, implementation guide §7).
 *
 * `disabled` is a named state, never an opacity step: fill `surface-1`,
 * border `border`, label `text-tertiary` (§2.3i).
 */
const buttonVariants = cva(
  [
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium',
    'transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)]',
    'disabled:cursor-not-allowed disabled:border disabled:border-border disabled:bg-surface-1 disabled:text-text-tertiary',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'border border-transparent bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-press disabled:hover:bg-surface-1',
        secondary:
          'border border-border-strong bg-transparent text-text-primary hover:border-border-hover hover:bg-surface-1 active:bg-surface-card',
        ghost:
          'border border-transparent bg-transparent text-text-secondary hover:bg-surface-1 hover:text-text-primary active:bg-surface-card',
        link: 'border border-transparent bg-transparent p-0 text-info-text underline-offset-4 hover:underline',
        danger:
          'border border-negative bg-negative text-accent-ink hover:border-accent-ink active:border-accent-ink',
      },
      size: {
        sm: 'h-8 rounded-sm px-3 text-small max-md:min-h-11',
        md: 'h-10 rounded-sm px-4 text-small max-md:min-h-11',
        lg: 'h-12 rounded-sm px-6 text-body-sm',
        icon: 'size-11 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
