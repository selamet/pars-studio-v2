import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Apple home-screen icon. Same dark/brass editorial mark as the favicon
 * but generated as a 180×180 PNG so iOS Safari uses it.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0908',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c9a96e',
          fontFamily: 'serif',
          fontSize: 132,
          fontWeight: 500,
          letterSpacing: '-0.02em',
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
