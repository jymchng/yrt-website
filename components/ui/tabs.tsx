'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

/**
 * Design-system §6.10 — used only by the dashboard period toggle. The selected
 * tab carries a 2px emerald rule plus `aria-selected`, so the indicator is not
 * colour alone.
 */
export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('inline-flex items-center gap-1 border-b border-hairline', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-t-sm px-3 md:h-9',
        'font-mono text-small text-text-secondary transition-colors duration-[var(--duration-base)]',
        'border-b-2 border-transparent hover:text-text-primary',
        'data-[state=active]:border-accent data-[state=active]:text-text-primary',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('mt-6', className)} {...props} />;
}
