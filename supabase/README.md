# Supabase setup — Pars Studio booking

One-time setup. ~5 minutes.

## 1. Create the project

1. Go to <https://supabase.com> → **New project**.
2. Name it `pars-studio`, pick a region close to Istanbul (e.g. `eu-central-1`),
   set a strong database password.
3. Wait for provisioning to finish.

## 2. Create the schema

1. In the project, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql`.
3. Click **Run**. You should see `Success. No rows returned`.
4. Check **Table Editor** → a `reservations` table now exists with RLS enabled.

## 3. Create the admin user (the studio owner)

There is **no public sign-up**. Create the single admin by hand:

1. **Authentication → Users → Add user → Create new user**.
2. Email: the studio owner's email. Password: a strong one.
3. Tick **Auto Confirm User** so no email verification is needed.
4. This is the only account that can log into `/admin`.

> Need more admins later? Just add more users the same way. Every
> authenticated user has full admin access (RLS allows all `authenticated`).

## 4. Copy the keys into `.env.local`

**Project Settings → API**:

| Supabase value            | `.env.local` variable            |
| ------------------------- | -------------------------------- |
| Project URL               | `NEXT_PUBLIC_SUPABASE_URL`       |
| Project API key — `anon`  | `NEXT_PUBLIC_SUPABASE_ANON_KEY`  |
| Project API key — `service_role` | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ The `service_role` key bypasses RLS. It is used **only** in server
> code (`src/lib/supabase/admin.ts`) and must never reach the browser.
> Do not prefix it with `NEXT_PUBLIC_`.

## 5. Done

Restart `npm run dev`. The booking form now writes to Supabase and
`/admin` can read it after you log in.
