import Link from 'next/link';

import { NavLinks } from '@/components/layout/nav-links';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Wordmark } from '@/components/layout/wordmark';
import { buttonVariants } from '@/components/ui/button';

/**
 * Design-system §4.3: sticky, 64px (56px mobile), `surface-1` at 85% with a
 * 12px blur and a 1px hairline edge. Server-rendered; only the two link groups
 * that need the pathname or a disclosure are client islands.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface-1/85 backdrop-blur-[12px]">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-6 px-4 md:h-16 md:px-8 lg:px-12">
        <Wordmark />

        <nav aria-label="Primary" className="hidden md:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          {/* The responsive contract puts the ghost CTA alongside the inline nav
              from 1024px; below that the nav's own Contact link (and, under
              `md`, the sheet's primary action) carries the destination.

              The visibility lives on this wrapper, not on the link: `buttonVariants`
              already emits `inline-flex`, and a bare `hidden` utility on the same
              element loses that cascade tie in the generated stylesheet, which left
              the CTA painted at every width and overflowing 768px by 7px. */}
          <div className="hidden lg:block">
            <Link href="/contact" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Contact
            </Link>
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
