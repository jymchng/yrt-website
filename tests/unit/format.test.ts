import { describe, expect, it } from 'vitest';

import {
  formatCompact,
  formatDate,
  formatNumber,
  formatPercent,
  formatShortDate,
  formatSignedNumber,
  formatSignedPercent,
} from '@/lib/format';

const MINUS = '\u2212';

describe('formatNumber', () => {
  it('groups thousands and fixes the digit count', () => {
    expect(formatNumber(1234.5)).toBe('1,234.50');
    expect(formatNumber(0, 0)).toBe('0');
    expect(formatNumber(99.999, 2)).toBe('100.00');
  });
});

describe('signed formatting', () => {
  it('always prints an explicit sign, using a typographic minus', () => {
    expect(formatSignedNumber(1.234)).toBe('+1.23');
    expect(formatSignedNumber(-1.234)).toBe(`${MINUS}1.23`);
    expect(formatSignedNumber(0)).toBe('+0.00');
    expect(formatSignedPercent(-3.5)).toContain(MINUS);
    expect(formatSignedPercent(3.5)).toBe('+3.50%');
  });

  it('never uses a hyphen as a minus sign', () => {
    expect(formatSignedNumber(-5)).not.toContain('-');
  });
});

describe('percent and compact helpers', () => {
  it('appends the unit exactly once', () => {
    expect(formatPercent(12.345)).toBe('12.35%');
    expect(formatCompact(820.44)).toBe('820.4M');
  });
});

describe('dates', () => {
  it('formats in a fixed locale and UTC, so output is deterministic', () => {
    expect(formatDate('2026-08-18')).toBe('18 Aug 2026');
    expect(formatShortDate('2026-08-18')).toBe('18 Aug');
    expect(formatDate('2026-01-01')).toBe('01 Jan 2026');
  });
});
