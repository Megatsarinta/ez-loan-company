# Deploy to Vercel

## 1. Push your code

Commit and push all changes, including `pnpm-lock.yaml`, `vercel.json`, `.nvmrc`, and `.env.example`.

## 2. Create project on Vercel

- Go to [vercel.com](https://vercel.com) → Add New Project → Import your repo.
- **Framework Preset:** Next.js (auto-detected)
- **Package Manager:** pnpm (auto-detected from lockfile)

## 3. Environment variables

In **Project Settings → Environment Variables**, add these (use the same values as your local `.env` for production):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooler URL); used at runtime |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL; used by Prisma (prisma.config.ts) for generate/build |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `ADMIN_USERNAME` | Yes | Admin login username |
| `ADMIN_PASSWORD` | Yes | Admin login password |

Optional (if your app uses them): `POSTGRES_*` variables.

## 4. Deploy

Click **Deploy**. Vercel will:

1. Run `pnpm install` (then `prisma generate` via postinstall)
2. Run `pnpm run build`
3. Deploy the app

## 5. Region

The project is set to **Singapore (sin1)** in `vercel.json` for lower latency to India. You can change `regions` in `vercel.json` if needed.

## Troubleshooting

- **ERR_PNPM_OUTDATED_LOCKFILE:** Ensure `pnpm-lock.yaml` is committed and up to date. Locally run `pnpm install` and commit the lockfile.
- **Prisma errors:** Ensure `DATABASE_URL` and `DIRECT_URL` are set in Vercel Environment Variables.
- **Build fails:** Check the build log; ensure all env vars are set for the Production environment.
