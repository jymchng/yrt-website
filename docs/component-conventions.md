# Component conventions

How to add to this codebase without making it worse. These are the rules the existing code
actually follows; a pull request that breaks one needs a reason in the description.

---

## 1. Choose the smallest surface

```
Does it need state, an effect, or a browser API?   → no  → Server Component
                                                    → yes → 'use client' leaf island
```

Client islands are listed exhaustively in `docs/architecture.md` §5. Adding a seventeenth
means adding a row to that table with a justification. "It was easier" is not one: a client
component ships its whole subtree's JavaScript and cannot be prerendered.

**Never** make a page `'use client'` to satisfy a child. Lift the interaction into a leaf and
pass data down as props from the server component.

## 2. Where a file goes

| You are adding… | Location |
|---|---|
| A Radix/shadcn primitive | `components/ui/` — the only place Radix is imported |
| Something in the persistent shell | `components/layout/` |
| A cross-page presentational piece | `components/shared/` |
| Something only one page uses | `components/<feature>/` |
| A chart or animated visual | `components/viz/`, always `'use client'` |
| Typed copy | `lib/content/`, shape in `lib/content/types.ts` |
| A generated fixture | `lib/data/`, seeded, never clock-dependent |
| A pure helper | `lib/` — and it must be importable by a test without React |
| A metadata/JSON-LD builder | `lib/seo/` |

Dependency direction is `app/ → components/ → lib/`. `lib/` never imports from `app/` or
`components/`; `components/ui/` never imports a feature module.

## 3. Styling

- **Tokens only.** `bg-bg`, `bg-surface-1`, `text-text-secondary`, `border-hairline`,
  `text-h2`, `font-mono`. A raw hex value in a component is a defect — the token block in
  `app/globals.css` is the single source of truth and is audited by `pnpm check:contrast`.
- **No `tailwind.config.js`.** Tailwind v4 is CSS-first; new tokens go in the `@theme` block,
  and the block is a transcription of design-system §15 — changing it is a design change.
- **Class order** is `layout → box model → typography → colour → state`. Long lists wrap
  with `cn()` only when conditional.
- **Geometry is squared or minimally rounded**, hairline borders, no drop shadows on cards.
  This is what stops the site reading as a default shadcn template.
- **Numeric output uses `font-mono` with tabular figures** and goes through `lib/format.ts`.
  Never interpolate a raw number into markup.

### Beware the display-utility cascade

`buttonVariants()` already emits `inline-flex`. Adding `hidden` to the same element does
**not** hide it — both are single-class `display` utilities and the generated stylesheet's
order decides, not the class attribute. This exact bug left the header CTA painted at every
width and overflowed 768px by 7px.

```tsx
// wrong — `hidden` loses to `inline-flex`
<Link className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden lg:inline-flex')} />

// right — put visibility on a wrapper
<div className="hidden lg:block">
  <Link className={buttonVariants({ variant: 'ghost', size: 'sm' })} />
</div>
```

## 4. Accessibility is part of the component, not a later pass

Every component ships with:

- **Correct semantics first.** A list of links is `<ul>`/`<li>`; an address is `<address>`;
  a chart is a `<figure>` with a caption. Reach for `role` only when no element fits.
- **A visible `focus-visible` ring** on every interactive element, from tokens.
- **Touch targets ≥ 44×44 CSS px** on mobile (`min-h-12` on nav links and triggers).
- **No hover-only information; colour never carries meaning alone** — signed numbers keep
  their sign, statuses carry text.
- **Decorative motifs** are `aria-hidden="true"` and non-focusable. Informative visuals are
  not.
- **Charts** expose a text alternative and keep the "simulated / illustrative" disclosure
  adjacent to the figures, always visible, not in a tooltip or footer.

Icon-only buttons need an `aria-label`. Radix supplies the focus trap, Escape handling and
focus return for `Dialog`/`Sheet`; do not reimplement them, and do not remove the trigger.

## 5. Charts and the simulated-data rule

A chart island receives its series as a prop from a server component. It does not fetch and
it does not generate data at module scope.

```tsx
// server component
<DashboardPreview series={dashboardSeries} kpis={computeKpis(dashboardSeries)} />

// client island
'use client';
export function DashboardPreview({ series, kpis }: Props) { … }
```

- Data comes from `lib/data/series.ts` with a fixed seed; no `Date.now()` in generation.
- Memoise derived arrays (`useMemo`) so Recharts does not recompute on hover.
- Use `ResponsiveContainer` — never a fixed pixel width. A chart that needs a fixed width to
  be legible is a chart that will overflow a 390px viewport.
- **Every figure is labelled illustrative in the UI.** If you add a numeric block, it gets a
  disclosure or it does not ship.

## 6. Disclosure and accordion components

`AccordionContent` is used with `forceMount`, because design-system §6.5 requires the
collapsed region to stay in the DOM. Radix cannot hide it for you: with `forceMount` its
`isOpen` is `context.open || isPresent`, which is always true, so it never sets `hidden` —
and the region stayed painted and exposed to assistive technology while the trigger claimed
`aria-expanded="false"`.

The collapsed state is therefore produced in CSS:

```css
.accordion-anim[data-state='closed'] {
  height: 0;                 /* no phantom layout space */
  visibility: hidden;        /* removed from the a11y tree and the paint */
  animation: yrt-accordion-up var(--duration-expand) var(--ease-standard);
  transition: visibility 0s linear var(--duration-expand);  /* after the close animation */
}
```

`height: 0` as a normal declaration does not fight the closing keyframe — the animation wins
while it runs, then the base value applies. Reduced motion drops the delay.

If you add another `forceMount` region, it needs an equivalent collapsed rule, or you have
shipped a disclosure that does not disclose.

## 7. Motion

- Purposeful and short: `--duration-base` 120ms, `--duration-expand` 240ms,
  `--duration-enter`/`--duration-page` for reveals. Never longer.
- Decorative CSS animation is wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Framer Motion islands consult `useReducedMotion()` and render the final state.
- **Never let information or a final value depend on an animation frame.** A backgrounded or
  throttled tab suspends `requestAnimationFrame`; the counters set their final value directly
  in an effect for exactly this reason.

## 8. Content modules

- One file per page-level topic in `lib/content/`, typed by `lib/content/types.ts`.
- Frozen literals, no runtime parsing, no fetch, no fallbacks — a compile error beats an
  empty page.
- Slugs are lowercase, hyphenated, unique and URL-safe (asserted in `content.test.ts`).
- **Copy rule.** Nothing may state or imply that a strategy is live, funded, deployed or
  profitable. Every research entry carries `illustrative: true`. Statistical claims are
  framed as method, not result.

## 9. Naming and exports

- `kebab-case.tsx` filenames, `PascalCase` components, `camelCase` helpers.
- Named exports for components; a page may default-export (Next requires it).
- Props are inline object types unless shared by more than one module, in which case they go
  in `types.ts`.
- No `any`. No non-null assertion without a comment explaining the invariant. No unused
  imports — ESLint fails on them and that is deliberate.

## 10. Adding a primitive

Only if Radix (or plain HTML) genuinely lacks it. Then:

1. Vendor it into `components/ui/`, using `cva` + `cn()`, and customise the geometry and
   density so it does not look stock.
2. Keep the Radix semantics (`data-state`, `data-slot`, focus management) intact.
3. Drive every colour, radius and duration from tokens.
4. Add it to the island table in `docs/architecture.md` if it needs `'use client'`.
5. Add a render assertion to `tests/unit/components.test.tsx` and, if it is interactive, a
   keyboard test to `tests/e2e/accessibility.spec.ts`.

**No new dependencies.** The approved stack is fixed (Next, React, Tailwind, Radix,
Lucide, Recharts, Framer Motion, Zod, Resend, cva/clsx/tailwind-merge). An extra icon set,
UI kit or utility library is out of scope by the brief, not by taste.

## 11. Before you call it done

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e
```

Plus, for anything touching layout or a component:

- No horizontal overflow at 390 / 768 / 1024 / 1440 on all six routes.
- Keyboard: skip link → nav → main → the new controls → out, with a visible ring throughout.
- Reduced motion: nothing moves, nothing is hidden, counters show final values.
- Any new number on screen carries an illustrative disclosure.
