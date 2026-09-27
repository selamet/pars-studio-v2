import type { MetadataRoute } from 'next';

const BASE = 'https://studiospars.com';
const LOCALES = ['en', 'tr'] as const;
const PATHS = ['', '/beats', '/services', '/booking', '/privacy'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return LOCALES.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  );
}
