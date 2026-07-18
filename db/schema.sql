-- ─────────────────────────────────────────────────────────────
-- Pars Studio — reservations schema
-- Target: Neon (or any plain PostgreSQL 15+).
-- Apply with:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/schema.sql
-- Access control is enforced in the app layer (no RLS here).
-- ─────────────────────────────────────────────────────────────

-- Needed for `session_date with =` inside the exclusion constraint.
create extension if not exists btree_gist;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Customer
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  artist_name text,

  -- Booking
  service_type text not null check (service_type in ('recording','mixing','mastering','beat','vocal')),
  session_date date not null,
  start_time time not null,
  duration_hours int not null check (duration_hours in (1, 2, 4, 8)),

  -- Project
  project_description text,
  reference_links text,

  -- Workflow
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  admin_notes text,

  -- Meta
  locale text not null default 'tr',
  updated_at timestamptz not null default now()
);

-- Double-booking is impossible at the DB level: two pending/confirmed
-- sessions on the same date must not overlap in [start, start+duration).
-- The API pre-checks for a friendly 409, but this is the real guarantee.
alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    session_date with =,
    int4range(
      extract(hour from start_time)::int,
      extract(hour from start_time)::int + duration_hours
    ) with &&
  )
  where (status in ('pending', 'confirmed'));

create index reservations_session_date_idx on public.reservations (session_date);
create index reservations_status_idx on public.reservations (status);

-- updated_at trigger ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();
