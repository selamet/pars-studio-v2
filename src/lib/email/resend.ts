import 'server-only';
import { Resend } from 'resend';

/**
 * Lazily-built Resend client. Returns null when RESEND_API_KEY is unset
 * so email becomes a no-op instead of crashing the reservation flow.
 */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'Pars Studio <onboarding@resend.dev>';
}

/**
 * Where customer replies should land — the studio inbox. Falls back to the
 * notification address so a single env var is usually enough.
 */
export function getReplyToAddress(): string | undefined {
  return (
    process.env.REPLY_TO_EMAIL ||
    process.env.STUDIO_NOTIFICATION_EMAIL ||
    undefined
  );
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}
