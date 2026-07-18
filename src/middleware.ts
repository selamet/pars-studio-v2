import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/auth';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Always land on English first; ignore the browser's Accept-Language.
  localeDetection: false,
});

// /tr/admin or /en/admin and below, EXCEPT /(tr|en)/admin/login
const ADMIN_RE = /^\/(tr|en)\/admin(?:\/(?!login)|$)/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gate the admin area (defense-in-depth; API routes re-check too).
  if (ADMIN_RE.test(pathname)) {
    const authed = await verifySessionToken(
      request.cookies.get(ADMIN_COOKIE)?.value
    );
    if (!authed) {
      const locale = pathname.split('/')[1] || defaultLocale;
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/admin/login`;
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip internal paths, the /api routes, and anything with a file ext.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
