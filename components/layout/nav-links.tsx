'use client';

import { usePathname } from 'next/navigation';

import { NavLink } from '@/components/layout/skip-link';
import { cn } from '@/lib/utils';

export const primaryNav = [
  { href: '/', label: 'Home' },
  { href: '/strategies', label: 'Strategies' },
  { href: '/research', label: 'Research' },
  { href: '/technology', label: 'Technology' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

/**
 * Client island: `usePathname()` is the only way a server-rendered shell can
 * report the active route. Everything inside is a plain link — there is no
 * state beyond the current pathname, and the DOM is identical on the server.
 */
export function NavLinks({
  className,
  stacked = false,
  onNavigate,
}: {
  className?: string;
  stacked?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <ul className={cn(stacked ? 'flex flex-col gap-1' : 'flex items-center gap-1', className)}>
      {primaryNav.map((item) => (
        <li key={item.href}>
          <NavLink
            href={item.href}
            label={item.label}
            current={isCurrent(item.href)}
            className={stacked ? 'min-h-12 w-full text-h4' : undefined}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  );
}
