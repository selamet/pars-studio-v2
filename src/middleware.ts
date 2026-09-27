import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Always land on English first; ignore the browser's Accept-Language.
  localeDetection: false,
});

export const config = {
  // Skip internal paths and anything with a file extension.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
