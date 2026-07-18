import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionToken } from './auth';

/** Is the current request an authenticated admin? (RSC / route handlers) */
export async function isAdmin(): Promise<boolean> {
  return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value);
}
