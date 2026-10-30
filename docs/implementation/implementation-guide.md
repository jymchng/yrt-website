# Implementation Guide — Yishun River Trading (v1, stack adaptation)

**Phase:** `stack_adaptation`. **Input:** approved design-system v1.2 (`docs/design/design-system.md`, 852 lines),
approved research (`docs/research/ui-ux-pro-max-research.md`), and the product brief.
**Purpose:** translate the approved design into instructions an implementation phase can execute against the
repository as it actually exists today — including the parts that are *not* knowable yet.

---

## 1. Detected stack — and how much of it is actually detected

**Finding: no stack is detectable from code. The repository contains no application.**

Measured evidence (`find . -type f -not -path './.agenthicc/*'`, this session):

| Path | What it is |
|---|---|
| `docs/design/design-system.md` | 852-line approved design system (v1.2) |
| `docs/design/check-contrast.mjs` | 645-line dependency-free ESM contrast/token auditor |
| `docs/research/ui-ux-pro-max-research.md` | 290-line design-intelligence report |
| `tests/.cassette/<uuid>/{cassette,approvals,meta}.json(l)` | agent-harness recording — **not** a test suite |

Absent: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.*`, `app/`, `components/`, any `.ts(x)`,
any installed `node_modules`. There is therefore **no framework to infer**, no existing convention to follow,
and no installed version to inspect for API compatibility.

What *is* measured about the environment:

| Probe | Value | Consequence |
|---|---|---|
| `node -v` | **v21.7.3** | Odd-numbered, **EOL** (Node 21 left support 2024-06). Not an LTS line. |
| `ls $NVM_DIR/versions/node` | `v21.7.3`, `v25.9.0` | The box has **no LTS** (20/22/24). v25 is also odd/non-LTS but current. |
| `pnpm -v` / `npm -v` | **9.15.9** / 10.5.0 | pnpm is the brief's manager and is present. |
| `pnpm store path` | `/root/.local/share/pnpm/store/v10/v3` (`v3`, `v10`, `v11` present) | An offline store exists — a first install may be satisfiable offline. |
| `pnpm config get registry` | `https://registry.npmjs.org/` | Network installs need operator approval. |
| Harness warning | `@tailwindcss/postcss not found` | Confirmed prerequisite: the v4 toolchain is not installed. |
| Playwright MCP | `ready`, local transport, 0 pages, 20 actions/turn | Browser verification is available **once a dev server exists** and its origin is allow-listed. |

**Declared** stack (brief §2 + design-system §15), which becomes authoritative only once it is installed:
Next.js App Router (server components, async `params`/`searchParams`), React, TypeScript strict, Tailwind CSS v4
CSS-first `@theme` via `@tailwindcss/postcss` (no `tailwind.config.js`), shadcn/ui hand-vendored over Radix
(`cva` + `clsx` + `tailwind-merge`), Lucide icons, Recharts, Framer Motion, `next/font` Geist Sans + Geist Mono,
Zod, Resend, Vitest, Playwright, `tw-animate-css`.

**Uncertainty to carry forward (do not silently assume):**

1. The brief's version literals (e.g. `Next.js 16.4.x`, `React 19.3`, `Tailwind 4.3`, `Recharts 3.10`,
   `Framer Motion 14.8`, `Zod 4.6`, `Resend 6.35`, `Lucide 1.65`) were **not verified against the registry**
   (no network probe was made). Some do not match the version cadences these packages are known for.
   **Rule: do not copy the literals into `package.json`.** Install latest stable, then record the resolved
   versions in `docs/architecture.md` and adjust if a literal does not resolve. Verify the package *name*
   too (`framer-motion` vs the newer `motion` entry point) before writing imports.
2. Pin the runtime honestly: prefer `v25.9.0` over the EOL `v21.7.3`, add `"engines": { "node": ">=20.9" }`,
   and record the non-LTS deviation. If `next build` fails on v25, the fallback is a documented `nvm` LTS
   install — an environment change, not a code change.
3. Recharts/React 19, Framer Motion/React 19 and Tailwind v4/PostCSS composition are **unverified by
   construction**. The first `pnpm build` is the evidence; treat it as a gate, not a formality.

---

## 2. UI/UX Pro Max stack guidance — what was used and what was refused

The skill is **not installed in this workspace**; only in unrelated sibling projects. The inspected version
(v0.1.0, `_meta.json`) exposes 12 stacks including `nextjs` (52 rows), `react` (53), `shadcn` (60) — the
three that match this project. Its guidance was consumed through the approved report, which recorded the
exact rows.

**Adopted (version-agnostic, consistent with the design system):** server components by default; Metadata API
over manual `<head>`; memoise expensive chart calculations; `cn()` + `cva` for variants; tokens as CSS
variables in `globals.css`.

**Not used as evidence:**

- Its **palette, font-pairing, landing-pattern and style rows** — already rejected with reasons in
  design-system §12 (pink CTA, light-first palette, serif display, "Horizontal Scroll Journey",
  "Trust & Authority" badge walls) and by the brief's integrity constraint.
- Its **chart-library recommendations** (TradingView Lightweight Charts, ApexCharts, Chart.js, Plotly, D3) —
  the brief locks Recharts; only its accessibility notes were retained.
- Its **Tailwind syntax guidance** — nothing in the inspected output distinguishes Tailwind v3
  (`tailwind.config.js`) from v4 CSS-first `@theme`, so it is *not* evidence for the syntax this project must
  use. The v4 syntax below comes from design-system §15 and must be confirmed by a real build (§9).

Also note the skill's own recorded defects: `landing.csv` row 27 is malformed and its generator's Pattern
block is untrustworthy (§5.1 of the research doc). No generated file was ever persisted into this repo.

---

## 3. Token mappings — design system → Tailwind v4

`app/globals.css` **must be a verbatim copy of design-system §15** (`@import "tailwindcss";` + one `@theme`
block + the `.tabular` class + the focus rule + the reduced-motion block). The auditor diffs it against the
document the moment it exists, so a hand-edited variant will fail the build gate.

| Design token family | Utilities it generates | Mapping rules |
|---|---|---|
| `--color-*` (33 tokens) | `bg-`, `text-`, `border-`, `outline-`, `ring-`, `fill-`, `stroke-`, `divide-`, `decoration-` | `--color-surface-card` → `bg-surface-card`; `--color-text-secondary` → `text-text-secondary` (double word is expected — do not rename the token to please the class name); `--color-accent-ink` → `text-accent-ink` |
| `--text-*` + `--text-*--line-height/letter-spacing/font-weight` | `text-display` … `text-code` (14 steps) | Use the token classes only; never `text-[17px]` |
| `--radius-sm/md/lg/pill` | overrides `rounded-sm`=2px, `rounded-md`=4px, `rounded-lg`=6px | **`rounded-xl` and `rounded-2xl` are still 12px/16px** and violate "nothing above 6px". Ban them from vendored shadcn source, or add `--radius-xl: 6px` |
| `--spacing: 0.25rem` | the whole dynamic spacing scale | `p-4`=16px, `gap-6`=24px, `py-16`=64px, `scroll-mt-22`=88px (nav offset), `min-h-[44px]` only where the scale cannot express it |
| `--shadow-overlay`, `--shadow-raised` | `shadow-overlay`, `shadow-raised` | `--shadow-none` is **not** in §15 and needs no token — `shadow-none` is a Tailwind built-in |
| `--font-sans`, `--font-mono` | `font-sans`, `font-mono` | `@theme` references `var(--font-geist-sans)`, so the `next/font` variable class must sit on `<html>`, not a nested div |
| `--duration-*`, `--ease-standard` | **no utilities** | Consume as `var(--duration-base)` in CSS, or `duration-[var(--duration-base)]`; in Framer Motion as `{ duration: 0.12, ease: [0.2, 0, 0, 1] }`. Verify on first build (§9) |
| `--color-selection` (`#10B98133`) | none (8-digit hex) | `::selection { background: var(--color-selection) }` in `globals.css` |
| `--color-overlay` | `bg-overlay` | Scrim only; Radix Dialog/Sheet overlay element |

**Two collision traps to write into `docs/architecture.md` before any component is vendored:**

1. **shadcn alias namespace.** Vendored source is written against `bg-background`, `text-foreground`, `bg-card`,
   `bg-popover`, `bg-primary`, `bg-secondary`, `bg-muted`, `bg-accent`, `text-accent-foreground`,
   `bg-destructive`, `border-input`, `ring-ring`. **None of those tokens exist here**, and `accent` means the
   *opposite* thing in the two vocabularies: shadcn's `accent` is a faint hover surface, this project's
   `--color-accent` is the brand emerald solid fill. Leaving `hover:bg-accent hover:text-accent-foreground`
   in a copied `DropdownMenu` renders `#F4F4F5` on `#10B981` — the **2.31:1** pair design-system §2.3(a) calls
   a hard fail — and floods the UI with emerald. **Rule: translate every shadcn alias class on paste; delete
   unknown tokens rather than defining them.**
2. **`dark:` variants are meaningless.** The token set is absolute, not a light/dark pair. There is no light
   theme, so `prefers-color-scheme` and every `dark:` utility must not appear. Instead set
   `color-scheme: dark` on `:root` (native `<select>`, scrollbars, form controls) and
   `<meta name="theme-color" content="#09090B">`.

---

## 4. Component strategy

Vendored under `components/ui`, customized per design-system §6. Each needs the primitive it is built on:

| Component | Design-system ref | Primitive dependency |
|---|---|---|
| `button` (primary/secondary/ghost/link/danger via `cva`) | §6.1 | `@radix-ui/react-slot` (for `asChild`) |
| `card` | §6.2 | — |
| `badge` (neutral/simulated/illustrative/caution/critical) | §6.9 | — |
| `sheet` (mobile nav) + `dialog` | §6.3, §6.8 | `@radix-ui/react-dialog` (one package, both components) |
| `accordion` (7 strategies) | §6.5 | `@radix-ui/react-accordion` |
| `tabs` (dashboard period) | §6.10 | `@radix-ui/react-tabs` |
| `tooltip` | §6.8 | `@radix-ui/react-tooltip` |
| `dropdown-menu` (article copy actions) | §6.12 | `@radix-ui/react-dropdown-menu` |
| `select` | §6.11 | `@radix-ui/react-select` |
| `separator` | §6.8 | `@radix-ui/react-separator` |
| `input`, `textarea`, `skeleton` | §6.7 | — |

That is **8 Radix packages + `cva` + `clsx` + `tailwind-merge` + `tw-animate-css`**. They are within the
brief's "shadcn/ui" allowance, but they are additions to `package.json` and must be listed with a one-line
justification in `docs/architecture.md` — the brief's "no new dependencies" rule is about *unapproved* kits.

**Two deliberate deviations from the brief's component list, both already ruled in the design system:**
`NavigationMenu` is not vendored (§6.3 — six flat links, no mega-menu; a Radix NavigationMenu would add a
viewport portal and roving focus for no benefit) and there is no `Table` component (§6.15 — semantic
`<table>` + `<caption>` styled with tokens; a component wrapper would obscure `scope` semantics).

**Custom, non-shadcn components the design needs** (all server components, no client JS): `Section` (the
shared eyebrow → headline → lead → content rhythm, §4.3), `Eyebrow`, `Prose` (measure caps: 72ch body / 60ch
lead / 52ch caption / 24ch display, §3.1), `Figure`+`Figcaption` wrapper, `Formula` (§6.13, hand-built
HTML/CSS — **no KaTeX, no MathML**), `ArchitectureDiagram` (§14.2, `<figure>` + visually-hidden `<ol>`),
`Disclosure`-derived strategy sections, `Breadcrumb`, `EmptyState`.

**Charts (client island).** Four panels + 4 KPIs per §6.6 — a panel missing from the DOM is a defect.
Conventions that must not drift: data comes from `lib/data/` seeded fixtures (`mulberry32`-style PRNG, exported
seeds), never from `fetch`; `useMemo` every derived series; `ResponsiveContainer` with **no** pixel widths; tick
counts 4–5 desktop / 3 at 390px; every panel wrapped in `<figure role="img" aria-label="…">` with a
visually-hidden text summary of that series, and the SVG itself `aria-hidden` so the accessible name is
announced once (reconcile this with Recharts' own accessibility layer — pick one, do not double-announce).
Volume and market activity use **solid** fills (series-3 / series-6), never washes, per §6.6/§6.14.

---

## 5. Responsive strategy

**No custom breakpoints are required**, which is worth stating because the design document's table is written
in device widths, not Tailwind tokens:

| Design-system width | Tailwind expression |
|---|---|
| 390px (`xs`) | the **base** layer — mobile-first, no breakpoint prefix |
| 768px (`md`) | `md:` (Tailwind default 48rem = 768px) — nav becomes inline, KPI row 4×1, capability grid 2×2 |
| 1024px (`lg`) | `lg:` (64rem) — 12-col grid, dashboard panel 1 full width + panels 2–4 in a 3-up row |
| 1440px (`xl`) | **not a breakpoint** — `max-w-[1200px] mx-auto`; extra width is margin, never measure |

Rules to enforce mechanically: nothing below `sm` may overflow (`document.scrollWidth <= clientWidth` at 390);
charts full-width with `min-w-0` on flex/grid parents (the classic Recharts overflow bug); tables get their own
`overflow-x-auto` + `tabIndex={0}` + `aria-label` wrapper; bleed elements use `overflow-x: clip` on their own
wrapper and **never** `overflow-hidden` on `body` (it breaks the sticky nav); touch targets `min-h-[44px]`
below `md` for nav rows, chips, tabs (design-system §6.10 specifies 36px visual tabs — extend the hit area with
padding/`::after` exactly as §6.1 does for `sm`/`md` buttons rather than shipping 36px targets).
`scroll-mt-22` on every `[id]` so the 64px sticky nav never covers an anchor.

---

## 6. State and event conventions

**Server components by default. Exactly these client islands** (`'use client'` at the leaf, never on a page):

1. `MobileNav` — Radix `Sheet` trigger + focus return.
2. `HeroMotif` — seeded SVG/order-book motif, `useReducedMotion`, static frame under reduced motion.
3. `DashboardPreview` — Recharts panels + `Tabs` period toggle (client-only; the KPI row may stay server
   components since the figures are static fixtures).
4. `ResearchFilter` — chips + debounced search + URL reflection.
5. `ContactForm` — `useActionState` + `useFormStatus`, honeypot, timing.
6. `ArticleActions` — `DropdownMenu` copy-link/citation.

Entrance reveals should be **CSS-only** (`@media (prefers-reduced-motion: no-preference)` + a single keyframe),
so a reveal does not cost a client island per section. Framer Motion is reserved for the motif and the
counters, not for static prose.

**Research URL state:** local input state debounced 200ms → `router.replace(`${pathname}?${params}`, { scroll: false })`;
chips update immediately; `category`/`q` are read from `searchParams` (awaited — Next 16 async search params);
an unrecognised `category` renders the unfiltered list plus a `caution` badge, never an empty state.

**Contact action contract** — a discriminated union, so "success" is unrepresentable on failure:

```ts
export type ContactResult =
  | { status: 'delivered' }
  | { status: 'not-configured'; missing: readonly string[] }
  | { status: 'invalid'; fieldErrors: Record<string, string> }
  | { status: 'rate-limited'; retryAfterSeconds: number };
```

Server-side Zod revalidation is mandatory (client validation is never trusted); the honeypot and minimum
elapsed-time checks run before any send; Resend is called only when `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and
`CONTACT_FROM_EMAIL` are all present. `not-configured` is a designed state that names the missing variables —
never a green success. The form renders `aria-live="polite"` status text plus text (not colour alone) for
delivered / not-configured / invalid.

---

## 7. Accessibility strategy (mapped to concrete code hooks)

- **Focus ring:** rely on the single global `:where(a, button, input, textarea, select, summary, [tabindex]):focus-visible`
  rule from §15. **Delete the `focus-visible:ring-*` classes from vendored shadcn source** — a ring plus the
  outline produces a double indicator, and an inset ring violates §2.4/§2.3(b).
- **Skip link:** first focusable child of `<body>`; `sr-only focus:not-sr-only` targeting `<main id="main" tabIndex={-1}>`.
- **Landmarks:** one `<main>`, `<header>`, `<nav aria-label="Primary">`, `<footer>`, `<address>` on /contact,
  one `h1` per route, no skipped levels, eyebrow as `<p>` (never a heading).
- **Charts:** `role="img"` + `aria-label` + visually-hidden summary per figure; decorative motif/grid
  `aria-hidden="true"` + `focusable="false"` + `pointer-events-none`.
- **Forms:** persistent visible labels, `aria-invalid` + `aria-describedby` wiring to error ids,
  `role="status"` summary, disabled submit explained in adjacent text.
- **Colour is never the sole carrier:** `+`/`−` on every signed figure, selected chip gets a dot, selected tab
  gets the 3px rule, badges carry words.
- **Motion:** the CSS block in §15 plus `useReducedMotion()` in the two client motion islands; counters render
  final values immediately.
- **Forced colours:** keep the `outline` (do not set `forced-color-adjust: none`).
- **Gate:** `node docs/design/check-contrast.mjs` must exit 0 — it names the specific drift when it does not.

---

## 8. Test and verification tooling

| Tool | State | Use |
|---|---|---|
| `docs/design/check-contrast.mjs` | **works now**, exit 0 (64/64 pairs, 8/8 pitfalls, 5/5 composites) | token/contrast gate; wire as `pnpm check:contrast` in CI |
| `tsc --noEmit` | not installed | strict compile gate (`no any`, no unjustified `!`) |
| ESLint (`eslint-config-next`) | not installed | lint gate |
| Vitest + `@testing-library/react` + `jsdom` | not installed | unit: Zod schema, seed determinism (same seed → same series), URL-state reducer, `ContactResult` union branches, content-module typing |
| Playwright | MCP browser context is `ready`; **project-local** `@playwright/test` and its browsers are not installed | smoke: nav, Sheet, research filter (incl. back/forward), contact validation, keyboard tab order. **Do not download browsers**; if none match, report e2e as unavailable rather than passed |
| `next build` | not installed | the real integration proof (Turbopack, RSC boundaries, `@theme` compilation) |

`tests/.cassette/` is harness recording data. **Do not import, extend or rely on it as a test suite.**

---

## 9. Validation commands (in order)

```bash
# 0. Gate that already passes today — run it before and after any token edit
node docs/design/check-contrast.mjs

# 1. Install (needs operator approval / network; try the offline store first)
pnpm install --offline     # fall back to: pnpm install
pnpm exec next --version   # record the resolved versions; do not trust the brief's literals

# 2. Static gates
pnpm exec tsc --noEmit
pnpm exec eslint .
pnpm exec vitest run

# 3. Integration + the Tailwind v4 evidence
pnpm exec next build
grep -r "duration-base\|radius-xl" .next/static/css/*.css   # confirms the v4 namespace assumptions in §3

# 4. Visual/responsive proof (report honestly if the origin is not allow-listed)
pnpm dev   # then Playwright MCP: http://localhost:3000 at 390 / 768 / 1024 / 1440
pnpm exec playwright test
```

---

## 10. Performance constraints

- No pixel widths on charts; `ResponsiveContainer` inside a `min-w-0` parent with an aspect-ratio wrapper so
  the chart cannot cause CLS or horizontal overflow.
- `useMemo` all derived series; fixtures are module-level constants generated once, not per render.
- Seed generation must be O(n) and dependency-free — no `d3-scale`, no `simple-statistics`.
- Keep non-interactive pages JS-light: the research index and article pages should carry no chart code.
- `next/dynamic` with `ssr: false` is **not** permitted inside a Server Component (Next 16 rule); if the
  dashboard must be deferred, do it from within an existing client island, or accept it in the home island.
- Fonts: `next/font` with `display: 'swap'`, both Geist families, no runtime Google requests; the OG route needs
  raw font bytes — vendor the Geist TTFs under `app/_og/` (SIL OFL 1.1) or accept the default sans (§14.4).

---

## 11. Implementation anti-patterns (design-system §10 plus stack-specific ones)

- ❌ `opacity-40` / blanket opacity for disabled — use the §6.1 named state (surface-1 fill, border, tertiary label).
- ❌ `hover:bg-accent` or any shadcn alias class copied verbatim (§3, trap 1).
- ❌ `rounded-xl` / `rounded-2xl` (12px/16px) — exceed the 6px ceiling.
- ❌ `dark:` variants, `prefers-color-scheme` branches, a light theme toggle.
- ❌ Ad-hoc hex, `text-[17px]`, inline `style={{ color }}` — tokens only.
- ❌ `'use client'` on a page or layout; client-side data fetching; a client island that is not one of the six.
- ❌ `any`, unjustified non-null assertions, `dangerouslySetInnerHTML` for article bodies (use typed content).
- ❌ Chart parity lost on mobile: fixed widths, 8 ticks, legends overlapping the axis.
- ❌ Unlabelled figures — every number carries `Simulated`/`Illustrative` **in the UI**, not just the footer.
- ❌ Invented history/AUM/headcount/testimonials; implied live deployment ("our strategies deliver").
- ❌ A contact success state for a message that was not delivered.
- ❌ `Nav` shadow lift, card scale on hover, parallax, infinite marquee, motion that ignores reduced motion.
- ❌ `href="#"` placeholders; placeholder-only labels; hover-only information.

---

## 12. Limitations of this guide (explicit)

1. **Nothing is detected.** Every stack statement rests on the brief and the approved design system, not on
   installed versions. The first `pnpm install` supersedes §1.
2. **Version literals unverified** (§1). Package *names* too (`framer-motion` vs `motion`).
3. **Node runtime is EOL** (v21.7.3) with no LTS on the box; v25.9.0 is the better of two non-LTS options.
4. **`@tailwindcss/postcss` is absent** — no Tailwind compile is possible until it is installed.
5. **8 Radix packages** are implied by the component list and must be recorded as approved additions.
6. **v4 namespace behaviours** (duration utilities, `--radius-xl`, `@theme` vs `@theme inline`) are stated from
   the design system and must be confirmed against the built CSS (§9 step 3), not assumed.
7. **Playwright project-local browsers are unproven**; MCP readiness is not e2e readiness.
8. **No LTS/E2E/visual verification has been performed** — the only executed check in this phase is
   `node docs/design/check-contrast.mjs` (exit 0), plus filesystem and toolchain probes.
9. The auditor parses `app/globals.css` **only once it exists**; until then it audits the document and its own
   mirror, so the first implementation commit must copy §15 verbatim to keep the gate meaningful.
