import { siteMeta } from '@/lib/site';

/**
 * JSON-LD blocks. They are emitted as raw `<script>` children (script is a raw
 * text element in React), never via `dangerouslySetInnerHTML` on article bodies.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteMeta.name,
        url: '/',
        slogan: siteMeta.tagline,
        description: siteMeta.description,
        email: siteMeta.email,
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteMeta.name,
        url: '/',
        description: siteMeta.description,
        inLanguage: 'en',
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  path,
  datePublished,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        datePublished,
        url: path,
        inLanguage: 'en',
        author: { '@type': 'Organization', name: siteMeta.name },
        publisher: { '@type': 'Organization', name: siteMeta.name },
        isAccessibleForFree: true,
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: readonly { label: string; href?: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          ...(item.href ? { item: item.href } : {}),
        })),
      }}
    />
  );
}
