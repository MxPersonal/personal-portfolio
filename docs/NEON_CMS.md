# Mr.HoSSein CMS: secure environment-variable administrator login

The CMS route is intentionally absent from public navigation and footer. Use the private administrator URL saved by the site owner. A hidden address alone does not secure CMS access: every privileged API validates a signed server-side session.

## Set up Vercel Production environment

In Vercel > personal-portfolio > Settings > Environment Variables, add these variables yourself:

| Name | Visibility | Purpose |
| --- | --- | --- |
| ADMIN_EMAIL | Server only | Email for the sole CMS administrator |
| ADMIN_PASSWORD | Server only | Strong unique password, at least 16 characters (20+ recommended) |
| DATABASE_URL | Server only | Existing Neon PostgreSQL database used for CMS content |
| BLOB_READ_WRITE_TOKEN | Server only, optional | Enables media uploads via Vercel Blob |

Never use a VITE_ prefix for the administrator email or password, and never commit or share the real values.

The former Neon Auth email sign-up, OTP and user UUID allowlist are not required for this CMS login. NEON_AUTH_BASE_URL and VITE_NEON_AUTH_URL are no longer consumed by the login code. Existing database tables and data remain unchanged.

1. Save ADMIN_EMAIL and ADMIN_PASSWORD in the Production environment. The user enters the actual values; this project includes only empty examples.
2. Verify DATABASE_URL is still configured. Without it, login can work but the CMS dashboard cannot load or persist content.
3. Make sure a Production deployment uses the new environment settings. A push to main triggers Vercel deployment automatically.
4. Open the private CMS URL using HTTPS, enter the email and password, and sign in. There is no account registration or verification code.
5. Log out from the CMS sidebar. Reopen the private address to sign in again.

## Session and API security

- POST /api/admin-session verifies the server-only credentials and sets a signed cookie with the HttpOnly, Secure, SameSite=Strict and Path=/ attributes. Session lifetime: 8 hours.
- DELETE /api/admin-session clears that cookie; GET /api/admin-status checks only the validity of the current session.
- Protected CMS CRUD, dashboard, and upload APIs use server-side getAdmin to check the same signed cookie. Write operations also check request origin.
- Password rotation invalidates every previously signed cookie. Use a unique random password.
- Login attempts are throttled per serverless instance. This is a best-effort measure, **not a globally coordinated limiter**. Configure platform WAF/rate limiting for stronger protection; verify availability and pricing on your plan.
- No administrator credentials or session tokens are saved in localStorage. A valid HttpOnly cookie is required; an email field or fake role never grants access.
- The public CMS read endpoint continues to expose only published content and approved public settings.

Database storage still uses Neon PostgreSQL (DATABASE_URL); optional media uploads require Vercel Blob.

## Troubleshooting

- 503 or admin_config_missing: check ADMIN_EMAIL, ADMIN_PASSWORD, password length (16+), Production scope, and the active deployment.
- 401: wrong email or password. Email comparison ignores letter case, password comparison does not.
- 429: the login throttle has been reached. Try again after the response Retry-After interval.
- 403: the signed cookie is missing, expired, or not attached. Open the CMS over HTTPS and sign in again.
- Dashboard 503: check DATABASE_URL and Neon availability.
- Upload 503: configure Vercel Blob or use a hosted HTTPS image URL.

## Manual verification checklist

1. When signed out, GET /api/admin-status reports admin=false and the dashboard API denies private access.
2. Wrong credentials return HTTP 401 without an authenticated cookie.
3. Correct credentials create an HttpOnly cookie and open the private CMS dashboard.
4. Log out, refresh, and confirm the protected dashboard rejects the request.
5. Rotate ADMIN_PASSWORD and confirm old signed sessions no longer authorize requests.
