<div align="center">

<img src="./public/hero-character.webp" width="260" alt="Mr.HoSSein portfolio character" />

# Mr.HoSSein
### Personal Portfolio · AI Engineering · Full-Stack Development

**از یک ایده تا یک تجربه دیجیتال هوشمند.**

A bilingual, cinematic portfolio built to present real projects, technical services, and a developer's story.

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Neon](https://img.shields.io/badge/Database-Neon-00E599)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Hosting-Vercel-black?logo=vercel)](https://vercel.com/)

**[Live experience](https://personal-portfolio-x-mrhossein.vercel.app/) · [CMS guide](docs/NEON_CMS.md) · [GitHub profile](https://github.com/HosseinYazdanpanah)**

</div>

---

## ✦ درباره پروژه | Overview

این ریپازیتوری وب‌سایت شخصی **Mr.HoSSein** است؛ پورتفولیویی برای معرفی مسیر حرفه‌ای، مهارت‌ها، خدمات توسعه وب و نرم‌افزار، مهندسی هوش مصنوعی و اتوماسیون. هدف صرفاً نمایش چند کارت نیست؛ تجربه‌ای روایی با طراحی واکنش‌گرا، حرکت سینمایی کنترل‌شده و مدیریت محتوای اختصاصی است.

> **English:** A Persian-first, English-ready portfolio blending storytelling, interactive visuals and a database-backed content studio. Public presentation and private content management live in one repository.

## ✨ Highlights

| Experience | What's inside |
|:--|:--|
| 🌐 **FA / EN** | محتوای فارسی و انگلیسی با RTL / LTR متناسب |
| 🎬 **Cinematic UI** | GSAP, ScrollTrigger, Framer Motion and responsive motion design |
| 🪐 **3D accents** | Three.js + React Three Fiber for selected interactive scenes |
| 🧩 **Services & skills** | گروه‌بندی خدمات توسعه نرم‌افزار، AI و اتوماسیون |
| 🗂️ **Real portfolio** | پروژه‌های منتشرشده با عنوان، توضیحات، وضعیت و لینک‌های واقعی؛ بدون نمونه‌کار ساختگی |
| 🛠️ **CMS Studio** | مدیریت پروژه‌ها، محتوای چندزبانه، رسانه‌ها، تنظیمات و درخواست‌ها در مسیر `/admin` |
| ✉️ **Inquiries** | مسیر API اختصاصی برای دریافت درخواست همکاری، همراه با امکان فعال‌سازی محافظت در برابر اسپم |
| ♿ **Adaptive** | چیدمان موبایل و دسکتاپ، fallback و احترام به `prefers-reduced-motion` |

## 🏗️ Architecture

~~~text
Browser (React 18 + Vite)
  ├── Public portfolio (FA / EN)
  ├── GSAP / Framer Motion / R3F
  └── /admin · Neon Auth
           │
           ▼
Vercel Serverless API
  ├── /api/cms
  ├── /api/admin-status
  ├── /api/inquiry
  ├── /api/dashboard
  └── /api/upload
           │
           ▼
Neon PostgreSQL + Neon Auth
   (+ optional Vercel Blob uploads)
~~~

**Key paths:** `src/main.tsx` (public UI), `src/CMSStudio.tsx`, `src/AdminDashboard.tsx`, `src/content.ts` (localized baseline), `src/db.ts` (auth/data adapter), `src/styles.css`, `api/` (server-only operations), `docs/NEON_CMS.md` (current CMS setup).

> **Important:** Older `supabase/` SQL and `docs/CMS.md` remain as historical material. **Do not run those Supabase migrations against Neon.** The current integration and correct administration instructions are in [docs/NEON_CMS.md](docs/NEON_CMS.md).

## 🚀 Run locally

**Requirements:** Node.js and npm, plus environment configuration for live CMS capabilities.

~~~bash
git clone https://github.com/MxPersonal/personal-portfolio-x-mrhossein.git
cd personal-portfolio-x-mrhossein
npm install
cp .env.example .env.local
npm run dev
~~~

Open the local address shown by Vite (typically `http://localhost:5173`).

| Command | Purpose |
|:--|:--|
| `npm run dev` | Start Vite development server |
| `npm run build` | TypeScript checks + production bundle |
| `npm run preview` | Preview built site |

### 🔐 Environment variables

The checked-in [`.env.example`](.env.example) is the source of truth for configuration.

| Variable | Scope | Usage |
|:--|:--|:--|
| `VITE_NEON_AUTH_URL` | Browser | Neon Auth client URL |
| `DATABASE_URL` | Server only | Neon PostgreSQL connection |
| `NEON_AUTH_BASE_URL` | Server only | JWT verification / trusted auth issuer |
| `BLOB_READ_WRITE_TOKEN` | Server only | Optional media uploads via Vercel Blob |
| `VITE_TURNSTILE_SITE_KEY` | Browser | Optional Turnstile widget |
| `TURNSTILE_SECRET_KEY` | Server only | Optional Turnstile verification |

Never expose `DATABASE_URL`, service credentials, or upload tokens as `VITE_*`. A local Vite dev server does **not** automatically emulate the Vercel serverless APIs: CMS and inquiry persistence require a correctly configured deployment/runtime.

## 🧭 Admin & publication

1. Configure the Neon ↔ Vercel integration and check that required environment variables exist for the target environment.
2. Follow [**Neon CMS Integration**](docs/NEON_CMS.md) to register and approve **your own** administrator account. Access is not granted solely by possessing an email address.
3. Open `/admin`, sign in, and edit the multilingual content and project entries.
4. Publish only genuine projects and media you are permitted to share.
5. Recheck both `/fa` and `/en` plus the mobile layout after substantial content changes.

Changes to code pushed to `main` are deployed through the connected GitHub/Vercel pipeline. Content changes stored in Neon do not normally need a code commit.

## 🛡️ Security & truthful documentation

- Protected admin mutations are checked **server-side**, with JWT verification and administrator allowlisting.
- Public access should return only published content; secrets stay on the server.
- For a public inquiry form, configure **both** client and server Turnstile settings and consider production-grade rate limits before promoting it.
- The presence of an integration or UI does **not** guarantee that the external service is configured for a given deployment.
- Demo badges, unsupported uptime percentages, fictitious user statistics and made-up testimonials are deliberately excluded.

## 🔎 Project status

This is an actively evolving personal website. Database setup, administrator provisioning, upload credentials, and live service readiness are **deployment-specific** and should be verified before assuming they work. The source code documents implemented routes and adapters, not third-party account activation.

## 🤝 Contact

[GitHub](https://github.com/HosseinYazdanpanah) · [LinkedIn](https://www.linkedin.com/in/hossein-yazdanpanah-0206b93ab/) · [Telegram](https://t.me/Hosssein_0905)

## 📄 License

See [LICENSE](LICENSE) for the terms governing this repository.

<div align="center">

**Built with code, curiosity & purposeful motion.** ✦

</div>
