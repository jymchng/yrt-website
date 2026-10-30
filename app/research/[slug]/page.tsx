import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArticleBody } from '@/components/research/article-body';
import { ArticleActions } from '@/components/research/article-actions';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { Eyebrow, Section, SectionShell } from '@/components/shared/primitives';
import { getAdjacentEntries, getResearchEntry, researchEntries } from '@/lib/content/research';
import { formatDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo/metadata';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/lib/seo/jsonld';

export function generateStaticParams() {
  return researchEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getResearchEntry(slug);

  if (!entry) {
    return buildMetadata({ title: 'Research entry not found', description: 'This research entry does not exist.', path: `/research/${slug}` });
  }

  return buildMetadata({
    title: entry.title,
    description: entry.summary,
    path: `/research/${entry.slug}`,
    type: 'article',
    publishedTime: entry.date,
  });
}

export default async function ResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getResearchEntry(slug);

  if (!entry) notFound();

  const { previous, next } = getAdjacentEntries(entry.slug);
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Research', href: '/research' },
    { label: entry.title },
  ] as const;

  return (
    <SectionShell>
      <Section className="flex flex-col gap-8">
        <ArticleJsonLd
          title={entry.title}
          description={entry.summary}
          path={`/research/${entry.slug}`}
          datePublished={entry.date}
        />
        <BreadcrumbJsonLd items={crumbs} />

        <Breadcrumb items={crumbs} />

        <header className="flex flex-col gap-4">
          <Eyebrow>
            {entry.kind} · {entry.category} · {formatDate(entry.date)} · {entry.readMinutes} min read
          </Eyebrow>
          <h1 className="max-w-[24ch] text-h1 text-text-primary">{entry.title}</h1>
          {entry.illustrative ? (
            <p>
              <Badge variant="illustrative">Illustrative entry — method, not results</Badge>
            </p>
          ) : null}
          <p className="max-w-[68ch] text-lead text-text-secondary">{entry.summary}</p>
          <ArticleActions title={entry.title} path={`/research/${entry.slug}`} />
          <Separator />
        </header>

        <ArticleBody blocks={entry.body} />

        <section aria-labelledby="takeaways" className="flex max-w-[68ch] flex-col gap-3 border-t border-hairline pt-6">
          <h2 id="takeaways" className="text-h3 text-text-primary">
            Takeaways
          </h2>
          <ul className="flex flex-col gap-2">
            {entry.takeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-3 text-body-sm text-text-secondary">
                <span aria-hidden="true" className="font-mono text-caption text-accent">
                  —
                </span>
                {takeaway}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="references" className="flex max-w-[68ch] flex-col gap-3 border-t border-hairline pt-6">
          <h2 id="references" className="text-h3 text-text-primary">
            References
          </h2>
          <ol className="flex flex-col gap-2">
            {entry.references.map((reference, index) => (
              <li key={reference.label} className="flex gap-3 text-body-sm text-text-secondary">
                <span aria-hidden="true" className="font-mono text-caption text-text-tertiary">
                  [{index + 1}]
                </span>
                {reference.href ? (
                  <a href={reference.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-info-text hover:underline">
                    {reference.label}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <span>{reference.label}</span>
                )}
              </li>
            ))}
          </ol>
        </section>

        <nav aria-label="Adjacent research" className="flex flex-col gap-4 border-t border-hairline pt-6 md:flex-row md:gap-6">
          {[previous, next].map((adjacent, index) => {
            const label = index === 0 ? 'Previous' : 'Next';
            if (!adjacent) {
              return (
                <div key={label} className="flex-1 rounded-md border border-dashed border-border p-4">
                  <Eyebrow>{label}</Eyebrow>
                  <p className="mt-2 font-mono text-caption text-text-tertiary">No adjacent entry</p>
                </div>
              );
            }
            return (
              <Link
                key={label}
                href={`/research/${adjacent.slug}`}
                className="flex flex-1 flex-col gap-2 rounded-md border border-border bg-surface-card p-4 transition-colors duration-[var(--duration-base)] hover:border-border-strong hover:bg-surface-raised"
              >
                <Eyebrow>{label}</Eyebrow>
                <span className="text-h4 text-text-primary">{adjacent.title}</span>
              </Link>
            );
          })}
        </nav>

        <div>
          <Link href="/research" className="inline-flex min-h-11 items-center rounded-sm font-mono text-small text-info-text hover:underline">
            Back to research
          </Link>
        </div>
      </Section>
    </SectionShell>
  );
}
