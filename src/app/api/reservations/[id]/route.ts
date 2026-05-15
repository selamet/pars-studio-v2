import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { sendStatusUpdate } from '@/lib/email/send';
import type { Reservation } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'cancelled', 'completed'])
    .optional(),
  admin_notes: z.string().max(2000).optional(),
});

/** Verify the admin session (defense-in-depth alongside middleware). */
async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await requireAuth();
  if (!supabase) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }

  try {
    const { data: before } = await supabase
      .from('reservations')
      .select('status')
      .eq('id', params.id)
      .single();

    const { data: row, error } = await supabase
      .from('reservations')
      .update(parsed.data)
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) throw error;

    const reservation = row as Reservation;
    const newStatus = parsed.data.status;
    if (
      newStatus &&
      newStatus !== before?.status &&
      (newStatus === 'confirmed' || newStatus === 'cancelled')
    ) {
      await sendStatusUpdate(reservation, newStatus);
    }

    return NextResponse.json(reservation);
  } catch (err) {
    console.error('[api:reservations:PATCH]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await requireAuth();
  if (!supabase) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api:reservations:DELETE]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
