import { ImageResponse } from 'next/og';

export const alt = 'Yishun River Trading — Yishun Has No River.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Design-system §14.4. A 1200×630 card: emerald river-slash, wordmark, tagline
 * and a mono subline. No charts and no figures — a chart in an OG image is an
 * unlabelled number, which the integrity constraint forbids.
 *
 * `ImageResponse` needs raw font bytes, which `next/font` does not expose. Per
 * §14.4's explicit fallback, no font is vendored or fetched: the default sans is
 * accepted rather than adding a request-time fetch or a binary asset.
 *
 * The hex literals below are the §15 token values, inlined because the OG route
 * renders outside the stylesheet.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#09090B',
        padding: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          border: '1px solid #23252D',
          padding: '40px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <svg width="32" height="40" viewBox="0 0 12 16">
            <g stroke="#10B981" strokeWidth="1.5">
              <line x1="2" y1="14" x2="6" y2="2" />
              <line x1="6.5" y1="14" x2="10.5" y2="2" opacity="0.55" />
            </g>
          </svg>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 600, color: '#F4F4F5' }}>Yishun River Trading</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 0.98,
              color: '#F4F4F5',
              maxWidth: '900px',
            }}
          >
            Yishun Has No River.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#8A8A94',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            Quantitative research. Systematic strategies. Data-driven trading.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <div style={{ width: '96px', height: '3px', backgroundColor: '#10B981' }} />
        </div>
      </div>
    </div>,
    size,
  );
}
