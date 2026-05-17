import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pars Studios — Recording, Mixing, Mastering & Beat Production';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Social-share card. Rendered at the edge so every share/twitter link gets a
 * crisp 1200×630 preview matching the site's dark editorial palette.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(60% 50% at 50% 55%, rgba(201,169,110,0.12) 0%, rgba(201,169,110,0.04) 40%, rgba(10,9,8,0) 75%), #0a0908',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          color: '#ece8df',
          fontFamily: 'serif',
        }}
      >
        {/* Top meta row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#a39c91',
            fontSize: 18,
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          <span>SIGNAL · 001 · ISTANBUL</span>
          <span>PARS STUDIOS</span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 96, fontWeight: 300, lineHeight: 1 }}>
            We carve raw
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 300,
              lineHeight: 1,
              fontStyle: 'italic',
              color: '#c9a96e',
            }}
          >
            signal
          </div>
          <div style={{ fontSize: 96, fontWeight: 300, lineHeight: 1 }}>
            into character.
          </div>
        </div>

        {/* Bottom caption */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: '#a39c91',
            fontSize: 22,
          }}
        >
          <span>Recording · Mixing · Mastering · Beat Production</span>
          <span style={{ fontSize: 18, letterSpacing: 4 }}>parsstudio.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
