# Database setup

The app needs PostgreSQL tables (e.g. `public.users`) to be created before registration and login work.

## Option 1: Supabase Dashboard (recommended)

1. Open your [Supabase](https://supabase.com) project.
2. Go to **SQL Editor** (left sidebar).
3. Click **New query**.
4. Copy the contents of `migrations/001_initial_schema.sql` and paste into the editor.
5. Click **Run**.

After this, try registering again from the app.

## Option 2: psql or direct Postgres

If you use a direct Postgres connection (e.g. `DATABASE_URL` or `DIRECT_URL`):

```bash
psql "$DATABASE_URL" -f supabase/migrations/001_initial_schema.sql
```

(or use your GUI/client to run the same SQL file).

## Env vars

Ensure your `.env.local` has:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` – service role key (for server-side auth)

For the PG fallback (optional): `DATABASE_URL` or `DIRECT_URL` with a direct Postgres connection string.
