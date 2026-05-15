import createMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// /tr/admin or /en/admin and below, EXCEPT /(tr|en)/admin/login
const ADMIN_RE = /^\/(tr|en)\/admin(?:\/(?!login)|$)/;

export async function middleware(request: NextRequest) {
  // 1. next-intl handles locale detection / prefixing first.
  const response = intlMiddleware(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not configured yet (e.g. Part 1 only) → just do i18n.
  if (!supabaseUrl || !supabaseKey) return response;

  // 2. Refresh the Supabase session on every request (cookie rotation).
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Gate the admin area (defense-in-depth; API routes re-check too).
  const { pathname } = request.nextUrl;
  if (ADMIN_RE.test(pathname) && !user) {
    const locale = pathname.split('/')[1] || defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/admin/login`;
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Skip internal paths, the /api routes, and anything with a file ext.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
