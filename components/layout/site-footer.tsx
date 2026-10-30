import Link from 'next/link';

import { Wordmark } from '@/components/layout/wordmark';
import { footerNav, siteMeta } from '@/lib/site';

/**
 * Design-system §4.3/§9. The footer is the last place the integrity constraint
 * is restated: secondary navigation, the illustrative-data disclaimer and the
 * contact address all live here.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface-1">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-8 md:py-16 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Wordmark asLink={false} />
            <p className="max-w-[52ch] font-mono text-caption text-text-tertiary">
              Quantitative research. Systematic strategies. Data-driven trading.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <h2 className="font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase">Navigate</h2>
            <ul className="flex flex-col gap-2">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-sm text-small text-text-secondary transition-colors duration-[var(--duration-base)] hover:text-text-primary md:min-h-0"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase">Contact</h2>
            <address className="flex flex-col gap-2 text-small text-text-secondary not-italic">
              <a href={`mailto:${siteMeta.email}`} className="inline-flex min-h-11 items-center rounded-sm text-info-text hover:underline md:min-h-0">
                {siteMeta.email}
              </a>
              <span className="text-text-tertiary">Singapore</span>
            </address>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase">Data note</h2>
            <p className="max-w-[52ch] text-caption text-text-tertiary">
              Every chart, return, ratio and drawdown on this site is simulated data generated from a seeded
              deterministic fixture. Nothing here describes live or historical trading performance.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-hairline pt-6 font-mono text-caption text-text-tertiary md:flex-row md:items-center md:justify-between">
          <p>© {siteMeta.year} Yishun River Trading. Yishun has no river.</p>
          <p>Illustrative figures only · no investment advice · no offers solicited</p>
        </div>
      </div>
    </footer>
  );
}
