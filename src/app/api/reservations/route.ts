import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { reservationSchema, fieldErrors } from '@/lib/validation/reservation';
import { hasConflict, hourOf } from '@/lib/booking/availability';
import {
  sendCustomerConfirmation,
  sendStudioNotification,
} from '@/lib/email/send';
import { confirmationCode } from '@/lib/email/templates/shared';
import type { Reservation } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** GET /api/reservations?date=YYYY-MM-DD → public availability (no PII). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('start_time, duration_hours')
      .eq('session_date', date)
      .in('status', ['pending', 'confirmed']);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[api:reservations:GET]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

/** POST /api/reservations → validate, conflict-check, insert, email. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', fields: fieldErrors(parsed.error) },
      { status: 400 }
    );
  }
  const input = parsed.data;

  try {
    const supabase = createAdminClient();

    // Conflict detection against pending + confirmed bookings.
    const { data: existing, error: readErr } = await supabase
      .from('reservations')
      .select('start_time, duration_hours')
      .eq('session_date', input.sessionDate)
      .in('status', ['pending', 'confirmed']);
    if (readErr) throw readErr;

    const conflict = hasConflict(
      hourOf(input.startTime),
      input.durationHours,
      existing ?? []
    );
    if (conflict) {
      return NextResponse.json({ code: 'slot_taken' }, { status: 409 });
    }

    const { data: row, error: insErr } = await supabase
      .from('reservations')
      .insert({
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        artist_name: input.artistName || null,
        service_type: input.serviceType,
        session_date: input.sessionDate,
        start_time: input.startTime,
        duration_hours: input.durationHours,
        project_description: input.projectDescription || null,
        reference_links: input.referenceLinks || null,
        locale: input.locale,
      })
      .select('*')
      .single();
    if (insErr) throw insErr;

    const reservation = row as Reservation;

    // Emails must not block / fail the reservation. Awaited (Promise
    // resolves even on failure) so they finish before the function exits.
    await Promise.allSettled([
      sendCustomerConfirmation(reservation),
      sendStudioNotification(reservation),
    ]);

    return NextResponse.json({
      id: reservation.id,
      confirmationCode: confirmationCode(reservation.id),
    });
  } catch (err) {
    console.error('[api:reservations:POST]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
