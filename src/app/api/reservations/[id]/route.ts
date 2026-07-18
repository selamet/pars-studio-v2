import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/auth-server';
import { getPool, RESERVATION_COLUMNS } from '@/lib/db';
import { sendStatusUpdate } from '@/lib/email/send';
import type { Reservation } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const idSchema = z.string().uuid();

const patchSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'cancelled', 'completed'])
    .optional(),
  admin_notes: z.string().max(2000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!idSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
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

  const sets: string[] = [];
  const values: unknown[] = [];
  if (parsed.data.status !== undefined) {
    values.push(parsed.data.status);
    sets.push(`status = $${values.length}`);
  }
  if (parsed.data.admin_notes !== undefined) {
    values.push(parsed.data.admin_notes);
    sets.push(`admin_notes = $${values.length}`);
  }
  values.push(params.id);

  try {
    const pool = getPool();
    const { rows: beforeRows } = await pool.query(
      'select status from reservations where id = $1',
      [params.id]
    );

    let row: Reservation | undefined;
    try {
      const { rows } = await pool.query(
        `update reservations set ${sets.join(', ')}
          where id = $${values.length}
          returning ${RESERVATION_COLUMNS}`,
        values
      );
      row = rows[0] as Reservation | undefined;
    } catch (err) {
      // 23P01: re-activating (e.g. cancelled → confirmed) would overlap a
      // booking made in the meantime.
      if ((err as { code?: string }).code === '23P01') {
        return NextResponse.json({ code: 'slot_taken' }, { status: 409 });
      }
      throw err;
    }
    if (!row) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const newStatus = parsed.data.status;
    if (
      newStatus &&
      newStatus !== beforeRows[0]?.status &&
      (newStatus === 'confirmed' || newStatus === 'cancelled')
    ) {
      await sendStatusUpdate(row, newStatus);
    }

    return NextResponse.json(row);
  } catch (err) {
    console.error('[api:reservations:PATCH]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!idSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  try {
    await getPool().query('delete from reservations where id = $1', [
      params.id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api:reservations:DELETE]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
