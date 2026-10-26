# Mr.HoSSein · Personal Portfolio

Cinematic bilingual portfolio for **Full-Stack Development · AI Engineering · Vibe Coding · Automation**.

## Stack

React 18, TypeScript, Vite, CSS, GSAP + ScrollTrigger, React Three Fiber + Three.js, Supabase (optional managed CMS), Vercel serverless inquiry API.

## What's included

- FA-first RTL + EN LTR switcher, responsive navbar and social links.
- Character illustration sourced from the supplied personal character-sheet reference (cropped without altering identity).
- Hero parallax / animated 3D orbital backdrop with low-motion and mobile fallback.
- Four-chapter About story, real personal experience, skills tagged by level, future vision.
- 15 actual selected service categories, details overlays and inquiry CTA.
- Portfolio gallery with status badges (real / in progress / concept / experiment). **Starts empty** until genuinely documented work is published; never fabricates completed client projects or testimonials.
- Portfolio detail pages `/project/:slug` backed by Supabase rows.
- Public Contact workflow that attempts to securely submit through `/api/inquiry`. On an unconfigured backend, explicitly switches to Copy + Telegram contact; never falsely confirms submission.
- `/admin`: Auth email magic link, admin whitelist check, database-backed project creation/editing, real file uploads and preview, inquiry status, availability updates. Requires Supabase activation.
- GSAP scroll-linked reveals and perspective, with reduced-motion support; targeted R3F scene only on larger screens.

## Deploy to Vercel

Connect GitHub `MxPersonal/personal-portfolio` to Vercel, framework **Vite**, build `npm run build`, output `dist`.

Static public sections and direct Telegram contact operate without a database. Advanced CMS / inquiry persistence are **not active** until the following steps are performed.

### Enable CMS and server-side inquiry storage

1. Create or reactivate a **dedicated** Supabase project of your choice. Do not automatically reuse unrelated projects.
2. Open Supabase SQL Editor and apply `supabase/001_portfolio.sql`. This enables RLS tables and restricted Storage policies.
3. In Supabase Auth, enable email (magic link), configure Site URL `https://personal-portfolio-six-amber-21.vercel.app` and redirect `https://personal-portfolio-six-amber-21.vercel.app/admin`.
4. Configure Vercel Environment Variables (Production + Preview as appropriate):
   - `VITE_SUPABASE_URL`: public Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: public publishable/anon key (never service-role).
   - `SUPABASE_URL`: same project URL, **server side only**.
   - `SUPABASE_SERVICE_ROLE_KEY`: secret Supabase service-role key, **server side only**. Never add `VITE_` prefix.
   - For spam protection, strongly recommended: configure `TURNSTILE_SECRET_KEY` (server) and add a verified Turnstile widget to inquiry form before accepting unauthenticated requests. In its absence, server-side validation and a honeypot operate but production-grade per-IP rate limiting should be added before advertising the form.
5. Redeploy Vercel to embed the public client variables.
6. Visit `/admin`, request a magic link, sign in. In Supabase dashboard, find *your actual Auth user UUID*, then run:
   `insert into public.portfolio_admins(user_id) values ('YOUR_AUTH_USER_UUID') on conflict do nothing;`
   Sign out and back in. Do not grant access using email text alone.
7. Add projects from `/admin`, upload covers to the restricted Storage bucket, set both FA/EN titles, verify project type and status, and enable `Published` for public display.
8. In `/admin`, manage availability and incoming inquiries. Changes are stored in one source of truth.

### Current limitations and safe defaults

- No external CMS is active by default. Any inactive Supabase projects must be deliberately brought online before use.
- Advanced admin covers and project fields are functional after DB connection; extensible case study module ordering, advanced pricing rules, file attachments on inquiry and automated notifications require further back-end implementations rather than fabricated UI claims.
- Pricing is **always by inquiry** until actual owner-approved price rules are configured.
- A public project image requires authorization to publish that media. Keep client data, access tokens and private architecture out of public content.
- The hero uses a cropped character-sheet illustration as a source-faithful placeholder: replace only with an owner-approved futuristic-techwear portrait preserving exact face identity.
- If image source is unavailable at deployment, place `public/hero-character.webp` from the supplied source asset or provide the file in GitHub.

## Local development

```bash
npm install
npm run dev
npm run build
```

## Architecture

- `src/content.ts`: public owner-approved content and 15 services in FA/EN.
- `src/db.ts`: Neon Auth session and Vercel CMS API data adapter.
- `src/main.tsx`: localized UI, project pages, admin forms and GSAP/R3F scenes.
- `src/styles.css`: responsive design system, accessibility and animation styles.
- `api/inquiry.ts`: Vercel secure server endpoint for contact requests.
- `docs/NEON_CMS.md`: current Neon database, authentication and security setup guide.

## Owner decisions

The original Jack artwork, sample project claims, broken `/work/*.gif` links and misleading experience metrics were removed. All currently visible bio copy is based on confirmed personal statements. The next planned decisions (#62-84) default to the robust adaptive hybrid approach, with an admin-first, privacy-aware implementation. Follow-up production enhancements (pricing workflows, richer media library and notifications) are tracked as implementation work, not silently claimed complete.



## CMS اختصاصی / Neon integration

- مخزن فعلی GitHub: `MxPersonal/personal-portfolio-x-mrhossein`
- ورود مدیر: [Mr.HoSSein CMS](https://personal-portfolio-x-mrhossein.vercel.app/admin)
- راهنمای فعلی راه‌اندازی Neon و معرفی حساب مدیر: **[docs/NEON_CMS.md](docs/NEON_CMS.md)**
- Neon Auth برای ورود Email + Password و OTP تأیید ایمیل استفاده می‌شود. دسترسی مدیر جداگانه در جدول `portfolio_admins` بررسی می‌شود.
- دیتابیس خصوصی با `DATABASE_URL` و `NEON_AUTH_BASE_URL` **فقط در Vercel Serverless API** قابل دسترسی است.
- پنج جدول `portfolio_*` قبلاً در Neon ساخته شده‌اند و RLS آن‌ها فعال است. فایل‌های `supabase/*.sql` صرفاً برای آرشیو هستند؛ آن‌ها را روی Neon اجرا نکن.
- برای آپلود فایل (تا 4MB)، Vercel Blob باید در پروژه فعال و متغیر `BLOB_READ_WRITE_TOKEN` موجود باشد. لینک‌های HTTPS رسانه بدون Blob هم قابل استفاده‌اند.
