'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/lib/utils';
import { DialogOverlay } from '@/components/ui/dialog';

/**
 * Design-system §6.3. A right-hand Sheet built on the shared Dialog primitive:
 * `surface-raised`, `radius-lg` on the leading edge, focus trapped, Esc closes,
 * focus returns to the trigger (all Radix behaviour).
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'sheet-anim fixed inset-y-0 right-0 z-50 flex h-full w-[min(20rem,88vw)] flex-col gap-6',
          'rounded-l-lg border-l border-border bg-surface-raised p-6 shadow-overlay',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
