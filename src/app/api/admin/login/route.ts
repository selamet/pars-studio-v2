import { createHash, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_S,
  createSessionToken,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const loginSchema = z.object({ password: z.string().min(1).max(200) });

/** Constant-time compare (hash first so lengths always match). */
function passwordMatches(given: string, expected: string): boolean {
  return timingSafeEqual(
    createHash('sha256').update(given).digest(),
    createHash('sha256').update(expected).digest()
  );
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (
    !parsed.success ||
    !passwordMatches(parsed.data.password, process.env.ADMIN_PASSWORD)
  ) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  });
  return response;
}
