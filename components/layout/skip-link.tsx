import Link from 'next/link';

/** Design-system §9: the skip link is the first focusable element on the page. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-sm border border-border-strong bg-surface-card px-4 py-3 text-small text-text-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100"
    >
      Skip to main content
    </a>
  );
}

/** Nav rows keep a 44px hit area even when the visual row is shorter (§6.1). */
export const navLinkClasses =
  'inline-flex min-h-11 items-center rounded-sm px-2 text-small text-text-secondary transition-colors duration-[var(--duration-base)] hover:text-text-primary md:min-h-0 md:py-1';

export const navLinkCurrentClasses =
  'relative text-text-primary after:absolute after:inset-x-2 after:top-[calc(100%+6px)] after:h-0.5 after:bg-accent after:content-[""]';

export type NavLinkProps = {
  href: string;
  label: string;
  current: boolean;
  className?: string;
  onNavigate?: () => void;
};

/** One nav row. `aria-current` is the indicator; the underline reinforces it. */
export function NavLink({ href, label, current, className, onNavigate }: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
      className={[navLinkClasses, current ? navLinkCurrentClasses : '', className ?? ''].join(' ').trim()}
    >
      {label}
    </Link>
  );
}
