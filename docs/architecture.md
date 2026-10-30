# Architecture — how the site is put together

**Status:** reflects the repository as implemented. Where this document and the code
disagree, the code is right and this document is a bug.

---

## 1. The shape in one paragraph

A Next.js 16 App Router application that is **static by default**. Six routes, seven
research articles and three SEO surfaces are prerendered at build time (24 pages). There is
no database, no CMS, no authentication and no server-side data fetching. Everything the
visitor reads comes from typed TypeScript modules in `lib/content/`, and every number comes
from a seeded generator in `lib/data/`. The only server-side execution is the contact
action. The only client-side JavaScript is sixteen leaf modules that are individually
justified in §5.

That shape is a consequence of the product brief, not of convenience: a marketing site that
cannot drift because a market feed moved is a site whose claims stay honest.

## 2. Rendering model

| Layer | Rendering | Why |
|---|---|---|
| `app/layout.tsx` | Static shell | Header, footer, skip link, font variables; identical on every route |
| Page routes | Static (`○`) | No per-request data |
| `/research` | Static shell + client filter | Filtering happens in the browser over data already delivered; the URL carries the state |
| `/research/[slug]` | SSG via `generateStaticParams` (`●`) | Twelve known slugs; each gets its own metadata and JSON-LD |
| `/contact` | Static shell + server action | Form posts to a server action; no page-level dynamic data |
| `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `icon.svg` | Static | Generated once at build |

There is no `middleware.ts`, no route handler and no `dynamic = 'force-dynamic'` anywhere.
Adding one of those is an architectural change, not a detail.

## 3. Directory responsibilities

```
app/                     routing, metadata, error/loading states
components/ui/           vendored primitives — the only place Radix is imported
components/layout/       persistent shell
components/shared/       cross-page presentational pieces (Section, Formula, motifs)
components/<feature>/    one folder per page-level feature
components/viz/          the two client chart islands
lib/content/             typed copy: strategies, research, about, capabilities
lib/data/                seeded fixtures: series, dashboard, hero
lib/seo/                 buildMetadata(), four JSON-LD builders
lib/validation/          the single shared Zod schema
lib/format.ts            number/date formatting for tabular figures
lib/research/filter.ts   pure filter functions, shared by the island and the tests
```

**Direction of dependency.** `app/` → `components/` → `lib/`. `lib/` never imports from
`app/` or `components/`. `components/ui/` never imports a feature module. Content modules
import only `lib/content/types.ts`. This is what makes the unit suite able to test content,
filtering, formatting and SEO without rendering a route.

## 4. Data flow

### 4.1 Content

`lib/content/*.ts` exports frozen, typed literals. `lib/content/types.ts` holds the shapes
(`Strategy`, `ResearchEntry`, `ResearchCategory`, …). Pages `map` over them; there is no
runtime parsing, no fetch and no fallback state, because a compile error is a better
failure than an empty page.

Research pagination is deliberately absent at twelve entries. The filter is pure:

```
parseFilter(searchParams)  →  filterEntries(entries, state)  →  describeResults(...)
```

`lib/research/filter.ts` is imported by both the client island and `tests/unit`, so the
filtering rules are tested without a browser.

### 4.2 Simulated market data

`lib/data/series.ts` provides `mulberry32(seed)` and `gaussian(random)` — a dependency-free
PRNG and a Box–Muller transform. Two fixed seeds (`DASHBOARD_SEED = 20261001`,
`HERO_SEED = 7741`) and a fixed `FIXTURE_END` date mean the equity curve, daily returns,
volatility and order-book drift are **byte-identical on the server and the client, and
identical on every run**. That is not cosmetic: it is what allows a chart to appear in the
static HTML and hydrate without a mismatch, and it is what makes the numbers safe to show.

No module reads `Date.now()` to generate data. Changing a seed changes the fixtures and
will move any test that asserts a formatted value.

### 4.3 Contact

```
contact-form.tsx ('use client')
  Zod on blur/submit → field errors
        │  FormData (name, email, subject, message, website, startedAt)
        ▼
app/contact/actions.ts ('use server')
  honeypot + elapsed-time check → rate limit → Zod re-parse
        → env check → Resend
        │
        ▼
  ContactResult discriminated union
  { delivered | not-configured | invalid | rate-limited | failed }
```

The result is a discriminated union, so `{ status: 'delivered' }` is not representable on a
failure path. `failed` is an addition to the original four-branch design: a transport error
is a real outcome, and without it the only representable answers would have been
`delivered` (a lie) or `invalid` (wrong).

Spam mitigation is deliberately local — honeypot field, `MIN_ELAPSED_MS = 3000`, and an
in-memory bucket of 5 submissions per 10 minutes per client key. **The bucket is
per-process**; a second instance does not share it. That limitation is stated at the code,
in `docs/deployment.md`, and in the README.

## 5. Client islands — the complete list

Sixteen modules carry `'use client'`. Nine of them are vendored Radix primitives that cannot
be server components; the rest are leaf islands:

| Island | Why it must be client-side |
|---|---|
| `components/layout/mobile-nav.tsx` | Sheet open/close state |
| `components/layout/nav-links.tsx` | `usePathname()` for `aria-current` |
| `components/research/research-filter.tsx` | Filter/search state, URL sync, `useTransition` |
| `components/research/article-actions.tsx` | Copy-link / share affordance |
| `components/viz/dashboard-preview.tsx` | Recharts, period tabs, reduced-motion counters |
| `components/viz/hero-visual.tsx` | Framer Motion animated motif |
| `components/contact/contact-form.tsx` | `useActionState`, field-level validation |
| `app/error.tsx`, `app/global-error.tsx` | Next requires client error boundaries |
| `components/ui/{accordion,dialog,dropdown-menu,select,separator,sheet,tabs,tooltip}.tsx` | Radix primitives |

Nothing else. A new `'use client'` module must be added to this table with a reason, or it
does not belong on the site. Charts are not fetched: the island receives its fixture as a
prop from a server component.

## 6. Styling

Tailwind v4, CSS-first. There is **no `tailwind.config.js`**; the design tokens live in the
`@theme` block at the top of `app/globals.css`, transcribed from design-system §15, and are
asserted by `docs/design/check-contrast.mjs` (`pnpm check:contrast`).

Rules that the codebase actually follows:

- Colour, radius, font and spacing come from tokens (`bg-bg`, `text-text-secondary`,
  `border-hairline`, `text-h2`). Ad-hoc hex in a component is a defect.
- `@layer base` holds element defaults; `@layer utilities` holds the few keyframe helpers
  (`.reveal`, `.accordion-anim`, `.sheet-anim`, `.line-draw`).
- Motion is opt-in through `@media (prefers-reduced-motion: no-preference)` where the
  animation is decorative, and globally flattened in the `reduce` block.
- The accordion's collapsed state is produced in CSS (`.accordion-anim[data-state='closed']`)
  because `forceMount` keeps the region in the DOM in every state — see
  `docs/component-conventions.md` §6.

## 7. SEO

`lib/seo/metadata.ts#buildMetadata({ title, description, path, … })` is called by every page
and returns canonical URL, Open Graph and Twitter card fields against the
`metadataBase` declared in `app/layout.tsx`. The root layout's `title.template` does **not**
apply to the layout's own segment, so the homepage states its full title explicitly.

JSON-LD builders in `lib/seo/jsonld.tsx` emit `Organization` and `WebSite` once in the
shell, and `Article` + `BreadcrumbList` on each research article.

## 8. Accessibility architecture

- One `<main id="main" tabIndex={-1}>` per page; the skip link targets it.
- The header is `<header>` + `<nav aria-label="Primary">`; the mobile sheet contains its own
  `nav aria-label="Primary"` and Radix marks the rest of the document `aria-hidden` while it
  is open, so exactly one Primary navigation is reachable at a time.
- Every chart is a `<figure>` with a text alternative and an always-visible simulated-data
  disclosure. Decorative motifs are `aria-hidden` and non-focusable.
- The contact form keeps a persistent label per field, wires `aria-describedby` /
  `aria-invalid`, and announces submission state in an `aria-live` region.
- Reduced motion is honoured twice: a CSS media query for CSS motion, and
  `useReducedMotion()` for Framer Motion and the counters. The counters set their final
  value directly rather than relying on an animation frame, because a throttled or
  backgrounded tab suspends `requestAnimationFrame`.

## 9. Failure surfaces

| Surface | Behaviour |
|---|---|
| Unknown URL | `not-found.tsx`, HTTP 404, styled, with a link home |
| Render error | `error.tsx` (segment) and `global-error.tsx` (root) |
| Route transition | `loading.tsx` |
| Contact without env | `not-configured`, naming the missing variables; nothing sent |
| Mail provider rejects or is unreachable | `failed`, with a reason; never `delivered` |
| Filter matches nothing | Empty state with a reset action |

## 10. What is deliberately absent

Authentication, CMS, database, live market data, analytics, i18n, payments, real trading
infrastructure, service worker and any third-party UI kit beyond Radix. Each would need a
decision recorded in `docs/design/` before it appears here.
