# Yishun River Trading — Master Design System

**Status:** **v1.2** — closes the four review findings raised against v1.1. The token set is unchanged: no conflict and no failing audited pair was found, so the fixes are one extended role, two corrected specifications, two missing compositions, and one new audit. The v1.1 change log is retained below as history.

**What changed in v1.2, and why.**

| Change | Reason |
|---|---|
| §6.6 dashboard anatomy: 5 → **7 figures**, with an explicit requirement→panel coverage table | The brief requires *equity curve, daily returns, volatility, Sharpe, max drawdown, volume and market activity*. v1.1 specified neither **volume** nor **market activity**: `volume` existed in this file only as the label of `--color-series-3`, and `market activity` appeared nowhere. The site's integrity-critical component was under-specified by two panels (§6.6) |
| §6.1 `disabled` state: blanket `opacity: 40%` → **explicit fill/border/label**, no dimming | 40% composited the label to **2.31:1** on an accent fill and **3.57:1** on the card — and 2.31 is the exact ratio §2.3(a) calls a hard fail. WCAG 2.2 exempts inactive components (1.4.3), so this was never a violation, but it was an unmeasured state in a document whose premise is measurement (§6.1, §2.3i) |
| New **§6.14** composite-alpha table + a matching auditor section | §11.1's claim that "a contrast number cannot be published without being measured" stopped at the token layer. Five component composites were unaudited; all five pass (min 3.09), but one token or alpha edit could have dropped one silently with the auditor still green (§6.14) |
| New **§14.5** (`/research` index), **§14.6** (`/about`), **§6.7 Textarea**, **§6.15 Tables** | Four surfaces the brief enumerates had no anatomy while the document elsewhere depended on them (`table cells`, `tables with an overflow-x wrapper`) |

**What changed in v1.1, and why.** v1.0 stated several things its auditor did not verify. The revision closes that gap and records the consequences rather than hiding them:

| Change | Reason |
|---|---|
| `--color-border-strong` `#6B6B75` → **`#74747E`**; `--color-border-hover` `#7E7E88` → **`#86868F`** | The v1.0 value measured **3.02:1 on `--color-surface-raised`** — at the WCAG floor exactly where Sheet/Dialog form controls live, which contradicts the token's own headroom rationale (§2.3g) |
| Added `--color-info-text`, `--color-border-hover` to the `@theme` block | Both were documented in §2.1 but undefined in §15, so the only permitted link colour would have referenced a missing token (§2.3h) |
| Added `--color-wash-{neutral,simulated,illustrative,caution,critical}` | Badge composites were given as raw hex in §6.9, which the "no ad-hoc hex in components" rule forbids (§6.9) |
| Added `--duration-*` (6 tokens) | Durations were literals in a table, so motion could drift from the spec (§7.1) |
| §3.1 split into three named scales (`h`, `t`, `d`) | One monotonic list forced either a 17px `h4` below a 16px body or an 18px lead above a 20px `h3`; the split is now machine-verified (§3.1) |
| Audit widened **3 → 4 surfaces**, and now parses §2.1 ≡ §15 ≡ mirror ≡ `globals.css` | 38 → **64** required pairs and **8** documented pitfalls; the surface list asserts itself against the declared tokens (§2.3h, §11) |
| §6.9 focus-ring-on-wash minimum corrected 5.72 → **5.33** | 5.72 was the `simulated` wash, not the minimum; `caution` `#332E20` is the real floor |

v1.0's "38/38 pairs hold" was true **for the three surfaces it measured**. The number was not wrong; the audit was incomplete, which is a different and more dangerous failure because it reads as a pass.
**Scope:** every surface of the six-page site (`/`, `/strategies`, `/research`, `/research/[slug]`, `/technology`, `/about`, `/contact`) plus system surfaces (error, not-found, loading, OG image, sitemap, robots).
**Authority:** this file is the master. Per-page overrides, if a page ever needs them, live in `docs/design/pages/<page>.md` and override this file only where they say so. Nothing in component code may introduce a colour, font, radius, or spacing value that is not a token defined here.

**How to read this document.** Every contrast number below was computed from the hex values in this file, not copied from documentation or from the upstream skill dataset. Re-run `node docs/design/check-contrast.mjs` to reproduce the full matrix and the pass/fail verdicts. If a number in this file and the script disagree, the script is right and this file is stale.

---

## 1. Visual direction and rationale

### 1.1 The stated direction

**Institutional editorial — "Bloomberg Terminal meets a research journal."** A near-black page, one restrained emerald accent, monospaced figures set like a terminal, and large serif-free editorial display type carrying the argument. Density where the data is, air where the prose is.

### 1.2 Why this direction and not the alternatives

The brief asks for a site that reads as a serious quantitative firm rather than "a generic cryptocurrency trading platform," explicitly warns against "generic SaaS landing pages," and names Bloomberg Terminal + minimalist editorial as the reference. That rules out the three obvious defaults:

| Rejected direction | Why it fails this brief |
|---|---|
| Centred SaaS hero, gradient blob, three feature cards with rounded-2xl, drop shadows | The brief names this as the thing to avoid |
| Trading-platform aesthetic: neon/green-on-black "profit porn," oversized tickers, dark-glow borders, coin iconography | Reads consumer-crypto; implies performance claims the integrity constraint forbids |
| Pure Swiss editorial on white, thin grotesque, no data surfaces | Loses the engineering/terminal credibility that "market microstructure" and "execution systems" need to look real |

The chosen direction resolves the tension by splitting the page into two registers that share one token set: **editorial register** (large display type, ≤72ch measure, generous vertical rhythm) for the argument, and **terminal register** (mono, tabular figures, hairlines, dense grids, labelled panels) for the evidence. The tagline *"Yishun Has No River."* sits in the editorial register and is the one place the site allows itself a joke; everything around it stays dry.

### 1.3 The personality rule

Humour is carried by **wording and one visual device**, never by illustration, mascots, emoji, or colour. The single visual device is the **river/current motif**: a horizontally-drifting, low-contrast field of hairlines in the hero and section transitions — a river that does not exist. It is `aria-hidden`, decorative, ≤4% opacity, and stops dead under `prefers-reduced-motion`. This keeps "Yishun has no river, but every market has a current" as a *structural* idea rather than a caption.

---

## 2. Colour

### 2.1 Token table

All values are exact. `@theme` names map 1:1 to Tailwind v4 utilities (`--color-surface-card` → `bg-surface-card`).

| Token | Hex | Role | Text use? |
|---|---|---|---|
| `--color-bg` | `#09090B` | Page background | — |
| `--color-surface-1` | `#111318` | Secondary background: alternating sections, nav glass, table header | — |
| `--color-surface-card` | `#181A20` | Card / panel / input background | — |
| `--color-surface-raised` | `#1F222A` | Overlays only: Dialog, Sheet, DropdownMenu, Tooltip | — |
| `--color-text-primary` | `#F4F4F5` | Headings, body | Yes — 15.82 on card |
| `--color-text-secondary` | `#A1A1AA` | Lead paragraphs, descriptions, nav idle | Yes — 6.79 on card |
| `--color-text-tertiary` | `#8A8A94` | Captions, metadata, footnotes, chart axis labels, **disabled control labels** (§6.1) | Yes — 5.09 on card, 5.44 on `surface-1` |
| `--color-accent` | `#10B981` | Positive values, primary CTA fill, focus ring, key emphasis | Yes — 6.86 on card |
| `--color-accent-hover` | `#34D399` | Accent hover on dark surfaces; accent text on hover | Yes — 9.05 on card |
| `--color-accent-press` | `#059669` | Accent active/pressed fill | Fill only |
| `--color-accent-ink` | `#09090B` | **Label colour on any emerald or blue fill** | Yes — 7.84 on emerald |
| `--color-info` | `#3B82F6` | **Fill only:** second chart series, informational marker backgrounds. **Never used as text.** | No — 4.32 on raised, fails |
| `--color-info-text` | `#60A5FA` | **All link and informational text**, including links inside Dialog/Sheet/DropdownMenu | Yes — 6.26 on raised (floor) |
| `--color-negative` | `#F87171` | Losses, drawdown, destructive, validation error | Yes — 6.29 on card |
| `--color-warning` | `#FBBF24` | Caution state, "illustrative" markers where attention is required | Yes — 10.42 on card |
| `--color-hairline` | `#23252D` | Decorative rules: section dividers, table row rules, grid lines | Never |
| `--color-border` | `#31343E` | Default container/card edge, grouping boundaries | Never |
| `--color-border-strong` | `#74747E` | **Interactive** boundaries: input fields, checkbox/radio, switch track, ghost-button outline, diagram edges | Never |
| `--color-border-hover` | `#86868F` | The single hover step above `border-strong`, for control borders only | Never |
| `--color-focus` | `#10B981` | Focus ring — always with a 2px offset (§2.4) | Never |
| `--color-selection` | `#10B98133` | Text selection wash (emerald @ 20%) | — |
| `--color-overlay` | `#00000099` | Modal scrim (@ 60%) | — |
| `--color-wash-neutral` | `#111318` | Badge wash: metadata | Never |
| `--color-wash-simulated` | `#172D2C` | Badge wash: "Simulated" (12% accent over card) | Never |
| `--color-wash-illustrative` | `#1C263A` | Badge wash: "Illustrative" (12% info over card) | Never |
| `--color-wash-caution` | `#332E20` | Badge wash: not-configured, caveats (12% warning over card) | Never |
| `--color-wash-critical` | `#33242A` | Badge wash: validation failure (12% negative over card) | Never |
| `--color-series-1` | `#10B981` | Chart series 1 — equity curve, positive returns | Fill/stroke only |
| `--color-series-2` | `#3B82F6` | Chart series 2 — benchmark, comparison | Fill/stroke only |
| `--color-series-3` | `#22D3EE` | Chart series 3 — volume, auxiliary | Fill/stroke only |
| `--color-series-4` | `#FBBF24` | Chart series 4 — highlight/annotation | Fill/stroke only |
| `--color-series-5` | `#94A3B8` | Chart series 5 — reference band, moving average | Fill/stroke only |
| `--color-series-6` | `#F87171` | Chart series 6 — drawdown, loss | Fill/stroke only |

### 2.2 Measured contrast (this is the audit, not a claim)

Computed against **all four** surfaces — including `--color-surface-raised`, the overlay surface where Dialog, Sheet, DropdownMenu and Tooltip content lives. Requirement: **4.5:1** for text, **3:1** for non-text (WCAG 2.2 AA, 1.4.3 and 1.4.11). Omitting the overlay surface is how a 4.32:1 link colour reached review; `docs/design/check-contrast.mjs` now audits it.

| Foreground | on `#09090B` | on `#111318` | on `#181A20` | on `#1F222A` | Verdict |
|---|---|---|---|---|---|
| `#F4F4F5` text-primary | 18.10 | 16.90 | 15.82 | 14.47 | AAA |
| `#A1A1AA` text-secondary | 7.76 | 7.25 | 6.79 | 6.21 | AAA |
| `#8A8A94` text-tertiary | 5.82 | 5.44 | 5.09 | 4.65 | AA |
| `#10B981` accent | 7.84 | 7.33 | 6.86 | 6.27 | AA |
| `#60A5FA` info-text | 7.83 | 7.31 | 6.84 | 6.26 | AA |
| `#3B82F6` info (fill only) | 5.41 | 5.05 | 4.73 | **4.32** | **Text: FAIL** — fill/series only |
| `#F87171` negative | 7.19 | 6.72 | 6.29 | 5.75 | AA |
| `#FBBF24` warning | 11.92 | 11.13 | 10.42 | 9.53 | AAA |
| `#6B6B75` border-strong (**retired**) | 3.78 | 3.53 | 3.30 | **3.02** | Rejected — see §2.3(g) |
| `#74747E` border-strong | 4.30 | 4.02 | 3.76 | 3.44 | Passes 3:1 non-text on all four |
| `#86868F` border-hover | 5.51 | 5.15 | 4.82 | 4.41 | Passes 3:1 non-text on all four |
| `#059669` accent-press (fill) | 5.28 | 4.93 | 4.62 | 4.22 | Fill only; ≥3:1 on all four |
| `#09090B` ink on `#059669` press | — | — | 5.28 | — | AA |
| `#10B981` focus ring | 7.84 | 7.33 | 6.86 | 6.27 | Passes 3:1 non-text |
| `#09090B` label on emerald fill | — | — | 7.84 vs `#10B981` | n/a | AA |

### 2.3 Nine findings that changed the design

These are the places where the obvious choice is measurably wrong. They are recorded because each one is a bug a later implementation phase would otherwise re-introduce.

**(a) Never put light text on the emerald fill.** `#F4F4F5` on `#10B981` is **2.31:1** — a hard fail, and exactly what the conventional "primary button = accent background + white text" recipe produces. `#09090B` on `#10B981` is **7.84:1**. Rule: **`--color-accent-ink` is the only permitted label colour on `accent` and `info` fills.** The same correction applies to blue: `#F4F4F5` on `#3B82F6` is 3.35:1 (fails), `#09090B` on `#3B82F6` is 5.41:1 (passes).

**(b) The emerald focus ring is invisible on an emerald button.** `#10B981` on `#10B981` is **1.00:1**. This is only acceptable because of the mandatory offset in §2.4 — the ring must sit across a 2px gap of page background, giving it 7.84:1 against what it actually touches. Never apply the focus ring inset, and never apply it with `outline-offset: 0`, on an accent-filled control.

**(c) "Subtle dark grey borders" cannot also be control boundaries.** The natural reading of the brief — a barely-there border around 1.5–2.5:1 — is fine for decoration and fails 1.4.11 wherever the border is the only thing saying "this is a control." Measured vs the card surface: `#3F3F46` 1.67, `#48484F` 1.92, `#52525B` 2.25, `#5C5C66` 2.63, `#66666F` 3.06. The true floor is a neutral grey at about `#666666` — 3.03 on the card, 3.24 on surface-1, 3.46 on bg — i.e. the only greys that work as control boundaries are conspicuously lighter than "subtle". The token is set at **`#74747E`** (4.30 / 4.02 / 3.76 / 3.44 across bg → raised) rather than at the floor, deliberately: a 1px line sitting exactly at 3.03 has no margin for row/AA rendering and display gamma, which erodes thin-light-on-dark edges in practice. Hence two tokens: `--color-border` for grouping (decoration, sub-3:1, never the sole indicator) and `--color-border-strong` for controls (clears 3:1 on every surface with headroom). The first value chosen for `border-strong`, `#6B6B75`, **failed that requirement on the fourth surface** — see §2.3(g).

**(d) Two candidate greys were demoted.** `#71717A` was considered for tertiary text and fails: 4.12 on bg, 3.60 on card. It is barred from text use entirely. `#8A8A94` (5.82 / 5.09) replaces it as `--color-text-tertiary`.

**(e) The brief's own approximations were corrected.** The brief estimated "`#A1A1AA` on `#09090B` measures ~7.3:1; `#10B981` on `#09090B` ~8.6:1". Measured: **7.76:1** and **7.84:1**. Both are comfortably AA, and the brief's conclusion (verify every pair programmatically and adjust tokens where a pair falls short) is exactly what produced (a)–(d). The emerald figure in particular was optimistic by ~0.8 — close enough not to change the decision, but a reminder that estimated ratios are not evidence.

**(f) The overlay surface is not the card surface.** `--color-info #3B82F6` measures 4.73:1 on the card but **4.32:1 on `--color-surface-raised #1F222A`** — below 4.5 for text. Because surface-raised is where Dialog, Sheet, DropdownMenu and Tooltip content lives, every link inside an overlay would have shipped sub-AA, and the first audit could not see it: its surface list was `bg`, `surface-1`, `surface-card`. Fix: `--color-info` is now **fill/series only**, and `--color-info-text #60A5FA` (6.26 on raised, 6.84 on card, 7.31 on surface-1, 7.83 on bg) is the only text/link colour. The lesson is structural: an audit is only as complete as its surface list, so the checker now **asserts** its surface list against the `--color-surface-*` and `--color-bg` tokens in this document — a new surface cannot be introduced without the audit either covering it or failing loudly.

**(g) `border-strong` failed the fourth surface, and that is why the audit now has four.** `#6B6B75` was chosen with headroom (3.30 on the card) and measured **3.02 on `--color-surface-raised`** — the overlay surface. 3.02 is not headroom; it is the floor, and a 1px control boundary sitting on the floor is exactly the rendering-fragility this token exists to avoid. It matters because that surface is where Sheet, Dialog, DropdownMenu and Tooltip content lives, which is where form controls inside an overlay would sit. `--color-border-strong` is therefore **`#74747E`** (**4.30 / 4.02 / 3.76 / 3.44**), which restores headroom on every surface including the overlay, and `--color-border-hover` moves up one visible step to **`#86868F`** (5.51 / 5.15 / 4.82 / 4.41) so the hover transition stays perceptible. The retired `#6B6B75` is kept in the audit as a **documented pitfall** (§11), so nobody re-derives it from the brief's "subtle dark grey" and quietly reintroduces it.

**(h) The document claimed checks the script was not performing.** Between v1.0 (submitted) and this revision, three divergences existed: §2.2 documented four surfaces while `check-contrast.mjs` audited three; §2.1 declared `--color-info-text` and `--color-border-hover` which the canonical `@theme` block in §15 never defined, so a component using the only permitted link colour would have referenced an undefined token; and §6.9 claimed the focus ring measured ≥5.72:1 against all five badge washes when the measured minimum is **5.33:1** (the `caution` wash, `#332E20`). All three were *prose assertions that no executable step verified*. The fix is structural rather than textual: the checker now **parses §2.1, §15 and its own mirror and fails if the three disagree**, so a token cannot be documented without being defined, and a contrast number cannot be published without being measured. A document that says more than its auditor checks is a document that will drift.

**(i) The disabled state cannot be expressed as an opacity.** `opacity: 40%` on a control is not one value — it composites *every* colour in it toward whatever sits behind. Measured: the primary button's `--color-accent-ink` label lands at **2.31:1** on the emerald fill (the same number as (a), arrived at from the opposite direction), a `--color-text-primary` label lands at **3.57:1** on the card, and a `--color-negative` danger label drops to 2.9:1. WCAG 2.2 exempts inactive components from 1.4.3, so no violation occurs — but the exemption is for components that are *legitimately* inactive, not permission to render their label unreadable. Disabled is therefore a named state with fixed tokens (§6.1): fill `--color-surface-1` (1.07:1 vs card), border `--color-border` (1.40:1), label `--color-text-tertiary` (**5.44:1** on its own fill). The fill and border sit deliberately under 3:1 — an inert control should not read as available — while the label keeps the full 4.5:1 text floor. This is the same principle as (c): *sub-3:1 is a legitimate choice for something that is not a boundary and not information, and an illegitimate one for something that is.*

### 2.4 Focus ring specification (non-negotiable)

```
outline: 2px solid var(--color-focus);
outline-offset: 2px;
border-radius: inherit;
```

- `outline-offset: 2px` is mandatory (§2.3b). The 2px gap may not be filled with a box-shadow ring.
- Never `outline: none` without an equivalent visible replacement. `:focus-visible` only — no ring on mouse click.
- Windows High Contrast / `forced-colors` must still show a ring: keep the `outline`, and avoid `forced-color-adjust: none`.
- On accent-filled controls the ring is the *only* focus indicator, so it is never removed at any breakpoint.

### 2.5 Colour usage rules

- **Emerald is rationed.** Permitted: positive numeric values, the primary CTA in a section (per-page max counts in §6.1), focus rings, the active nav indicator, the selected filter chip, and the hero motif's leading line. Forbidden: decorative section backgrounds, large fills, gradient endpoints, more than one primary button in the same section.
- **Colour is never the only carrier of meaning.** A positive number carries `+`; a negative carries `−` and `--color-negative`; a "simulated" figure carries the word *Simulated*. Directional arrows accompany sign, never replace it.
- **Blue is meaning, not decoration.** `--color-info-text #60A5FA` is the only blue permitted as text (links, selection, informational copy) because `--color-info #3B82F6` fails 4.5:1 on the overlay surface; `--color-info` is reserved for fills and the second chart series. Blue never indicates positivity — that is emerald's job, and conflating them would make the dashboard ambiguous.
- **No gradients as identity.** The only permitted gradient is a linear alpha fade of a surface into the page background used to mask a chart edge or a horizontal scroller's overflow. No purple/pink gradient anywhere.

### 2.6 Data-visualization palette

Series colours validated for ≥3:1 on the card surface (WCAG 1.4.11 applies to graphics needed to understand content), ordered for maximum adjacent separation:

| Index | Hex | on card | Use |
|---|---|---|---|
| 1 | `#10B981` | 6.86 | Primary series — equity curve, positive returns |
| 2 | `#3B82F6` | 4.73 | Secondary series — benchmark, comparison |
| 3 | `#22D3EE` | 9.62 | Tertiary series — volume, auxiliary |
| 4 | `#FBBF24` | 10.42 | Highlight/annotation series |
| 5 | `#94A3B8` | 6.78 | Reference/context series (moving average, band) |
| 6 | `#F87171` | 6.29 | Negative series — drawdown, loss |

Rules: never rely on colour alone to identify a series — every series is named in the legend and in the chart's text alternative. All six also clear 3:1 on `--color-surface-1` (min 5.05), so a chart may sit on either surface. Grid lines use `--color-hairline`; axis labels use `--color-text-tertiary`; tooltips use `--color-surface-raised` with a `--color-border` hairline. Chart frames are `--color-border`, never `--color-border-strong` (a chart border is not a control). Series 2 is `--color-info` used as a **graphic**, which is permitted at 4.73:1 on card and 4.32:1 on raised — a series line is not text, but a series *label* must use `--color-info-text`.

---

## 3. Typography

**Families (self-hosted via `next/font`, zero runtime requests to Google):**

| Token | Family | Loaded as |
|---|---|---|
| `--font-sans` | **Geist Sans** | `next/font/google`, `variable: --font-geist-sans`, weights 400/500/600 |
| `--font-mono` | **Geist Mono** | `next/font/google`, `variable: --font-geist-mono`, weights 400/500 |

Geist was chosen from the brief's shortlist (Inter, Geist, IBM Plex Sans) because it is a contemporary grotesque with matching mono sibling in the same family — the mono/sans pairing is the core of the visual language, and pairing across one superfamily guarantees consistent terminals and x-height, which a mixed pairing does not. `display: 'swap'`, and `adjustFontFallback` left to default so the fallback metric matches and layout does not shift.

**Mono is the data voice.** Anything numeric — prices, returns, Sharpe, drawdown, volumes, percentages, timestamps, ticker symbols, formula tokens, keyboard shortcuts, and uppercase eyebrows — is Geist Mono with `font-variant-numeric: tabular-nums slashed-zero` so digits align in columns and `0` is unambiguous. Prose is never mono.

### 3.1 Type scale

Fluid `clamp()` for display sizes so 390px → 1440px needs no per-breakpoint overrides; fixed `rem` for everything at body size and below.

The scale is declared as **three named families**, not one list, because a single list cannot be both strictly descending and typographically correct — a 17px `h4` must sit above a 16px body, while an 18px lead must sit below a 20px `h3`. Treating them as one sequence forces either a bad `h4` or a bad lead. Each family is independently monotonic, and `docs/design/check-contrast.mjs` verifies that from this table:

- **`h` heading scale** — `display` 40 → `h1` 32 → `h2` 24 → `h3` 20 → `h4` 17
- **`t` text scale** — `lead` 18 → `body` 16 → `body-sm` 15 → `small` 14 → `caption` 13 → `eyebrow` 12
- **`d` data scale** — `data-xl` 28 → `data` 14 → `code` 13

| Token | Scale | Size | Line height | Tracking | Weight | Use |
|---|---|---|---|---|---|---|
| `text-display` | h | `clamp(2.5rem, 5.5vw, 4.5rem)` | 0.98 | −0.03em | 600 | Hero `h1` only |
| `text-h1` | h | `clamp(2rem, 3.6vw, 3rem)` | 1.05 | −0.025em | 600 | Page titles |
| `text-h2` | h | `clamp(1.5rem, 2.4vw, 2rem)` | 1.15 | −0.02em | 600 | Section headlines |
| `text-h3` | h | `1.25rem` (20px) | 1.3 | −0.01em | 600 | Card titles, subsection heads |
| `text-h4` | h | `1.0625rem` (17px) | 1.4 | 0 | 600 | Minor heads, strategy names in lists, Sheet rows |
| `text-lead` | t | `1.125rem` (18px) | 1.55 | 0 | 400 | Section lead paragraphs |
| `text-body` | t | `1rem` (16px) | 1.65 | 0 | 400 | Default body |
| `text-body-sm` | t | `0.9375rem` (15px) | 1.6 | 0 | 400 | Dense body, card descriptions |
| `text-small` | t | `0.875rem` (14px) | 1.5 | 0 | 400 | UI labels, nav links, form labels |
| `text-caption` | t | `0.8125rem` (13px) | 1.45 | 0.005em | 400 | Captions, chart notes, disclaimers |
| `text-eyebrow` | t | `0.75rem` (12px) | 1 | **0.14em** | 500 | Section eyebrows — **uppercase, mono** |
| `text-data-xl` | d | `clamp(1.75rem, 3vw, 2.5rem)` | 1.05 | −0.02em | 500 | KPI figures — **mono, tabular** |
| `text-data` | d | `0.875rem` (14px) | 1.4 | 0 | 400 | Table cells, axis values — **mono, tabular** |
| `text-code` | d | `0.8125rem` (13px) | 1.6 | 0 | 400 | Code-inspired blocks — **mono** |

**Measure limits (hard):** prose `max-width: 72ch`; lead paragraphs `60ch`; captions and disclaimers `52ch`; display headlines `24ch`. A body paragraph wider than 72ch is a defect, not a preference.

**Hierarchy rules:** exactly one `h1` per page; no skipped heading levels; the eyebrow is never a heading element (it is a `<p>`); display type is used once per page and never for a card title. Optical margin: display and `h1` may hang 1–2px left of the text column so the vertical edge reads optically straight.

---

## 4. Spacing, grid, and layout

### 4.1 Spacing scale

One 4px base, expressed the Tailwind v4 way: a single `--spacing: 0.25rem` multiplier in `@theme`, from which every spacing utility is derived (`p-1` = 4px, `p-4` = 16px, `p-8` = 32px, `gap-6` = 24px, `py-16` = 64px). Steps actually used: `0`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`, `32`. **There is deliberately no second `--space-*` scale** — two competing spacing scales is how a design system ends up with 18px and 20px gaps that look like mistakes; one multiplier means every spacing value in the code is traceable to one number.

Semantic assignments:

| Context | Mobile | Tablet | Desktop |
|---|---|---|---|
| Page side margin | 16px | 32px | 48px |
| Section vertical padding | 64px | 80px | `clamp(80px, 8vw, 128px)` |
| Section headline → lead | 16px | 20px | 24px |
| Lead → content | 40px | 48px | 64px |
| Card padding | 20px | 24px | 24px (32px for feature cards) |
| Card gap (grid) | 16px | 24px | 24px |
| Stack rhythm (prose blocks) | 16px | 16px | 24px |
| Label → value (data) | 4px | 4px | 4px |
| Icon → text | 8px | 8px | 8px |

### 4.2 Grid

- **≥1024px:** 12 columns, 24px gutter, max content width **1200px**, centred. Prose blocks span cols 3–10 (≈66ch at desktop); data panels and the dashboard span the full 12.
- **768–1023px:** 8 columns, 20px gutter, full width minus margins.
- **<768px:** 4 columns, 16px gutter, full width minus margins.
- **Bleed:** charts and the hero motif may bleed to viewport edges; text never does. A bleed element must not cause horizontal overflow — it uses `overflow-x: clip` on its own wrapper, never `hidden` on `body` (that breaks `position: sticky` on the nav).

### 4.3 Layout rules

- **One shared page rhythm.** Every page uses the same sequence: eyebrow → headline → lead → content. No page invents its own intro treatment.
- **Nav is sticky, 64px tall (56px mobile),** with `--color-surface-1` at 85% opacity plus `backdrop-filter: blur(12px)` and a 1px `--color-hairline` bottom edge. It may never obscure anchor targets: `scroll-margin-top: 88px` on every `[id]`.
- **Footer** carries secondary nav, the illustrative-data disclaimer, and contact details — it is the last place the integrity constraint is restated.
- **Vertical rhythm is not decoration.** Section padding is the primary grouping cue in the terminal register, so borders are used to separate *items*, not *sections*.
- **Max two levels of nesting** for cards. A card inside a card is a defect; use a hairline group instead.

---

## 5. Shape, depth, and borders

### 5.1 Radii (this is the main shadcn "de-template" lever)

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `2px` | Badges, chips, inputs, buttons |
| `--radius-md` | `4px` | Cards, panels, chart frames, dialogs |
| `--radius-lg` | `6px` | The largest surface in view (hero panel, mobile sheet) |
| `--radius-pill` | `999px` | Only where a pill is semantically a tag/status |

Default shadcn ships `--radius: 0.5rem` (8px) on everything, which is precisely the "unmodified template" tell the brief forbids. Squared geometry here reads instrument-panel, not app-store. **Nothing may exceed 6px except pills.**

### 5.2 Borders

`1px` only. A 2px border exists solely as the focus ring. Default `--color-border`; `--color-border-strong` for anything interactive (§2.3c); `--color-hairline` for rules inside a surface. Dashed borders appear exactly once, on the "no results" empty state.

### 5.3 Depth

On a near-black page, shadows are nearly invisible and are a poor depth cue; **surface steps plus hairlines carry hierarchy**. Shadows are reserved for elements that must separate from the page plane:

| Token | Value | Use |
|---|---|---|
| `--shadow-overlay` | `0 16px 48px -12px rgba(0,0,0,0.72), 0 2px 8px rgba(0,0,0,0.48)` | Dialog, Sheet, DropdownMenu, Tooltip |
| `--shadow-raised` | `0 1px 0 rgba(255,255,255,0.04) inset` | Top-light hairline on raised cards |
| `--shadow-none` | `none` | Everything else — cards use surface + border |

Cards do **not** lift on hover with a shadow. Hover changes surface (`--color-surface-card` → `--color-surface-raised`) and border (`--color-border` → `--color-border-strong`), which is measurable and does not shift layout.

---

## 6. Components

Every component is hand-vendored shadcn source under `components/ui`, customized to these tokens. Common anatomy: `1px` border, `--radius-md`, `--color-surface-card`, `text-body-sm`, no shadow.

### 6.1 Buttons

| Variant | Fill | Label | Border | Use |
|---|---|---|---|---|
| `primary` | `--color-accent` | `--color-accent-ink` | none | One per **section**; page budget below |
| `secondary` | transparent | `--color-text-primary` | `1px --color-border-strong` | The paired alternative CTA |
| `ghost` | transparent | `--color-text-secondary` → primary on hover | none | Inline actions, nav CTA |
| `link` | none | `--color-info-text`, underline on hover | none | In-prose navigation |
| `danger` | `--color-negative` | `--color-accent-ink` | none | Destructive actions (few) |

Sizes: `sm` 32px tall / `text-small` / px-12px; `md` 40px / `text-small` / px-16px; `lg` 48px / `text-body-sm` / px-24px. **Minimum interactive target 44×44px on touch** — `sm` and `md` get a transparent 44px hit area via padding or `::after` at `<768px`, so visual size and target size are decoupled.

State matrix (all variants): `default` → `hover` (surface/fill step, 120ms) → `active` (`--color-accent-press`, 80ms) → `focus-visible` (ring, §2.4) → `disabled` (see the specification immediately below — **not** an opacity step) → `loading` (label replaced by a mono status word plus a 1px indeterminate bar; the button keeps its width so layout does not jump). `cursor: pointer` on every interactive element, always.

**Disabled state (measured, not dimmed).** v1.1 specified `opacity: 40%`, which is the one state in this document with no measured value, and a blanket opacity is the wrong instrument: it composites the *label* toward the fill. Measured, `--color-accent-ink` at 40% over `--color-accent` is **2.31:1** — the exact ratio §2.3(a) calls a hard fail — and `--color-text-primary` at 40% over the card is **3.57:1**. WCAG 2.2 exempts inactive components from 1.4.3, so neither is a violation; both are also unnecessary. The rule is therefore a named state, not a filter:

| Property | Value | Measured |
|---|---|---|
| Fill | `--color-surface-1` | **1.07:1** vs `--color-surface-card` |
| Border | `1px --color-border` | **1.40:1** vs `--color-surface-card` |
| Label | `--color-text-tertiary` | **5.44:1** on its own fill, **5.09:1** on card, **4.65:1** on `surface-raised` |
| Behaviour | `cursor: not-allowed`, `aria-disabled="true"`, no hover/active transition, still focusable | — |

The fill and border are **deliberately below the 3:1 non-text floor**, and that is the point: 1.4.11 exists so an operable control is *perceivable as available*, and an inert control should not be. The label is the part that must stay readable, because on the contact form the disabled submit's label is what tells the user what will happen once the field is valid — so it keeps a 4.5:1 floor instead of inheriting a 2.31 composite. Every other state is unchanged: a disabled button never loses its `aria-disabled` announcement, and the reason is always stated in text next to it (§6.7).

**Primary-button budget (resolves the §2.5/§6.1 contradiction).** The rule is *one primary per section*, not one per viewport, because the brief mandates a hero CTA pair *and* a closing "Contact Us" on the same home page. Explicit allocation:

| Location | Variant | Rationale |
|---|---|---|
| Nav "Contact" (every page) | `ghost` | Persistent chrome must never compete with page content; never primary |
| Home hero — "Explore Our Approach" | `primary` | The single intended next step |
| Home hero — "Discover Our Research" | `secondary` | The paired alternative |
| Home closing CTA — "Contact Us" | `primary` | Different section; the page's second and final primary |
| `/contact` submit | `primary` | The only primary on that page |
| Research empty state — "Clear filters" | `secondary` | Recovery action, not a conversion |

Per-page maximum: **2** (home only); every other page **1 or 0**. Never two primaries inside one section.

### 6.2 Cards and capability tiles

`--color-surface-card`, `1px --color-border`, `--radius-md`, padding 24px (32px feature). Optional eyebrow (mono, 12px) → title (`text-h3`) → body (`text-body-sm`, `--color-text-secondary`) → optional link. Linked cards: the whole surface is one link — the `<a>` wraps the content, or a single absolutely-positioned overlay anchor makes the card clickable while the heading remains the accessible name. **A fully clickable card contains exactly one interactive element: no nested anchors and no nested buttons**, because an anchor inside an anchor is invalid HTML and reads as two ambiguous targets. If a card genuinely needs a second destination, it stops being a card — render it as a list row with two separate sibling links instead. Hover: surface→raised, border→strong, 120ms. Focus: ring on the card. No transform, no scale.

### 6.3 Navigation

Desktop: wordmark left (Geist Sans 600, `text-body-sm`, with a 12px emerald river-slash glyph), six links centre-left (`text-small`, `--color-text-secondary`), "Contact" as `ghost` CTA right. Active route: `aria-current="page"` plus a 2px emerald underline offset 8px below the text baseline — the underline is the indicator, colour is the reinforcement.

Mobile (`<768px`): wordmark + 44×44px menu button → shadcn `Sheet` from the right. Sheet: `--color-surface-raised`, `--radius-lg` on the leading edge, focus trapped, `Esc` closes, focus returns to the trigger, links stacked at `text-h4` with 48px rows. One `h1` per page is unaffected by the sheet.

**`NavigationMenu` decision: not used.** The brief lists it as a *potential* component, not a required one. This site has six flat, single-level links with no mega-menu, no nested panels and no hover-reveal submenus, so a shadcn `NavigationMenu` (Radix `NavigationMenu`, which brings roving focus, viewport animations and a portal) would add dependency surface and interaction paths for no user benefit. The nav is a plain `<nav aria-label="Primary">` containing a `<ul>` of links plus the mobile Sheet. This is a deliberate rejection, recorded so the implementation phase does not "restore" a missing component.

### 6.4 Research filter and search

Category chips (`--radius-sm`, `1px --color-border-strong`, `text-small`) with `aria-pressed`; selected chip = emerald text + emerald border + `--color-accent` 8% wash + a leading 6px emerald dot so selection is not colour-only. Search input: `--color-border-strong`, `--radius-sm`, 44px tall, visible label, `type="search"`, debounced 200ms. State is reflected in the URL (`?category=&q=`) so filtered views are shareable and back/forward safe. Empty state: centred, dashed hairline, mono headline `NO MATCHING ENTRIES`, a plain-language sentence, and a "Clear filters" button. Results count is announced in an `aria-live="polite"` region.

### 6.5 Strategy disclosure

Seven strategies, each with five required discussion dimensions. Use shadcn `Accordion` (`type="single"`, `collapsible`) where each strategy is an item; **the conceptual overview stays visible in the DOM in all states** and the remaining four dimensions are the collapsible region. Trigger is a full-width button at `text-h3` with a chevron; the region has `role="region"` and `aria-labelledby` the trigger. `hidden="until-found"` is not used (support is inconsistent) — content is real DOM, collapsed via height animation with reduced-motion bypass.

### 6.6 Dashboard preview (the integrity-critical component)

Anatomy: eyebrow `SIMULATED · ILLUSTRATIVE`, `h2`, then a KPI row in mono `text-data-xl` with tabular figures, then four chart panels. **Seven figures are required** — the brief names them and v1.1 delivered five. This table is the coverage contract; a panel that is missing from the DOM is a defect, not a design choice:

| Brief requirement | Where it renders | Token | Form |
|---|---|---|---|
| Equity curve | panel 1 — full-width area/line | `--color-series-1`, 8% wash beneath (§6.14) | time series |
| Daily returns | panel 2 — signed bars around a zero rule | `--color-series-1` up / `--color-series-6` down | bars |
| Volatility | KPI 4 — "Daily volatility" | `--color-text-primary` on `--color-surface-card` | KPI figure |
| Sharpe | KPI 2 — "Sharpe (simulated)" | `--color-text-primary` | KPI figure |
| Max drawdown | KPI 3 — signed, with `−` | `--color-negative` | KPI figure |
| Volume | panel 3 — solid bars, no axis label duplication | `--color-series-3` (9.62 on card) | bars |
| Market activity | panel 4 — **signed net order-flow imbalance** per time bucket, zero rule at `--color-hairline`, positive `--color-series-3`, negative `--color-series-6` | `--color-series-3` / `--color-series-6`, both solid | signed bars |

KPI row of 4: **Equity · Sharpe · Max drawdown · Daily volatility**, in that order. Panels 1–4 stack at every width below `lg`; at `lg` panel 1 spans full width and panels 2–4 share a 3-column row. "Market activity" is *defined* above rather than left to the implementer, because an undefined term in this component is where an invented metric gets drawn.

**The disclosure is not a footnote**: a persistent badge reading `Simulated data` sits inside the component header, adjacent to the figures, and each of the four panels' `figcaption` repeats it. Tooltip: `--color-surface-raised`, 1px border, mono values, `+`/`−` signs. Every panel is `role="img"` with an `aria-label` summarising the shape and range, plus a visually-hidden text summary of that series. Axis: 4–5 ticks desktop, 3 at 390px; tick labels `text-caption` mono `--color-text-tertiary`. Volume and market-activity panels use solid fills, not washes, so they need no composite audit (§6.14) — which is why they are specified that way.

### 6.7 Forms (contact)

Visible label above every field (never placeholder-only), 44px input height, `--color-border-strong` border, `--radius-sm`, `--color-surface-card` fill. States: `default` → `hover` (`--color-border-hover`, 120ms) → `focus-visible` (emerald ring, §2.4) → `invalid` (`--color-negative` border + 16px error text + `aria-invalid="true"` + `aria-describedby` pointing at the error id) → `disabled`. Submit disabled while pending, with the reason stated in text. Result states: `delivered` (emerald, plain confirmation) and `not-configured` (warning, naming the missing env vars, explicitly stating the message was **not** sent). The `not-configured` state is a first-class design state, not an error path.

**Textarea** (the message field) shares the Input anatomy — same `--color-border-strong` border, `--color-surface-card` fill, `--radius-sm`, visible label, same five states — with four additions: `min-height: 128px` with `resize: vertical` only (horizontal resize breaks the measure); `text-body` rather than `text-small`, because it is prose the user writes, not a UI value; the character counter is mono `text-caption` in `--color-text-tertiary`, rendered *after* the limit is approached rather than from the first keystroke, and mirrored into an `aria-describedby` id so it is announced; and over-limit is a `caution` state (warning border + warning counter), not `negative`, because the message is recoverable by deleting and is not yet a validation failure. The submit button's `disabled` rendering is the §6.1 named state — never `opacity: 40%`.

### 6.8 Overlays and feedback

`Dialog`/`Sheet`: `--color-surface-raised`, scrim `--color-overlay`, `--radius-lg`, `--shadow-overlay`, focus trap, `Esc`, focus return, `aria-labelledby` on the title. `Tooltip`: mono `text-caption`, 200ms open / 100ms close delay, keyboard reachable, never the only source of information. `Skeleton`: `--color-surface-card` with a 1.2s opacity pulse, `prefers-reduced-motion` → static. `Separator`: 1px `--color-hairline`, decorative, `role="none"` unless it truly separates sections.

### 6.9 Badges

Non-interactive status labels. `--radius-sm`, height 22px, padding 2px 8px, `text-eyebrow` scale but **not** uppercased for prose badges (uppercase is reserved for section eyebrows), mono, `1px` border of the badge's own hue at 40% alpha, plus a 12% hue wash over the card. **The wash is a token, not a hand-mixed colour** — `--color-wash-*` is defined in `@theme` so no composite hex leaks into component code, and the auditor re-derives each one as 12% of its hue over `--color-surface-card` and fails if the token disagrees. Every label colour was measured against the resulting composite, not against the bare card:

| Variant | Text token | Wash token | Text on wash | Use |
|---|---|---|---|---|
| `neutral` | `--color-text-secondary` | `--color-wash-neutral` | 7.25 | Metadata: category, read time |
| `simulated` | `--color-accent` | `--color-wash-simulated` | **5.72** | Every illustrative figure — the integrity badge |
| `illustrative` | `--color-info-text` | `--color-wash-illustrative` | **5.95** | Illustrative research entries |
| `caution` | `--color-warning` | `--color-wash-caution` | **8.10** | Not-configured contact state, caveats |
| `critical` | `--color-negative` | `--color-wash-critical` | **5.32** | Validation failure summary |

Badges carry meaning in **text**, never in hue alone — the word is the label. They are `<span>`s with no `role`, never buttons. The focus ring clears **5.33:1** against every wash (minimum: `caution`, `#332E20`), so a badge inside a focusable card keeps a visible ring. *(v1.0 claimed ≥5.72:1 here; that was the `simulated` wash mistaken for the minimum — see §2.3(h).)*

### 6.10 Tabs

Used in exactly one place: the dashboard's period toggle (`1M / 3M / 1Y / ALL`), where it switches the *rendered slice* of the same seeded series — it never implies different or live data. Radix `Tabs`; `role="tablist"` / `role="tab"` / `role="tabpanel"` come from the primitive and must not be overridden. Height 36px, `--radius-sm`, `text-small` in mono. Selected tab: `--color-text-primary` plus a 2px `--color-accent` bottom rule (the rule is the indicator, colour is reinforcement) with `aria-selected="true"`; unselected: `--color-text-secondary`; hover: `--color-text-primary`. Left/Right arrows move between tabs, `Home`/`End` jump to the ends, and the panel is focusable with `tabIndex={0}` only when it contains no focusable children. Never more than one tablist per page.

### 6.11 Select

Radix `Select`, styled as an Input so form controls are visually uniform: trigger 44px, `--color-border-strong`, `--radius-sm`, `--color-surface-card`, `text-small`, with a Lucide chevron at `--color-text-tertiary`. Content: `--color-surface-raised`, `1px --color-border`, `--radius-md`, `--shadow-overlay`, items 40px tall with 8px inset. Item hover/focus: `--color-surface-1` background and `--color-text-primary`. Selected item: `--color-accent` text **plus** a Lucide check icon (never colour alone). Typeahead comes from Radix and is documented as available. A native `<select>` is acceptable instead if a page only needs one option set — it inherits the same border/fill/radius tokens and is preferred for the /research mobile category control.

### 6.12 DropdownMenu

Radix `DropdownMenu`, used for low-frequency page actions only (e.g. a "copy citation" / "copy link" menu on a research article). Content: `--color-surface-raised`, `1px --color-border`, `--radius-md`, `--shadow-overlay`, min-width 180px, 8px vertical padding. Items: 40px tall, `text-small`, `--color-text-primary`, hover/focus `--color-surface-1`; a destructive item uses `--color-negative` text. `Separator` items use `--color-hairline`. Arrow-key navigation, `Esc` and focus return come from Radix and must not be reimplemented. Never the only route to a destination on the site — a menu item is always an accelerator for something also reachable by navigation.

### 6.13 Data-visualization primitives

These are the visual vocabulary the brief's §3 asks for. Each is a small, reusable component; each ships a text alternative; each is deterministic and static under reduced motion. All colours are existing series tokens — no new hues.

**Time series (line/area)** — `stroke-width` 1.5px, `stroke-linejoin: round`, no smoothing beyond Recharts' default monotone, no fill gradient (a single 8% `--color-series-1` wash is permitted under the line and only under the primary series). Full implementation lives in §6.6.

**Candlestick** — body fill and wick both `--color-series-1 #10B981` for up bars, `--color-series-6 #F87171` for down bars, **hollow body for up / filled for down** so direction survives greyscale and colour-blindness. Body width 60–70% of the slot, 1px wick, squared corners (no radius), no outline. Rendering: one SVG `<g>` per bar with a `<title>` carrying the date and OHLC, so hover is not the only access path. The OHLC values themselves are printed in mono tabular figures beneath the chart when the series has ≤10 bars. Never colour-only: every candle also carries position (above/below the previous close line) and the legend names up/down.

**Order book / market depth** — two mirrored horizontal bar stacks off a centre line: bids `--color-series-1`, asks `--color-series-6`, both at 40% fill with a solid 1px leading edge at 100%, so the edge — not the wash — carries the ≥3:1 graphic contrast. Depth bars are cumulative and labelled in mono at three levels. This component is the hero motif and MUST be `aria-hidden` there (decorative), and MUST be a coded data table with a text alternative where it appears as content.

**Statistical distribution** — histogram bars `--color-series-5 #94A3B8` (context mass), the annotated ±2σ region in `--color-accent` at 20% wash with a 1px emerald edge, and a 1px dashed `--color-border-strong` mean line. No 3D, no gradient fill, no drop shadow. Axis in `text-caption` mono. Always paired with the μ/σ values in text, because the shape alone is not the point.

**Network graph** — nodes 3px radius, filled `--color-series-2`; edges 1px. **Decorative motif → edges `--color-hairline` + `aria-hidden="true"`; data-bearing graph → edges `--color-border-strong` (≥3:1) and every node labelled.** Emphasised node: 1px `--color-accent` ring, not a larger radius (no layout-shifting growth). Motion: the edge drift described in §7.2 only.

**Mathematical formulas** — **no KaTeX and no MathML**, because the brief forbids new dependencies and a formula renderer is a large one. Formulas are hand-built from HTML/CSS primitives: `--font-mono` at `text-body`, variables in `--color-text-primary`, operators and brackets in `--color-text-tertiary`, `<sub>`/`<sup>` at `0.72em` with `line-height: 0` to avoid leading growth, and a fraction primitive as an inline grid (`display: inline-grid; grid-template-rows: auto auto` with a `1px --color-text-tertiary` top border on the denominator). Every formula sits in a `<figure>` whose `<figcaption>` states it in words — that gloss is the accessible text alternative and is mandatory, not optional. Formulas never scroll horizontally: if one cannot fit at 390px it is broken across lines at an operator.

**Grid / technical illustration** — 24px cell, 1px lines in `--color-hairline`, masked with a linear alpha fade to the page background at the edges. Always `aria-hidden="true"` and `pointer-events: none`. It is atmosphere, not information: nothing may be legible only in the grid.

---

### 6.14 Component composites (the audit that §11.1 previously stopped short of)

A token pair is not the last place a contrast failure can hide. Components composite a token *at partial alpha over another surface*, and until v1.2 five such composites existed in this document with no check behind them — the same class of gap as v1.0's "38/38" claim, one level down. This table is parsed by `docs/design/check-contrast.mjs`, which recomputes each row from the two named tokens and the stated alpha:

| Element | Foreground | Base | Alpha | Measured | Floor |
|---|---|---|---|---|---|
| Selected filter chip label (§6.4) | `--color-accent` | `--color-surface-card` | 8% | 6.10 | 4.5 |
| Primary-series wash under the line (§6.13) | `--color-series-1` | `--color-surface-card` | 8% | 6.10 | 3.0 |
| ±2σ region edge annotation (§6.13) | `--color-accent` | `--color-surface-card` | 20% | 4.91 | 3.0 |
| Order-book bid leading edge (§6.13) | `--color-series-1` | `--color-surface-card` | 40% | 3.20 | 3.0 |
| Order-book ask leading edge (§6.13) | `--color-series-6` | `--color-surface-card` | 40% | 3.09 | 3.0 |

All five pass today; the point of the audit is that they cannot stop passing silently. Two consequences worth stating because they shaped the design: the tightest composite is the **ask** edge at 3.09, so raising the order-book fill above 40% is the change that would break it, not lowering it; and the dashboard's volume and market-activity panels were specified with **solid** fills rather than washes (§6.6) partly so that they add no new composite to this table. A sixth row appears here if and only if a component introduces a new alpha — that is the rule, not a preference.

### 6.15 Tables

Any tabular data (dashboard drill-downs, OHLC printouts, research metadata) uses one anatomy: `--color-surface-card` container, 1px `--color-border` outer edge, header row on `--color-surface-1` with `text-caption` mono uppercase `--color-text-tertiary` and a 1px `--color-hairline` bottom rule, body cells at `text-data` mono with `font-variant-numeric: tabular-nums slashed-zero`, right-aligned numerics and left-aligned labels, 44px minimum row height below `md` and 36px above. Row separation is a 1px `--color-hairline`, never a border, and rows do not zebra-stripe — the hairline is the separation. Numeric columns never wrap; the whole table gets its own `overflow-x: auto` wrapper with `tabindex="0"` and an `aria-label`, so a keyboard user can scroll it and the page never scrolls horizontally (§8). `<caption>` is required and is the table's accessible name; a header cell that carries meaning uses `scope="col"`/`scope="row"`. Empty tables render the §6.4 empty state rather than an empty grid.

---

## 7. Interaction states and motion

### 7.1 State tokens

| State | Duration | Easing | Visual |
|---|---|---|---|
| hover | 120ms | `cubic-bezier(0.2, 0, 0, 1)` | Surface or border step, colour only |
| active | 80ms | `ease-out` | One step darker/stronger |
| focus-visible | 0ms (instant) | — | 2px emerald ring, 2px offset |
| expand/collapse | 240ms | `cubic-bezier(0.2, 0, 0, 1)` | Height + opacity, content in DOM |
| entrance reveal | 320ms | `cubic-bezier(0.2, 0, 0, 1)` | 8px translateY + opacity 0→1 |
| page transition | 200ms | `ease-out` | Opacity only |

Every duration above is a token, so motion cannot be tuned by scattered magic numbers: `--duration-instant: 0ms`, `--duration-fast: 80ms`, `--duration-base: 120ms`, `--duration-page: 200ms`, `--duration-expand: 240ms`, `--duration-enter: 320ms`, with `--default-transition-duration: var(--duration-base)`. The auditor fails if a duration appears in this table and has no token (§11), so adding a state means adding its token.

### 7.2 Motion budget

Purposeful motion only, and each instance must survive the question "what does this communicate?" Permitted: entrance reveal (once, on first view), numeric count-up (≤900ms, illustrative figures only), SVG line-draw on the hero series (800ms, once), order-book depth bars settling (once), the river motif's slow horizontal drift (4s loop, ≤4% opacity, `aria-hidden`). Forbidden: parallax, scroll-jacking, infinite marquees, hover scale on cards, animated gradients, motion that delays reading, anything over 400ms except the three explicitly named.

Reduced motion (`prefers-reduced-motion: reduce` and Framer Motion's `useReducedMotion`): all durations → 0, transforms removed, counters render final values immediately, charts render complete with no line-draw, the hero motif's drift stops on a static frame. No information is ever conveyed by motion alone.

---

## 8. Responsive behaviour

| Breakpoint | Width | Key behaviour |
|---|---|---|
| `xs` | 390px | 4-col grid, 16px margins, nav collapses to Sheet, charts at 3 ticks with legend below, KPI row 2×2, display type at clamp floor, strategy accordion full-width |
| `sm`/`md` | 768px | 8-col grid, 32px margins, nav still Sheet until 768px then inline, KPI row 4×1, capability grid 2×2 |
| `lg` | 1024px | 12-col grid, 48px margins, footer 4 columns, dashboard 2-panel split |
| `xl` | 1440px | Content capped at 1200px and centred; extra width becomes margin, never more line length |

Hard rules: **no horizontal scroll at any width** (verify with `document.scrollWidth <= clientWidth`); charts use `ResponsiveContainer` with no fixed pixel widths; long mono values wrap or scale rather than overflow (tables get their own `overflow-x: auto` wrapper with a visible scroll affordance); touch targets ≥44px below `md`; the sticky nav never covers an anchored heading (`scroll-margin-top`); text never sits over the hero motif's moving lines.

---

## 9. Accessibility contract

- **Target: WCAG 2.2 AA.** Every text pair in §2.2 clears 4.5:1; every non-text boundary and focus indicator clears 3:1 (§2.3c, §2.4).
- Landmarks: one `<main>` per page, `<header>`, `<nav aria-label="Primary">`, `<footer>`, one `h1`, no skipped levels, `<address>` on contact details.
- Skip link: first focusable element, visible on focus, targets `#main`.
- Keyboard: full operability, logical order, no traps, `Esc` closes overlays, focus returns to the trigger, focus never lost on filter/route changes.
- Charts: `role="img"` + descriptive `aria-label` + visually-hidden summary; decorative motifs `aria-hidden="true"` + `focusable="false"`.
- Forms: persistent labels, required indicators in text, `aria-invalid` + `aria-describedby`, error summary in `role="status"`, success/failure in words as well as colour.
- Colour is never the sole carrier (§2.5). Contrast checked at build by `docs/design/check-contrast.mjs`.
- `lang="en"` on `<html>`; descriptive `<title>` per route; link text descriptive (no bare "Read more").

---

## 10. Anti-patterns (do not ship)

**Contrast and correctness**
- ❌ Light text on `--color-accent` or `--color-info` (2.31:1 / 3.35:1) — use `--color-accent-ink`.
- ❌ Emerald focus ring with `outline-offset: 0` on an emerald control (1.00:1) — offset is mandatory.
- ❌ `--color-border` or `--color-hairline` as the only boundary of a control — use `--color-border-strong`.
- ❌ `#71717A` as text (4.12 on bg, 3.60 on card — fails).
- ❌ `outline: none` with no replacement; disabling the ring at any breakpoint.
- ❌ Colour-only meaning for +/- / selected / error states.

**Visual**
- ❌ Radii above 6px (except pills); 8px-everywhere shadcn default geometry.
- ❌ Card hover with shadow lift or scale transform (layout shift).
- ❌ Emojis as icons; mixed icon sets — Lucide only, 1.5px stroke, 16/20/24px.
- ❌ Any purple/pink gradient, glassmorphism beyond the nav's functional blur, neon glow borders.
- ❌ Stock photography, mascots, coin/rocket imagery.
- ❌ Serif display faces (rejected from the upstream generator: Crimson Pro conflicts with the engineering register).
- ❌ Light-first palette (rejected from the upstream generator: `#FAFAFA` background, pink `#EC4899` CTA).
- ❌ Animated counters on any figure that is not labelled illustrative.

**Content integrity (a design constraint, not just copy)**
- ❌ Unlabelled numbers anywhere. Every figure carries `Simulated`/`Illustrative` in the UI, not only in the footer.
- ❌ Invented firm history, AUM, headcount, founding date, awards, client logos, or testimonials.
- ❌ "Trust & Authority" badge walls, certificate carousels, and metric-pulse animations (rejected from the upstream landing pattern — they manufacture credibility the brief forbids).
- ❌ Implied live deployment: never "our strategies deliver", always "systematic strategies are designed to".
- ❌ A contact success state for a message that was not delivered.

**Interaction**
- ❌ Instant state changes with no transition; transitions over 400ms (except the three named).
- ❌ Motion that ignores `prefers-reduced-motion`.
- ❌ Horizontal-scroll "journey" landing patterns (rejected from the upstream generator; the brief needs scannable institutional structure).
- ❌ Placeholder-only form labels; hover-only information; dead `href="#"`.

---

## 11. Cross-token consistency checks performed

Two kinds of check, kept apart on purpose. **Executed** checks are run by `node docs/design/check-contrast.mjs`, which exits non-zero on failure; their numbers are printed by that script, so this table cannot drift from reality without the script failing. **Inspected** checks are judgement calls that no script in this repo can make — they are listed so a reviewer knows which claims rest on reading rather than measurement.

### 11.1 Executed (`node docs/design/check-contrast.mjs`, exit 0)

| Check | What it actually does | Result |
|---|---|---|
| Token set: doc ≡ `@theme` ≡ script mirror ≡ `app/globals.css` | parses §2.1, §15, its own defaults and (when present) `app/globals.css`; fails on a token present in one and missing in another, or on any value disagreement | **Pass — 33 colour tokens identical in all copies** |
| Surface coverage | derives the surface list from the `--color-bg` / `--color-surface-*` tokens; fails if a declared surface is not audited, or an audited surface is not declared | **Pass — 4/4 (`bg`, `surface-1`, `surface-card`, `surface-raised`)** |
| Every text role × every surface ≥ 4.5:1 | 8 roles × 4 surfaces, computed | **Pass — 32 pairs, min 4.65** (`text-tertiary` on `surface-raised`) |
| Control boundaries ≥ 3.4:1 | `border-strong`, `border-hover` × 4 surfaces, held to the *headroom* floor not the WCAG floor (§2.3c) | **Pass — 8 pairs, min 3.44** |
| Focus ring ≥ 3:1 on every surface | `--color-focus` × 4 surfaces | **Pass — min 6.27** |
| Label on every filled control ≥ 4.5:1 | `accent-ink` on `accent`, `info`, `negative`, `accent-press` | **Pass — min 5.28** |
| Filled controls separate from the page | each fill vs `surface-card` ≥ 3:1 | **Pass — min 4.62** |
| Chart series legible on both chart surfaces | 6 series × 2 surfaces ≥ 3:1 | **Pass — min 4.73** on card, min 5.05 on `surface-1` |
| Badge washes are derived, not hand-picked | recomputes each `--color-wash-*` as 12% of its hue over the card; fails if the token disagrees | **Pass — 5/5** |
| Badge label and focus ring on each wash | text ≥ 4.5:1, ring ≥ 4.5:1 | **Pass — text min 5.32, ring min 5.33** |
| §2.2's printed ratios equal a fresh computation | parses every numeric cell of the measured-contrast table and re-derives it from the hexes | **Pass — 54/54 ratios across 15 rows** |
| Chart-series table ≡ series tokens, numbers measured | parses §2.6, compares each hex to `--color-series-N` and each printed ratio to the computed one | **Pass — 6/6** |
| Type scale, per family, strictly descending ≥1px apart | parses §3.1's `Scale` column | **Pass — h: 40>32>24>20>17, t: 18>16>15>14>13>12, d: 28>14>13** |
| Every duration in §7.1 has a token | parses §7.1 rows and the `--duration-*` declarations | **Pass — 5/5 (plus 0ms instant)** |
| Documented pitfalls still fail | 8 traps asserted to remain traps | **Pass — 8/8** |
| Component composites are recomputed (§6.14) | parses the §6.14 table, re-composites each foreground at its stated alpha over its base, and fails if the printed ratio or the floor disagrees | **Pass — 5/5, min 3.09** (order-book ask edge) |
| Disabled state is measured, not dimmed (§6.1) | `--color-text-tertiary` against the disabled fill and against every surface | **Pass — 5.44 on `surface-1`, 5.09 on card, 4.65 on raised** |
| Focus contract present | `outline-offset: 2px` and the reduced-motion block exist in the doc | **Pass** |

The pitfalls in the last-but-one row are the load-bearing part: each is a plausible design choice that a future implementer could re-derive from the brief, so the script failing when one *stops* being a pitfall is what keeps §2.3 honest. Current set: light label on emerald (2.31), light label on blue (3.35), emerald ring at zero offset (1.00), `--color-info` as link text on the overlay surface (4.32), `--color-border` as a control boundary (1.40), `#71717A` as text (3.60), `#3F3F46` as a control boundary (1.67), retired `#6B6B75` on the overlay surface (3.02).

### 11.2 Inspected (no executable check — a reviewer must confirm)

| Check | How | Result |
|---|---|---|
| Radii all ≤ 6px except pills | token review (§5.1) | Pass |
| Mono used for every numeric/label role | token review (§3) | Pass |
| Spacing on a single `--spacing` multiplier | token review (§4.1) | Pass |
| One `h1` per page, eyebrow never a heading | rule stated in §3; enforced per page during implementation | Rule stated, **not yet enforced** |
| No ad-hoc hex in component code | rule stated in §2.1; enforced by review and lint in implementation | Rule stated, **not yet enforced** |
| Emerald accent budget (§2.5, §6.1) | allocation table in §6.1 | Pass by inspection |
| Dashboard renders all seven brief-named figures (§6.6) | requirement→panel→token table in §6.6 | **Pass by inspection — 7/7 mapped**; rendering is enforced in implementation |
| Textarea, tables, `/research` and `/about` anatomies exist (§6.7, §6.15, §14.5, §14.6) | section review | Pass |

Re-run after **any** token edit: `node docs/design/check-contrast.mjs`. Exit 0 means the token set agrees across all copies and every audited pair holds; exit 1 names the specific drift.

---

## 12. Relationship to the upstream `ui-ux-pro-max` generated master

The skill's generator (`scripts/design_system.py --design-system`) was run and its master read as a starting point, then adapted — not adopted. It is **not** installed in this repo and no `design-system/` tree was written into the project by it (`--persist` was never used).

| Upstream generated value | Decision | Reason |
|---|---|---|
| Category "Consulting Firm" | Rejected as a category | `ui-reasoning.csv` has no quantitative-trading/hedge-fund category; a trading query routes to Consulting Firm. Nothing in the dataset models market microstructure. |
| Background `#FAFAFA`, text `#09090B` | Inverted to dark-first | Brief mandates `#09090B` background. |
| CTA `#EC4899` (pink) | Replaced with emerald `#10B981` | Brief mandates emerald; pink reads consumer, and the generator's own style notes list "AI purple/pink gradients" as an anti-pattern. |
| Crimson Pro + Atkinson Hyperlegible | Replaced with Geist Sans + Geist Mono | Serif display conflicts with the terminal register; the brief's shortlist (Inter/Geist/IBM Plex Sans) is all grotesque, and Geist supplies a matching mono. |
| `--radius: 8px` on every component | Reduced to 2/4/6px | 8px-everywhere is the shadcn-template tell the brief forbids. |
| Shadow-driven depth (`--shadow-sm…xl`) | Depth by surface steps + hairlines; shadows only for overlays | Shadows are near-invisible on near-black and do nothing for hierarchy. |
| Pattern "Horizontal Scroll Journey" | Rejected | Output of the malformed-category chain; institutional credibility needs scannable vertical structure. |
| Style "Trust & Authority" (badges, certificates, metric pulse) | Rejected | Manufacturing credentials conflicts with the no-fabrication constraint. |
| Truncated Pattern block in the generated master | Not reproducible | `landing.csv` row 27 is malformed and swallows rows 28–30, so the generator's Pattern section is unusable — see `docs/research/ui-ux-pro-max-research.md` §5.1. |
| Anti-pattern list (emojis, missing `cursor-pointer`, layout-shifting hovers, low contrast, instant transitions, invisible focus) | **Adopted** | Correct and stack-agnostic. Retained in §10. |
| Pre-delivery checklist | **Adopted and extended** | Added §11's contrast audit and the content-integrity block. |

---

## 13. Open prerequisites (not resolved by this phase)

- `@tailwindcss/postcss` is **not installed**; the Tailwind v4 PostCSS plugin must be added before the first build can succeed (the toolchain emits `@tailwindcss/postcss not found` on every turn). This phase is design-only and installed nothing.
- The repo is **not a git repository** and has no `package.json` yet; §2.1–§5.3 define the tokens that `app/globals.css` must carry, but no application file was created here.
- `docs/design/check-contrast.mjs` runs standalone today against the document and its own mirror. It **already** parses `app/globals.css` if that file exists (any `--color-*` declaration there overrides the mirror and is compared against §2.1), so the first official `app/globals.css` will be audited automatically — no edit to this script is needed, and a mismatch between the doc and the shipped CSS fails the run. Wiring it into CI (`pnpm check:contrast`) belongs to the implementation phase. The script exits non-zero on drift, so it is CI-ready as written.
- **Motion tokens are consumed as CSS variables, not utility names.** `--duration-*` and `--ease-standard` are referenced as `var(--duration-base)` in CSS transitions, in component `transition` shorthands, and in Framer Motion `transition` objects. Do not assume a `duration-base` class is generated from the token; write `duration-[var(--duration-base)]` or the variable directly. Motion is one of the places where a v4 theme namespace can differ from v3 expectations, and the tokens are the contract either way.

---

## 14. Page compositions

Tokens and components alone do not specify the surfaces the brief requires; these six compositions do. Every page still opens with the shared rhythm from §4.3 (eyebrow → headline → lead → content).

### 14.1 Research article (`/research/[slug]`)

A single-column editorial article. No sidebar, no reading-progress bar, no floating share rail — the measure is the interface.

- **Breadcrumb** — `<nav aria-label="Breadcrumb">` wrapping an `<ol>`; mono `text-caption` in `--color-text-tertiary`; 12px Lucide `chevron-right` separators; the final crumb carries `aria-current="page"` and is not a link; intermediate crumb links use `--color-info-text`.
- **Header** — eyebrow line of category `·` date in mono `text-eyebrow` (never a heading element) → `h1` at `text-h1` → lead at `text-lead` in `--color-text-secondary` → hairline `Separator`.
- **Illustrative marker** — for entries marked illustrative, a `illustrative` badge (§6.9) sits **directly beneath the `h1`, above the lead**. Never at the end of the article, never only in the footer.
- **Body** — paragraphs at `text-body` in `--color-text-secondary` (6.79:1). This is deliberate: `#F4F4F5` body copy at 16px on near-black is fatiguing across a long article, so pure white is reserved for headings, lead sentences and UI. `h2` at `text-h2` (16px/64px top margin), `h3` at `text-h3` (12px/40px). Measure capped at `68ch`.
- **Blockquote** — 2px `--color-accent` left border, 16px left padding, `text-lead`, `--color-text-secondary`.
- **Inline code** — mono, `--color-surface-1`, 1px `--color-border`, `--radius-sm`, 2px 6px padding.
- **Code block** — mono `text-code`, `--color-surface-1`, 1px `--color-border`, `--radius-md`, 16px padding, `overflow-x: auto`, `max-height: 480px` with internal scroll, and a copy control with a **visible text label** (not an icon-only button).
- **Formula** — per §6.13, always inside a `<figure>` with a prose `<figcaption>` gloss.
- **Lists** — disc/decimal markers in `--color-text-tertiary`, 24px item gap, never nested deeper than two levels.
- **Figures** — `<figure>` + `<figcaption>` at `text-caption` in `--color-text-tertiary`, capped at `52ch`.
- **References** — an `h2` "References" then an `<ol>` with mono numerals; links `--color-info-text`, external links carry `rel="noopener noreferrer"` and an external-link Lucide icon **plus** visually-hidden "(opens in a new tab)".
- **Article footer** — previous/next as two cards (side by side ≥768px, stacked below); each has an eyebrow ("Previous" / "Next") and the title; plus a plain "Back to research" link. Every article is reachable and escapable without the browser back button.

### 14.2 Technology architecture diagram

The brief requires architecture diagrams *with a text alternative*; that alternative is part of the design, not an afterthought.

- **Structure** — four layers, top to bottom: `DATA INGESTION` → `NORMALISATION` → `STRATEGY & BACKTEST` → `EXECUTION & MONITORING`. Each layer is a row of nodes.
- **Node** — `--color-surface-card`, 1px `--color-border`, `--radius-md`, 12px/16px padding, min-width 140px; label at `text-caption` mono in `--color-text-primary`; optional sublabel at `text-caption` in `--color-text-tertiary`.
- **Edge** — 1px `--color-border-strong` (**not** hairline: an edge in this diagram carries meaning, so it must clear 3:1), 6px arrowheads, orthogonal right-angle routing, no curves.
- **Layer label** — in a left gutter, mono `text-eyebrow`, uppercase, `--color-text-tertiary`.
- **Text alternative (mandatory)** — the diagram is wrapped in `<figure>` with a `<figcaption>`, and a visually-hidden `<ol>` enumerates each layer and its nodes and the direction of flow between layers, in reading order. The diagram is **not interactive**; if a version ever needs interaction it becomes a `<table>` instead, because a diagram that must be operated cannot be described once.
- **Responsive** — ≥1024px horizontal rows; 768–1023px two columns per layer; <768px the layers stack vertically and each connector becomes a 16px vertical line with a downward chevron. **A diagram never scrolls horizontally**; node labels wrap to two lines rather than truncating.
- **Motion** — none by default. Edge pulses are forbidden (they imply live traffic, which the site cannot claim).

### 14.3 System surfaces (error, global-error, not-found, loading)

One shared "system page" template, so the site never renders a raw framework error: centred column, `max-width: 52ch`, vertical padding `clamp(96px, 14vh, 160px)`, eyebrow (mono, uppercase) → `h1` at `text-h2` → one plain sentence in `--color-text-secondary` → optional mono diagnostic in a `--color-surface-1` box with 1px `--color-border` → one or two actions.

- **`not-found.tsx`** — eyebrow `404`; `h1` "This page has no river either."; a sentence saying the link may be outdated; primary "Back to home", secondary "Browse research". `noindex`.
- **`error.tsx`** (`'use client'`) — eyebrow `ERROR`; `h1` "Something broke in the pipeline."; secondary "Try again" calling `reset()`, ghost "Back to home"; when `error.digest` exists it is shown in the mono diagnostic line so a report can be matched to a server log.
- **`global-error.tsx`** — replaces the root layout, so it **must render its own `<html>` and `<body>`** and cannot use the header, nav or footer. Because the root layout's stylesheet import may not have run, it embeds a minimal inline `<style>` re-declaring only the tokens it uses (bg, text-primary, text-secondary, accent, accent-ink, radius, font stacks) with the same literal values as §15. Design consequence: wordmark plus message only — no navigation. Include `<meta name="robots" content="noindex">`.
- **`loading.tsx`** — mirrors the page rhythm with Skeleton blocks at the real block sizes (eyebrow, headline, lead, panel) so nothing shifts when content arrives; the wrapper carries `aria-busy="true"`. Skeleton is not the only signal: a visible mono `LOADING` line appears after 1s.

### 14.4 Open Graph image

- Canvas **1200×630**, filled `--color-bg`, with a 1px `--color-hairline` inset frame at 40px.
- Wordmark top-left at the 40px inset: Geist Sans 600, 40px, `--color-text-primary`, preceded by the 32px emerald river-slash glyph.
- Tagline "Yishun Has No River." at 76px, weight 600, tracking −0.03em, wrapped to at most two lines, positioned at ~40% height.
- Subline at 24px mono in `--color-text-tertiary`: the page title, or the default "Quantitative research. Systematic strategies. Data-driven trading."
- A single 96×3px emerald rule bottom-right. **No charts, no figures, no logo soup** — a chart in an OG image is an unlabelled number and violates the integrity constraint.
- Rendered with `next/og`'s `ImageResponse`. It needs raw font bytes, which `next/font` does not expose, so the Geist TTFs (SIL OFL 1.1) are vendored under `app/_og/` and read with `readFile`. If vendoring is rejected, omit `fonts` and accept the default sans rather than fetching a font at request time. No external images; the route must render with zero network calls.

---

### 14.5 Research index (`/research`)

A dense editorial list, not a card grid — the terminal register with an editorial header.

- **Header** — shared rhythm (eyebrow `RESEARCH` → `h1` → lead), then the filter bar.
- **Filter bar** — one row at `lg`, wrapping to two at `md`, stacked at `xs`: category chips (§6.4) on the left, search input on the right, `min-width: 220px` on the input so it does not collapse. The bar is `position: sticky` under the nav at `lg` only, with `--color-surface-1` at 85% and the same blur as the nav; it must not trap focus or cover the first result (`scroll-margin-top: 88px`).
- **Results count** — mono `text-caption` in `--color-text-tertiary`, inside the `aria-live="polite"` region, phrased as a sentence ("6 entries in Market Microstructure"), never as a bare numeral.
- **Entry row** — a single `<article>` whose heading is the only link (one interactive element per row, §6.2): eyebrow line of category `·` date in mono `text-eyebrow` → title at `text-h3` → summary at `text-body-sm` in `--color-text-secondary`, capped at `68ch` → an `illustrative` badge (§6.9) *inline after the title when the entry is illustrative, never at the end of the row*. Rows separate with a 1px `--color-hairline`, 24px vertical padding, no card, no border, no shadow. Hover raises the title to `--color-text-primary` and the hairline to `--color-border-strong`.
- **URL state** — `?category=&q=` reflected on every change (debounced 200ms for text, immediate for chips) via `router.replace` with `scroll: false`, so back/forward restores a filtered view without jumping. An unrecognised `category` value renders the unfiltered list plus a `caution` badge naming what was ignored — never an empty state, because a stale shared link should still land somewhere useful.
- **Empty state** — §6.4's: centred, dashed hairline, mono `NO MATCHING ENTRIES`, one plain sentence, secondary "Clear filters".
- **Below the list** — nothing. No pagination until the content set exceeds one page of rows; when it does, "Load more" as a `secondary` button, not infinite scroll, because infinite scroll breaks the back button and the footer.

### 14.6 About (`/about`)

The most editorial page on the site: it is the only place where the argument is carried by prose alone, so the composition gives it the widest measure and the fewest interruptions.

- **Header** — shared rhythm; the `h1` is the page title, the tagline is *not* repeated here (the home page owns it).
- **Philosophy** — `h2` plus three or four paragraphs at `text-body` in `--color-text-secondary`, measure `68ch`, separated by 24px. No cards, no icons, no pull-out statistic: this is the one surface with no numbers on it at all.
- **Our Name** — the section that carries "Yishun has no river. But every market has a current." Treatment: a full-bleed `--color-surface-1` band (the only banded section on the site besides the closing CTA), 96–128px vertical padding, the line set at `text-h2` in `--color-text-primary` as a **blockquote with a 2px `--color-accent` left border and 16px inset** — reusing §14.1's blockquote primitive rather than inventing one — followed by two or three paragraphs of prose. The river motif from §1.3 may run behind it at ≤4% opacity, `aria-hidden`, stopped under reduced motion.
- **Principles** — an `<ol>` of three or four items, each an `h3` at `text-h4` plus one sentence at `text-body-sm`; mono numerals in `--color-text-tertiary`. A definition list is acceptable when items are term/definition rather than ordered.
- **No invented history.** No founding year, headcount, AUM, office list, awards, client logos, or team photographs anywhere on this page — the "Our Name" narrative is about the *name*, not about a company timeline (§10).
- **Exit** — the closing CTA band with one `primary` link to `/contact`.

---

## 15. Appendix — canonical `@theme` block

This is the exact Tailwind v4 CSS-first configuration that `app/globals.css` must carry in the implementation phase. It is reproduced here so the token set has one authoritative definition; the hex values are asserted against §2.1 by `docs/design/check-contrast.mjs` and by the table check in §11. No `tailwind.config.js` — Tailwind v4 is configured in CSS.

```css
@import "tailwindcss";

@theme {
  /* ---- surfaces & text ---- */
  --color-bg: #09090B;
  --color-surface-1: #111318;
  --color-surface-card: #181A20;
  --color-surface-raised: #1F222A;

  --color-text-primary: #F4F4F5;
  --color-text-secondary: #A1A1AA;
  --color-text-tertiary: #8A8A94;

  /* ---- accents ---- */
  --color-accent: #10B981;
  --color-accent-hover: #34D399;
  --color-accent-press: #059669;
  --color-accent-ink: #09090B; /* the ONLY label colour on accent/info fills */
  --color-info: #3B82F6;          /* fill + series only - never text */
  --color-info-text: #60A5FA;     /* the ONLY blue permitted as text/link */
  --color-negative: #F87171;
  --color-warning: #FBBF24;

  /* ---- lines ---- */
  --color-hairline: #23252D;      /* decorative only */
  --color-border: #31343E;        /* grouping only */
  --color-border-strong: #74747E; /* required for control boundaries; >=3.44 on every surface */
  --color-border-hover: #86868F;  /* one perceptible step above border-strong */
  --color-focus: #10B981;         /* always with outline-offset: 2px */

  --color-selection: #10B98133;
  --color-overlay: #00000099;

  /* ---- badge washes (6.9; 12% of the hue over surface-card) ---- */
  --color-wash-neutral: #111318;
  --color-wash-simulated: #172D2C;
  --color-wash-illustrative: #1C263A;
  --color-wash-caution: #332E20;
  --color-wash-critical: #33242A;

  /* ---- chart series (>=3:1 on surface-card) ---- */
  --color-series-1: #10B981;
  --color-series-2: #3B82F6;
  --color-series-3: #22D3EE;
  --color-series-4: #FBBF24;
  --color-series-5: #94A3B8;
  --color-series-6: #F87171;

  /* ---- families (next/font variables) ---- */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;

  /* ---- type scale ---- */
  --text-display: clamp(2.5rem, 5.5vw, 4.5rem);
  --text-display--line-height: 0.98;
  --text-display--letter-spacing: -0.03em;
  --text-display--font-weight: 600;

  --text-h1: clamp(2rem, 3.6vw, 3rem);
  --text-h1--line-height: 1.05;
  --text-h1--letter-spacing: -0.025em;
  --text-h1--font-weight: 600;

  --text-h2: clamp(1.5rem, 2.4vw, 2rem);
  --text-h2--line-height: 1.15;
  --text-h2--letter-spacing: -0.02em;
  --text-h2--font-weight: 600;

  --text-h3: 1.25rem;
  --text-h3--line-height: 1.3;
  --text-h3--letter-spacing: -0.01em;
  --text-h3--font-weight: 600;

  --text-h4: 1.0625rem;
  --text-h4--line-height: 1.4;
  --text-h4--font-weight: 600;

  --text-lead: 1.125rem;
  --text-lead--line-height: 1.55;

  --text-body: 1rem;
  --text-body--line-height: 1.65;

  --text-body-sm: 0.9375rem;
  --text-body-sm--line-height: 1.6;

  --text-small: 0.875rem;
  --text-small--line-height: 1.5;

  --text-caption: 0.8125rem;
  --text-caption--line-height: 1.45;
  --text-caption--letter-spacing: 0.005em;

  --text-eyebrow: 0.75rem;
  --text-eyebrow--line-height: 1;
  --text-eyebrow--letter-spacing: 0.14em;
  --text-eyebrow--font-weight: 500;

  --text-data-xl: clamp(1.75rem, 3vw, 2.5rem);
  --text-data-xl--line-height: 1.05;
  --text-data-xl--letter-spacing: -0.02em;
  --text-data-xl--font-weight: 500;

  --text-data: 0.875rem;
  --text-data--line-height: 1.4;

  --text-code: 0.8125rem;
  --text-code--line-height: 1.6;

  /* ---- shape ---- */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-pill: 999px;

  /* ---- depth (overlays only) ---- */
  --shadow-overlay: 0 16px 48px -12px rgba(0, 0, 0, 0.72), 0 2px 8px rgba(0, 0, 0, 0.48);
  --shadow-raised: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  /* ---- spacing base ---- */
  --spacing: 0.25rem;

  /* ---- motion (section 7.1) ---- */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --duration-instant: 0ms;
  --duration-fast: 80ms;
  --duration-base: 120ms;
  --duration-page: 200ms;
  --duration-expand: 240ms;
  --duration-enter: 320ms;
  --default-transition-duration: var(--duration-base);
}

/* numeric voice */
.tabular {
  font-variant-numeric: tabular-nums slashed-zero;
  font-family: var(--font-mono);
}

/* the mandatory focus treatment (section 2.4) */
:where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: inherit;
}

/* reduced motion (section 7.2) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Known prerequisite:** `@tailwindcss/postcss` must be installed for these directives to compile (see §13).
