import { mulberry32 } from '@/lib/data/series';

/**
 * The hero motif's seeded path. Two normalised series (the simulated price and
 * the river that does not exist) plus the signal markers the line-draw animates
 * to. Deterministic: `HERO_SEED` always produces this exact path.
 */
export type HeroPoint = { x: number; y: number };

export const heroSeries: readonly HeroPoint[] = (() => {
  const random = mulberry32(7741);
  const points: HeroPoint[] = [];
  let level = 0.5;

  for (let i = 0; i < 48; i += 1) {
    level += (random() - 0.5) * 0.09;
    level = Math.min(0.92, Math.max(0.08, level));
    points.push({ x: Math.round((i / 47) * 1000) / 10, y: Math.round(level * 1000) / 10 });
  }

  return points;
})();

/** Path data for an SVG polyline over a 100×100 viewBox. */
export const heroPath = heroSeries.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');

/** Depth bars behind the hero line — decorative, `aria-hidden` (§6.13). */
export const heroDepth = (() => {
  const random = mulberry32(991);
  return Array.from({ length: 24 }, () => Math.round((0.15 + random() * 0.85) * 100) / 100);
})();
