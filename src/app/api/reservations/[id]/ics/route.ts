import { createAdminClient } from '@/lib/supabase/admin';
import { getService } from '@/lib/booking/services';
import { confirmationCode } from '@/lib/email/templates/shared';
import type { Reservation } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Local (floating) timestamp: YYYYMMDDTHHMMSS */
function dt(date: string, time: string, addHours = 0) {
  const [y, m, d] = date.split('-').map(Number);
  const h = parseInt(time.slice(0, 2), 10) + addHours;
  return `${y}${pad(m)}${pad(d)}T${pad(h)}${time.slice(3, 5)}00`;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', params.id)
      .single();
    if (error || !data) {
      return new Response('Not found', { status: 404 });
    }

    const r = data as Reservation;
    const svc =
      getService(r.service_type)?.name[r.locale] ?? r.service_type;
    const code = confirmationCode(r.id);

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pars Studio//Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${r.id}@parsstudio`,
      `DTSTAMP:${dt(r.session_date, r.start_time)}`,
      `DTSTART:${dt(r.session_date, r.start_time)}`,
      `DTEND:${dt(r.session_date, r.start_time, r.duration_hours)}`,
      `SUMMARY:Pars Studio — ${svc} (#${code})`,
      'LOCATION:Pars Studio, Bomonti, Şişli, İstanbul',
      `DESCRIPTION:${r.locale === 'tr' ? 'Rezervasyon kodu' : 'Reservation code'} #${code}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="pars-studio-${code}.ics"`,
      },
    });
  } catch (err) {
    console.error('[api:reservations:ics]', err);
    return new Response('Error', { status: 500 });
  }
}
