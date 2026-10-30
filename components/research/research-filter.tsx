'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { researchCategories } from '@/lib/content/research';
import type { ResearchEntry } from '@/lib/content/types';
import { formatDate } from '@/lib/format';
import {
  MAX_QUERY_LENGTH,
  buildQueryString,
  describeResults,
  filterEntries,
  isResearchCategory,
  parseFilter,
} from '@/lib/research/filter';

/**
 * Research filter island (design-system §6.4, §14.5).
 *
 * The initial state comes from `searchParams` on the server, so the first paint
 * is already filtered — no flash of the unfiltered list. Local state drives the
   * list immediately; category changes create history entries, while debounced
 * text edits replace the current entry to avoid one history item per keystroke.
 * External URL changes (back/forward) are adopted into local state.
 */
export function ResearchFilter({
  entries,
  initialCategory,
  initialQuery,
}: {
  entries: readonly ResearchEntry[];
  initialCategory: string;
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);

  const urlCategory = searchParams.get('category') ?? '';
  const urlQuery = searchParams.get('q') ?? '';
  const parsed = useMemo(() => parseFilter({ category: urlCategory, q: urlQuery }), [urlCategory, urlQuery]);
  const unknownCategory = parsed.unknownCategory;
  const parsedQuery = parsed.state.query;

  /**
   * Adopt an externally-driven URL change (back/forward, a shared link).
   * React's documented "adjust state when a prop changes" pattern: compare the
   * previous URL key during render and adjust once, instead of mirroring the
   * URL in an effect (which renders twice and briefly shows stale results).
   */
  const urlKey = `${urlCategory}\u0000${urlQuery}`;
  const [adoptedUrlKey, setAdoptedUrlKey] = useState(urlKey);
  if (adoptedUrlKey !== urlKey) {
    setAdoptedUrlKey(urlKey);
    setCategory(parsed.state.category);
    setQuery(parsed.state.query);
  }

  // Reflect local state into the URL, debounced 200 ms for typing.
  useEffect(() => {
    const current = buildQueryString({ category: urlCategory, query: urlQuery });
    const next = buildQueryString({ category, query });
    if (current === next) return;

    // An unknown category stays in the URL on first load so its warning remains
    // visible. Once the user changes a filter, synchronize the intentional state.
    if (unknownCategory && category === '' && query === parsedQuery) return;

    const timer = setTimeout(() => {
      const categoryChanged = urlCategory !== category;
      if (categoryChanged) router.push(`${pathname}${next}`, { scroll: false });
      else router.replace(`${pathname}${next}`, { scroll: false });
    }, 200);

    return () => clearTimeout(timer);
  }, [category, query, pathname, router, urlCategory, urlQuery, unknownCategory, parsedQuery]);

  const results = useMemo(() => filterEntries(entries, { category, query }), [entries, category, query]);
  const resultsText = describeResults(results.length, category, query);
  const overLength = query.length >= MAX_QUERY_LENGTH;

  const clear = () => {
    setCategory('');
    setQuery('');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-y border-hairline bg-surface-1 py-4 lg:sticky lg:top-16 lg:z-10 lg:bg-surface-1/85 lg:backdrop-blur-[12px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <p id="category-label" className="font-mono text-caption text-text-tertiary">
              Filter by category
            </p>
            <ul aria-labelledby="category-label" className="flex flex-wrap gap-2">
              <li>
                <Chip selected={category === ''} onClick={() => setCategory('')}>
                  All
                </Chip>
              </li>
              {researchCategories.map((option) => (
                <li key={option}>
                  <Chip selected={category === option} onClick={() => setCategory(option)}>
                    {option}
                  </Chip>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full flex-col gap-1.5 md:w-auto md:min-w-[220px]">
            <label htmlFor="research-search" className="font-mono text-caption text-text-tertiary">
              Search research
            </label>
            <Input
              id="research-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setQuery('');
              }}
              placeholder="e.g. order flow, shrinkage, latency"
              maxLength={MAX_QUERY_LENGTH}
              aria-describedby="research-search-hint"
            />
            <p id="research-search-hint" className="font-mono text-caption text-text-tertiary">
              {overLength ? 'Search text is at its 80-character limit.' : 'Filters as you type; the URL keeps the state.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p aria-live="polite" className="font-mono text-caption text-text-secondary">
            {resultsText}
          </p>
          {unknownCategory ? (
            <Badge variant="caution">Unknown category “{unknownCategory}” ignored</Badge>
          ) : null}
          {category ? <Badge variant="neutral">Category filter active</Badge> : null}
          {query.trim() ? <Badge variant="neutral">Text filter active</Badge> : null}
          {unknownCategory || category || query.trim() ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-sm border border-border-strong px-3 font-mono text-small text-text-secondary transition-colors duration-[var(--duration-base)] hover:border-border-hover hover:text-text-primary md:min-h-9"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          headline="No matching entries"
          body="Nothing in the archive matches that combination of category and text. Clear the filters to see the full index."
          actionHref="/research"
          actionLabel="Clear filters"
        />
      ) : (
        <ul aria-label="Research entries" className="flex flex-col">
          {results.map((entry) => (
            <li key={entry.slug} className="border-t border-hairline">
              <article className="flex flex-col gap-2 py-6">
                <p className="font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase">
                  {entry.kind} · {entry.category} · {formatDate(entry.date)}
                </p>
                <h2 className="text-h3 text-text-primary">
                  <Link href={`/research/${entry.slug}`} className="rounded-sm hover:text-accent hover:underline">
                    {entry.title}
                  </Link>
                  {entry.illustrative ? (
                    <>
                      {' '}
                      <Badge variant="illustrative" className="align-middle">
                        Illustrative
                      </Badge>
                    </>
                  ) : null}
                </h2>
                <p className="max-w-[68ch] text-body-sm text-text-secondary">{entry.summary}</p>
              </article>
            </li>
          ))}
        </ul>
      )}

      {isResearchCategory(category) ? (
        <p className="font-mono text-caption text-text-tertiary">
          Viewing {category} · {results.length} of {entries.length} entries
        </p>
      ) : null}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border px-3 font-mono text-small transition-colors duration-[var(--duration-base)] md:min-h-9',
        selected
          ? 'border-accent bg-accent/8 text-accent'
          : 'border-border-strong text-text-secondary hover:border-border-hover hover:text-text-primary',
      ].join(' ')}
    >
      {selected ? <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent" /> : null}
      {children}
    </button>
  );
}
