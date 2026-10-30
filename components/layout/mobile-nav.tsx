'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NavLinks, primaryNav } from '@/components/layout/nav-links';
import { buttonVariants } from '@/components/ui/button';

/**
 * Design-system §6.3: the mobile menu is a right-hand Sheet with a 44×44
 * trigger. Focus trap, Esc-to-close and focus return are Radix Dialog's; this
 * component only closes the sheet after a navigation.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        type="button"
        aria-label="Open navigation menu"
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle className="text-h3">Yishun River Trading</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <nav aria-label="Primary" className="flex flex-1 flex-col justify-between gap-8">
          <NavLinks stacked onNavigate={() => setOpen(false)} />
          <div className="flex flex-col gap-3 border-t border-hairline pt-6">
            <SheetClose asChild>
              <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })} onClick={() => setOpen(false)}>
                Contact us
              </Link>
            </SheetClose>
            <p className="font-mono text-caption text-text-tertiary">
              {primaryNav.length} destinations · simulated data throughout
            </p>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
