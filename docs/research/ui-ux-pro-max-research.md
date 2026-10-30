# Design Intelligence Report — UI/UX Pro Max skill applied to Yishun River Trading

Phase: `design_intelligence` (broad). Project: **Yishun River Trading** — Next.js App Router corporate/research site, dark-first.
Date of run: 2026-10-30. Environment: Node v21.7.3, Python 3 (subprocess), pnpm 9.15.9.

This report records **actual** tool inspections and query output. Nothing below is inferred from memory of the
upstream project; where the dataset had no answer, that is stated explicitly.

**Verification status:** every claim below was re-executed in a second session on the same date. Row counts in §1.4
were re-measured with `csv.DictReader`; three prior figures were corrected (marked †). The skill, its scripts, its
datasets and the generator behaved identically across both sessions — see §1.5.

---

## 1. Skill discovery and verified capability

The skill is **not installed inside this project**. `ls -a /root/typescript_projects/yrt-website` shows only
`.agenthicc/` and `tests/` (agent-harness artifacts). The skill was located on disk at:

| Item | Verified value |
|---|---|
| Primary path | `/root/python_projects/lauren-all/lauren-website/skills/ui-ux-pro-max` |
| Duplicate copy | `/root/python_projects/lauren-all/lauren-ai-website/skills/ui-ux-pro-max` (`diff -rq` → no differences) |
| Version | `_meta.json`: `{"slug":"ui-ux-pro-max","version":"0.1.0","publishedAt":1769616159343}` |
| `SKILL.md` | Documents triage, deliverable types, bundled assets, and the *optional* generator `scripts/design_system.py` |
| Scripts | `scripts/search.py` (111 lines), `scripts/core.py` (253), `scripts/design_system.py` (1071), `scripts/__init__.py` (empty) |
| Data | `data/` and `assets/data/` are byte-identical (`diff -r` clean; identical md5 for `styles.csv`) — 476 KB, 23 CSVs |

### 1.1 `search.py` parser (from `--help`, exit 0)

```
usage: search.py [-h] [--domain {style,color,chart,landing,product,ux,typography,icons,react,web}]
                 [--stack {html-tailwind,react,nextjs,astro,vue,nuxtjs,nuxt-ui,svelte,swiftui,react-native,flutter,shadcn,jetpack-compose}]
                 [--max-results MAX_RESULTS] [--json] [--design-system]
                 [--project-name PROJECT_NAME] [--format {ascii,markdown}]
                 [--persist] [--page PAGE] [--output-dir OUTPUT_DIR] query
```

`--persist` writes `design-system/<project-slug>/MASTER.md` (+ `pages/*.md`). **It was never used** — the user did
not request that write. The only persisted artifact is this report, written with normal workspace tools.

### 1.2 Search implementation (from `core.py`)

- BM25 (`k1=1.5`, `b=0.75`) over the concatenation of each domain's `search_cols`; results with score `> 0` only.
- Tokenizer lowercases, strips non-word characters, drops tokens `len <= 2`.
- `MAX_RESULTS = 3` default. Domain auto-detection exists via `detect_domain()` keyword table (unused here — every
  query pinned `--domain` explicitly so the dataset searched is unambiguous).
- Stack search uses `search_cols = Category, Guideline, Description, Do, Don't` and outputs docs URLs per row.

### 1.3 Design-system generator (from `design_system.py`)

`DesignSystemGenerator.generate()` is a 5-step pipeline: (1) `search(query, "product", 1)` → take
`Product Type` as the category; (2) `_apply_reasoning(category)` on `ui-reasoning.csv` (exact → partial → keyword
match) for `Recommended_Pattern`, `Style_Priority`, effects, anti-patterns, severity; (3) multi-domain search over
`product/style/color/landing/typography` with the style priority appended to the style query; (4) pick best per domain
(`_select_best_match` scores rows against `style_priority`); (5) format as ASCII box or Markdown.

**Consequence:** the generator is only as good as its *category* match. A trading-firm query matched
`Consulting Firm`, which then drove an unrelated landing pattern. Domain-level searches were therefore run
separately and given priority over the composed output.

### 1.4 Dataset schemas (headers and row counts, measured)

| File | Rows | Header |
|---|---|---|
| `products.csv` | 96 † | No, Product Type, Keywords, Primary Style Recommendation, Secondary Styles, Landing Page Pattern, Dashboard Style, Color Palette Focus, Key Considerations |
| `styles.csv` | 67 | No, Style Category, Type, Keywords, Primary Colors, Secondary Colors, Effects & Animation, Best For, Do Not Use For, Light ✓, Dark ✓, Performance, Accessibility, … |
| `ui-reasoning.csv` | 100 | No, UI_Category, Recommended_Pattern, Style_Priority, Color_Mood, Typography_Mood, Key_Effects, Decision_Rules, Anti_Patterns, Severity |
| `colors.csv` | 96 | No, Product Type, Primary, Secondary, CTA, Background, Text, Border, Notes (hex columns) |
| `typography.csv` | 57 † | No, Font Pairing Name, Category, Heading Font, Body Font, Mood, Best For, Google Fonts URL, CSS Import, Tailwind Config, Notes |
| `charts.csv` | 25 | No, Data Type, Keywords, Best Chart Type, Secondary Options, Color Guidance, Performance Impact, Accessibility Notes, Library Recommendation, Interactive Level |
| `landing.csv` | numbering runs 1–30 but only **27 records** exist (§5.1) | No, Pattern Name, Keywords, Section Order, Primary CTA Placement, Color Strategy, Recommended Effects, Conversion Optimization |
| `ux-guidelines.csv` | 99 † | No, Category, Issue, Platform, Description, Do, Don't, Code Good, Code Bad, Severity |
| `web-interface.csv` | 30 | No, Category, Issue, Keywords, Platform, Description, Do, Don't, Code Good, Code Bad, Severity |
| `react-performance.csv` | 44 | No, Category, Issue, Keywords, Platform, Description, Do, Don't, Code Good, Code Bad, Severity |
| `icons.csv` | 100 | No, Category, Icon Name, Keywords, Library, Import Code, Usage, Best For, Style |
| `stacks/nextjs.csv` | 52 | No, Category, Guideline, Description, Do, Don't, Code Good, Code Bad, Severity, Docs URL |
| `stacks/react.csv` | 53 | same |
| `stacks/shadcn.csv` | 60 | same |

† Corrected during re-verification. Counts are records returned by `csv.DictReader` (header excluded). The earlier
figures under-counted three files by one row each; no conclusion in this report depended on those totals.

### 1.5 Re-verification performed in the resuming session

Re-run to confirm the interrupted turn's findings were reproducible rather than incidental:

| Check | Result |
|---|---|
| `search.py --help` under Python 3.13.13 | Identical `usage:` block — same 10 domains, 12 stacks, `--design-system`, `--persist`, `--page`, `--output-dir` |
| `diff -rq data assets/data` | No output — the two dataset copies are byte-identical, as reported |
| Run A `--design-system` (same query) | **Identical output**, including the corrupted Pattern block — defect §5.1 is deterministic |
| `--domain chart` `"order book market depth liquidity"` | **0 results** again — gap §5.3 confirmed |
| `--domain style`, same order-book query | Returns `Dimensional Layering` (depth / z-index / shadows) — a pure keyword collision on "depth", irrelevant to order books. Confirms the dataset has no microstructure vocabulary, so cross-domain fallback must not be trusted either |
| `--domain chart` `"candlestick OHLC…"` | `Stock/Trading OHLC` → Candlestick; *"provide OHLC data table"*; libraries Lightweight Charts / ApexCharts |
| `--domain chart` `"time series equity curve…"` | `Line with Confidence Band` (add legend) → `Line Chart` (Recharts listed) → `Bullet Chart` |
| `--domain chart` `"distribution histogram returns volatility"` | `Box Plot` — *"include stats table (min, Q1, median, Q3, max)"*; Scatter — *"provide data table alternative"* |
| `--domain color` `"fintech dark trading dashboard institutional"` | `Financial Dashboard`: bg `#020617`, primary `#0F172A`, CTA `#22C55E`, text `#F8FAFC`, *"Dark bg + green positive indicators"* |
| `--domain ux` (reduced motion / touch / table / form) | Same rows: Reduced Motion → `prefers-reduced-motion` (High); Excessive Motion → 1–2 elements/view (High); Easing → ease-out (Low); Touch Target → 44×44 px (High); Table Handling → scroll or cards (Medium); Error Messages → `aria-live`/`role=alert` (High); Form Labels → `label[for]` (High); Inline Validation → on blur (Medium) |
| `--stack shadcn` `"theming tokens customization"` | CSS variables in `:root`/`.dark` (High); `cn()` + `cva` (Medium); extend variants with `cva`; docs URL `ui.shadcn.com/docs/theming` |
| `--stack nextjs` `"metadata server components streaming"` | Server Components by default (High); Metadata API over manual `<head>` tags |
| `--domain style` `"swiss style typographic grid technical data"` | `Swiss Modernism 2.0` — 12-col grid, 8 px base unit, Inter/Helvetica, single accent, ⚡ Excellent, WCAG AAA, Tailwind 10/10 |

**Outcome of the re-run: no finding in this report was retracted.** The dataset's advice on grid, chart typing,
accessibility and stack discipline is stable and repeatable. Its palette, font and page-pattern advice remains
brief-incompatible (§4, §5.4) and stays rejected for the reasons already recorded.

---

## 2. Queries executed (exact strings, with results)

### 2.1 `--design-system` runs

**Run A** — the broad product direction required by this phase:

```
python3 scripts/search.py "quantitative trading firm institutional finance research dark editorial website" \
  --design-system -p "Yishun River Trading" --format markdown
```

Returned (verbatim fields via `DesignSystemGenerator().generate()`):

- `category` → `Consulting Firm` (product match, via keyword "firm")
- `pattern.name` → `Horizontal Scroll Journey` with **corrupted** `conversion` field (see §5.1)
- `style` → `Trust & Authority` — *"financial services, enterprise software, premium/luxury"*, Performance ⚡ Excellent, Accessibility "✓ WCAG AAA", effects: *"Badge hover effects, metric pulse animations, certificate carousel, smooth stat reveal"*
- `colors` → Primary `#18181B`, Secondary `#3F3F46`, CTA `#EC4899`, Background `#FAFAFA`, Text `#09090B`, notes *"Editorial black + accent pink"*
- `typography` → Heading `Crimson Pro`, Body `Atkinson Hyperlegible`, mood *"academic, research, scholarly…"*
- `anti_patterns` → `Generic content + No credentials + AI purple/pink gradients`; `severity` → `HIGH`
- Pre-delivery checklist: no emojis as icons (Lucide/Heroicons), cursor-pointer on clickables, 150–300 ms hover transitions, 4.5:1 text contrast, visible focus states, `prefers-reduced-motion`, responsive at 375/768/1024/1440.

**Run B** — re-run with a query that routes to the financial-dashboard category:

```
python3 scripts/search.py "financial dashboard portfolio performance analytics dark data dense" \
  --design-system -p "Yishun River Trading" --format markdown
```

Returned: category `Financial Dashboard`; pattern `Portfolio Grid`; style `Dark Mode (OLED)` (⚡ Excellent, WCAG AAA,
effects *"Minimal glow, dark-to-light transitions, low white emission, visible focus"*); colors Primary `#1E40AF`,
Secondary `#3B82F6`, CTA `#F59E0B`, Background `#F8FAFC`, Text `#1E3A8A`; typography `Fira Code` + `Fira Sans`
(mood: dashboard/data/precise); anti-patterns `Light mode default + Slow rendering`.

### 2.2 Domain and stack searches

| # | Domain/stack | Query | Top rows returned |
|---|---|---|---|
| 1 | product | `quantitative trading firm hedge fund proprietary trading` | **Consulting Firm** — Trust & Authority + Minimalism; secondary Swiss Modernism 2.0, Accessible & Ethical; palette "Navy + Gold + Professional grey" |
| 2 | product | `financial dashboard portfolio analytics investment management` | **Financial Dashboard** — Dark Mode (OLED) + Data-Dense; "Dark bg + red/green alerts + trust blue"; **Analytics Dashboard** — Data-Dense + Heat Map |
| 3 | product | `fintech banking institutional finance` | **Fintech/Crypto** — Glassmorphism + Dark Mode (OLED); **Banking/Traditional Finance** — Minimalism + Accessible & Ethical; "Navy + Trust Blue + Gold" |
| 4 | style | `dark mode institutional financial editorial minimal` | **Dark Mode (OLED)** (#000/#121212/#0A0E27, "minimal glow", contrast 7:1+, ⚡ Excellent, WCAG AAA); Cyberpunk UI (⚠ Limited a11y); **Financial Dashboard** (profit `#22C55E`, loss `#EF4444`, Recharts 9/10, number count-up, `Intl.NumberFormat`, sparklines) |
| 5 | style | `swiss style typographic grid technical data` | **Swiss Modernism 2.0** (12-col grid, 8px base unit, Inter/Helvetica, single accent, "Best For: corporate sites, architecture, editorial…", ⚡ Excellent, WCAG AAA); HUD/Sci-Fi FUI (⚠ Poor — thin lines) |
| 6 | chart | `time series equity curve portfolio performance` | Line with Confidence Band (actual solid / forecast dashed, distinct legend); **Line Chart** (Recharts listed; "clear line patterns for colour-blind users"); Bullet Chart |
| 7 | chart | `order book market depth liquidity` | **0 results** |
| 8 | chart | `distribution histogram returns volatility` | Box Plot ("include stats table: min, Q1, median, Q3, max"); Scatter/Bubble ("⚠ provide data table alternative") |
| 9 | chart | `candlestick OHLC stock trading price chart` | **Stock/Trading OHLC → Candlestick**; bullish `#26A69A`, bearish `#EF5350`, volume 40% opacity; "⚠ Moderate — provide OHLC data table"; library *Lightweight Charts (TradingView), ApexCharts* |
| 10 | typography | `financial data monospace technical dashboard` | **Dashboard Data** (Fira Code + Fira Sans, "code for data, sans for labels"); Brutalist Raw (Space Mono); **Financial Trust** (IBM Plex Sans, "excellent for data") |
| 11 | ux | `form validation error message accessibility` | Error Messages → `role=alert`/`aria-live`, never visual-only (High); Form Labels → real `<label for>` (High); Inline Validation → validate on blur (Medium) |
| 12 | ux | `keyboard navigation focus visible` | Focus States → visible ring (High); Keyboard Navigation → tab order matches visual order (High); Skip Links (Medium) |
| 13 | ux | `touch target mobile responsive table overflow` | Table Handling → `overflow-x-auto` or card layout (Medium); Touch Target Size ≥ 44×44 px (High) |
| 14 | ux | `reduced motion animation preference` | Reduced Motion → honour `prefers-reduced-motion` (High); Excessive Motion → "animate 1–2 key elements per view maximum" (High); Easing → ease-out in / ease-in out (Low) |
| 15 | ux | `dark mode contrast text readability` | Contrast Readability (High); Colour Contrast ≥ 4.5:1 (High); Alt Text (High) |
| 16 | web | `chart accessibility screen reader data table` | Decorative Icons → `aria-hidden="true"` (Medium); Aria Live → `aria-live="polite"` for async updates (Medium) |
| 17 | web | `form input labels validation` | Form Control Labels → label/`aria-label` (Critical); Autocomplete Attribute (High) |
| 18 | landing | `editorial research publication institutional landing` | AI Personalization Landing; Pricing-Focused Landing; FAQ/Documentation Landing — none fit a firm site |
| 19 | color | `fintech dark trading dashboard institutional` | **Financial Dashboard**: `#020617` bg, `#0F172A` primary, `#22C55E` CTA, `#F8FAFC` text ("dark bg + green positive indicators"); Smart Home/IoT dark tech; Fintech/Crypto (gold `#F59E0B` + purple `#8B5CF6`) |
| 20 | icons | `finance chart market data` | `PieChart`, `BarChart`, `Database` (Lucide, outline) |
| 21 | icons | `trending market ticker activity` | `Activity`, `TrendingUp`, `TrendingDown` (Lucide) |
| 22 | react | `server components client boundary bundle` | Minimize serialization across RSC boundary (High); Parallel fetching (Critical); `next/dynamic` for heavy components (Critical) |
| 23 | stack react | `memoization chart re-render useMemo` | Memoize expensive calculations (Medium); memoize context values (High) |
| 24 | stack nextjs | `metadata server components streaming` | Server Components by default (High); Metadata API vs manual `<head>` (Medium); fetch data in Server Components (High) |
| 25 | stack shadcn | `theming tokens customization` | CSS variables in `globals.css` (High); custom components with `cn()` + `cva` (Medium); extend variants via `cva` (Medium) |

Total: 2 design-system runs + 25 search invocations across 10 search domains and 3 stacks. Raw JSON captured to
`/tmp/uiux/*.json` during the run (ephemeral; contents summarised above).

---

## 3. Applicable recommendations (adopted)

1. **Style — Swiss Modernism 2.0 grid discipline** (row 5): 12-column grid, 8 px base unit, strict typographic
   hierarchy, single accent colour, "no decorations, high contrast verified". Directly compatible with the brief's
   "editorial, institutional, minimal" direction. Adopt as the *layout* basis.
2. **Style — Dark Mode (OLED) contrast rules** (row 4): text contrast ≥ 7:1, "no white background", `color-scheme: dark`,
   visible focus. Adopt the contrast/visibility rules; the specified brief palette (`#09090B` bg, `#F4F4F5`/`#A1A1AA`
   text) already exceeds them — measured later in a unit test.
3. **Style — Financial Dashboard data conventions** (row 4, third result): profit `#22C55E` / loss `#EF4444` semantics,
   `Intl.NumberFormat` currency/number formatting, consistent decimals, sparklines, "trend direction indicators".
   Adopt: monospaced tabular figures, sign + colour for deltas, consistent decimal places.
4. **Product — Financial Dashboard direction** (rows 2–3): "Dark Mode (OLED) + Data-Dense", dark background with
   red/green alerts. Adopt *data density* and dark default; reject the "Glassmorphism"/crypto-neon options.
5. **Typography — "Dashboard Data" principle** (row 10): *mono for data, sans for labels*, plus "Financial Trust →
   IBM Plex Sans, excellent for data". Adopt the **pairing principle** (sans + mono); font *choice* stays Geist Sans /
   Geist Mono per the brief's approved list.
6. **Charts — type assignments justified by `charts.csv`**: equity curve → Line Chart (row 1: "clearly distinguish
   series, add legend"); daily returns → bar/column with signed values; distribution → Box Plot with a stats table;
   OHLC/candlestick → Candlestick **with an OHLC data table** (a11y note); network/market-signal graphic → Network
   Graph *decorative only* because `charts.csv` rates its a11y "❌ Very Poor — provide adjacency list alternative".
   Stream/real-time aesthetic → "Streaming Area Chart" with a pause control instead of flashing (row 23 warns
   "flashing elements — provide pause button").
7. **UX — accessibility heuristics** (rows 11–16): real `<label for>` (Critical), `role="alert"`/`aria-live` for errors,
   validate on blur, visible focus ring, skip link, tab order = visual order, 44×44 px touch targets, `overflow-x-auto`
   for wide tables, `aria-hidden` on decorative icons, `prefers-reduced-motion`, "animate 1–2 key elements per view".
   All adopted verbatim as implementation/test requirements.
8. **Engineering — RSC + Next.js + shadcn stack rows** (rows 22–25): server components by default, metadata API over
   manual tags, `next/dynamic` for heavy visualizations, `useMemo` for derived chart series, CSS-variable theming with
   `cn()`/`cva` variants. All already implied by the brief; the dataset independently confirms the choices.
9. **Anti-patterns from Run A**: "Generic content", "AI purple/pink gradients" — adopted as explicit "do not" rules
   (the generated `#EC4899` CTA is itself exactly this anti-pattern and is rejected below).
10. **Pre-delivery checklist** (Run A/B): Lucide SVG icons only, hover transitions 150–300 ms, visible focus,
    reduced-motion, responsive at 375/768/1024/1440. Adopted as verification checkpoints.

## 4. Rejected recommendations (with reason)

| Recommendation (source) | Why rejected |
|---|---|
| Palette Run A: `#FAFAFA` bg, `#09090B` text, `#EC4899` CTA ("Editorial black + accent pink") | Light-mode default with a pink CTA contradicts the brief's explicit dark-first palette, the "no generic SaaS/fintech pink" direction, and the generator's own anti-pattern "AI purple/pink gradients" |
| Palette Run B: `#F8FAFC` bg, `#1E3A8A` text, `#F59E0B` CTA | Same conflict: light background; amber CTA is off-brand against emerald `#10B981` |
| Typography Run A: Crimson Pro + Atkinson Hyperlegible | Serif academic pairing conflicts with the brief's required Google Fonts set (Inter/Geist/IBM Plex Sans) and with the monospaced-data requirement; the *mood* ("scholarly") is retained, the fonts are not |
| Typography Run B: Fira Code + Fira Sans | Reasonable pairing, but the brief pins the font family set; substituting Fira would be an unapproved third family |
| "Trust & Authority" effects: badge hover, **certificate carousel**, "metric pulse animations", "credentials displayed" | The honesty constraint forbids unsubstantiated credentials, certifications, AUM or track-record claims; a certificate carousel on a firm with no published certifications would be fabricated credibility. Replaced with *methodological* credibility (research process, mathematical exposition, architecture diagrams) |
| Neo-glow / `text-shadow` neon, Cyberpunk UI, HUD/FUI | Rated ⚠ Limited / Poor accessibility in the dataset itself; reads as crypto/gaming, not institutional |
| Landing Run A pattern "Horizontal Scroll Journey" (+ floating sticky CTA) | Output was corrupted; also a consumer storytelling pattern, poor for a six-page institutional site and for keyboard users |
| Landing Run B pattern "Portfolio Grid" ("Project Card Hover + lightbox") | Category mismatch (`Portfolio/Personal` from the word "portfolio"); a designer-portfolio masonry grid is not a firm site IA |
| Landing rows 18 (AI Personalization, Pricing-Focused, FAQ/Documentation) | Product does not price publicly, has no personalization data layer, and is not a docs product |
| Chart library recommendations: TradingView Lightweight Charts, ApexCharts, Chart.js, Plotly, D3 | Stack is locked to Recharts by the brief; Recharts covers line/area/bar (+ candlestick via custom shape). Recommendation rejected, a11y *notes* retained |
| `#26A69A` bullish / `#EF5350` bearish candlestick colours | Foreign to the brand palette; emerald `#10B981` and a muted loss tone are used instead, keeping sign + label so colour is not the only signal |
| "Minimal glow (text-shadow)" from Dark Mode (OLED) | Glow reduces legibility and looks consumer-tech; brief asks for minimalist elegance |
| Colour-guidance hexes generally (`#0080FF` series, `#1976D2` borders, gradient axis) | They are illustrative defaults, not brand tokens; the brief's palette governs |
| Run B "Portfolio Grid" section order (Hero → masonry grid → About → Contact) | Does not accommodate the required capability/dashboard/research/technology sections |

## 5. Conflicts, defects and limitations (verified)

### 5.1 Dataset defect: `landing.csv` malformed row

`csv.DictReader` parses **27 rows** although row numbers run to **30**. Exactly one row contains embedded newlines:
row 27 `Horizontal Scroll Journey`, whose `Conversion Optimization` field has an unterminated quote and swallows rows
28–30 (`Bento Grid Showcase`, `Interactive 3D Configurator`, `AI-Driven Dynamic Landing`). This is why Run A's
"Conversion Focus" printed raw comma-separated CSV fragments. **Do not trust the generator's Pattern block.**

### 5.2 Category routing is keyword-fragile

`Product Type` keyword matching sent a quantitative-trading-firm query to `Consulting Firm` (matching only the word
"firm") and a dashboard query to `Portfolio Grid`. `ui-reasoning.csv` has 100 categories but **none for
quantitative trading, proprietary trading, hedge fund, asset management or research publication** — the closest are
`Fintech/Crypto`, `Banking/Traditional Finance`, `Financial Dashboard`, `Analytics Dashboard`, `Consulting Firm`,
`Magazine/Blog`, `Knowledge Base/Documentation`. Category-driven output was therefore treated as advisory at best.

### 5.3 Coverage gaps

- `order book / market depth / liquidity` → **0 rows** returned; the dataset has no order-book or depth-visualisation
  entry. The order-book motif must be designed from first principles (custom SVG/DOM), not from the dataset.
- No entry for institutional **research/publication** sites; no guidance on OG images, sitemaps, JSON-LD, or dynamic
  metadata — that work is repository/brief-grounded, not dataset-grounded.
- `charts.csv` has no "table" or "KPI stat tile" row; the dashboard's metric tiles are designed from the
  "Financial Dashboard" style row plus the bullet-chart accessibility note ("add numerical value + percentage label").
- Accessibility ratings in the dataset ("✓ WCAG AAA", "⚠ Limited") are **self-declared labels**, not measured
  contrast/behaviour results. They were used only as hints; actual contrast is verified numerically in the test suite.

### 5.4 Conflict between dataset direction and the brief

The generator defaults to light-mode palettes and consumer landing patterns, while the brief mandates dark-first,
emerald-on-near-black and an institutional (non-conversion-optimised) IA. Where they disagree, **the brief wins**;
the dataset contributes structure, chart typing, and accessibility rules, not colours, fonts, or page patterns.

### 5.5 Skill packaging observation

`SKILL.md` documents only `design_system.py`; `search.py` (the domain-search entry point this phase relies on) is
present but undocumented in the skill file. `data/` and `assets/data/` duplicate the same dataset, so edits to one
copy would silently diverge — read-only use here, no edits made. The skill is installed outside this workspace
(`/root/python_projects/lauren-all/...`), not vendored into the project, so builds do not depend on it.

## 6. Resulting design direction (brief-compatible synthesis)

- **Layout**: 12-column grid, 8 px base unit, asymmetric editorial splits, hairline `1px` borders, deliberately
  generous whitespace; section rhythm = eyebrow label → headline → lead → content.
- **Type**: Geist Sans (display/UI) + Geist Mono (all numeric/technical data), self-hosted via `next/font`;
  fluid `clamp()` display sizes, `tabular-nums` everywhere figures appear.
- **Colour**: the brief's tokens as `@theme` variables; emerald reserved for positive/advisory emphasis, muted blue for
  secondary data series, `#EF4444`-class red only for loss/negative; every pairing verified ≥ 4.5:1 (text) / 3:1 (UI).
- **Charts**: line/area equity curve with legend, signed return bars, distribution with stats table, candlestick with a
  visually-hidden OHLC table, order-book and signal-network graphics as decorative `aria-hidden` motifs with a text
  summary; every figure labelled *simulated*.
- **Motion**: 1–2 animated elements per view, 150–300 ms ease-out, `useReducedMotion` + CSS media query, no glow,
  no flashing, counters jump to final value when reduced motion is set.
- **Verification**: the dataset's checklist becomes test assertions (labels, `aria-live`, focus rings, 44 px targets,
  skip link, reduced motion, responsive breakpoints 375/768/1024/1440).

**Confidence:** high for chart typing, accessibility rules, grid/typographic structure and stack guidance (direct
dataset rows + independent confirmation by the brief). Low for palette, fonts and page patterns — those candidates were
rejected for explicit brief conflicts, so the design direction there is *brief-derived*, not research-derived.
