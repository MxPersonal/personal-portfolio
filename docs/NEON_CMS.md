# Neon CMS Integration / راه‌اندازی پنل اختصاصی

## Status and identifiers

- GitHub: `MxPersonal/personal-portfolio-x-mrhossein`
- Vercel: `hosseinyazdanpanahs-projects/personal-portfolio`
- Neon: `personal-portfolio-db`, project ID `icy-mode-87886981`, database `neondb`, branch `main`.
- CMS: `/admin`
- This integration replaces the previous Supabase frontend client and inquiry backend.

## Completed in the Neon Console

Five tables already exist under `public` and have RLS enabled:

`portfolio_admins`, `portfolio_projects`, `portfolio_cms_entries`, `portfolio_settings`, `portfolio_inquiries`.

**Do not execute** the old files `supabase/001_portfolio.sql` or `supabase/002_cms.sql` in Neon. They contain Supabase-specific SQL and access policies. The Neon schema already exists.

## Server-to-database connection and security

The Vercel ↔ Neon integration supplies **server-only** `DATABASE_URL`, `NEON_AUTH_BASE_URL` and the browser-safe `VITE_NEON_AUTH_URL`. Ensure these variables target **Production**. Passwords and connection URLs must NEVER be checked into GitHub or put in `VITE_...` variables.

- The public Vercel endpoint `GET /api/cms` returns **only** published projects and CMS entries; it allows only a small set of public settings. It never returns inquiries/admin records.
- The other methods (and non-public reads) require a JWT from Neon Auth, cryptographically verified with the Neon JWKS and a corresponding **verified, unbanned Neon user whose ID exists in `portfolio_admins`**.
- The backend uses parameterized SQL, whitelisted table names/columns, and checks same-origin for writes. It does not trust a client-supplied role or email.
- A database owner can bypass RLS; these API authorization gates are essential. Keep the DB connection string server-only.
- A public inquiry can be submitted through `POST /api/inquiry`, separately from the admin CRUD endpoint. For production abuse prevention, configure Cloudflare Turnstile in BOTH client and backend before enabling `TURNSTILE_SECRET_KEY` on its own.

## Step-by-step: create the first administrator

1. Open `https://personal-portfolio-x-mrhossein.vercel.app/admin` after the automatic Vercel build has succeeded.
2. Click **Create first account / ساخت اولین حساب**.
3. Enter your **own** email and a strong unique password. Never share the password.
4. Confirm the verification **OTP from your email**. Shared Neon email delivery may be rate-limited. If sign-up cannot send email, configure a custom SMTP provider in **Neon → Auth → Configuration**.
5. Sign in. You will see **Admin approval required**, with your exact **User UUID**.
6. Neon Console → `personal-portfolio-db` → **Postgres database → SQL Editor**. Confirm **Branch=main**, **Database=neondb**.
7. Run this query, substituting ONLY the UUID you saw in the admin UI:

```sql
INSERT INTO public.portfolio_admins (user_id)
SELECT id FROM neon_auth."user"
WHERE id = 'PASTE_YOUR_UUID_HERE'::uuid
  AND "emailVerified" = true
ON CONFLICT (user_id) DO NOTHING;
```

8. Run verification:

```sql
SELECT a.user_id, u.email, u."emailVerified"
FROM public.portfolio_admins a
JOIN neon_auth."user" u ON u.id=a.user_id;
```

Only **your** verified email should appear. Do not add strangers or grant privileges using their email in a public query.
9. Neon Auth settings → **disable new public sign-ups** after the first approved admin account exists. Keep email/password sign-in enabled. Trusted domains should include `https://personal-portfolio-x-mrhossein.vercel.app`. Prefer disabling localhost in production.
10. Log out and log in again. Now the CMS sections and project/inquiry tabs should load. From Site CMS, select **Initialize editable content** **once** to import the default content and starter projects. This operation is restricted to an approved admin and will make published items live.

## Content management and deployment

After initialization, public pages load CMS entries from the Neon-backed Vercel endpoint. Edit Persian and English titles and descriptions, reorder sections, publish/unpublish services, skills, social links and pages, and add projects without another Git build.

**Media uploads**: the upload endpoint supports images/videos up to **4 MB**, but only after enabling **Vercel Blob** for this project (which automatically provides `BLOB_READ_WRITE_TOKEN` to Vercel). Until then, you can paste an HTTPS URL for images/videos into the CMS. Larger files also require using hosted URLs or a future client-upload flow.

No manual Vercel deployments are required for edits in Git `main`; Vercel builds automatically. Normal CMS content changes do not trigger builds.

## Troubleshooting

- `403 Admin role required`: signed-in account is not verified and approved via `portfolio_admins`.
- `503 Neon database is not configured`: check Vercel **Production** environment variables and automatic build.
- `401/403` after login: verify that `NEON_AUTH_BASE_URL` and `VITE_NEON_AUTH_URL` refer to the same Neon branch and that the domain is in Trusted Origins.
- Upload returns `503 Media storage is not connected`: install Vercel Blob, or use image URL.
- Pending registration verification: check Neon shared SMTP delivery/rate limits and resend verification.
- Avoid sharing database URLs, passwords, JWTs or keys in screenshots or chats.
