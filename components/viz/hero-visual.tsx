import { heroSeries } from '@/lib/data/hero';
import { orderBook } from '@/lib/data/dashboard';
import { formatSignedPercent } from '@/lib/format';

/**
 * The hero's quantitative visualisation: a seeded market panel rather than stock
 * photography (brief §4.1). It is server-rendered and animated with CSS only —
 * the line-draw and depth-settle keyframes are flattened by the global
 * `prefers-reduced-motion` block, so the static frame is the reduced-motion
 * state and no client island is needed.
 *
 * Design-system §6.1 keeps the *background* river motif at ≤4% opacity behind
 * the copy; this is a foreground figure, so it is legible, labelled and carries
 * a text alternative (§9).
 */
export function HeroVisual() {
  const chartWidth = 320;
  const chartHeight = 132;
  const step = chartWidth / (heroSeries.length - 1);

  const linePath = heroSeries
    .map((point, index) => {
      const x = index * step;
      const y = chartHeight - (point.y / 100) * chartHeight;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `${linePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;
  const last = heroSeries.at(-1);
  const first = heroSeries.at(0);
  const changePct = first && last ? ((last.y - first.y) / first.y) * 100 : 0;
  const maxDepth = Math.max(...orderBook.map((row) => Math.max(row.bidDepth, row.askDepth)));

  return (
    <figure
      role="img"
      aria-label="Simulated market panel: a seeded price path rising then falling across 48 intervals, with a signed order book of eight price levels on each side."
      className="w-full"
    >
      <div aria-hidden="true" className="overflow-hidden rounded-lg border border-border bg-surface-card shadow-raised">
        <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-1 px-4 py-2.5">
          <span className="font-mono text-caption text-text-tertiary">SIM · YRT-INDEX</span>
          <span className="font-mono text-caption text-text-secondary">1D · 48 intervals</span>
          <span className={`tabular text-caption ${changePct >= 0 ? 'text-accent' : 'text-negative'}`}>
            {formatSignedPercent(changePct)}
          </span>
        </div>

        <div className="px-3 pt-3">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-32 w-full" preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id="hero-wash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-series-1)" stopOpacity="0.16" />
                <stop offset="100%" stopColor="var(--color-series-1)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={fraction}
                x1="0"
                x2={chartWidth}
                y1={chartHeight * fraction}
                y2={chartHeight * fraction}
                stroke="var(--color-hairline)"
                strokeWidth="1"
              />
            ))}
            <path d={areaPath} fill="url(#hero-wash)" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-series-1)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="line-draw"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-hairline px-4 py-3">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-eyebrow tracking-[0.08em] text-text-tertiary">BIDS</p>
            {orderBook.slice(4, 8).map((row) => (
              <div key={`bid-${row.level}`} className="flex items-center gap-2">
                <span className="w-6 shrink-0 font-mono text-eyebrow text-text-tertiary">L{row.level}</span>
                <span className="h-1.5 flex-1 bg-surface-1">
                  <span
                    className="depth-settle block h-full bg-series-1/40 ring-1 ring-series-1 ring-inset"
                    style={{ width: `${Math.round((row.bidDepth / maxDepth) * 100)}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-right font-mono text-eyebrow tracking-[0.08em] text-text-tertiary">ASKS</p>
            {orderBook.slice(4, 8).map((row) => (
              <div key={`ask-${row.level}`} className="flex flex-row-reverse items-center gap-2">
                <span className="w-6 shrink-0 text-right font-mono text-eyebrow text-text-tertiary">L{row.level}</span>
                <span className="h-1.5 flex-1 bg-surface-1">
                  <span
                    className="depth-settle ml-auto block h-full bg-series-6/40 ring-1 ring-series-6 ring-inset"
                    style={{ width: `${Math.round((row.askDepth / maxDepth) * 100)}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-hairline px-4 py-2">
          <span className="font-mono text-eyebrow text-text-tertiary">SEEDED FIXTURE · NOT LIVE DATA</span>
          <span className="font-mono text-eyebrow text-accent">SIMULATED</span>
        </div>
      </div>
      <figcaption className="sr-only">
        A seeded simulated price series over 48 intervals rises through the first two thirds of the window and
        gives back part of the gain at the end. Beneath it, a simulated order book lists cumulative depth for
        eight levels on each side; bids and asks are drawn as mirrored bars with a solid leading edge. All
        values are generated from a fixed seed for illustration and are not market data.
      </figcaption>
    </figure>
  );
}
