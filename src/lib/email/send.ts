import 'server-only';
import type { Reservation } from '@/lib/supabase/types';
import { getResend, getFromAddress, getSiteUrl } from './resend';
import {
  customerConfirmationEmail,
  customerStatusEmail,
} from './templates/customer-confirmation';
import { studioNotificationEmail } from './templates/studio-notification';

/**
 * All senders swallow errors: a failed email must never block or roll
 * back a reservation. They log and resolve.
 */
async function safeSend(
  to: string | string[],
  subject: string,
  html: string,
  label: string
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(`[email:${label}] RESEND_API_KEY unset — skipping send.`);
      return;
    }
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject,
      html,
    });
    if (error) console.error(`[email:${label}] Resend error:`, error);
  } catch (err) {
    console.error(`[email:${label}] threw:`, err);
  }
}

export async function sendCustomerConfirmation(
  r: Reservation
): Promise<void> {
  const { subject, html } = customerConfirmationEmail(r);
  await safeSend(r.customer_email, subject, html, 'customer-confirmation');
}

export async function sendStudioNotification(r: Reservation): Promise<void> {
  const to = process.env.STUDIO_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn('[email:studio] STUDIO_NOTIFICATION_EMAIL unset — skipping.');
    return;
  }
  const { subject, html } = studioNotificationEmail(r, getSiteUrl());
  await safeSend(to, subject, html, 'studio-notification');
}

export async function sendStatusUpdate(
  r: Reservation,
  status: 'confirmed' | 'cancelled'
): Promise<void> {
  const { subject, html } = customerStatusEmail(r, status);
  await safeSend(r.customer_email, subject, html, `status-${status}`);
}
