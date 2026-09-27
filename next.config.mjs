import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// Hosts allowed for next/image: the API (local media fallback) and the R2 public domain.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: apiUrl.protocol.replace(':', ''), hostname: apiUrl.hostname, port: apiUrl.port },
      ...(mediaHost ? [{ protocol: 'https', hostname: mediaHost }] : []),
    ],
  },
};

export default withNextIntl(nextConfig);
