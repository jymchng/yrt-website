import type { Metadata } from 'next';

import { siteMeta } from '@/lib/site';

/**
 * One metadata builder for every route, so titles, descriptions, canonicals and
 * social cards cannot drift apart. Next 16's Metadata API resolves the title
 * template from the root layout.
 */
export function buildMetadata({
  title,
  absoluteTitle,
  description,
  path,
  type = 'website',
  publishedTime,
}: {
  title: string;
  /**
   * Full document title, used instead of `title` when the root layout's
   * `%s — Yishun River Trading` template does not apply. Next only applies a
   * layout's template to *child* segments, so the home page — which sits in the
   * same segment as the root layout — would otherwise ship a title with no
   * brand in it.
   */
  absoluteTitle?: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}): Metadata {
  const social = {
    title: absoluteTitle ?? `${title} — ${siteMeta.name}`,
    description,
    url: path,
  };

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...social,
      type,
      siteName: siteMeta.name,
      locale: siteMeta.locale,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      ...social,
    },
  };
}
