import type { DailyPoint } from '@/lib/data/types';

/**
 * Deterministic seeded PRNG (mulberry32). Dependency-free, O(1) per draw and
 * identical on server and client, which is what lets a chart be rendered into
 * static HTML and hydrated without a mismatch.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller, so returns are normal rather than uniform. */
export function gaussian(random: () => number): number {
  const u = Math.max(random(), Number.EPSILON);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const DASHBOARD_SEED = 20261001;
export const HERO_SEED = 7741;

/** The fixture ends on a fixed date so output never depends on the clock. */
const FIXTURE_END = Date.UTC(2026, 8, 30);
const DAY_MS = 86_400_000;
const TRADING_DAYS = 252;

function isoDay(offsetFromEnd: number): string {
  return new Date(FIXTURE_END - offsetFromEnd * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Generates the simulated daily series: a zero-drift random walk with 1.2%
 * daily volatility, log-normal volume and a signed order-flow imbalance.
 * Everything is illustrative (§10) — no figure here describes real trading.
 */
export function createDailySeries(seed: number = DASHBOARD_SEED, length: number = TRADING_DAYS): DailyPoint[] {
  const random = mulberry32(seed);
  const points: DailyPoint[] = [];
  let equity = 100;

  for (let i = 0; i < length; i += 1) {
    const shock = gaussian(random);
    const ret = 0.0004 + 0.012 * shock;
    equity = equity * (1 + ret);
    const volume = Math.round((820 + 260 * random() + 40 * Math.abs(shock)) * 10) / 10;
    const flow = Math.round((gaussian(random) * 45 + 8 * Math.abs(shock) * 10) * 10) / 10;

    points.push({ day: isoDay(length - 1 - i), ret, equity, volume, flow });
  }

  return points;
}

export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Peak-to-trough drawdown of the equity index, returned as a negative %. */
export function maxDrawdown(points: readonly DailyPoint[]): number {
  let peak = Number.NEGATIVE_INFINITY;
  let worst = 0;
  for (const point of points) {
    peak = Math.max(peak, point.equity);
    const drawdown = point.equity / peak - 1;
    worst = Math.min(worst, drawdown);
  }
  return worst * 100;
}

/** Annualised Sharpe of the simulated returns, rounded for display. */
export function sharpeRatio(points: readonly DailyPoint[]): number {
  const returns = points.map((point) => point.ret);
  const sd = standardDeviation(returns);
  if (sd === 0) return 0;
  return (mean(returns) / sd) * Math.sqrt(252);
}
