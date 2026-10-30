import { Badge } from '@/components/ui/badge';
import { ArchitectureDiagram, ArchitectureLegend } from '@/components/technology/architecture-diagram';
import { Eyebrow, PageIntro, Section, SectionShell } from '@/components/shared/primitives';
import { codeSamples, technologyAreas } from '@/lib/content/capabilities';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Technology',
  description:
    'The engineering foundations: trading infrastructure, market data processing, backtesting, execution systems, statistical computing, distributed systems and performance engineering — described as capabilities, not infrastructure claims.',
  path: '/technology',
});

export default function TechnologyPage() {
  return (
    <>
      <SectionShell>
        <Section className="flex flex-col gap-10">
          <PageIntro
            eyebrow="Technology"
            title="Technology"
            lead="Systems are part of the research, not a delivery detail. These are the capability areas the work is built from — described as design intentions, with no claim about a running deployment."
          />

          <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {technologyAreas.map((area, index) => (
              <li key={area.slug} id={area.slug} className="flex flex-col gap-3 rounded-md border border-border bg-surface-card p-5 md:p-6">
                <Eyebrow>{String(index + 1).padStart(2, '0')}</Eyebrow>
                <h2 className="text-h3 text-text-primary">{area.title}</h2>
                <p className="text-body-sm text-text-secondary">{area.description}</p>
                <ul className="mt-auto flex flex-col gap-1.5 border-t border-hairline pt-4">
                  {area.capabilities.map((capability) => (
                    <li key={capability} className="font-mono text-caption text-text-tertiary">
                      {capability}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      </SectionShell>

      <SectionShell className="border-y border-hairline bg-surface-1">
        <Section className="grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <Eyebrow>Architecture</Eyebrow>
            <h2 className="text-h2 text-text-primary">Four layers, one direction of flow.</h2>
            <ArchitectureLegend />
          </div>
          <div className="lg:col-span-8">
            <ArchitectureDiagram />
          </div>
        </Section>
      </SectionShell>

      <SectionShell>
        <Section className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-4">
              <Eyebrow>Code-inspired</Eyebrow>
              <h2 className="text-h2 text-text-primary">What the work looks like, in three fragments.</h2>
            </div>
            <Badge variant="caution" className="max-w-full whitespace-normal">Static listings — not a running system</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {codeSamples.map((sample) => (
              <figure
                key={sample.title}
                className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-surface-1"
              >
                <figcaption className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
                  <span className="font-mono text-caption text-text-primary">{sample.title}</span>
                  <span className="font-mono text-caption text-text-tertiary">{sample.language}</span>
                </figcaption>
                <pre tabIndex={0} aria-label={`${sample.title} — static ${sample.language} listing`} className="overflow-x-auto p-4 font-mono text-code text-text-secondary">
                  <code>{sample.code}</code>
                </pre>
              </figure>
            ))}
          </div>
          <p className="max-w-[60ch] font-mono text-caption text-text-tertiary">
            Listings are illustrative fragments. They are not extracted from a production system and they are not
            executed anywhere on this site.
          </p>
        </Section>
      </SectionShell>
    </>
  );
}
