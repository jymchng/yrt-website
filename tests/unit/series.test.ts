import { describe, expect, it } from 'vitest';

import {
  createDailySeries,
  gaussian,
  maxDrawdown,
  mean,
  mulberry32,
  sharpeRatio,
  standardDeviation,
} from '@/lib/data/series';
import type { DailyPoint } from '@/lib/data/types';

function point(equity: number, ret = 0): DailyPoint {
  return { day: '2026-01-01', equity, ret, volume: 0, flow: 0 };
}

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const drawsA = Array.from({ length: 8 }, () => a());
    const drawsB = Array.from({ length: 8 }, () => b());
    expect(drawsA).toEqual(drawsB);
  });

  it('produces different streams for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(Array.from({ length: 5 }, () => a())).not.toEqual(Array.from({ length: 5 }, () => b()));
  });

  it('stays inside [0, 1)', () => {
    const random = mulberry32(20261001);
    for (let i = 0; i < 5_000; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('gaussian', () => {
  it('is standard normal in the first two moments', () => {
    const random = mulberry32(7);
    const draws = Array.from({ length: 20_000 }, () => gaussian(random));
    expect(mean(draws)).toBeCloseTo(0, 1);
    expect(standardDeviation(draws)).toBeCloseTo(1, 1);
  });
});

describe('createDailySeries', () => {
  it('is a pure function of its seed', () => {
    expect(createDailySeries(123, 40)).toEqual(createDailySeries(123, 40));
  });

  it('honours the requested length and defaults to 252 trading days', () => {
    expect(createDailySeries(123, 10)).toHaveLength(10);
    expect(createDailySeries()).toHaveLength(252);
  });

  it('emits ascending ISO dates with no clock dependency', () => {
    const series = createDailySeries(5, 30);
    for (const row of series) expect(row.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const days = series.map((row) => row.day);
    expect([...days].sort()).toEqual(days);
    // The fixture always ends on the same fixed date, so a snapshot of the
    // markup can never drift with the wall clock.
    expect(days.at(-1)).toBe('2026-09-30');
  });

  it('keeps every field finite and positive where the model requires it', () => {
    for (const row of createDailySeries(99, 60)) {
      expect(Number.isFinite(row.ret)).toBe(true);
      expect(Number.isFinite(row.equity)).toBe(true);
      expect(row.equity).toBeGreaterThan(0);
      expect(row.volume).toBeGreaterThan(0);
      expect(Number.isFinite(row.flow)).toBe(true);
    }
  });
});

describe('summary statistics', () => {
  it('treats the empty sample as zero rather than NaN', () => {
    expect(mean([])).toBe(0);
    expect(standardDeviation([])).toBe(0);
    expect(standardDeviation([1])).toBe(0);
  });

  it('computes the sample standard deviation', () => {
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });

  it('measures peak-to-trough drawdown as a negative percentage', () => {
    expect(maxDrawdown([point(100), point(120), point(90), point(130)])).toBeCloseTo(-25, 10);
    expect(maxDrawdown([point(100), point(110)])).toBe(0);
  });

  it('returns zero Sharpe for a zero-variance series and a positive value for a positive drift', () => {
    expect(sharpeRatio([point(100, 0.01), point(101, 0.01), point(102, 0.01)])).toBe(0);
    expect(sharpeRatio([point(100, 0.004), point(101, 0.002), point(102, 0.006)])).toBeGreaterThan(0);
  });
});
