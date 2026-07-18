import { NextResponse } from 'next/server';
import { getPool, RESERVATION_COLUMNS } from '@/lib/db';
import { reservationSchema, fieldErrors } from '@/lib/validation/reservation';
import { hasConflict, hourOf } from '@/lib/booking/availability';
import {
  sendCustomerConfirmation,
  sendStudioNotification,
} from '@/lib/email/send';
import { confirmationCode } from '@/lib/email/templates/shared';
import type { Reservation } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const BOOKED_SLOTS_SQL = `
  select start_time::text as start_time, duration_hours
    from reservations
   where session_date = $1 and status in ('pending', 'confirmed')
`;

/** GET /api/reservations?date=YYYY-MM-DD → public availability (no PII). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  try {
    const { rows } = await getPool().query(BOOKED_SLOTS_SQL, [date]);
    return NextResponse.json(rows);
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
    const pool = getPool();

    // Friendly fast path — the exclusion constraint below is the real guard.
    const { rows: existing } = await pool.query(BOOKED_SLOTS_SQL, [
      input.sessionDate,
    ]);
    if (hasConflict(hourOf(input.startTime), input.durationHours, existing)) {
      return NextResponse.json({ code: 'slot_taken' }, { status: 409 });
    }

    let reservation: Reservation;
    try {
      const { rows } = await pool.query(
        `insert into reservations
           (customer_name, customer_email, customer_phone, artist_name,
            service_type, session_date, start_time, duration_hours,
            project_description, reference_links, locale)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         returning ${RESERVATION_COLUMNS}`,
        [
          input.customerName,
          input.customerEmail,
          input.customerPhone,
          input.artistName || null,
          input.serviceType,
          input.sessionDate,
          input.startTime,
          input.durationHours,
          input.projectDescription || null,
          input.referenceLinks || null,
          input.locale,
        ]
      );
      reservation = rows[0] as Reservation;
    } catch (err) {
      // 23P01 = exclusion_violation: someone booked the slot concurrently.
      if ((err as { code?: string }).code === '23P01') {
        return NextResponse.json({ code: 'slot_taken' }, { status: 409 });
      }
      throw err;
    }

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
