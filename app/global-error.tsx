'use client';

/*
 * `no-html-link-for-pages` is disabled for this file only: `global-error`
 * replaces the root layout, so the App Router context (and with it
 * `next/link`) may not exist. Recovery from a shell-level crash must be a full
 * document load.
 */
/* eslint-disable @next/next/no-html-link-for-pages */

/**
 * Design-system §14.3. `global-error` replaces the root layout, so it must
 * render its own `<html>` and `<body>` and cannot use the header, nav or footer.
 * The stylesheet may not have loaded, so the tokens it needs are re-declared
 * inline with the same literal values as §15.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#09090B',
          color: '#F4F4F5',
          fontFamily:
            'Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <title>Something broke in the pipeline — Yishun River Trading</title>
        <meta name="robots" content="noindex" />
        <div style={{ width: '100%', maxWidth: '52ch', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#8A8A94',
            }}
          >
            Critical error
          </p>
          <h1 style={{ margin: 0, fontSize: '1.5rem', lineHeight: 1.15, color: '#F4F4F5' }}>
            Something broke in the pipeline.
          </h1>
          <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.65, color: '#A1A1AA' }}>
            The application shell itself failed to render. Reloading usually resolves it.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: 0,
                padding: '8px 12px',
                border: '1px solid #31343E',
                borderRadius: '2px',
                backgroundColor: '#111318',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '13px',
                color: '#8A8A94',
              }}
            >
              digest: {error.digest}
            </p>
          ) : null}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: 'pointer',
                minHeight: '48px',
                padding: '0 24px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: '#10B981',
                color: '#09090B',
                fontSize: '0.9375rem',
                fontWeight: 500,
              }}
            >
              Reload
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '48px',
                padding: '0 24px',
                borderRadius: '2px',
                border: '1px solid #74747E',
                color: '#F4F4F5',
                textDecoration: 'none',
                fontSize: '0.9375rem',
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
