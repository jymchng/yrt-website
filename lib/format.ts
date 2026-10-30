/** Formatting helpers shared by the dashboard, the figures and the tests. */

const MINUS = '\u2212';

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * Sign is never carried by colour alone (§2.5): an explicit `+` or `−` is
 * always printed, and `−` is the typographic minus rather than a hyphen.
 */
export function formatSignedNumber(value: number, digits = 2): string {
  const sign = value < 0 ? MINUS : '+';
  return `${sign}${formatNumber(Math.abs(value), digits)}`;
}

export function formatSignedPercent(value: number, digits = 2): string {
  return `${formatSignedNumber(value, digits)}%`;
}

export function formatPercent(value: number, digits = 2): string {
  return `${formatNumber(value, digits)}%`;
}

export function formatCompact(value: number, digits = 1): string {
  return `${formatNumber(value, digits)}M`;
}

/** `2026-08-18` → `18 Aug 2026`. Fixed locale, so output is deterministic. */
export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** `2026-08-18` → `18 Aug`. Used for axis ticks, where the year is noise. */
export function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date);
}
