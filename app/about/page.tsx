import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { ClosingCta } from '@/components/shared/closing-cta';
import { RiverField } from '@/components/shared/motifs';
import { Eyebrow, PageIntro, Prose, Section, SectionShell } from '@/components/shared/primitives';
import { aboutContent } from '@/lib/content/about';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'About',
  description:
    'Why Yishun River Trading exists as a research practice: discipline over narrative, uncertainty reported rather than smoothed, and a name that is a small factual joke.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <SectionShell>
        <Section className="flex flex-col gap-10">
          <PageIntro
            eyebrow="About"
            title="About"
            lead="A research practice organised around measurement. This page describes how we think about the work — not a company history, because there is no history to publish here."
          />

          <section aria-labelledby="philosophy" className="grid gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-3 lg:col-span-4">
              <Eyebrow>Philosophy</Eyebrow>
              <h2 id="philosophy" className="text-h2 text-text-primary">
                {aboutContent.philosophy.heading}
              </h2>
            </div>
            <Prose measure="wide" className="lg:col-span-8">
              {aboutContent.philosophy.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </Prose>
          </section>
        </Section>
      </SectionShell>

      {/* The one banded section besides the closing CTA (§14.6). */}
      <section className="relative isolate overflow-x-clip border-y border-hairline bg-surface-1">
        <RiverField opacity={0.03} />
        <div className="relative mx-auto grid w-full max-w-[1200px] gap-6 px-4 py-24 md:px-8 md:py-28 lg:grid-cols-12 lg:px-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Our Name</Eyebrow>
            <h2 className="text-h2 text-text-primary">{aboutContent.name.heading}</h2>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-8">
            <blockquote className="border-l-2 border-accent pl-4 text-h2 text-text-primary">
              {aboutContent.name.quote}
            </blockquote>
            <Prose measure="wide">
              {aboutContent.name.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </Prose>
          </div>
        </div>
      </section>

      <SectionShell>
        <Section className="grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Principles</Eyebrow>
            <h2 className="text-h2 text-text-primary">Four rules we keep returning to.</h2>
          </div>
          <ol className="flex flex-col gap-6 lg:col-span-8">
            {aboutContent.principles.map((principle, index) => (
              <li key={principle.title} className="flex gap-4 border-t border-hairline pt-4">
                <span aria-hidden="true" className="font-mono text-caption text-text-tertiary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-h4 text-text-primary">{principle.title}</h3>
                  <p className="max-w-[68ch] text-body-sm text-text-secondary">{principle.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </SectionShell>

      <SectionShell className="border-t border-hairline">
        <Section className="flex flex-col items-start gap-4">
          <Eyebrow>Careers & collaboration</Eyebrow>
          <h2 className="max-w-[32ch] text-h2 text-text-primary">If your work is measurable, we would like to read it.</h2>
          <p className="max-w-[60ch] text-body text-text-secondary">
            We are interested in conversations with researchers and engineers who prefer evidence to adjectives. There
            is no application form and no invented headcount to report — just an address.
          </p>
          <Link href="/contact" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            Get in touch
          </Link>
        </Section>
      </SectionShell>

      <ClosingCta eyebrow="Next" headline={aboutContent.closing.headline} body={aboutContent.closing.body} />
    </>
  );
}
