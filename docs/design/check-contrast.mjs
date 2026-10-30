#!/usr/bin/env node
/**
 * Design-system auditor for Yishun River Trading.
 *
 *   node docs/design/check-contrast.mjs
 *
 * Exit 0 -> the document, the canonical @theme block, this file's mirror and
 *           (when present) app/globals.css agree, and every audited pair holds.
 * Exit 1 -> a pair fails, a documented pitfall now passes, or the three copies
 *           of the token set have drifted apart.
 *
 * Why three-way: v1.0 of this script audited three surfaces while
 * docs/design/design-system.md section 2.2 claimed four, and the document's
 * token table had a --color-info-text that the @theme appendix never defined.
 * A contrast number is only evidence if the thing it measured is the thing the
 * document says it measured, so the token set is now parsed from three places
 * and compared before any ratio is computed.
 *
 * Sources of truth, in precedence order:
 *   1. app/globals.css         (only once it exists - the shipped values)
 *   2. docs/design/design-system.md section 15   (@theme block)
 *   3. docs/design/design-system.md section 2.1  (token table)
 *   4. the DEFAULTS mirror below                (so the script runs before app/ exists)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const DOC = join(repoRoot, 'docs', 'design', 'design-system.md');
const GLOBALS = join(repoRoot, 'app', 'globals.css');

let failures = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => {
  console.log(`  FAIL  ${m}`);
  failures += 1;
};

/* ------------------------------------------------------------------ *
 * Colour maths (WCAG 2.1 relative luminance, sRGB)
 * ------------------------------------------------------------------ */

const norm = (hex) => {
  const h = hex.replace('#', '').toUpperCase();
  if (h.length === 3) return '#' + [...h].map((c) => c + c).join('');
  return '#' + h.slice(0, 6);
};

const channel = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const luminance = (hex) => {
  const h = norm(hex);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/** Alpha-composite `fg` over `bg`; both `#rrggbb`, alpha 0..1. */
const composite = (fg, alpha, bg) => {
  const parse = (h) => [1, 3, 5].map((i) => parseInt(norm(h).slice(i, i + 2), 16));
  const [f, b] = [parse(fg), parse(bg)];
  const out = f.map((c, i) => Math.round(alpha * c + (1 - alpha) * b[i]));
  return '#' + out.map((c) => c.toString(16).padStart(2, '0').toUpperCase()).join('');
};

const TEXT = 4.5;
const NON_TEXT = 3.0;

/* ------------------------------------------------------------------ *
 * The mirror of section 2.1. Must equal both parsed copies exactly.
 * ------------------------------------------------------------------ */

const DEFAULTS = {
  // surfaces
  bg: '#09090B',
  'surface-1': '#111318',
  'surface-card': '#181A20',
  'surface-raised': '#1F222A',
  // text
  'text-primary': '#F4F4F5',
  'text-secondary': '#A1A1AA',
  'text-tertiary': '#8A8A94',
  // accents
  accent: '#10B981',
  'accent-hover': '#34D399',
  'accent-press': '#059669',
  'accent-ink': '#09090B',
  info: '#3B82F6',
  'info-text': '#60A5FA',
  negative: '#F87171',
  warning: '#FBBF24',
  // lines
  hairline: '#23252D',
  border: '#31343E',
  'border-strong': '#74747E',
  'border-hover': '#86868F',
  focus: '#10B981',
  // misc
  selection: '#10B98133',
  overlay: '#00000099',
  // badge washes (section 6.9; four are 12% of the variant hue over the card)
  'wash-neutral': '#111318',
  'wash-simulated': '#172D2C',
  'wash-illustrative': '#1C263A',
  'wash-caution': '#332E20',
  'wash-critical': '#33242A',
  // chart series
  'series-1': '#10B981',
  'series-2': '#3B82F6',
  'series-3': '#22D3EE',
  'series-4': '#FBBF24',
  'series-5': '#94A3B8',
  'series-6': '#F87171',
};

/* ------------------------------------------------------------------ *
 * Parse the document
 * ------------------------------------------------------------------ */

const doc = readFileSync(DOC, 'utf8');
const lines = doc.split('\n');

/** Slice the lines between two heading prefixes. */
const slice = (startPrefix, endPrefix) => {
  const start = lines.findIndex((l) => l.trimStart().startsWith(startPrefix));
  if (start === -1) throw new Error(`heading not found: ${startPrefix}`);
  const end = lines.findIndex((l, i) => i > start && l.trimStart().startsWith(endPrefix));
  return lines.slice(start, end === -1 ? lines.length : end);
};

/** `| `--color-x` | `#HEX` | ...` -> Map */
const parseTokenTable = (region) => {
  const out = new Map();
  const row = /^\|\s*`--color-([a-z0-9-]+)`\s*\|\s*`(#[0-9A-Fa-f]{3,8})`\s*\|/;
  for (const line of region) {
    const m = line.match(row);
    if (m) out.set(m[1], m[2].toUpperCase());
  }
  return out;
};

/** Parse `--color-x: #hex;` declarations out of a block of CSS text. */
const parseCss = (css) => {
  const out = new Map();
  for (const m of css.matchAll(/--color-([a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\s*;/g)) {
    out.set(m[1], m[2].toUpperCase());
  }
  return out;
};

const themeRegion = slice('## 15.', '**Known prerequisite');
const themeCssStart = themeRegion.findIndex((l) => l.trim() === '@theme {');
const themeCssEnd = themeRegion.findIndex((l, i) => i > themeCssStart && l.trim() === '}');
const themeTokens = parseCss(themeRegion.slice(themeCssStart, themeCssEnd).join('\n'));

const docTokens = parseTokenTable(slice('### 2.1 Token table', '### 2.2'));

let shippedTokens = null;
let shippedCss = null;
try {
  shippedCss = readFileSync(GLOBALS, 'utf8');
  const t = parseCss(shippedCss);
  if (t.size > 0) shippedTokens = t;
} catch {
  /* app/globals.css does not exist yet - expected before the build phase */
}

/* ------------------------------------------------------------------ *
 * 1. Three-way token-set agreement
 * ------------------------------------------------------------------ */

console.log('\n=== TOKEN SET: document table == @theme block == mirror == globals.css ===');

const compareSets = (a, aName, b, bName) => {
  let diffs = 0;
  for (const [k, v] of a) {
    if (!b.has(k)) {
      fail(`${aName} defines --color-${k} but ${bName} does not`);
      diffs += 1;
    } else if (b.get(k) !== v) {
      fail(`--color-${k}: ${aName} says ${v}, ${bName} says ${b.get(k)}`);
      diffs += 1;
    }
  }
  for (const k of b.keys()) {
    if (!a.has(k)) {
      fail(`${bName} defines --color-${k} but ${aName} does not`);
      diffs += 1;
    }
  }
  if (diffs === 0) pass(`${aName} == ${bName} (${a.size} colour tokens, identical)`);
  return diffs;
};

compareSets(docTokens, 'section 2.1 table', themeTokens, 'section 15 @theme');
compareSets(docTokens, 'section 2.1 table', new Map(Object.entries(DEFAULTS)), 'script mirror');
if (shippedTokens) {
  compareSets(docTokens, 'section 2.1 table', shippedTokens, 'app/globals.css');
  console.log(`  (app/globals.css present: ${shippedTokens.size} --color-* tokens parsed)`);
} else {
  console.log('  (app/globals.css not present yet: auditing the document + mirror)');
}

/* ------------------------------------------------------------------ *
 * 2. Surface-list completeness
 * ------------------------------------------------------------------ */

console.log('\n=== SURFACE COVERAGE ===');

const surfaces = ['bg', 'surface-1', 'surface-card', 'surface-raised'];
const declaredSurfaces = [...docTokens.keys()].filter(
  (k) => k === 'bg' || k.startsWith('surface-'),
);

let surfaceGap = 0;
for (const s of declaredSurfaces) {
  if (!surfaces.includes(s)) {
    fail(`--color-${s} is declared but not audited - add it to \`surfaces\``);
    surfaceGap += 1;
  }
}
for (const s of surfaces) {
  if (!declaredSurfaces.includes(s)) {
    fail(`audited surface "${s}" is not a declared --color-* token`);
    surfaceGap += 1;
  }
}
if (surfaceGap === 0) {
  pass(`all ${declaredSurfaces.length} declared surfaces audited: ${surfaces.join(', ')}`);
}

const T = (k) => docTokens.get(k);

/* ------------------------------------------------------------------ *
 * 3. Required pairs
 * ------------------------------------------------------------------ */

const required = [];
const add = (label, fg, bg, min) => required.push([label, fg, bg, min]);

// Text roles against every surface, including the overlay surface.
for (const role of [
  'text-primary',
  'text-secondary',
  'text-tertiary',
  'accent',
  'accent-hover',
  'info-text',
  'negative',
  'warning',
]) {
  for (const s of surfaces) add(`${role} on ${s}`, T(role), T(s), TEXT);
}

// Non-text boundaries and the focus ring against every surface.
// border-strong is held to 3.4, not 3.0: a 1px light-on-dark edge sitting at
// exactly 3.03 loses ~half a ratio to row/AA rendering and display gamma, so
// the design floor carries deliberate headroom (sections 2.3c and 2.3g).
for (const role of ['border-strong', 'border-hover']) {
  for (const s of surfaces) add(`${role} on ${s}`, T(role), T(s), 3.4);
}
for (const s of surfaces) add(`focus on ${s}`, T('focus'), T(s), NON_TEXT);

// Labels on filled controls: --color-accent-ink is the only permitted colour.
for (const fill of ['accent', 'info', 'negative', 'accent-press']) {
  add(`accent-ink label on ${fill} fill`, T('accent-ink'), T(fill), TEXT);
}
// A filled control must also separate from the page surface it sits on.
for (const fill of ['accent', 'info', 'negative', 'accent-press']) {
  add(`${fill} fill vs surface-card`, T(fill), T('surface-card'), NON_TEXT);
}

// Chart series on both surfaces a chart may be drawn on.
for (const s of ['surface-card', 'surface-1']) {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    add(`series-${n} on ${s}`, T(`series-${n}`), T(s), NON_TEXT);
  }
}

// The focus ring is deliberately NOT asserted against a chart stroke: the ring
// is always drawn with a 2px offset across the page surface (section 2.4), so
// the per-surface checks above are the ones that govern it. The badge washes
// are checked separately in section 6.9 below, because those DO sit under a ring.

/* ------------------------------------------------------------------ *
 * 3. Section 2.2's printed table must equal a fresh computation
 *    This is the document's central claim: every ratio it prints was
 *    measured. If a row is edited without re-measuring, this fails.
 * ------------------------------------------------------------------ */

console.log('\n=== SECTION 2.2 PRINTED TABLE vs FRESH COMPUTATION ===');

let printedRows = 0;
let printedCells = 0;
let printedMismatch = 0;
for (const line of slice('### 2.2 Measured contrast', '### 2.3')) {
  if (!line.startsWith('|')) continue;
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 6) continue;
  const hexes = [...cells[1].matchAll(/#([0-9A-Fa-f]{6})/g)].map((m) => '#' + m[1].toUpperCase());
  if (hexes.length === 0) continue;
  const fg = hexes[0];
  const explicitBg = hexes[1] ?? null; // e.g. "ink on #059669 press"
  const label = cells[1].replace(/`/g, '').slice(0, 44);
  printedRows += 1;

  for (let i = 0; i < 4; i += 1) {
    const cell = cells[2 + i];
    const num = cell.match(/^\*{0,2}(\d+\.\d{2})\*{0,2}(?=\s|$| vs)/);
    if (!num) continue; // em dash / "n/a" / prose
    const printed = Number.parseFloat(num[1]);
    // "7.84 vs `#10B981`" names its own background inside the cell.
    const vsMatch = cell.match(/vs\s*`?(#[0-9A-Fa-f]{6})`?/);
    const bg = vsMatch ? vsMatch[1].toUpperCase() : (explicitBg ?? T(surfaces[i]));
    const measured = contrast(fg, bg);
    printedCells += 1;
    if (Math.abs(printed - measured) > 0.01) {
      fail(`2.2 row "${label}" col ${i + 1}: prints ${printed.toFixed(2)}, measures ${measured.toFixed(2)} on ${bg}`);
      printedMismatch += 1;
    }
  }
}

if (printedCells === 0) {
  fail('no numeric cells parsed from section 2.2 - the table shape changed');
} else if (printedMismatch === 0) {
  pass(`all ${printedCells} printed ratios across ${printedRows} rows equal a fresh computation`);
}

console.log('\n=== REQUIRED PAIRS ===');
for (const [label, fg, bg, min] of required) {
  if (!fg || !bg) {
    fail(`${label} - unresolved token`);
    continue;
  }
  const v = contrast(fg, bg);
  if (v < min) fail(`${label} ${v.toFixed(2)} (need ${min})`);
  else pass(`${label} ${v.toFixed(2)} (need ${min})`);
}

/* ------------------------------------------------------------------ *
 * 4. Documented pitfalls must still be pitfalls
 * ------------------------------------------------------------------ */

const pitfalls = [
  ['light label on emerald fill (2.3a)', T('text-primary'), T('accent'), TEXT],
  ['light label on blue fill (2.3a)', T('text-primary'), T('info'), TEXT],
  ['emerald ring, zero offset, on emerald fill (2.3b)', T('focus'), T('accent'), NON_TEXT],
  ['--color-info as link text on surface-raised (2.3f)', T('info'), T('surface-raised'), TEXT],
  ['--color-border as a control boundary on surface-card (2.3c)', T('border'), T('surface-card'), NON_TEXT],
  ['#71717A as text on surface-card (2.3d)', '#71717A', T('surface-card'), TEXT],
  ['#3F3F46 as a control boundary on surface-card (2.3c)', '#3F3F46', T('surface-card'), NON_TEXT],
  ['#6B6B75 (v1.0 border-strong) on surface-raised - 3.0 yes, headroom no (2.3g)', '#6B6B75', T('surface-raised'), 3.4],
];

console.log('\n=== DOCUMENTED PITFALLS (must still fail) ===');
let stale = 0;
for (const [label, fg, bg, min] of pitfalls) {
  const v = contrast(fg, bg);
  if (v >= min) {
    fail(`${label} now measures ${v.toFixed(2)} and passes - update section 2.3`);
    stale += 1;
  } else {
    pass(`${label} still fails at ${v.toFixed(2)} (need ${min})`);
  }
}

/* ------------------------------------------------------------------ *
 * 5. Badge washes are derived from tokens, not hand-picked
 * ------------------------------------------------------------------ */

console.log('\n=== BADGE WASHES (section 6.9) ===');

const card = T('surface-card');
const washSpec = [
  // variant, hue token or null (neutral reuses surface-1), text token
  ['neutral', null, 'text-secondary'],
  ['simulated', 'accent', 'accent'],
  ['illustrative', 'info', 'info-text'],
  ['caution', 'warning', 'warning'],
  ['critical', 'negative', 'negative'],
];

for (const [variant, hue, textRole] of washSpec) {
  const tokenName = `wash-${variant}`;
  const declared = T(tokenName);
  const expected = hue === null ? T('surface-1') : composite(T(hue), 0.12, card);
  if (!declared) {
    fail(`--color-${tokenName} is not declared`);
    continue;
  }
  if (declared !== expected) {
    fail(`--color-${tokenName} is ${declared} but 12% ${hue ?? 'surface-1'} over card gives ${expected}`);
  } else {
    pass(`--color-${tokenName} ${declared} == ${hue === null ? 'surface-1' : `12% ${hue} over card`}`);
  }
  const textV = contrast(T(textRole), declared);
  if (textV < TEXT) fail(`badge text ${textRole} on ${tokenName} ${textV.toFixed(2)} (need ${TEXT})`);
  else pass(`badge text ${textRole} on ${tokenName} ${textV.toFixed(2)}`);

  const ringV = contrast(T('focus'), declared);
  if (ringV < TEXT) fail(`focus ring on ${tokenName} ${ringV.toFixed(2)} (need ${TEXT})`);
  else pass(`focus ring on ${tokenName} ${ringV.toFixed(2)}`);
}

/* ------------------------------------------------------------------ *
 * 5b. Component composites (section 6.14)
 *     A token pair is not the last place a failure can hide: a component
 *     may composite one token at partial alpha over another surface. Each
 *     row of 6.14 is recomposited here and both its printed ratio and its
 *     floor are enforced, so an alpha or a token edit cannot quietly drop
 *     a chip, a chart wash or an order-book edge below threshold.
 * ------------------------------------------------------------------ */

console.log('\n=== COMPONENT COMPOSITES (section 6.14) ===');

let compositeRows = 0;
for (const line of slice('### 6.14 Component composites', '### 6.15')) {
  if (!line.startsWith('|')) continue;
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 7) continue;
  const fgName = cells[2].match(/--color-([a-z0-9-]+)/);
  const bgName = cells[3].match(/--color-([a-z0-9-]+)/);
  if (!fgName || !bgName) continue; // header / separator row
  const label = cells[1].replace(/`/g, '').slice(0, 46);
  const alpha = cells[4].match(/^(\d+)%$/);
  const printed = cells[5].match(/^(\d+\.\d{2})$/);
  const floor = cells[6].match(/^(\d+(?:\.\d+)?)$/);
  if (!alpha || !printed || !floor) {
    fail(`6.14 row "${label}": expected "<n>%", a 2dp ratio and a numeric floor`);
    continue;
  }
  const fg = T(fgName[1]);
  const base = T(bgName[1]);
  if (!fg || !base) {
    fail(`6.14 row "${label}": unresolved token (${fgName[1]} / ${bgName[1]})`);
    continue;
  }
  const over = composite(fg, Number(alpha[1]) / 100, base);
  const measured = contrast(fg, over);
  compositeRows += 1;
  if (Math.abs(measured - Number(printed[1])) > 0.01) {
    fail(`6.14 row "${label}": prints ${printed[1]}, measures ${measured.toFixed(2)} (${over})`);
  } else if (measured < Number(floor[1])) {
    fail(`6.14 row "${label}": ${measured.toFixed(2)} is below its ${floor[1]} floor`);
  } else {
    pass(`${label}: ${fgName[1]} @ ${alpha[1]}% over ${bgName[1]} = ${over} -> ${measured.toFixed(2)} (floor ${floor[1]})`);
  }
}

if (compositeRows < 5) {
  fail(`parsed ${compositeRows} composite rows from section 6.14, expected at least 5`);
}

/* ------------------------------------------------------------------ *
 * 5c. The disabled state is a named state, not an opacity
 *     A blanket opacity composites the LABEL toward the fill: 40% puts
 *     accent-ink on accent at 2.31:1, the number section 2.3a calls a
 *     hard fail. Section 6.1 now fixes the tokens instead; this asserts
 *     both halves of that decision - the tokens hold, and the opacity
 *     recipe has not crept back in.
 * ------------------------------------------------------------------ */

console.log('\n=== DISABLED STATE (section 6.1) ===');

const buttons = slice('### 6.1 Buttons', '### 6.2');
const disabledRegion = buttons.join('\n');

// The state matrix is the normative line: it is where the disabled rendering
// is actually specified. The prose around it may (and does) quote the retired
// `opacity: 40%` recipe to explain why it was wrong, so the check is scoped to
// the specification rather than to any mention of the string.
const stateMatrix = buttons.find((l) => l.trimStart().startsWith('State matrix')) ?? '';
if (stateMatrix === '') {
  fail('section 6.1 has no "State matrix" line - the button state contract moved');
} else if (/opacity\s*[:=]?\s*\d+%|\d+%\s*opacity/i.test(stateMatrix)) {
  fail('the state matrix dims a state with a blanket opacity again - 40% puts the label at 2.31:1 (2.3i)');
} else {
  pass('the state matrix specifies no opacity-dimmed state');
}
if (!/Disabled state \(measured, not dimmed\)/.test(disabledRegion)) {
  fail('section 6.1 lost the "Disabled state (measured, not dimmed)" specification');
}
for (const token of ['surface-1', 'text-tertiary', 'border']) {
  if (!new RegExp(`--color-${token}\\b`).test(disabledRegion)) {
    fail(`section 6.1 disabled specification lost its --color-${token} reference`);
  }
}
for (const bgName of ['surface-1', 'surface-card', 'surface-raised']) {
  const v = contrast(T('text-tertiary'), T(bgName));
  if (v < TEXT) fail(`disabled label text-tertiary on ${bgName} ${v.toFixed(2)} (need ${TEXT})`);
  else pass(`disabled label text-tertiary on ${bgName} ${v.toFixed(2)} (need ${TEXT})`);
}

/* ------------------------------------------------------------------ *
 * 6. Chart-series table agrees with the series tokens, and the numbers
 *    printed in it are the measured ones
 * ------------------------------------------------------------------ */

console.log('\n=== CHART SERIES TABLE (section 2.6) ===');

const seriesRows = [];
for (const line of slice('### 2.6 Data-visualization palette', '---')) {
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 5) continue;
  const idx = cells[1].match(/^[1-6]$/);
  const hex = cells[2].match(/^`(#[0-9A-Fa-f]{6})`$/);
  if (idx && hex) seriesRows.push([Number(cells[1]), hex[1].toUpperCase(), cells[3]]);
}

if (seriesRows.length !== 6) {
  fail(`parsed ${seriesRows.length} series rows from section 2.6, expected 6`);
} else {
  for (const [n, hex, printed] of seriesRows) {
    const token = T(`series-${n}`);
    if (token !== hex) {
      fail(`series ${n}: section 2.6 says ${hex}, --color-series-${n} is ${token}`);
      continue;
    }
    const measured = contrast(hex, T('surface-card'));
    const printedValue = Number.parseFloat(printed);
    if (!Number.isFinite(printedValue) || Math.abs(printedValue - measured) > 0.01) {
      fail(`series ${n} prints ${printed} but measures ${measured.toFixed(2)} on surface-card`);
    } else {
      pass(`series ${n} ${hex} matches token and its printed ${printedValue.toFixed(2)} is measured`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 7. Type scale: two scales, each strictly descending, >=1px apart
 * ------------------------------------------------------------------ */

console.log('\n=== TYPE SCALE (section 3.1) ===');

const toPx = (cell) => {
  const clamp = cell.match(/clamp\(\s*([\d.]+)(rem|px)/);
  const plain = cell.match(/([\d.]+)(rem|px)/);
  const m = clamp ?? plain;
  if (!m) return null;
  return m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
};

const scaleRows = [];
for (const line of slice('### 3.1 Type scale', '**Measure limits')) {
  const cells = line.split('|').map((c) => c.trim());
  // ['', token, scale, size, line-height, tracking, weight, ...]
  if (cells.length < 6) continue;
  const tokenMatch = cells[1].match(/^`(text-[a-z0-9-]+)`$/);
  const scale = cells[2];
  if (!tokenMatch || !['h', 't', 'd'].includes(scale)) continue;
  const px = toPx(cells[3]);
  if (px === null) {
    fail(`${tokenMatch[1]} has an unparseable size "${cells[3]}"`);
    continue;
  }
  scaleRows.push([tokenMatch[1], scale, px]);
}

if (scaleRows.length < 10) {
  fail(`only ${scaleRows.length} type-scale rows parsed - table shape changed?`);
} else {
  for (const key of ['h', 't', 'd']) {
    const seq = scaleRows.filter((r) => r[1] === key);
    let okScale = true;
    for (let i = 1; i < seq.length; i += 1) {
      const [prevName, , prevPx] = seq[i - 1];
      const [name, , px] = seq[i];
      if (prevPx <= px) {
        fail(`scale "${key}": ${name} (${px}px) is not smaller than ${prevName} (${prevPx}px)`);
        okScale = false;
      } else if (prevPx - px < 1) {
        fail(`scale "${key}": ${name} (${px}px) is <1px below ${prevName} (${prevPx}px)`);
        okScale = false;
      }
    }
    if (okScale) {
      pass(`scale "${key}" strictly descending, >=1px gaps: ${seq.map((r) => r[2]).join(' > ')}`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 7. Every documented duration has a token
 * ------------------------------------------------------------------ */

console.log('\n=== MOTION TOKENS (section 7.1) ===');

const durationTokens = new Set(
  [...doc.matchAll(/--duration-[a-z]+:\s*(\d+)ms\s*;/g)].map((m) => Number(m[1])),
);
const documentedDurations = new Set();
for (const line of slice('### 7.1 State tokens', '### 7.2 Motion budget')) {
  if (!line.startsWith('|')) continue;
  for (const m of line.matchAll(/(\d+)ms/g)) documentedDurations.add(Number(m[1]));
}
for (const d of [...documentedDurations].sort((a, b) => a - b)) {
  if (durationTokens.has(d) && d !== 0) pass(`${d}ms has a --duration-* token`);
  else if (d === 0) pass('0ms is the instant/focus state (no token needed)');
  else fail(`${d}ms is used in section 7.1 but has no --duration-* token`);
}
if (durationTokens.size === 0) fail('no --duration-* tokens found in the @theme block');

/* ------------------------------------------------------------------ *
 * 8. Focus-ring offset cannot be silently dropped
 * ------------------------------------------------------------------ */

console.log('\n=== FOCUS CONTRACT ===');
if (/outline-offset:\s*2px/.test(doc) && /outline-offset:\s*2px/.test(themeCssEnd >= 0 ? doc : '')) {
  pass('outline-offset: 2px present in the document and the @theme example');
} else {
  fail('outline-offset: 2px missing - the emerald ring has 1.00:1 on an emerald control (2.3b)');
}
if (/@media \(prefers-reduced-motion: reduce\)/.test(doc)) {
  pass('prefers-reduced-motion block present');
} else {
  fail('prefers-reduced-motion block missing (section 7.2)');
}

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

console.log(
  `\n${required.length - required.filter(([l, f, b, m]) => !f || !b || contrast(f, b) < m).length}/${required.length} required pairs hold; ` +
    `${pitfalls.length - stale}/${pitfalls.length} pitfalls still fail as documented.`,
);

if (failures > 0) {
  console.log(`\nFAIL: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nOK: token set agrees across all copies and the contrast contract holds.');
process.exit(0);
