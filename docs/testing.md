# Testing

Two suites, deliberately separated by what they can prove.

| Suite | Runner | Location | Count | Cost | Proves |
|---|---|---|---|---|---|
| Unit | Vitest (jsdom) | `tests/unit` | 91 tests across 10 files | ~12 s on Node 25.9 | Content integrity, pure logic, formatting, SEO strings, the server action's branches |
| End-to-end | Playwright | `tests/e2e` | 156 runs (78 tests × desktop + mobile) | ~4.6 min | Production HTML, keyboard behaviour, responsive layout, and contact behavior |

**Latest recorded verification:** production Playwright completed with **155 passed, 1 skipped, 0 failed** (156 total across desktop and mobile) on local Node 21.7.3; pnpm warned that the project requires Node `>=22.12`. The skipped run is the mobile-only sheet test under the desktop project. Earlier recorded typecheck, lint, unit tests, production build (24 generated pages), and contrast audit passed on Node 25.9. The Playwright failures previously listed below have been addressed and the full suite rerun successfully; see the regression table in section 5.

```bash
pnpm test          # unit only — fast enough to run on every save
pnpm build         # required before e2e; the suite runs `next start`
pnpm test:e2e
```

## 1. Why the split is where it is

Vitest cannot tell you whether the production build still renders a `<h1>`, whether a Radix
accordion actually collapses once bundled, or whether the header overflows at 768px. Those
are exactly the failures this project has had. Playwright cannot cheaply cover twelve
content modules, the Zod schema's message text, or the mail-provider boundary. So the unit
suite covers logic and content, and the E2E suite covers the rendered artefact — nothing is
duplicated between them for its own sake.

## 2. Unit suite — what each file protects

| File | Guards |
|---|---|
| `content.test.ts` | The twelve research entries, the seven strategies and the capability copy: required fields present, slugs unique and URL-safe, categories drawn from the known set, every entry marked illustrative |
| `series.test.ts` | Determinism. Same seed → identical series; `sliceSeries` windows the right range; the fixture never depends on the clock |
| `dashboard-data.test.ts` | KPI arithmetic over the seeded series (Sharpe, drawdown, volatility) and the order-book fixture |
| `research-filter.test.ts` | `parseFilter`, `filterEntries`, `describeResults`, `buildQueryString` — including the unknown-category and empty-result cases the index renders |
| `format.test.ts` | Tabular formatting: signed numbers carry an explicit sign, percentages and dates are stable |
| `seo.test.ts` | `buildMetadata` output: canonical, Open Graph, Twitter card, and the homepage full-title case (the layout's `title.template` does not apply to its own segment) |
| `contact-schema.test.ts` | The shared Zod schema and `fieldErrorsFrom` — one message per field, keyed for `aria-describedby` |
| `contact-action.test.ts` | The five branches of `submitContact`: `invalid`, the honeypot trap, the timing trap, `rate-limited`, `not-configured` naming the missing variables, and `failed` when the provider errors |
| `components.test.tsx` | The shared presentational primitives render the semantics they promise (`Eyebrow`, `PageIntro`, `Badge`, `Formula`, `EmptyState`) |
| `source-integrity.test.ts` | Source-level guards for the brief's hard constraints, walked from `app/`, `components/`, `lib/`: no `dangerouslySetInnerHTML`, no committed secrets, no `'use client'` where it is not needed |

`tests/setup.ts` registers Testing Library's cleanup, because Vitest does not run Jest's
global hooks and DOM state would otherwise leak between files.

**Config note.** `vitest.config.mts` (not `.ts`) avoids Vite's native-config-loader warning.
`include` is `tests/unit/**` and `tests/e2e/**` is excluded, so Playwright specs can never be
picked up by Vitest.

## 3. E2E suite — what each spec protects

Both projects run every spec: **desktop** at 1440×900 (Desktop Chrome) and **mobile** at
390×844 (Pixel 7). A test that only makes sense on one viewport branches on
`page.viewportSize()`.

| Spec | Guards |
|---|---|
| `navigation.spec.ts` | Every route renders one `<h1>`, a `<main>` and a title; the header navigates client-side; `aria-current` marks the active route; the footer repeats every destination; the seven strategies and seven technology areas are present; the architecture figure is discoverable by name; the 404 renders styled with a way back |
| `research.spec.ts` | Category chips and search filter the index without a reload; state is reflected in the URL; the empty state appears for a query that matches nothing; an article opens with metadata, body, breadcrumb and its illustrative badge |
| `accessibility.spec.ts` | Document structure per route (one `h1`, no skipped levels, no unlabelled figures); the skip link moves focus to `main`; the mobile sheet traps and returns focus on Escape; counters show final values when motion is reduced |
| `responsive.spec.ts` | No horizontal overflow at 390 / 768 / 1024 / 1440 on all six routes; charts stay within the viewport at 390px; the sheet opens, navigates and closes on Escape |
| `contact.spec.ts` | Client validation blocks a bad submit; server validation reports field errors; the honeypot is present but clipped; the delivered-without-configuration path returns the explicit `not-configured` state rather than a success |

**The `webServer` runs `next start`, not `next dev`,** and starts it with
`RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` forced to empty strings. That
is what makes `contact.spec.ts` deterministic: it asserts the not-configured branch whatever
the developer's shell happens to export.

### Running without downloading a browser

`playwright.config.ts` honours `PLAYWRIGHT_CHROMIUM_EXECUTABLE` and passes it to
`launchOptions.executablePath`; unset, Playwright resolves its own managed browser.

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome pnpm test:e2e
```

### Debugging a failure

Playwright writes `test-results/<slug>/` on failure with a trace, a screenshot and a
readable `error-context.md` that includes an ARIA snapshot of the page at the moment of
failure. That snapshot is usually enough on its own.

```bash
pnpm exec playwright show-trace test-results/<slug>/trace.zip
pnpm exec playwright test tests/e2e/responsive.spec.ts --project=desktop
```

`reuseExistingServer` is on outside CI, so a running `next start` on port 3100 is reused —
stop it if you need the config's env overrides to apply.

## 4. Conventions the suites follow

- **Assert what the user perceives.** `getByRole('navigation', { name: 'Primary' })`,
  `getByText('Illustrative entry — method, not results')` — not CSS classes.
- **Scope repeated landmarks.** The footer repeats every destination and the sheet carries a
  second `Primary` nav, so an unscoped `getByRole('link', { name: 'Contact' })` is ambiguous
  by design. Scope to `header`, `footer` or the dialog.
- **One route per test when the mobile branch is involved.** Six routes plus a sheet
  interaction in one test body exceeded the 30 s per-test budget under parallel load; the
  per-route form also names the route that broke.
- **Do not scroll to measure.** `boundingBox()` needs no scroll, and
  `scrollIntoViewIfNeeded` adds a stability wait that a hydration commit can invalidate.
- **When a test and the product disagree, decide which is wrong and say so.** Several
  historical failures were stale expectations — the "Momentum" strategy is named "Momentum
  Strategies", the latency article's title changed, the article badge reads "Illustrative
  entry — method, not results". Others were genuine defects (see §5).

## 5. Regressions these suites have already caught

| Finding | Status / coverage |
|---|---|
| Strategies disclosure closed-state visibility/accessibility mismatch | Fixed; full desktop/mobile Playwright suite passed |
| Research filter URL updates/clear and browser-history synchronization | Filter/clear, share-link, and unknown-category coverage passes in full Playwright suite; browser back/forward is not separately asserted |
| Dashboard final counter values/period captions | Fixed; full desktop/mobile Playwright suite passed, including reduced-motion coverage |
| Contact invalid-submit focus and unconfigured-mail E2E state | Fixed; full desktop/mobile Playwright suite passed |
| Mobile navigation interaction | Fixed; full desktop/mobile Playwright suite passed, including Escape and focus return |
| Horizontal overflow on `/technology` at 390px | Fixed; responsive and focused technology tests pass in full Playwright suite |
| Earlier strategy accessible naming, unknown research category fallback, and gradient alpha fixes | Implemented; verify again when rerunning the full suite |

## 6. What is not covered

- **Visual regression.** No screenshot diffing; layout is asserted structurally.
- **Cross-browser.** Chromium only. The protocols used (CSS `visibility`, Radix presence,
  `requestAnimationFrame`) are not Chromium-specific, but Safari and Firefox are unverified.
- **Load and rate-limit behaviour across instances.** The bucket is per process by design.
- **Real mail delivery.** The provider boundary is mocked; `delivered` is never exercised
  against a live API key, and the E2E suite deliberately asserts the not-configured branch.
