'use client';

import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipContent, TooltipProvider, Tooltip as UiTooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { computeKpis, periods, sliceSeries } from '@/lib/data/dashboard';
import type { Period } from '@/lib/data/types';
import { formatCompact, formatNumber, formatPercent, formatShortDate, formatSignedNumber, formatSignedPercent } from '@/lib/format';

/**
 * The integrity-critical component (design-system §6.6). Seven figures are
 * required and the coverage contract is explicit:
 *
 *   equity curve   → panel 1 (area, series-1 with an 8% wash)
 *   daily returns  → panel 2 (signed bars, series-1 / series-6)
 *   volatility     → KPI 4  (daily standard deviation of returns)
 *   Sharpe         → KPI 2
 *   max drawdown   → KPI 3  (signed, negative tone)
 *   volume         → panel 3 (solid series-3 bars)
 *   market activity→ panel 4 (signed net order-flow imbalance per bucket)
 *
 * All figures come from one seeded fixture, so the headline number and the
 * curve that illustrates it cannot disagree. Every panel is a `figure` with
 * `role="img"`, an `aria-label` and a visually-hidden summary; the SVG is
 * hidden from assistive technology so the summary is announced once.
 */

type ChartRow = {
  day: string;
  equity: number;
  retPct: number;
  volume: number;
  flow: number;
};

type TooltipItem = { value?: number | string };

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: readonly TooltipItem[];
  label?: string | number;
  format: (value: number) => string;
}) {
  const value = payload?.[0]?.value;
  if (!active || typeof value !== 'number') return null;

  return (
    <TooltipContent side="top">
      <p className="text-text-tertiary">{typeof label === 'string' ? formatShortDate(label) : String(label ?? '')}</p>
      <p className="tabular text-text-primary">{format(value)}</p>
    </TooltipContent>
  );
}

function PanelFrame({
  title,
  caption,
  ariaLabel,
  summary,
  children,
  className,
}: {
  title: string;
  caption: string;
  ariaLabel: string;
  summary: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure role="img" aria-label={ariaLabel} className={`flex min-w-0 flex-col gap-3 rounded-md border border-border bg-surface-card p-4 md:p-5 ${className ?? ''}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-h4 text-text-primary">{title}</h3>
        <span className="font-mono text-eyebrow text-text-tertiary">SIMULATED</span>
      </div>
      <div aria-hidden="true" className="h-44 w-full min-w-0 md:h-48">
        {children}
      </div>
      <figcaption className="font-mono text-caption text-text-tertiary">
        {caption} · <span className="sr-only">{summary}</span>
        <span aria-hidden="true">illustrative series, seeded</span>
      </figcaption>
    </figure>
  );
}

/** Panel-level failure isolation: a broken series never blanks the card. */
class PanelBoundary extends Component<{ children: React.ReactNode; title: string }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (this.state.failed) {
      return (
        <p className="rounded-md border border-border bg-surface-card p-5 font-mono text-caption text-text-tertiary">
          {this.props.title} is unavailable — the simulated series could not be rendered.
        </p>
      );
    }
    return this.props.children;
  }
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return narrow;
}

function useCountUp(target: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(target * progress);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target, enabled]);

  // Reduced motion renders the final value instead of animating to it. Waiting
  // for a frame would be wrong here: frame callbacks are throttled or suspended
  // in background tabs, and a counter stuck at zero is the one outcome the
  // reduced-motion promise forbids. `enabled` is only false after hydration
  // (useReducedMotion resolves post-mount), so the server markup still matches.
  return enabled ? value : target;
}

const axisTick = { fill: 'var(--color-text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' } as const;
const gridStroke = 'var(--color-hairline)';

export function DashboardPreview() {
  const reduceMotion = useReducedMotion();
  const narrow = useIsNarrow();
  const [period, setPeriod] = useState<Period>('1Y');

  const { rows, kpis } = useMemo(() => {
    const series = sliceSeries(period);
    return {
      rows: series.points.map<ChartRow>((point) => ({
        day: point.day,
        equity: Math.round(point.equity * 100) / 100,
        retPct: Math.round(point.ret * 10_000) / 100,
        volume: point.volume,
        flow: point.flow,
      })),
      kpis: computeKpis(series.points),
    };
  }, [period]);

  const tickCount = narrow ? 3 : 4;
  const animate = !reduceMotion;

  const equity = useCountUp(kpis.equityIndex, animate);
  const sharpe = useCountUp(kpis.sharpe, animate);
  const drawdown = useCountUp(kpis.maxDrawdownPct, animate);
  const volatility = useCountUp(kpis.dailyVolPct, animate);

  const lastEquity = rows.at(-1)?.equity ?? 0;
  const firstEquity = rows.at(0)?.equity ?? 0;
  const periodReturn = firstEquity === 0 ? 0 : ((lastEquity - firstEquity) / firstEquity) * 100;

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <div className="flex flex-col gap-6">
        <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TabsList aria-label="Simulated dashboard period">
              {periods.map((option) => (
                <TabsTrigger key={option} value={option}>
                  {option}
                </TabsTrigger>
              ))}
            </TabsList>
            <p className="font-mono text-caption text-text-tertiary">
              Period toggle re-slices the same seeded series · {rows.length} buckets
            </p>
          </div>

          <TabsContent value={period} className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <Kpi
                label="Equity index"
                value={formatNumber(equity, 2)}
                detail={`${formatSignedPercent(periodReturn)} over ${period}`}
                detailTone={periodReturn >= 0 ? 'positive' : 'negative'}
                definition="Equity index level of the simulated series, rebased to 100 at the start of the fixture."
              />
              <Kpi
                label="Sharpe (simulated)"
                value={formatSignedNumber(sharpe, 2)}
                detail="annualised, zero risk-free rate"
                definition="Annualised mean excess return divided by return volatility, computed from the same seeded series. Simulated, not a fund result."
              />
              <Kpi
                label="Max drawdown"
                value={formatSignedPercent(drawdown, 2)}
                detail="peak to trough, close to close"
                tone="negative"
                definition="Worst peak-to-trough decline of the simulated equity index over the selected period."
              />
              <Kpi
                label="Daily volatility"
                value={formatPercent(volatility, 2)}
                detail="standard deviation of daily returns"
                definition="Standard deviation of the simulated daily returns. Daily, not annualised."
              />
            </dl>

            <PanelBoundary title="Equity curve">
              <PanelFrame
                title="Equity curve"
                caption="Simulated equity index"
                ariaLabel={`Simulated equity curve over ${period}, ending at an index level of ${formatNumber(lastEquity, 2)}.`}
                summary={`The simulated equity index moves from ${formatNumber(firstEquity, 2)} to ${formatNumber(lastEquity, 2)} across ${rows.length} buckets.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart accessibilityLayer={false} data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="equity-wash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-series-1)" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="var(--color-series-1)" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={gridStroke} strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickFormatter={formatShortDate}
                      tick={axisTick}
                      tickLine={false}
                      axisLine={{ stroke: gridStroke }}
                      tickCount={tickCount}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={axisTick}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                      tickCount={tickCount}
                      domain={['auto', 'auto']}
                      tickFormatter={(value: number) => formatNumber(value, 0)}
                    />
                    <Tooltip content={<ChartTooltip format={(value) => formatNumber(value, 2)} />} cursor={{ stroke: 'var(--color-border-strong)' }} />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="var(--color-series-1)"
                      strokeWidth={1.5}
                      fill="url(#equity-wash)"
                      isAnimationActive={animate}
                      animationDuration={800}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </PanelFrame>
            </PanelBoundary>

            <div className="grid gap-4 lg:grid-cols-3">
              <PanelBoundary title="Daily returns">
                <PanelFrame
                  title="Daily returns"
                  caption="Simulated daily returns"
                  ariaLabel={`Simulated daily returns over ${period}, signed bars around a zero rule, range ${formatSignedPercent(Math.min(...rows.map((row) => row.retPct)))} to ${formatSignedPercent(Math.max(...rows.map((row) => row.retPct)))}.`}
                  summary="Each bar is one day's simulated return; bars above the zero rule are positive and bars below it are negative."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart accessibilityLayer={false} data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={gridStroke} strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickFormatter={formatShortDate}
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: gridStroke }}
                        tickCount={tickCount}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={axisTick}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        tickCount={tickCount}
                        tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                      />
                      <ReferenceLine y={0} stroke="var(--color-hairline)" />
                      <Tooltip content={<ChartTooltip format={(value) => formatSignedPercent(value)} />} cursor={{ fill: 'var(--color-surface-1)' }} />
                      <Bar dataKey="retPct" isAnimationActive={animate} animationDuration={600}>
                        {rows.map((row) => (
                          <Cell key={row.day} fill={row.retPct >= 0 ? 'var(--color-series-1)' : 'var(--color-series-6)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </PanelFrame>
              </PanelBoundary>

              <PanelBoundary title="Volume">
                <PanelFrame
                  title="Volume"
                  caption="Simulated traded volume"
                  ariaLabel="Simulated traded volume per bucket as solid bars."
                  summary="Traded volume per bucket, generated from the same seed as the returns series."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart accessibilityLayer={false} data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={gridStroke} strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickFormatter={formatShortDate}
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: gridStroke }}
                        tickCount={tickCount}
                        minTickGap={24}
                      />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} tickCount={tickCount} />
                      <Tooltip content={<ChartTooltip format={(value) => formatCompact(value)} />} cursor={{ fill: 'var(--color-surface-1)' }} />
                      <Bar dataKey="volume" fill="var(--color-series-3)" isAnimationActive={animate} animationDuration={600} />
                    </BarChart>
                  </ResponsiveContainer>
                </PanelFrame>
              </PanelBoundary>

              <PanelBoundary title="Market activity">
                <PanelFrame
                  title="Market activity"
                  caption="Net order-flow imbalance per bucket"
                  ariaLabel="Simulated market activity: signed net order-flow imbalance per bucket, positive cyan above the zero rule and negative red below it."
                  summary="Market activity is the signed net order-flow imbalance per bucket: positive bars mean net buying pressure, negative bars mean net selling pressure."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart accessibilityLayer={false} data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={gridStroke} strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickFormatter={formatShortDate}
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: gridStroke }}
                        tickCount={tickCount}
                        minTickGap={24}
                      />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} tickCount={tickCount} />
                      <ReferenceLine y={0} stroke="var(--color-hairline)" />
                      <Tooltip content={<ChartTooltip format={(value) => formatSignedNumber(value, 1)} />} cursor={{ fill: 'var(--color-surface-1)' }} />
                      <Bar dataKey="flow" isAnimationActive={animate} animationDuration={600}>
                        {rows.map((row) => (
                          <Cell key={row.day} fill={row.flow >= 0 ? 'var(--color-series-3)' : 'var(--color-series-6)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </PanelFrame>
              </PanelBoundary>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function Kpi({
  label,
  value,
  detail,
  detailTone = 'neutral',
  tone = 'neutral',
  definition,
}: {
  label: string;
  value: string;
  detail: string;
  detailTone?: 'neutral' | 'positive' | 'negative';
  tone?: 'neutral' | 'negative';
  definition: string;
}) {
  const detailColour = detailTone === 'positive' ? 'text-accent' : detailTone === 'negative' ? 'text-negative' : 'text-text-tertiary';

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border bg-surface-card p-4">
      <dt className="font-mono text-caption text-text-tertiary">
        <UiTooltip>
          <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-4">{label}</TooltipTrigger>
          <TooltipContent side="top">{definition}</TooltipContent>
        </UiTooltip>
      </dt>
      <dd className={`tabular text-data-xl ${tone === 'negative' ? 'text-negative' : 'text-text-primary'}`}>{value}</dd>
      <dd className={`font-mono text-caption ${detailColour}`}>{detail}</dd>
    </div>
  );
}
