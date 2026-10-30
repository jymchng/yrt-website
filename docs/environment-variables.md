# Environment variables

Four variables. **All are optional for rendering** — the site builds and renders completely
without a single one of them. Only contact *delivery* needs values.

`.env.example` contains empty placeholders and is safe to commit. Never put a real value in
it.

```bash
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## `NEXT_PUBLIC_SITE_URL`

| | |
|---|---|
| Required | No — defaults to `http://localhost:3000` |
| Read at | **Build time**, in `app/layout.tsx` |
| Used for | `metadataBase`, canonical URLs, Open Graph `url`, sitemap entries, JSON-LD `@id`s |

Because it feeds `metadataBase`, the value is baked into the prerendered HTML. It must be
the production origin **when `pnpm build` runs**; changing it at runtime has no effect until
the next build.

```bash
NEXT_PUBLIC_SITE_URL=https://example.com
```

The `NEXT_PUBLIC_` prefix means it is also inlined into client bundles. That is fine here —
it is a public origin — but do not add a variable with this prefix unless it is genuinely
public.

---

## `RESEND_API_KEY`

| | |
|---|---|
| Required | No — its absence produces the `not-configured` state |
| Read at | Request time, in the contact server action |
| Used for | Authenticating with Resend |

## `CONTACT_TO_EMAIL`

| | |
|---|---|
| Required | No |
| Used for | Destination inbox for enquiries — a single address |

## `CONTACT_FROM_EMAIL`

| | |
|---|---|
| Required | No |
| Used for | The `from` address on the outgoing message; the domain must be verified in Resend |

---

## The three contact variables are checked together

`app/contact/actions.ts` treats `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and
`CONTACT_FROM_EMAIL` as one unit. **If any one of them is unset or whitespace, nothing is
sent** and the action returns:

```ts
{ status: 'not-configured', missing: readonly string[] }
```

The UI then states which variables are missing and that no message was sent. A blank string
is treated as missing, which is what lets the Playwright suite force this branch regardless
of the developer's shell:

```ts
webServer: {
  env: { RESEND_API_KEY: '', CONTACT_TO_EMAIL: '', CONTACT_FROM_EMAIL: '' },
}
```

## Every possible result of the contact action

The result is a discriminated union, so success is not representable on a failure path:

| `status` | When | What the visitor sees |
|---|---|---|
| `delivered` | All three variables present **and** Resend accepted the message | "sent" confirmation |
| `not-configured` | Any of the three missing | Missing-variable list + "nothing was sent" |
| `invalid` | Zod rejected the input on the server | Per-field errors wired with `aria-describedby` |
| `rate-limited` | Bucket exhausted, **or** the honeypot/timing trap fired | Retry-after message; nothing sent |
| `failed` | Resend returned an error or threw | Failure state with a reason; never success |

The last two matter for integrity: a spam trap and a provider outage are reported as
non-success. The action never returns `delivered` for a message it did not hand to the
provider.

## Spam mitigation settings

Not environment variables — constants in `app/contact/actions.ts` and
`lib/validation/contact.ts`:

| Constant | Value | Meaning |
|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | 600000 | 10-minute window |
| `RATE_LIMIT_MAX` | 5 | Submissions per window, **per process** |
| `MIN_ELAPSED_MS` | 3000 | Submissions faster than this are discarded |
| honeypot field | `website` | Must arrive empty; the input is `sr-only` and 1×1 clipped |
| `MESSAGE_MIN` / `MESSAGE_MAX` | 20 / 2000 | Message length bounds |

The bucket is an in-memory `Map`, so the limit is per instance. See
[`deployment.md`](./deployment.md) §5.

## Secrets hygiene

- `.env.local` is the only file that should hold real values, and `.gitignore` excludes it.
- `.env.example` holds placeholders only; `tests/unit/source-integrity.test.ts` scans the
  source tree for committed secrets.
- Never log a key. The contact action logs only a spam-trap warning with booleans and an
  elapsed time, and provider errors — never the message body or credentials.
