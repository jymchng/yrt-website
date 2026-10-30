import { PageIntro, Section, SectionShell } from '@/components/shared/primitives';
import { ResearchFilter } from '@/components/research/research-filter';
import { researchEntries } from '@/lib/content/research';
import { parseFilter } from '@/lib/research/filter';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Research',
  description:
    'Illustrative research notes on market microstructure, statistical arbitrage, execution, portfolio optimisation, time-series analysis and financial machine learning.',
  path: '/research',
});

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { state } = parseFilter(params);

  return (
    <SectionShell>
      <Section className="flex flex-col gap-10">
        <PageIntro
          eyebrow="Research"
          title="Research"
          lead="Notes, technical memos and mathematical explorations from the research process. Every entry is illustrative: the entries demonstrate method and tone, not results."
        />
        <ResearchFilter entries={researchEntries} initialCategory={state.category} initialQuery={state.query} />
      </Section>
    </SectionShell>
  );
}
