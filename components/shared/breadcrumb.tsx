import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/** Design-system §14.1: mono breadcrumb, last crumb is not a link. */
export function Breadcrumb({ items }: { items: readonly { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 font-mono text-caption text-text-tertiary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="inline-flex min-h-11 items-center rounded-sm text-info-text hover:underline md:min-h-0">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="inline-flex min-h-11 items-center md:min-h-0">
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight aria-hidden="true" className="size-3 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
