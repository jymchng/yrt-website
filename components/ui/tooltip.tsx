'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

/** Design-system §6.8: mono caption, raised surface, never the only information. */
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 max-w-64 rounded-md border border-border bg-surface-raised px-2.5 py-1.5',
          'font-mono text-caption text-text-primary shadow-overlay',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
