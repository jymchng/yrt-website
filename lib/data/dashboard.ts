import { createDailySeries, maxDrawdown, mulberry32, sharpeRatio, standardDeviation } from '@/lib/data/series';
import type { DailyPoint, DashboardKpis, DashboardSeries, Period } from '@/lib/data/types';

/**
 * The dashboard's single seeded fixture. Generated once at module scope: it is
 * identical on the server and in the client bundle, so the chart renders into
 * static HTML and hydrates without a mismatch, and no per-render work is done.
 */
export const dailySeries: readonly DailyPoint[] = createDailySeries();

const PERIOD_OFFSETS: Record<Period, number> = {
  '1M': 21,
  '3M': 63,
  '1Y': 252,
  ALL: dailySeries.length,
};

export const periods: readonly Period[] = ['1M', '3M', '1Y', 'ALL'] as const;

/** The tabs re-slice the same series; they never imply different or live data. */
export function sliceSeries(period: Period): DashboardSeries {
  const take = PERIOD_OFFSETS[period];
  return { period, points: dailySeries.slice(Math.max(0, dailySeries.length - take)) };
}

/**
 * KPIs are computed from the fixture, not typed in, so the headline number and
 * the curve that illustrates it cannot disagree.
 */
export function computeKpis(points: readonly DailyPoint[]): DashboardKpis {
  const first = points.at(0);
  const last = points.at(-1);
  const startEquity = first?.equity ?? 100;
  const endEquity = last?.equity ?? 100;
  const returns = points.map((point) => point.ret);

  return {
    equityIndex: Math.round(endEquity * 100) / 100,
    totalReturnPct: Math.round(((endEquity / (startEquity / (1 + (first?.ret ?? 0)))) - 1) * 10_000) / 100,
    sharpe: Math.round(sharpeRatio(points) * 100) / 100,
    maxDrawdownPct: Math.round(maxDrawdown(points) * 100) / 100,
    /** Daily standard deviation of returns (not annualised) — brief §4.1. */
    dailyVolPct: Math.round(standardDeviation(returns) * 100 * 100) / 100,
  };
}

export const fullPeriodKpis = computeKpis(dailySeries);

/**
 * Simulated order book used by the hero motif (decorative) and the technology
 * page's coded depth figure (data-bearing). Cumulative, 8 levels a side.
 */
export const orderBook = (() => {
  const random = mulberry32(4471);
  const rows: { level: number; bidDepth: number; askDepth: number }[] = [];
  let bid = 0;
  let ask = 0;

  for (let level = 1; level <= 8; level += 1) {
    bid += Math.round((120 + random() * 90) * 10) / 10;
    ask += Math.round((115 + random() * 95) * 10) / 10;
    rows.push({ level, bidDepth: bid, askDepth: ask });
  }

  return rows;
})();
