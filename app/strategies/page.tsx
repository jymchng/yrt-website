import Link from 'next/link';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import { Eyebrow, PageIntro, Section, SectionShell } from '@/components/shared/primitives';
import { Formula } from '@/components/shared/formula';
import { strategies } from '@/lib/content/strategies';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Strategies',
  description:
    'Seven conceptual strategy families — statistical arbitrage, market making, cross-exchange arbitrage, momentum, mean reversion, liquidity provision and portfolio optimisation — each with its mathematical intuition, data requirements, risks and implementation considerations.',
  path: '/strategies',
});

/**
 * Design-system §6.5: seven disclosures. The conceptual overview stays in the
 * DOM in every state; the remaining four dimensions are the collapsible region.
 * The accordion is a single Radix item set (`type="single"`, `collapsible`), and
 * collapsed content is height-animated real DOM — never `hidden="until-found"`.
 *
 * Copy rule (§10): these are conceptual research programmes. Nothing here claims
 * a strategy is live, funded or profitable.
 */
export default function StrategiesPage() {
  return (
    <SectionShell>
      <Section className="flex flex-col gap-10">
        <PageIntro
          eyebrow="Strategies"
          title="Strategies"
          lead="Seven conceptual research programmes. Each is a way of asking a question about markets, not a product and not a record: no strategy here is presented as deployed, funded or profitable."
        />

        <Accordion type="single" collapsible className="flex flex-col">
          {strategies.map((strategy, index) => (
            <AccordionItem key={strategy.slug} value={strategy.slug} id={strategy.slug}>
              <div className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-10">
                <div className="flex flex-col gap-3 lg:col-span-4">
                  <Eyebrow>
                    {String(index + 1).padStart(2, '0')} / {strategy.slug.replaceAll('-', ' ')}
                  </Eyebrow>
                  <h2 className="text-h2 text-text-primary">{strategy.name}</h2>
                  <p className="max-w-[40ch] text-body-sm text-text-secondary">{strategy.tagline}</p>
                </div>

                <div className="flex flex-col gap-4 lg:col-span-8">
                  <div className="flex max-w-[72ch] flex-col gap-3">
                    {strategy.overview.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)} className="text-body text-text-secondary">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <AccordionTrigger aria-label={`${strategy.name}: mathematical intuition, market data, risk and implementation`}>
                    <span aria-hidden="true">Mathematical intuition, market data, risk and implementation</span>
                    <span className="sr-only">{strategy.name}: mathematical intuition, market data, risk and implementation</span>
                  </AccordionTrigger>
                  <AccordionContent forceMount>
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-3">
                        <h3 className="text-h3 text-text-primary">Mathematical intuition</h3>
                        <Formula spec={strategy.math} />
                        {strategy.mathProse.map((paragraph) => (
                          <p key={paragraph.slice(0, 24)} className="max-w-[68ch] text-body-sm text-text-secondary">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      <Dimension title="Market data" items={strategy.data} />
                      <Dimension title="Risk considerations" items={strategy.risks} />
                      <Dimension title="Implementation considerations" items={strategy.implementation} />
                    </div>
                  </AccordionContent>
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex flex-col gap-4 border-t border-hairline pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[60ch] text-body-sm text-text-secondary">
            Strategy descriptions are conceptual. They describe how a family of methods is reasoned about, not what any
            system is doing today.
          </p>
          <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Contact Us
          </Link>
        </div>
      </Section>
    </SectionShell>
  );
}

function Dimension({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-h3 text-text-primary">{title}</h3>
      <ul className="flex max-w-[72ch] list-disc flex-col gap-2 pl-5 text-body-sm text-text-secondary marker:text-text-tertiary">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
