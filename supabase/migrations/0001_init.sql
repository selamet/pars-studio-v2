-- ─────────────────────────────────────────────────────────────
-- Pars Studio — reservations schema + RLS
-- Run this in the Supabase SQL Editor (one shot).
-- ─────────────────────────────────────────────────────────────

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

create index reservations_session_date_idx on public.reservations (session_date);
create index reservations_status_idx on public.reservations (status);

-- Row Level Security ------------------------------------------------
alter table public.reservations enable row level security;

-- Anyone can insert (the booking form is public). Server-side zod
-- validation + the service-role client are the real gate; this policy
-- just keeps the anon key from doing anything else.
create policy "Public can create reservations"
  on public.reservations for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users (the studio admin) can read/update/delete.
create policy "Admins can read all reservations"
  on public.reservations for select
  to authenticated
  using (true);

create policy "Admins can update reservations"
  on public.reservations for update
  to authenticated
  using (true);

create policy "Admins can delete reservations"
  on public.reservations for delete
  to authenticated
  using (true);

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
