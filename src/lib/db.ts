import 'server-only';
import { Pool, types } from 'pg';

// DATE columns come back as plain 'YYYY-MM-DD' strings, not JS Dates —
// the whole app treats session_date as a string.
types.setTypeParser(types.builtins.DATE, (v) => v);

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

/**
 * Singleton Pool cached on globalThis so dev hot-reload and warm
 * serverless invocations reuse connections. On Vercel/serverless use
 * Neon's POOLED connection string (the "-pooler" host) — PgBouncer does
 * the real pooling server-side, so keep the local pool small.
 */
export function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set.');
  }
  if (!global.pgPool) {
    global.pgPool = new Pool({ connectionString: url, max: 3 });
  }
  return global.pgPool;
}

/**
 * Every reservations column, date/time/timestamps cast to text so rows
 * match the `Reservation` type (all strings) in every runtime.
 */
export const RESERVATION_COLUMNS = `
  id,
  to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
  customer_name, customer_email, customer_phone, artist_name,
  service_type, session_date::text as session_date,
  start_time::text as start_time, duration_hours,
  project_description, reference_links, status, admin_notes, locale,
  to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
`;
