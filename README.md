# Yishun River Trading — website

Marketing, research and simulated-analytics site for a fictional quantitative trading firm.
Six pages, dark-first, server-rendered with a handful of client islands.

**"Yishun Has No River."**

> **Integrity rule, first.** Every financial number on this site is a deterministic
> simulated fixture and is labelled as such in the UI. Nothing here reports real,
> historical or live performance, and no strategy is described as deployed, funded or
> profitable. Copy changes that weaken that rule are defects, not content edits.

---

## 1. Quick start

```bash
pnpm install
cp .env.example .env.local     # optional: the site renders fully without any of these
pnpm dev                       # http://localhost:3000
```

Node **≥ 22.12** (declared in `package.json#engines`; developed on Node 25.9).
Package manager is **pnpm** (`packageManager: pnpm@9.15.9`).

## 2. Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | `next dev` with Turbopack |
| `pnpm build` | Production build — 24 prerendered routes |
| `pnpm start` | Serve the production build |
| `pnpm lint` | `eslint .` (flat config, ESLint 9 + `eslint-config-next`) |
| `pnpm typecheck` | `tsc --noEmit`, strict |
| `pnpm test` | Vitest unit suite (`tests/unit`) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:e2e` | Playwright suite (`tests/e2e`) against `next start` on port 3100 |
| `pnpm check:contrast` | Dependency-free token/contrast auditor over `docs/design/check-contrast.mjs` |
| `pnpm format` / `format:check` | Prettier |

**Full verification, in the order that fails fastest:**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e
```

`test:e2e` needs a completed `pnpm build` — the Playwright `webServer` runs `next start`,
not `next dev`, so the suite exercises the HTML a visitor actually receives.

### Running Playwright without downloading a browser

Playwright normally resolves its own managed Chromium (`pnpm exec playwright install
chromium`). On a machine that already has a Chromium build and cannot download one, point
the config at it:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome pnpm test:e2e
```

`playwright.config.ts` passes that through as `launchOptions.executablePath`. When it is
unset, Playwright's default resolution applies unchanged.

## 3. Pages

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static | Hero visual, four capability cards, labelled dashboard preview, research preview |
| `/strategies` | Static | Seven strategy disclosures (Radix accordion) |
| `/research` | Static shell, client filtering | Category + search filter reflected in the URL (`?category=…&q=…`) |
| `/research/[slug]` | SSG, 12 paths | Typed in-repo content, JSON-LD `Article` + `BreadcrumbList` |
| `/technology` | Static | Seven capability areas, described architecture diagram |
| `/about` | Static | Philosophy and "Our Name" |
| `/contact` | Static shell, server action | Zod on both sides, honeypot, timing check, per-instance rate limit, env-gated Resend |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/icon.svg` | Static | SEO surfaces |

Plus `not-found.tsx`, `error.tsx`, `global-error.tsx` and `loading.tsx`.

## 4. Layout of the repository

```
app/                 routes, route handlers, metadata, global CSS
  globals.css        the @theme token block (design-system §15) + keyframes
components/
  ui/                14 vendored shadcn-style primitives over Radix
  layout/            header, nav, mobile sheet, footer, skip link, wordmark
  viz/               chart/hero islands ('use client')
  shared/            section primitives, formula, motifs, breadcrumb, empty state
  research/ technology/ contact/   feature components
lib/
  content/           typed page copy: strategies, research, about, capabilities
  data/              seeded fixtures: series, dashboard, hero
  seo/               metadata builder + JSON-LD builders
  validation/        the shared Zod contact schema
  format.ts          number/date/percent formatting for tabular figures
docs/                design system, implementation guides, and the docs below
tests/unit/          Vitest (jsdom)
tests/e2e/           Playwright (desktop 1440 + mobile 390)
```

## 5. Environment variables

All optional for rendering; only contact delivery needs values. See
[`docs/environment-variables.md`](docs/environment-variables.md).

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key — delivery only |
| `CONTACT_TO_EMAIL` | Destination inbox for enquiries |
| `CONTACT_FROM_EMAIL` | Verified sender address |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and OG URLs |

With **any** of the three contact variables missing, the server action returns
`not-configured`, names the missing variables and states that nothing was sent. It never
reports a success it did not achieve.

## 6. Documentation

| Document | Contents |
|---|---|
| [`docs/design/design-system.md`](docs/design/design-system.md) | Approved design system: tokens, type, layout, components, motion, a11y, copy rules |
| [`docs/design/check-contrast.mjs`](docs/design/check-contrast.mjs) | Contrast/token auditor (`pnpm check:contrast`) |
| [`docs/implementation/implementation-guide.md`](docs/implementation/implementation-guide.md) | Stack adaptation: how the design maps onto Next 16 / React 19 / Tailwind v4 |
| [`docs/implementation/experience-architecture.md`](docs/implementation/experience-architecture.md) | Journeys, states, responsive contract, client-island inventory |
| [`docs/architecture.md`](docs/architecture.md) | How the app is put together and why |
| [`docs/testing.md`](docs/testing.md) | Test strategy, what each suite protects, how to debug a failure |
| [`docs/deployment.md`](docs/deployment.md) | Build, run, hosting notes, the rate-limit caveat |
| [`docs/environment-variables.md`](docs/environment-variables.md) | Every variable, its failure mode and the states it produces |
| [`docs/component-conventions.md`](docs/component-conventions.md) | Rules for adding components, tokens, islands and tests |
| [`AGENTS.md`](AGENTS.md) | Working agreement for contributors and AI agents |

## 7. Known limitations

- **Rate limiting is per instance, in memory.** Behind more than one instance the effective
  limit is per process, not per site. Documented at the implementation in
  `app/contact/actions.ts`.
- **The architecture diagram is descriptive, not a deployed topology.** It illustrates how
  the components in `docs/architecture.md` relate; it is not a running system.
- **All market data is simulated.** Charts are generated from seeded PRNGs
  (`lib/data/series.ts`) with a fixed fixture end date, so output never depends on the clock.
- **No analytics, CMS, auth, database or i18n.** Deliberately out of scope.
