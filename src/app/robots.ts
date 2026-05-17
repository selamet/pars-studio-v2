import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/tr/admin/', '/en/admin/'],
      },
    ],
    sitemap: 'https://parsstudio.com/sitemap.xml',
  };
}
