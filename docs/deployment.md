# Deployment

The site is a standard Next.js 16 App Router application with **no database, no background
jobs and no external services at render time**. Deployment is a build and a `next start`.

---

## 1. Requirements

| Requirement | Value |
|---|---|
| Node | **≥ 22.12** (`package.json#engines`); verified on 25.9 |
| Package manager | pnpm 9.15.9 (`packageManager`) |
| Build command | `pnpm install --frozen-lockfile && pnpm build` |
| Start command | `pnpm start` (i.e. `next start`) |
| Default port | `3000` |
| Node modules | Required at runtime — this is not a static export |

`next build` prerenders 24 routes. The contact route needs a Node server because it uses a
server action; there is no `output: 'export'` and there must not be one while the contact
form is server-backed.

`netlify.toml` sets `NODE_VERSION = "22.12.0"`, runs `pnpm build`, publishes `.next`, and sets
`COREPACK_INTEGRITY_KEYS = "0"` as a workaround for the reported Corepack/pnpm signature-
verification failure during dependency installation. `ENABLE_COREPACK = "false"` is also
retained. Disabling integrity-key verification weakens Corepack's package-manager signature
validation; prefer restoring verification once Netlify's bundled Corepack metadata is fixed.
The owner confirmed a subsequent deployment succeeds with this configuration. Do not lower
Node to 20: that would violate the `package.json` engine declaration.

## 2. Build and run

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start --port 3000
```

Health check: `GET /` returns 200 and contains the wordmark. `GET /sitemap.xml` and
`GET /robots.txt` are generated at build time.

## 3. Environment

Only four variables exist, all optional for rendering. Full detail — including the exact
state produced when each is absent — is in
[`environment-variables.md`](./environment-variables.md).

```bash
NEXT_PUBLIC_SITE_URL=https://example.com   # canonical origin: metadata, sitemap, OG URLs
RESEND_API_KEY=re_...                      # contact delivery only
CONTACT_TO_EMAIL=hello@example.com
CONTACT_FROM_EMAIL=no-reply@example.com    # must be a verified Resend sender domain
```

`NEXT_PUBLIC_SITE_URL` is read in `app/layout.tsx` as the `metadataBase`, so it must be
correct **at build time** — canonicals, Open Graph URLs and the sitemap are baked into the
prerendered HTML. Set it wrong and every canonical is wrong until the next build. It also
defaults to `http://localhost:3000`, which is fine locally and wrong in production.

## 4. Platform notes

**Vercel / any Node host.** No configuration beyond the variables above. If the platform
runs more than one instance, read §5 before relying on the rate limit.

**Container.** Provide `node_modules` (or a full `pnpm install`), `.next/`, `public/` if one
appears, `package.json` and `next.config.ts`. Do not copy `.env.local` into an image.

**Behind a reverse proxy.** The contact action keys the rate limit on
`x-forwarded-for` (first entry), falling back to `x-real-ip`, then `'unknown-client'`. If the
proxy does not set either header, every submission shares one bucket and the effective site
limit becomes five submissions per ten minutes in total. Make sure the header is set.

## 5. The rate-limit caveat — read before scaling out

`app/contact/actions.ts` keeps its buckets in a module-level `Map`. That means:

- The limit is **5 submissions per 10 minutes per process**, not per site.
- Two instances behind a load balancer allow up to 10, on different keys, with no shared
  state.
- A restart clears every bucket.

This is a deliberate, documented limitation of doing spam mitigation without an external
service (brief §7). Growing beyond one instance means moving the bucket to shared storage —
a design change, not a config change.

## 6. Caching and headers

- Prerendered routes are served with Next's defaults; there is no custom `headers()` or
  `revalidate` anywhere.
- `poweredByHeader: false` in `next.config.ts`.
- `allowedDevOrigins` in `next.config.ts` is **development-only** and has no effect on a
  production build.

## 7. Pre-deploy checklist

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e
pnpm check:contrast        # token/contrast audit
```

Latest recorded checks: typecheck, lint, 91 unit tests, production build, and contrast
audit passed on Node 25.9. The production Playwright suite ran but has unresolved behavior
failures; see [`testing.md`](./testing.md). Do not interpret the checklist as fully cleared
until those E2E failures are fixed and the suite passes.

Then confirm in the deployed environment:

- [ ] `NEXT_PUBLIC_SITE_URL` is the real origin, and a page's `<link rel="canonical">` agrees.
- [ ] `/sitemap.xml` lists absolute URLs on that origin.
- [ ] `/robots.txt` allows crawling and points at the sitemap.
- [ ] `/opengraph-image` returns an image.
- [ ] Posting the contact form with no mail variables returns **not-configured** and names
      the missing variables — it must not claim delivery.
- [ ] Posting with variables set delivers, and the reply-to is the enquirer's address.
- [ ] A 404 URL returns HTTP 404 with the styled page.
- [ ] No horizontal scroll at 390px on all six routes.

## 8. Rollback

The app holds no state, so rollback is redeploying the previous build. The only thing that
survives a restart is nothing at all — no cache to clear, no migration to reverse.
