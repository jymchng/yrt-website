# Experience Architecture — Yishun River Trading

**Phase:** `experience_architecture`. **Binding inputs:** approved design-system v1.2
(`docs/design/design-system.md`), stack-adaptation guide (`docs/implementation/implementation-guide.md`),
product brief. One master design system; local overrides only where listed in §7 and each requires a written reason.

Legend used below: **[S]** server component (default) · **[C]** client island (`'use client'`, leaf) ·
**[R]** route file · **[T]** typed data module.

---

## 1. Screen inventory (7 routes + 7 system surfaces)

| # | Route | Kind | h1 | Primary action | Islands |
|---|---|---|---|---|---|
| 1 | `/` | [R] page | "Yishun River Trading" | Explore Our Approach → `/strategies`; Contact Us → `/contact` | HeroMotif, DashboardPreview |
| 2 | `/strategies` | [R] page | "Strategies" | Contact Us → `/contact` | Accordion (via Radix, client) |
| 3 | `/research` | [R] page | "Research" | open an entry | ResearchFilter |
| 4 | `/research/[slug]` | [R] page (13–16 static slugs) | article title | Back to research | ArticleActions (DropdownMenu) |
| 5 | `/technology` | [R] page | "Technology" | Explore our approach → `/strategies` | none |
| 6 | `/about` | [R] page | "About" | Contact Us → `/contact` | none |
| 7 | `/contact` | [R] page | "Contact" | Submit enquiry | ContactForm |
| S1 | `app/layout.tsx` | [R] shell | — | — | MobileNav |
| S2 | `app/not-found.tsx` | [R] | "This page has no river either." | Back to home | none |
| S3 | `app/error.tsx` | [R] client boundary | "Something broke in the pipeline." | Try again | none (digest shown) |
| S4 | `app/global-error.tsx` | [R] own `<html>/<body>` | "Something broke in the pipeline." | Back to home | inline `<style>` tokens only |
| S5 | `app/loading.tsx` | [R] | — | — | Skeleton blocks |
| S6 | `app/opengraph-image.tsx` | [R] `ImageResponse` | — | — | none |
| S7 | `app/sitemap.ts` · `app/robots.ts` | [R] | — | — | none |

No screen is optional and no screen is a mockup: every row above ships.

---

## 2. Information hierarchy

```
app/layout.tsx [S]  <html lang="en" class="…geist vars"> <body>
 ├─ SkipLink  → #main
 ├─ SiteHeader [S]  <header> <nav aria-label="Primary"> wordmark + 6 links + ghost Contact
 │    └─ MobileNav [C]  <md only, Radix Sheet
 ├─ <main id="main" tabIndex={-1}>  ← exactly one per route
 │    Home → hero → brand statement → capabilities → dashboard → research preview → technology → CTA
 │    Strategies → intro → 7 strategy disclosures → CTA
 │    Research → intro → filter bar → entry list | empty state
 │    Article → breadcrumb → header(+illustrative badge) → body → references → prev/next
 │    Technology → intro → 7 capability areas → architecture diagram → code visuals → CTA
 │    About → intro → Philosophy → Our Name (banded) → Principles → CTA
 │    Contact → intro → form (aria-live status) → direct contact <address>
 └─ SiteFooter [S]  secondary nav · illustrative-data disclaimer · <address>
```

Heading rule enforced per route: one `h1` (`text-h1`, home uses `text-display`), `h2` per section,
`h3` per card/sub-section, `h4` for list-row heads. Eyebrows are `<p>`, never headings.

---

## 3. User-flow states

**F1 Evaluator (home → strategies → contact).** hero → capability cards → dashboard (disclosure adjacent) →
strategies accordion (overview always visible) → contact. Every hop is a real link; no client state needed
except the accordion and the dashboard period tabs.

**F2 Researcher (research → filtered → article → back).** `/research?category=market-microstructure&q=depth`
renders server-side from `searchParams` (no flash of unfiltered list), then the client island takes over.
Article page is statically generated; breadcrumb returns to the *filtered* URL only if the referrer carried
params — otherwise the plain index. Unknown slug → `notFound()`.

**F3 Engineer (technology → about → contact).** No islands; diagram is static SVG + visually-hidden `<ol>`.

**F4 Mobile visitor (390px).** Sheet menu → route → charts at 3 ticks, KPI 2×2, no horizontal scroll
(`document.scrollWidth <= clientWidth`).

**F5 Contact submitter.** idle → client-side field errors on blur/submit → server revalidation →
`delivered` | `not-configured` | `invalid` | `rate-limited`. The failure states never render as success.

**F6 Keyboard/SR user.** skip link → nav → main → accordion triggers → chart text alternatives →
research chips/search → form fields → submit → announced status.

---

## 4. Interaction / state matrix

| Surface | States that must exist and be visually distinct |
|---|---|
| SkipLink | hidden (`sr-only`) · focus-visible (visible, ring) |
| Nav link | idle (`text-secondary`) · hover (primary) · focus-visible (ring) · current (`aria-current="page"` + 2px emerald underline) |
| MobileNav Sheet | closed · open (trap, `Esc`, focus return) · reduced-motion (0ms) · trigger 44×44 |
| Button | default · hover (120ms) · active (accent-press, 80ms) · focus-visible (2px ring, 2px offset) · **disabled = named state, not opacity** · loading (label → mono status + 1px indeterminate bar, width preserved) |
| Capability card | idle · hover (surface→raised, border→strong) · focus-visible (ring on card) · single link per card |
| Strategy accordion | collapsed · expanded (overview always in DOM) · focus-visible · reduced-motion bypass |
| Dashboard island | ready (static fixtures) · tab switch (1M/3M/1Y/ALL re-slices the same seeded series) · tooltip hover/focus · skeleton while the chunk/fonts load · reduced-motion (no line-draw, counters at final value) · per-panel error boundary → panel-level message, never a blank card |
| Chart panel | data · empty series (defensive: renders "no data" caption, not an axis-only frame) · `role="img"` + aria-label + visually-hidden summary |
| Research chips | unselected · selected (`aria-pressed` + emerald text/border/wash + leading dot) · focus-visible |
| Research search | idle · typing (200ms debounce) · pending · **no results (dashed empty state + Clear filters)** · over-length (caution, not error) |
| Research URL | `?category` only · `?q` only · both · **unknown category → unfiltered list + caution badge** |
| Article | loading skeleton (route `loading.tsx`) · loaded · illustrative badge beneath h1 · unknown slug → 404 |
| Contact field | default · focus (ring) · invalid (`aria-invalid`, negative border, error text wired via `aria-describedby`) · disabled · filled |
| Contact submit | idle · pending (disabled + reason in text) · **delivered** · **not-configured (names missing env vars, states not sent)** · **invalid** · **rate-limited (retry-after)** · honeypot/time-trap → silent success-shaped 200 with no send *and* an explicit internal log |
| System pages | 404 · error (`digest` shown when present) · global-error (no shell, inline tokens) · loading skeleton matching final block sizes |

---

## 5. Component dependency graph

```
app/layout.tsx ─┬→ SkipLink
                ├→ SiteHeader ─┬→ NavLinks ─→ (Link, usePathname)
                │              └→ MobileNav ─→ Sheet ─→ (Radix Dialog)
                │                            └→ Button(ghost)
                └→ SiteFooter ─→ FooterNav, DisclaimerBadge, Address

app/page.tsx ─┬→ Section, PageIntro, Eyebrow, Prose
              ├→ HeroMotif [C] ─→ useReducedMotion, seeded series (lib/data)
              ├→ CapabilityCard ×4 ─→ Card
              ├→ DashboardPreview [C] ─┬→ KpiRow ─→ KpiFigure(mono, tabular)
              │                        ├→ ChartFrame ─→ figcaption + sr-only summary
              │                        ├→ EquityCurvePanel, DailyReturnsPanel,
              │                        │   VolumePanel, MarketActivityPanel ─→ Recharts
              │                        ├→ Tabs (1M/3M/1Y/ALL)
              │                        └→ Badge(simulated)
              ├→ ResearchPreviewList ─→ EntryRow ×6
              ├→ TechnologySummary ─→ CapabilityArea ×7
              └→ ClosingCta ─→ Button(primary)

app/strategies/page.tsx ─→ StrategyDisclosure ×7 ─→ Accordion(Radix)
                                                      └→ Formula, Table(§6.15), Badge

app/research/page.tsx ─┬→ PageIntro
                       ├→ ResearchFilter [C] ─┬→ CategoryChips ─→ Chip(aria-pressed)
                       │                      ├→ SearchField (type=search, 200ms)
                       │                      └→ lib/research/filter.ts (pure, unit-tested)
                       ├→ ResultsCount (aria-live)
                       ├→ EntryRow ×n ─→ Badge(illustrative)
                       └→ EmptyState

app/research/[slug]/page.tsx ─┬→ Breadcrumb
                              ├→ Badge(illustrative)
                              ├→ Prose (renderer over typed blocks: p/h2/h3/quote/list/code/formula/figure)
                              ├→ ArticleActions [C] ─→ DropdownMenu
                              ├→ ReferenceList
                              └→ PrevNextNav ─→ EntryCard ×2

app/technology/page.tsx ─┬→ CapabilityArea ×7
                         └→ ArchitectureDiagram [S] (static SVG + visually-hidden <ol>)

app/about/page.tsx ─→ Prose, Blockquote (Our Name band), PrinciplesList, ClosingCta

app/contact/page.tsx ─┬→ ContactForm [C] ─┬→ FormField / TextAreaField / HoneypotField
                      │                    ├→ SubmitButton (disabled/loading)
                      │                    ├→ StatusMessage (aria-live)
                      │                    └→ lib/validation/contact.ts (Zod, shared)
                      └→ AddressBlock

lib/data/{series.ts, dashboard.ts} [T] ─→ seeded PRNG (mulberry32) + exported seeds
lib/content/{research.ts, strategies.ts, capabilities.ts, technology.ts, about.ts} [T]
lib/seo/{metadata.ts, jsonld.tsx} [S]
docs/design/check-contrast.mjs ─→ app/globals.css (diff gate)
```

**Shared-file rule:** each file in the graph has exactly one owning task (§8). A task may *import* a file
owned by an earlier wave; it may never edit it. `package.json`, `app/layout.tsx`, `app/globals.css`,
`lib/utils.ts` and `lib/data/types.ts` are single-owner files — the most common source of merge conflict and
therefore the ones fixed before parallel work starts.

---

## 6. Page & component specifications

### 6.1 `/` Home
Sections in order, server-rendered except the two islands:
1. **Hero** — eyebrow `SYSTEMATIC · QUANTITATIVE · DISCIPLINED`; `h1` "Yishun River Trading" (`text-display`);
   subtitle "Yishun Has No River."; lead "Quantitative research. Systematic strategies. Data-driven trading.";
   paragraph "We apply mathematics, statistics, and technology to understand financial markets and develop
   systematic trading strategies."; CTAs [Explore Our Approach `primary` → /strategies] [Discover Our Research
   `secondary` → /research]; HeroMotif behind, `aria-hidden`, ≤4% opacity, static under reduced motion.
2. **Brand statement** — "Markets are complex. Our approach is systematic." (`h2`) + one paragraph.
3. **Capabilities** — 4 cards: Quantitative Research, Algorithmic Trading, Statistical Arbitrage, Market
   Microstructure. Each: eyebrow, `h3`, `text-body-sm` description, single full-surface link to the related
   section (Strategies or Technology). Exactly one interactive element per card.
4. **Dashboard preview** — `SIMULATED · ILLUSTRATIVE` eyebrow + `h2` + persistent `Simulated data` badge in the
   header; KPI row [Equity · Sharpe · Max drawdown · Daily volatility]; 4 panels [equity curve | daily returns |
   volume | market activity]; each panel `figcaption` repeats the disclosure; period tabs 1M/3M/1Y/ALL.
5. **Research preview** — 6 entry rows (title link only) + "All research →".
6. **Technology** — `h2` "Built on mathematics. Powered by technology." + 3–4 capability lines + link.
7. **Closing CTA** — "The market never stops moving. Neither does research." + `primary` Contact Us.

### 6.2 `/strategies`
`h1` "Strategies"; one-sentence lead that frames all seven as *conceptual* research (no performance claim).
Seven `<StrategyDisclosure>` items — Statistical Arbitrage, Market Making, Cross-Exchange Arbitrage, Momentum,
Mean Reversion, Liquidity Provision, Portfolio Optimisation — each with: **Overview** (always visible), then
**Mathematical intuition** (Formula + prose gloss), **Market data**, **Risk considerations**,
**Implementation considerations**. Accordion `type="single" collapsible`; region has `aria-labelledby`;
trigger is a full-width `h3` button with chevron; content real DOM (never `hidden="until-found"`).

### 6.3 `/research` and `/research/[slug]`
Index per design-system §14.5: `h1`, lead, sticky-at-lg filter bar (chips left, search right, `min-width:220px`),
`aria-live` results count phrased as a sentence, one `<article>` row per entry with the heading as the only link,
`illustrative` badge inline after the title. Empty state = dashed hairline + `NO MATCHING ENTRIES` + Clear filters.
Unknown `category` → unfiltered list + caution badge (never an empty screen).
Article per §14.1: breadcrumb `<ol>`, category·date eyebrow, `h1`, badge, lead, hairline, body blocks, references
`<ol>` (external links get icon + visually-hidden "(opens in a new tab)"), prev/next cards, "Back to research".
`generateStaticParams()` exports every slug; `generateMetadata()` returns title/description/canonical/OG/Twitter;
Article + BreadcrumbList JSON-LD emitted.

### 6.4 `/technology`
Seven areas (trading infrastructure, market data processing, backtesting, execution systems, statistical
computing, distributed systems, performance engineering), each `h3` + `text-body-sm` + a mono capability list.
`ArchitectureDiagram`: 4 layers (DATA INGESTION → NORMALISATION → STRATEGY & BACKTEST → EXECUTION & MONITORING),
nodes as cards, edges `--color-border-strong`, no motion, `<figcaption>` + visually-hidden `<ol>` describing
every node and the flow direction. Stacks vertically <768px with chevron connectors; never scrolls horizontally.
Code-inspired visuals use `text-code` mono blocks with `overflow-x:auto` and a visible "Copy" text label.

### 6.5 `/about`
`h1` "About"; **Philosophy** (3–4 paragraphs, 68ch, no numbers); **Our Name** banded section (`surface-1`,
96–128px padding) carrying "Yishun has no river. But every market has a current." as a blockquote with 2px emerald
left border, then prose; **Principles** `<ol>` of 3–4 `h4` + one sentence each; closing CTA. No founding year,
headcount, AUM, awards, logos, photographs.

### 6.6 `/contact`
`h1` "Contact"; one paragraph on what to send; form: Name, Email, Subject (Select or Input — Select uses native
`<select>` on mobile), Message (Textarea, counter after threshold, over-limit = caution), honeypot (visually
hidden, `tabIndex={-1}`, `aria-hidden`), SubmitButton. Status region `aria-live="polite"`; four result states as
in §4. `<address>` with the firm's contact details (no fake phone/office). Server action in
`app/contact/actions.ts` returns the `ContactResult` union.

### 6.7 System surfaces
Shared "system page" template: centred, `max-width:52ch`, eyebrow → `h2`-sized `h1` → one sentence → optional mono
diagnostic → one or two actions. `error.tsx` is a client component with `reset()`; `global-error.tsx` renders its
own `<html>/<body>` with inline token values and no nav; both `noindex`. `loading.tsx` mirrors the real block
sizes with Skeletons and `aria-busy="true"`, plus a visible mono `LOADING` line after 1s.

---

## 7. Local overrides of the master design system

The design system is the master for all seven routes. Only two page-level documents are permitted, and both are
recorded here *before* implementation so the implementation phase cannot invent new ones:

| Override document | Applies to | Justified deviation |
|---|---|---|
| `docs/design/pages/home.md` | `/` only | The hero may use `text-display` (elsewhere banned) and the dashboard may host the only two-island composite; body measure widens to 72ch on §1.2's editorial register. Nothing else changes. |
| `docs/design/pages/research.md` | `/research`, `/research/[slug]` | Body copy uses `--color-text-secondary` at `text-body` (§14.1) and the measure is 68ch, not 72ch; the index row separator is `--color-hairline` with hover→`border-strong`. |

No other route may add a token, a colour, a radius, a duration or a component variant. Anything that wants to is a
design-system revision, not a page override.

---

## 8. Implementation tasks, waves and file ownership

Each task owns a disjoint set of paths. `package.json` is written once, in T1, with **every** script and
dependency the later waves need (including vitest/playwright), so no later task edits it.

| ID | Task | Owns (paths) | Depends on |
|---|---|---|---|
| T1 | Foundation: pnpm project, TS strict, Next+Tailwind v4+PostCSS, fonts, `app/globals.css` (§15 verbatim), `lib/utils.ts` (`cn`), `app/layout.tsx` shell, `package.json` with all scripts/deps | `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `app/globals.css`, `app/layout.tsx`, `lib/utils.ts`, `.env.example`, `.gitignore` | — |
| T2 | UI primitives (13 vendored, token-customized, ring classes deleted) | `components/ui/**` | T1 |
| T3 | Layout components + mobile nav | `components/layout/**` | T2 |
| T4 | Types, seeded data, and all content modules | `lib/data/**`, `lib/content/**` | T1 |
| T5 | Data-viz system + dashboard island | `components/viz/**` | T2, T4 |
| T6 | Home page | `app/page.tsx`, `components/home/**` | T2–T5 |
| T7 | Strategies page | `app/strategies/**`, `components/strategies/**` | T2, T3, T4 |
| T8 | Research index + article route + filter island | `app/research/**`, `components/research/**`, `lib/research/**` | T2, T3, T4 |
| T9 | Technology page + architecture diagram | `app/technology/**`, `components/technology/**` | T2, T3, T4 |
| T10 | About page | `app/about/**`, `components/about/**` | T2, T3, T4 |
| T11 | Contact page, form, Zod schema, server action | `app/contact/**`, `components/contact/**`, `lib/validation/**` | T2, T3 |
| T12 | System surfaces + SEO (metadata builders, JSON-LD, sitemap, robots, OG) | `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/loading.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `lib/seo/**`, `app/_og/**` | T2, T4 |
| T13 | Tests + docs | `tests/unit/**`, `tests/e2e/**`, `vitest.config.ts`, `playwright.config.ts`, `README.md`, `AGENTS.md`, `docs/architecture.md`, `docs/testing.md`, `docs/deployment.md`, `docs/design/pages/*.md` | all |

**Waves (max concurrency 3, no two workers touching the same file):**
`W1` T1 → `W2` T2, T3, T4 → `W3` T5, T7, T9, T10, T12 → `W4` T6, T8, T11 → `W5` T13.

Expected intermediate state: `tsc` is **red** at the end of W1 by design (T1's `app/layout.tsx` imports
`components/layout/*`, which only exists after W2). W2's exit criterion is `tsc --noEmit` green; W3 adds routes
without touching shell files; W4 fills the remaining routes; W5 adds tests and docs and must leave
`tsc`, `eslint`, `vitest`, `next build` and `check-contrast` all green.

---

## 9. Keyboard and accessibility behaviour (per component)

| Component | Keyboard | Announcement |
|---|---|---|
| SkipLink | first Tab reveals it; Enter jumps to `#main` | "Skip to main content" |
| SiteHeader nav | Tab order = DOM order; no roving tabindex | `<nav aria-label="Primary">`, current link `aria-current="page"` |
| MobileNav trigger | Enter/Space opens; `Esc` closes; focus returns to trigger; trap inside Sheet | `aria-expanded`, `aria-controls`; Sheet has `aria-labelledby` |
| Strategy accordion | Enter/Space toggles; ↑/↓/Home/End move between triggers | `aria-expanded`, `aria-controls`; region `aria-labelledby` |
| Dashboard tabs | ←/→ move, Home/End jump; panel `tabIndex={0}` only when it has no focusable children | `role="tablist"/tab/tabpanel`, `aria-selected` |
| Charts | every panel is a `figure` with `role="img"`; the summary is real text in the DOM, so no keyboard interaction is required to read it | `aria-label` on the figure + visually-hidden series summary |
| Research chips | Enter/Space toggles; all chips reachable in one Tab pass | `aria-pressed`; results count in `aria-live="polite"` |
| Search field | typing debounced 200ms; `Esc` clears; no focus loss on re-render | `<label>` + `aria-describedby` for pending/empty hints |
| Entry row / card | one Tab stop per row (single link) | heading is the accessible name |
| Contact fields | Tab order = visual order; blur/submit validation; errors focus the first invalid field | `aria-invalid`, `aria-describedby`, `role="status"` summary |
| DropdownMenu (article) | Enter opens, arrows navigate, `Esc` closes, focus returns | Radix-managed roles |
| System pages | one Tab stop (the action) | `h1` first in reading order |

Global: no focus traps, no `outline: none` without the §2.4 replacement, no hover-only information, colour never
the sole carrier, `prefers-reduced-motion` honoured in both CSS and the two motion islands.

---

## 10. Responsive variants

| Component | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| Nav | wordmark + 44×44 Sheet trigger | inline links from `md` | inline + ghost CTA | same, content capped 1200 |
| Hero | `text-display` at clamp floor, motif behind at ≤4%, no text over moving lines | 8-col, wider lead | 12-col, 60ch lead | capped 1200 |
| Capability cards | 1 col | 2×2 | 4×1 | 4×1 |
| KPI row | 2×2 | 4×1 | 4×1 | 4×1 |
| Dashboard panels | stacked, 3 ticks, legend below | stacked | panel 1 full + 2–4 in 3-up | same |
| Strategies accordion | full width, 48px trigger rows | 2-col meta | 12-col with sticky sub-nav none | capped |
| Research filter | stacked, native `<select>` allowed | chips wrap 2 rows | sticky bar, input ≥220px | capped |
| Research rows | stacked meta | title + summary | single-line meta inline | capped |
| Architecture diagram | vertical stack + chevrons | 2 per layer | 4 horizontal rows | same |
| Tables | `overflow-x:auto` + tabIndex 0 | 44px rows | 36px rows | 36px rows |
| Contact form | 1 col, 44px inputs | 1 col | 2-col for name/email | capped 52ch |
| System pages | 96px padding | 128px | 160px | capped 52ch |

---

## 11. Requirement → acceptance mapping

| # | Requirement (brief) | Acceptance criterion | Verified by |
|---|---|---|---|
| R1 | Six pages exist as real App Router routes; every link resolves | 7 route files present; scripted crawl finds 0 `href="#"` and 0 404s for internal links | e2e crawl + `grep -r 'href="#"'` |
| R2 | Landmarks, one h1, correct heading order, working skip link | each route has exactly one `h1` and one `<main>`; skip link moves focus to `#main` | e2e a11y assertions + axe run |
| R3 | Sticky nav, server-rendered, Sheet below md, `aria-current` | header is a server component; Sheet opens <768 only; current route marked | e2e at 390 + 1440 |
| R4 | Hero visualisation from seeded series, static under reduced motion | same seed ⇒ identical path; no `fetch`; reduced-motion renders final frame | unit (seed determinism) + e2e emulate media |
| R5 | Tagline + specified headlines verbatim, 4 cards, 2 CTAs | strings present in DOM snapshot: "Yishun Has No River.", "Markets are complex. Our approach is systematic.", "Built on mathematics. Powered by technology.", "The market never stops moving. Neither does research." | e2e text assertions |
| R6 | Dashboard: all 7 figures + tooltips + disclosure adjacent | 4 KPIs + 4 panels in DOM; disclosure badge inside the component header; 7/7 requirement→panel map honoured | e2e DOM assertions |
| R7 | Research filter + search, no full reload, URL-reflected, back/forward safe, empty state | URL contains `?category=&q=`; back restores filtered view; "Clear filters" restores all | e2e |
| R8 | Typed in-repo content with slug/category/date/summary/body/takeaways; several illustrative | `lib/content/research.ts` type-checks; ≥6 entries; ≥2 with `illustrative: true` | unit + tsc |
| R9 | 7 strategies × 5 dimensions in accessible disclosure keeping content in DOM | 7 disclosures; each has 5 labelled parts; collapsed content still in DOM | unit render + e2e |
| R10 | Technology: 7 areas + diagram with text alternative | 7 area headings; `figure` + visually-hidden `ol` naming every node | e2e |
| R11 | About: Philosophy + Our Name with the required line, no invented history | line present verbatim; no year/AUM/headcount/award tokens in page text | e2e + content lint |
| R12 | Contact: client+server Zod, aria wiring, aria-live, honeypot+timing | inline errors wired; server revalidates forged payload; fast bot submission does not send | unit (schema) + e2e |
| R13 | Resend env-gated; absent vars ⇒ explicit unconfigured, never success | `not-configured` names missing vars; no success string rendered | unit (action) + e2e with env unset |
| R14 | Reduced motion site-wide, no animation-only information | CSS block present; both islands call `useReducedMotion`; counters render final | e2e emulate media |
| R15 | Per-page Metadata + sitemap + robots + OG + JSON-LD | every route exports metadata; `/sitemap.xml`, `/robots.txt`, `/opengraph-image` respond 200; Organization/WebSite/Article/BreadcrumbList present | e2e + build output |
| R16 | Loading, error, not-found styled consistently | 4 system files exist and use the shared template | build + e2e 404 |
| R17 | Server components by default; each `'use client'` justified | exactly 6 `'use client'` files, listed in `docs/architecture.md` | `grep -rl "use client" \| wc -l` |
| R18 | No secrets; env documented with placeholders only | `.env.example` has no real values; README lists every var | grep for key patterns |
| R19 | Zero fabricated performance claims; every figure labelled | every numeric panel carries Simulated/Illustrative in the UI; accent/claims audit list passes | e2e + manual audit |
| R20 | Tooling: scripts + tsc, eslint, vitest, next build, Playwright smoke | all five commands exit 0; smoke covers nav + contact validation | CI command run |
| X1 | Design-system tokens, no ad-hoc values | `check-contrast.mjs` exit 0 (diffs `app/globals.css`); no hex outside `globals.css` | `node docs/design/check-contrast.mjs` + grep |
| X2 | WCAG 2.2 AA contrast/focus/targets | 64/64 token pairs hold; every interactive element has a visible focus ring; ≥44px targets <md | audit script + e2e |
| X3 | Responsive 390/768/1024/1440, no horizontal overflow | `scrollWidth <= clientWidth` at all four widths on all 7 routes | e2e |

---

## 12. Out of scope (explicit, to prevent scope creep)

Auth, CMS, database, live market data, analytics, i18n, payments, real trading infrastructure, a light theme,
a search backend, pagination until content exceeds one page of rows.
