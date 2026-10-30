import { describe, expect, it } from 'vitest';

import { buildMetadata } from '@/lib/seo/metadata';
import { siteMeta } from '@/lib/site';

describe('buildMetadata', () => {
  const meta = buildMetadata({
    title: 'Strategies',
    description: 'Seven conceptual research programmes.',
    path: '/strategies',
  });

  it('sets a route-specific title and description', () => {
    expect(meta.title).toBe('Strategies');
    expect(meta.description).toBe('Seven conceptual research programmes.');
  });

  it('sets a canonical path rather than an absolute duplicate', () => {
    expect(meta.alternates?.canonical).toBe('/strategies');
  });

  it('builds Open Graph and Twitter cards from the same strings', () => {
    const og = meta.openGraph;
    expect(og?.title).toBe(`Strategies \u2014 ${siteMeta.name}`);
    expect(og && 'url' in og ? og.url : undefined).toBe('/strategies');
    expect(og && 'type' in og ? og.type : undefined).toBe('website');
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('states the full title when the layout template does not apply', () => {
    const home = buildMetadata({
      title: 'Systematic quantitative trading research',
      absoluteTitle: `${siteMeta.name} — Systematic quantitative trading research`,
      description: 'Home.',
      path: '/',
    });

    // The root layout's `%s — Yishun River Trading` template only applies to
    // child segments, so the home page must carry the brand itself.
    expect(home.title).toEqual({ absolute: `${siteMeta.name} — Systematic quantitative trading research` });
    expect(home.openGraph?.title).toBe(`${siteMeta.name} — Systematic quantitative trading research`);
  });

  it('switches to the article type and forwards the publication date', () => {
    const article = buildMetadata({
      title: 'Queue position',
      description: 'A note.',
      path: '/research/queue-position-and-adverse-selection',
      type: 'article',
      publishedTime: '2026-08-18',
    });

    const og = article.openGraph;
    expect(og && 'type' in og ? og.type : undefined).toBe('article');
    expect(og && 'publishedTime' in og ? og.publishedTime : undefined).toBe('2026-08-18');
  });
});

describe('site metadata', () => {
  it('keeps the tagline in its declared casing', () => {
    expect(siteMeta.tagline).toBe('Yishun Has No River.');
  });
});
