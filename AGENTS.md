# AGENTS.md — working agreement

For anyone — human or AI — changing this repository. Read this before the first edit; read
`docs/component-conventions.md` before the first component.

---

## 1. The one rule that overrides the others

**Nothing on this site may claim a performance result it does not have.**

- All financial data is a deterministic simulated fixture, labelled illustrative in the UI.
- No strategy is described as live, funded, deployed or profitable.
- No firm history is invented. The "Our Name" section explains the tagline and says nothing
  about origins that did not happen.
- The contact form never reports a delivery it did not make.

If a change would make any of those sentences false, the change is wrong even if it looks
better.

## 2. Ground truth, in order

1. The code in `app/`, `components/`, `lib/`.
2. `docs/design/design-system.md` — tokens, type, layout, components, motion, a11y, copy.
3. `docs/implementation/*` — how the design maps onto this stack.
4. `docs/architecture.md`, `docs/testing.md`, `docs/deployment.md`,
   `docs/environment-variables.md`, `docs/component-conventions.md`.
5. The product brief.

When (2) and the code disagree, do not silently pick one: fix the code if the design is
right, or record a deviation with a reason if it is not achievable.

## 3. Do not

- **Add a dependency.** The stack is fixed by the brief. No icon sets, UI kits, utility
  mega-libs, date libraries or animation helpers.
- **Add a shadcn CLI scaffold.** Components are vendored source under `components/ui/` and
  customised by hand.
- **Introduce `tailwind.config.js`.** Tailwind v4 is CSS-first; tokens live in the `@theme`
  block in `app/globals.css`.
- **Put a raw hex colour, hardcoded radius or magic duration in a component.** Tokens only.
- **Add `'use client'`** without adding a row to the island table in `docs/architecture.md`.
- **Fetch market data**, at build or runtime. There is no live feed and there will not be.
- **Commit a secret.** `.env.example` holds empty placeholders; `.env.local` is ignored.
- **Weaken a test to make a run green** without deciding whether the test or the product is
  wrong, and saying which in the commit message.
- **Add `output: 'export'`** while the contact form is server-backed.

## 4. Do

- Server Components by default; client islands only for interactivity.
- Reuse `components/shared/primitives.tsx` (`SectionShell`, `Section`, `PageIntro`,
  `Eyebrow`, `Prose`) so page rhythm stays consistent across routes.
- Keep copy in `lib/content/`, typed by `lib/content/types.ts`.
- Put numbers through `lib/format.ts` and render them in `font-mono` tabular figures.
- Keep every chart inside a `<figure>` with a text alternative and a visible illustrative
  disclosure.
- Respect reduced motion in both CSS and any Framer Motion island.
- Run the full gate before declaring done (§6).

## 5. Traps this repository has already hit

Read these before debugging something similar.

| Symptom | Cause | Fix |
|---|---|---|
| An element with `hidden` is still visible | A `display` utility from `buttonVariants`/`cva` wins the cascade tie | Move visibility to a wrapper element |
| Accordion content visible while `aria-expanded="false"` | Radix `forceMount` sets `isOpen = open \|\| present`, so it never hides the region | Collapse it in CSS (`height: 0; visibility: hidden`, delayed) |
| Counter stuck at `0` under reduced motion | Final value written from a `requestAnimationFrame` callback a throttled tab never runs | Set the final value directly in an effect |
| 390px horizontal scroll | A `<pre>` or grid child without `min-w-0`, or an over-wide badge | `min-w-0` on the grid item; `max-w-full whitespace-normal` on the badge |
| Playwright can't launch a browser | No managed Chromium downloaded | `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome`, or `pnpm exec playwright install chromium` |
| E2E test times out at 30s for no reason | Six routes plus a sheet interaction in one test body under parallel load | One route per test |
| Homepage title shows only the firm name | `title.template` does not apply to the layout's own segment | State the full title on `/` |

## 6. The gate

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e
pnpm check:contrast
```

Expected: `tsc` clean, `eslint` 0 errors, 91 unit tests pass, 24 prerendered routes, E2E
green on both the desktop (1440) and mobile (390) projects.

`pnpm test:e2e` requires `pnpm build` first — the suite runs `next start`, and it forces
`RESEND_API_KEY`/`CONTACT_*` to empty so the not-configured branch is deterministic. If a
`next start` is already listening on port 3100 it is reused, and the env overrides will not
apply.

## 7. Style

- TypeScript strict. No `any`, no unused imports, no non-null assertions without a stated
  invariant.
- Comments explain **why**, and cite the document section when a rule is not obvious
  (`design-system §6.5`, `brief §7`). Do not narrate what the code already says.
- Prose is British-leaning, plain, and free of marketing superlatives — including in docs
  and commit messages.
- Commit messages: imperative subject, then why. One logical change per commit.

## 8. When something is infeasible

Record the deviation rather than quietly changing direction. State:

1. what the design asked for,
2. what was built instead,
3. why the design could not be met on this stack,
4. what would be needed to meet it.

Deviations already recorded: `tw-animate-css` replaced with hand-written keyframes;
`@radix-ui/icons` not used in favour of Lucide; Playwright browsers injected from the host
Chromium; `app/icon.svg` instead of a generated `icon.tsx`; `vitest.config.mts` because of
Vite's native-config loader.
