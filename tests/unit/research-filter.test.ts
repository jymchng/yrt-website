import { describe, expect, it } from 'vitest';

import { researchCategories, researchEntries } from '@/lib/content/research';
import {
  MAX_QUERY_LENGTH,
  buildQueryString,
  describeResults,
  filterEntries,
  isResearchCategory,
  parseFilter,
} from '@/lib/research/filter';

const ALL = { category: '', query: '' };

describe('parseFilter', () => {
  it('treats absent params as the unfiltered state', () => {
    expect(parseFilter(undefined)).toEqual({ state: { category: '', query: '' }, unknownCategory: null });
    expect(parseFilter({})).toEqual({ state: { category: '', query: '' }, unknownCategory: null });
  });

  it('keeps a known category and passes the query through', () => {
    const parsed = parseFilter({ category: 'Market Microstructure', q: 'queue' });
    expect(parsed.state).toEqual({ category: 'Market Microstructure', query: 'queue' });
    expect(parsed.unknownCategory).toBeNull();
  });

  it('degrades a stale shared link instead of showing an empty page', () => {
    const parsed = parseFilter({ category: 'Not A Category' });
    expect(parsed.state.category).toBe('');
    expect(parsed.unknownCategory).toBe('Not A Category');
  });

  it('clamps an over-long query rather than forwarding it', () => {
    const parsed = parseFilter({ q: 'x'.repeat(500) });
    expect(parsed.state.query).toHaveLength(MAX_QUERY_LENGTH);
  });
});

describe('isResearchCategory', () => {
  it('accepts every declared category and rejects everything else', () => {
    for (const category of researchCategories) expect(isResearchCategory(category)).toBe(true);
    expect(isResearchCategory('')).toBe(false);
    expect(isResearchCategory('market microstructure')).toBe(false);
  });
});

describe('filterEntries', () => {
  it('returns every entry for the unfiltered state', () => {
    expect(filterEntries(researchEntries, ALL)).toHaveLength(researchEntries.length);
  });

  it('filters by category using AND semantics', () => {
    const filtered = filterEntries(researchEntries, { category: 'Market Microstructure', query: '' });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((entry) => entry.category === 'Market Microstructure')).toBe(true);
  });

  it('matches the query case-insensitively across the searchable fields', () => {
    const needle = 'LATENCY';
    const filtered = filterEntries(researchEntries, { category: '', query: needle });
    expect(filtered.length).toBeGreaterThan(0);
    for (const entry of filtered) {
      const haystack = [entry.title, entry.summary, entry.category, entry.kind, ...entry.takeaways]
        .join(' ')
        .toLowerCase();
      expect(haystack).toContain(needle.toLowerCase());
    }
  });

  it('returns nothing when the category and the text disagree', () => {
    expect(filterEntries(researchEntries, { category: 'Market Microstructure', query: 'zzzz-no-match' })).toEqual([]);
  });

  it('ignores surrounding whitespace in the query', () => {
    const spaced = filterEntries(researchEntries, { category: '', query: '   latency   ' });
    const tight = filterEntries(researchEntries, { category: '', query: 'latency' });
    expect(spaced.map((entry) => entry.slug)).toEqual(tight.map((entry) => entry.slug));
  });
});

describe('describeResults', () => {
  it('is a sentence, with correct singular and plural', () => {
    expect(describeResults(1, '', '')).toBe('1 entry');
    expect(describeResults(12, '', '')).toBe('12 entries');
    expect(describeResults(2, 'Market Microstructure', '')).toBe('2 entries in Market Microstructure');
    expect(describeResults(1, '', 'queue')).toBe('1 entry matching \u201cqueue\u201d');
  });
});

describe('buildQueryString', () => {
  it('omits empty parameters entirely', () => {
    expect(buildQueryString({ category: '', query: '' })).toBe('');
    expect(buildQueryString({ category: '', query: '   ' })).toBe('');
  });

  it('encodes category and query in a stable order', () => {
    expect(buildQueryString({ category: 'Market Microstructure', query: 'order flow' })).toBe(
      '?category=Market+Microstructure&q=order+flow',
    );
  });

  it('round-trips through URLSearchParams', () => {
    const query = buildQueryString({ category: 'Time-Series Analysis', query: 'half-life' });
    const params = new URLSearchParams(query);
    expect(params.get('category')).toBe('Time-Series Analysis');
    expect(params.get('q')).toBe('half-life');
  });
});
