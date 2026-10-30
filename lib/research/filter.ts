import { researchCategories } from '@/lib/content/research';
import type { ResearchCategory, ResearchEntry } from '@/lib/content/types';

export const MAX_QUERY_LENGTH = 80;

export type ResearchFilterState = {
  /** '' means "all categories". */
  readonly category: string;
  readonly query: string;
};

export type ParsedFilter = {
  readonly state: ResearchFilterState;
  /** A `?category=` value that is not a known category — surfaced, never fatal. */
  readonly unknownCategory: string | null;
};

export function isResearchCategory(value: string): value is ResearchCategory {
  return (researchCategories as readonly string[]).includes(value);
}

/**
 * Reads the URL state. An unrecognised category renders the unfiltered list
 * plus a caution badge rather than an empty screen (design-system §14.5) — a
 * stale shared link should still land somewhere useful.
 */
export function parseFilter(
  params: { readonly category?: string; readonly q?: string } | undefined,
): ParsedFilter {
  const rawCategory = (params?.category ?? '').trim();
  const query = (params?.q ?? '').slice(0, MAX_QUERY_LENGTH);

  if (rawCategory && !isResearchCategory(rawCategory)) {
    return { state: { category: '', query }, unknownCategory: rawCategory };
  }

  return { state: { category: rawCategory, query }, unknownCategory: null };
}

/**
 * Pure filter used by the island and by the unit tests: category match AND a
 * case-insensitive substring match over the fields a reader would expect.
 */
export function filterEntries(
  entries: readonly ResearchEntry[],
  { category, query }: ResearchFilterState,
): readonly ResearchEntry[] {
  const needle = query.trim().toLowerCase();

  return entries.filter((entry) => {
    if (category && entry.category !== category) return false;
    if (needle === '') return true;

    const haystack = [entry.title, entry.summary, entry.category, entry.kind, ...entry.takeaways]
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  });
}

/** "6 entries in Market Microstructure" — a sentence, never a bare numeral. */
export function describeResults(count: number, category: string, query: string): string {
  const noun = count === 1 ? 'entry' : 'entries';
  const parts = [`${count} ${noun}`];
  if (category) parts.push(`in ${category}`);
  if (query.trim()) parts.push(`matching “${query.trim()}”`);
  return parts.join(' ');
}

export function buildQueryString(state: ResearchFilterState): string {
  const params = new URLSearchParams();
  if (state.category) params.set('category', state.category);
  if (state.query.trim()) params.set('q', state.query.trim());
  const query = params.toString();
  return query ? `?${query}` : '';
}
