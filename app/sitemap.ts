import type { MetadataRoute } from 'next';

import { researchEntries } from '@/lib/content/research';
import { routes } from '@/lib/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1 : 0.7,
  }));

  const researchRoutes = researchEntries.map((entry) => ({
    url: new URL(`/research/${entry.slug}`, siteUrl).toString(),
    lastModified: new Date(`${entry.date}T00:00:00Z`),
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...researchRoutes];
}
