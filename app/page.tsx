import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ClosingCta } from '@/components/shared/closing-cta';
import { GridField, RiverField } from '@/components/shared/motifs';
import { Eyebrow, Prose, Section, SectionShell } from '@/components/shared/primitives';
import { DashboardPreview } from '@/components/viz/dashboard-preview';
import { HeroVisual } from '@/components/viz/hero-visual';
import { capabilities, technologyAreas, technologyStack } from '@/lib/content/capabilities';
import { researchEntries } from '@/lib/content/research';
import { formatDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo/metadata';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/lib/seo/jsonld';
import { siteMeta } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Systematic quantitative trading research',
  // The root layout's title template applies to child segments only, so the home
  // page states its own full title rather than losing the brand.
  absoluteTitle: `${siteMeta.name} — Systematic quantitative trading research`,
  description:
    'Yishun River Trading applies mathematics, statistics and technology to understand financial markets and develop systematic trading strategies. All figures on this site are simulated and labelled.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      {/* 1. Hero ------------------------------------------------------------ */}
      <section className="relative isolate overflow-x-clip border-b border-hairline">
        <RiverField />
        <GridField id="hero-grid" className="opacity-60" />
        <div className="relative mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:py-24">
          <div className="flex flex-col gap-5 lg:col-span-7 lg:gap-6">
            <Eyebrow>Systematic · Quantitative · Disciplined</Eyebrow>
            <h1 className="max-w-[24ch] text-display text-text-primary">Yishun River Trading</h1>
            <p className="text-h2 text-accent">Yishun Has No River.</p>
            <p className="max-w-[60ch] text-lead text-text-secondary">
              Quantitative research. Systematic strategies. Data-driven trading.
            </p>
            <p className="max-w-[60ch] text-body text-text-secondary">
              We apply mathematics, statistics, and technology to understand financial markets and develop
              systematic trading strategies.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href="/strategies" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Explore Our Approach
              </Link>
              <Link href="/research" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                Discover Our Research
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* 2. Brand statement ------------------------------------------------- */}
      <SectionShell className="border-b border-hairline">
        <Section className="grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>Approach</Eyebrow>
            <h2 className="max-w-[24ch] text-h2 text-text-primary">Markets are complex. Our approach is systematic.</h2>
          </div>
          <Prose className="lg:col-span-6">
            <p>
              Prices are the output of an enormous, adversarial, partially observable system. We do not attempt to
              explain that system in prose; we attempt to measure it, state what we measured, and be explicit about
              how much of it we do not know.
            </p>
            <p>
              That means starting from data quality and cost models rather than from stories, testing hypotheses
              against out-of-sample data, and treating a strategy that dies under an honest fill assumption as a null
              result rather than a reason to change the assumption.
            </p>
          </Prose>
        </Section>
      </SectionShell>

      {/* 3. Capabilities ---------------------------------------------------- */}
      <SectionShell>
        <Section className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Eyebrow>Capabilities</Eyebrow>
            <h2 className="max-w-[32ch] text-h2 text-text-primary">Four disciplines, one research process.</h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <li key={capability.slug} className="flex">
                <Link
                  href={capability.href}
                  className="group flex w-full flex-col gap-3 rounded-md border border-border bg-surface-card p-5 transition-colors duration-[var(--duration-base)] hover:border-border-strong hover:bg-surface-raised md:p-6"
                >
                  <Eyebrow>{capability.eyebrow}</Eyebrow>
                  <h3 className="text-h3 text-text-primary">{capability.title}</h3>
                  <p className="text-body-sm text-text-secondary">{capability.description}</p>
                  <ul className="mt-auto flex flex-col gap-1 pt-2">
                    {capability.points.map((point) => (
                      <li key={point} className="font-mono text-caption text-text-tertiary">
                        {point}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-2 font-mono text-caption text-info-text group-hover:underline">
                    {capability.linkLabel} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </SectionShell>

      {/* 4. Dashboard preview ----------------------------------------------- */}
      <section id="dashboard" className="border-y border-hairline bg-surface-1">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-16 md:px-8 md:py-20 lg:px-12">
          <div className="flex flex-col gap-4">
            <Eyebrow>Simulated · Illustrative</Eyebrow>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="max-w-[32ch] text-h2 text-text-primary">A dashboard, populated with a seeded fixture.</h2>
              <Badge variant="simulated">Simulated data</Badge>
            </div>
            <p className="max-w-[72ch] text-body text-text-secondary">
              An interface preview, not a track record. Every series below is generated from a fixed seed in
              {' '}<code className="font-mono text-code text-text-primary">lib/data/series.ts</code>{' '}
              and is identical on every render. No figure here describes a live or historical trading result.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* 5. Research preview ------------------------------------------------ */}
      <SectionShell>
        <Section className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-4">
              <Eyebrow>Research</Eyebrow>
              <h2 className="max-w-[32ch] text-h2 text-text-primary">Notes from the research process.</h2>
            </div>
            <Link href="/research" className={`${buttonVariants({ variant: 'ghost', size: 'md' })} shrink-0`}>
              All research →
            </Link>
          </div>
          <ul className="flex flex-col">
            {researchEntries.slice(0, 6).map((entry) => (
              <li key={entry.slug} className="border-t border-hairline py-6">
                <article className="flex flex-col gap-2">
                  <p className="font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase">
                    {entry.category} · {formatDate(entry.date)}
                  </p>
                  <h3 className="text-h3 text-text-primary">
                    <Link href={`/research/${entry.slug}`} className="rounded-sm hover:text-accent hover:underline">
                      {entry.title}
                    </Link>
                  </h3>
                  <p className="max-w-[68ch] text-body-sm text-text-secondary">{entry.summary}</p>
                </article>
              </li>
            ))}
          </ul>
        </Section>
      </SectionShell>

      {/* 6. Technology ------------------------------------------------------ */}
      <SectionShell className="border-t border-hairline bg-surface-1">
        <Section className="grid gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Eyebrow>Technology</Eyebrow>
            <h2 className="max-w-[28ch] text-h2 text-text-primary">Built on mathematics. Powered by technology.</h2>
            <p className="max-w-[60ch] text-body text-text-secondary">
              We describe capabilities, not infrastructure claims. These are the tools and disciplines the work is
              built from.
            </p>
            <div>
              <Link href="/technology" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
                Inside the stack
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
              {technologyStack.map((item) => (
                <div key={item.name} className="flex flex-col gap-1 bg-surface-card p-4">
                  <dt className="font-mono text-small text-text-primary">{item.name}</dt>
                  <dd className="text-caption text-text-tertiary">{item.note}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-mono text-caption text-text-tertiary">
              {technologyAreas.length} capability areas documented on the technology page.
            </p>
          </div>
        </Section>
      </SectionShell>

      {/* 7. Closing CTA ----------------------------------------------------- */}
      <ClosingCta
        eyebrow="Next"
        headline="The market never stops moving. Neither does research."
        body="If your work is systematic, sceptical and comfortable being measured, we would like to hear from you."
      />
    </>
  );
}
