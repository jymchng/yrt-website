import { describe, expect, it } from 'vitest';

import { computeKpis, dailySeries, fullPeriodKpis, orderBook, periods, sliceSeries } from '@/lib/data/dashboard';

describe('dailySeries', () => {
  it('is a fixed 252-bucket fixture', () => {
    expect(dailySeries).toHaveLength(252);
    expect(periods).toEqual(['1M', '3M', '1Y', 'ALL']);
  });
});

describe('sliceSeries', () => {
  it('re-slices the same series from the end for every period', () => {
    expect(sliceSeries('1M').points).toHaveLength(21);
    expect(sliceSeries('3M').points).toHaveLength(63);
    expect(sliceSeries('1Y').points).toHaveLength(252);
    expect(sliceSeries('ALL').points).toHaveLength(dailySeries.length);
  });

  it('never invents points: every slice is a suffix of the fixture', () => {
    const slice = sliceSeries('3M');
    expect(slice.points.at(-1)).toEqual(dailySeries.at(-1));
    expect(slice.points.at(0)).toEqual(dailySeries[dailySeries.length - 63]);
  });
});

describe('computeKpis', () => {
  it('derives KPIs from the series instead of hard-coding them', () => {
    const kpis = computeKpis(dailySeries);
    const last = dailySeries.at(-1);
    expect(kpis.equityIndex).toBeCloseTo(Number((last?.equity ?? 0).toFixed(2)), 2);
    expect(kpis.maxDrawdownPct).toBeLessThanOrEqual(0);
    expect(kpis.dailyVolPct).toBeGreaterThan(0);
    expect(kpis.dailyVolPct).toBeLessThan(100);
    expect(Number.isFinite(kpis.sharpe)).toBe(true);
    expect(Number.isFinite(kpis.totalReturnPct)).toBe(true);
  });

  it('is stable across calls (no clock, no randomness)', () => {
    expect(computeKpis(dailySeries)).toEqual(fullPeriodKpis);
  });

  it('falls back to the rebased level for an empty series', () => {
    const kpis = computeKpis([]);
    expect(kpis.equityIndex).toBe(100);
    expect(kpis.sharpe).toBe(0);
    expect(kpis.maxDrawdownPct).toBe(0);
  });
});

describe('orderBook', () => {
  it('is eight cumulative levels per side', () => {
    expect(orderBook).toHaveLength(8);
    orderBook.forEach((row, index) => {
      expect(row.level).toBe(index + 1);
      expect(row.bidDepth).toBeGreaterThan(0);
      expect(row.askDepth).toBeGreaterThan(0);
      if (index > 0) {
        const previous = orderBook[index - 1];
        expect(row.bidDepth).toBeGreaterThan(previous?.bidDepth ?? 0);
        expect(row.askDepth).toBeGreaterThan(previous?.askDepth ?? 0);
      }
    });
  });
});
