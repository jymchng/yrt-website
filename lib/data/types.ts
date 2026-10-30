/** Shared shapes for every simulated figure on the site. */

export type DailyPoint = {
  /** ISO date, fixed by the fixture (never `Date.now()`). */
  day: string;
  /** Simple daily return, e.g. 0.0043 = +0.43%. */
  ret: number;
  /** Equity index level, rebased to 100 at the start of the fixture. */
  equity: number;
  /** Traded notional in millions of the simulated currency unit. */
  volume: number;
  /** Signed net order-flow imbalance, negative = net selling. */
  flow: number;
};

export type Period = '1M' | '3M' | '1Y' | 'ALL';

export type DashboardSeries = {
  readonly period: Period;
  readonly points: readonly DailyPoint[];
};

export type DashboardKpis = {
  readonly equityIndex: number;
  readonly totalReturnPct: number;
  readonly sharpe: number;
  readonly maxDrawdownPct: number;
  readonly dailyVolPct: number;
};
