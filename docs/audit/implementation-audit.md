# Implementation audit

**Scope:** source review and available runtime/browser evidence against `docs/design/design-system.md` and `docs/implementation/implementation-guide.md`. The original product brief was not found as a separate project file, so these documents are the available written acceptance contract. This is a pre-remediation audit; statuses describe observations, not a claim of final acceptance.

## Criterion-by-criterion findings

| Criterion | Status | Evidence / gap | Remediation or verification |
|---|---|---|---|
| Integrity: no fabricated trading performance, deployment, firm history | Pass by source review | Home and strategy copy calls programmes conceptual; dashboard visibly says simulated; `about` explicitly disclaims a company history. | Preserve during fixes; source-integrity tests. |
| Required site pages and substantive content | Pass by source review | Routes exist for home, strategies, research, technology, about and contact; seven strategies and seven technology areas in content. | Smoke-test each route in production. |
| Strategies disclosure names and collapsed visibility | **Fail / partial** | `app/strategies/page.tsx` supplies `aria-label` and then separate visible and screen-reader spans; live browser exposes duplicate text and generic dimension text as the control name instead of an unambiguous strategy-specific name. `components/ui/accordion.tsx` uses Radix with `forceMount`; closed state hidden by CSS. Browser snapshot showed collapsed region hidden and opening revealed content, so visibility currently works in this dev runtime. | Change trigger contents/name to a single accessible strategy-specific label; verify closed/open accessibility tree and keyboard interaction. |
| Seven dashboard requirements and labels | Pass by source review | `components/viz/dashboard-preview.tsx`: four KPIs and four `figure[role=img]` panels account for equity, returns, volatility, Sharpe, drawdown, volume and activity; labels state simulated. | Verify production render and responsive dimensions; no performance inference. |
| Research index filtering / URL state | **Partial; implementation concern** | `lib/research/filter.ts` handles unknown categories safely. `research-filter.tsx` uses `router.replace`, which does not create history entries for filter changes despite docs claiming back/forward restores prior filters. | Test chip/search URL synchronization, back/forward, shared URL, and unknown category; use history semantics consistent with approved contract or revise contract. |
| Contact validation and truthfulness | Pass by source review; live delivery unverified | Client + server Zod, honeypot/time check/rate limit, env gate and provider failure branch in `app/contact/actions.ts`; form explicitly says not delivered on failure. No live provider credentials used. | Deterministic tests for each branch; verify not-configured in E2E; never send real mail during audit. |
| Keyboard/accessibility semantics | Partial | Global focus-visible rule, skip link, Radix Sheet and accordion are present. E2E specs assert focus return and broad tab operability but were not run in this audit. Browser snapshot confirms disclosure controls are named generically/duplicatively. | Run keyboard tests; check active focus rings, Sheet focus trap/return, accordion accessible names/state, form errors and landmarks. |
| Contrast | Pass for audited tokens only | `pnpm check:contrast` passes: 64/64 required pairs, 8/8 documented pitfalls. However, dashboard equity gradient uses `stopOpacity=0.16` and `0.02` while design spec §6.6 / §6.14 says an 8% wash; not covered by the five composite rows. | Reconcile implementation vs approved fill; measure/document any actual alpha composite. |
| Responsive / overflow | Unverified | E2E tests cover 390, 768, 1024, 1440 across six routes, but not run here. Source uses responsive grids and `min-w-0` in charts; this does not prove no overflow. | Run production Playwright responsive suite and capture actual result. |
| Visual design | Partially verified | Browser available at `http://localhost:3000/strategies`; snapshot confirms page hierarchy and accordion state, but no screenshot/per-page visual review. | Capture page screenshots at mobile and desktop; inspect all pages and chart overlays. |
| SEO surfaces | Pass by source review; runtime partly unverified | Metadata builder, canonical/social metadata, JSON-LD, sitemap and robots source exist. Runtime URL metadata depends on `NEXT_PUBLIC_SITE_URL`; fallback is localhost. `robots.ts` disallows `/contact?*`, which is not meaningful as robots paths generally exclude query strings. | Inspect built metadata and sitemap with deployment origin; review robots directive and canonical host. |
| Vitest/unit suite | **Blocked** | `pnpm test` fails before tests start under Node v21.7.3: Vitest 5/Rolldown passes `['underline','gray']` to `node:util.styleText`, unsupported by this Node. Package engine requires `>=22.12`. | Run under supported Node version; do not count test suite as passed. |
| Typecheck, lint, contrast | Pass with environment caveat | `pnpm typecheck`, `pnpm lint`, `pnpm check:contrast` exited 0; pnpm warns current Node v21.7.3 is below declared `>=22.12`. | Re-run on supported Node alongside full test/build gate. |
| Production build, Playwright, cross-browser, console, performance | Unverified | No production build / Playwright test / cross-browser / console sweep / performance measurement completed during this audit. | Run planned gates; report any browser/download or environment blocks as such, not as passes. |

## Remediation checklist

- [ ] Make each strategies disclosure's accessible name concise, unique and strategy-specific; check the heading/trigger relationship and keyboard state.
- [ ] Verify research filter history semantics against the approved URL-state requirement; correct code or explicitly update the contract.
- [ ] Align dashboard gradient/wash alpha with the approved specification and the contrast audit.
- [ ] Resolve supported-Node Vitest startup and add/adjust deterministic regression tests.
- [ ] Run production build and E2E smoke, 390/768/1024/1440 overflow, keyboard focus-return, contact not-configured path, SEO routes, and console checks.
- [ ] Perform visual review where browser evidence is available; state remaining cross-browser/performance limitations accurately.

## Commands and observations

- `pnpm check:contrast`: exit 0, 64/64 required pairs and 8/8 documented pitfalls.
- `pnpm typecheck`: exit 0 (pnpm warned Node v21.7.3 is unsupported by the package engine).
- `pnpm lint`: exit 0 (same Node engine warning).
- `pnpm test`: exit 1 at startup; no tests executed. Root error: Node `styleText` rejected format array `['underline','gray']`.
- Playwright browser: strategies page loaded at `http://localhost:3000/strategies`; initial snapshot showed collapsed details hidden. Opening first disclosure revealed details. Its control announced generic dimension text plus a duplicate strategy-specific string, a confirmed naming defect.
