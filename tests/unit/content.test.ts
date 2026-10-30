import { describe, expect, it } from 'vitest';

import { aboutContent } from '@/lib/content/about';
import { capabilities, technologyAreas, technologyStack } from '@/lib/content/capabilities';
import { getAdjacentEntries, getResearchEntry, researchCategories, researchEntries } from '@/lib/content/research';
import { getStrategy, strategies } from '@/lib/content/strategies';

/**
 * Content integrity: the copy is data, so the guarantees the brief makes about
 * it (six categories, seven strategies, five dimensions each, a labelled
 * illustrative flag on every article) can be asserted rather than trusted.
 */

describe('research archive', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = researchEntries.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('covers every category on the site', () => {
    const used = new Set(researchEntries.map((entry) => entry.category));
    for (const category of researchCategories) expect(used.has(category)).toBe(true);
    expect(used.size).toBe(researchCategories.length);
  });

  it('dates every entry in fixed ISO form', () => {
    for (const entry of researchEntries) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(entry.date))).toBe(false);
    }
  });

  it('marks every entry as illustrative and gives it takeaways and a body', () => {
    for (const entry of researchEntries) {
      expect(entry.illustrative).toBe(true);
      expect(entry.readMinutes).toBeGreaterThan(0);
      expect(entry.body.length).toBeGreaterThan(0);
      expect(entry.takeaways.length).toBeGreaterThan(0);
      expect(entry.summary.length).toBeGreaterThan(40);
    }
  });

  it('looks entries up by slug and walks neighbours safely', () => {
    const first = researchEntries[0];
    const last = researchEntries.at(-1);
    expect(first && getResearchEntry(first.slug)).toBe(first);
    expect(getResearchEntry('does-not-exist')).toBeUndefined();

    if (!first || !last) throw new Error('the archive must not be empty');
    expect(getAdjacentEntries(first.slug).previous).toBeUndefined();
    expect(getAdjacentEntries(last.slug).next).toBeUndefined();
    expect(getAdjacentEntries('does-not-exist')).toEqual({ previous: undefined, next: undefined });
  });
});

describe('strategy programme', () => {
  it('documents all seven strategies exactly once', () => {
    expect(strategies).toHaveLength(7);
    expect(new Set(strategies.map((strategy) => strategy.slug)).size).toBe(7);
    expect(getStrategy('market-making')?.name).toBe('Market Making');
    expect(getStrategy('nope')).toBeUndefined();
  });

  it('covers the five required dimensions for every strategy', () => {
    for (const strategy of strategies) {
      expect(strategy.overview.length).toBeGreaterThan(0);
      expect(strategy.math.parts.length).toBeGreaterThan(0);
      expect(strategy.math.gloss.length).toBeGreaterThan(20);
      expect(strategy.mathProse.length).toBeGreaterThan(0);
      expect(strategy.data.length).toBeGreaterThan(0);
      expect(strategy.risks.length).toBeGreaterThan(0);
      expect(strategy.implementation.length).toBeGreaterThan(0);
    }
  });
});

describe('capabilities and technology', () => {
  it('has the four home-page capability cards, each pointing at a real route', () => {
    expect(capabilities).toHaveLength(4);
    for (const capability of capabilities) {
      expect(capability.href.startsWith('/')).toBe(true);
      expect(capability.points.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('presents exactly the six requested technology foundations', () => {
    expect(technologyStack).toHaveLength(6);
    const names = technologyStack.map((item) => item.name);
    expect(names).toEqual(
      expect.arrayContaining(['Python', 'Rust', 'C++', 'Machine Learning', 'Distributed Computing']),
    );
  });

  it('has seven technology areas, each with supporting detail', () => {
    expect(technologyAreas).toHaveLength(7);
    for (const area of technologyAreas) {
      expect(area.capabilities.length).toBeGreaterThan(0);
      expect(area.description.length).toBeGreaterThan(20);
    }
  });
});

describe('about page copy', () => {
  it('carries the philosophy and the brand line verbatim', () => {
    expect(aboutContent.philosophy.heading).toBe('Our Philosophy');
    expect(aboutContent.name.heading).toBe('Our Name');
    expect(aboutContent.name.quote).toBe('Yishun has no river. But every market has a current.');
    expect(aboutContent.closing.headline).toBe('The market never stops moving. Neither does research.');
  });

  it('never invents a founding story, a date or a headcount', () => {
    const body = JSON.stringify(aboutContent);
    expect(body).not.toMatch(/founded in \d{4}/i);
    expect(body).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(body).not.toMatch(/\d+\s+(employees|staff|people)\b/i);
  });
});
