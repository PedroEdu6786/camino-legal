# Analytics reader access

Google sign-in protects `/admin/analitica`, including its server-rendered inventory, and the summary, insights and session APIs. Only verified Google accounts on the explicit email allowlist can read data. Initial authorized reader: `info@caminolegal.com.mx`.

## Configuration

Create a Google OAuth client of type **Web application**, separate from the GA4 reporting service account. Register these exact authorized redirect URIs:

- Production: `https://caminolegal.com.mx/api/auth/callback/google`
- Local development: `http://localhost:3000/api/auth/callback/google`

Use the same localhost hostname and port in the browser and in `AUTH_URL`. For another development port, register its exact callback too. Plain HTTP localhost/127.0.0.1 origins are accepted outside production; production requires HTTPS. Localhost is an allowed application origin, not an authorization bypass: the same Google account allowlist applies.

Configure server-only variables in ignored `.env.local` for local work and the hosting secret store for production:

| Variable | Value |
| --- | --- |
| `AUTH_URL` | `https://caminolegal.com.mx` in production; `http://localhost:3000` locally |
| `AUTH_GOOGLE_ID` | OAuth web client ID |
| `AUTH_GOOGLE_SECRET` | OAuth web client secret |
| `AUTH_SECRET` | Dedicated random secret of at least 32 bytes; do not reuse `ANALYTICS_SERVER_SECRET` |
| `ANALYTICS_READER_EMAILS` | `info@caminolegal.com.mx`; comma-separated exact emails for additional readers |

Do not prefix these with `NEXT_PUBLIC_` or commit their values. Keep development and production session secrets distinct. The local origin, initial allowlist, generated local auth secret and Google OAuth credentials are now installed in ignored `.env.local`. Both callback URLs were validated against the downloaded web-client JSON. If the Google OAuth app is in testing mode, add the reader as an OAuth test user. The reader email must belong to a Google account; a forwarding mailbox alone cannot sign in.

## Access contract

| Request | Result |
| --- | --- |
| Dashboard without a valid session | Redirect to Spanish sign-in screen, before building inventory |
| API without valid session or with expired/tampered cookie | JSON `401`, no provider call |
| Valid session whose email is no longer allowed | JSON `403`, no provider call |
| Missing or invalid auth configuration | JSON `503` / unavailable sign-in state; access stays locked |
| Allowed reader | Existing read-only reports; private, non-cacheable responses |

The same server-side authorization gate protects each API. It runs before parameter validation, report caches and GA4 calls. All future admin reporting routes must use this gate. Authentication is checked in the page and handlers, independently of client components or layouts. The public site remains accessible; auth screens are outside the existing public marketing-collection route set.

Sessions use Auth.js `next-auth@5.0.0-beta.32`, pinned for the current Next.js 16 / React 19 integration. Google login requests only `openid email`; it never grants GA4 report access. Reporting continues to use its separate server credentials. The encrypted HttpOnly session cookie carries identity and an absolute eight-hour deadline, with SameSite=Lax and Secure on HTTPS. OAuth access/refresh tokens are not retained in the session. Client updates cannot replace identity or extend the deadline.

Allowlist checks run on every protected request. Environment changes require the hosting platform's normal restart/redeploy across all instances; after that, removed readers lose access even with an otherwise valid cookie. Open tabs check access every minute and on focus/visibility changes, clear reports on an authorization failure, and enforce the absolute deadline locally. Logout clears the current browser cookie. With stateless sessions, a copied cookie remains usable until expiry unless its email is removed or `AUTH_SECRET` is rotated; rotating that secret invalidates every session.

## Verification and activation

1. Run `node --test tests/dashboard-auth.test.mjs` for policy, verified Google identity, encrypted-cookie integrity, absolute expiry, allowlist removal, redirect restrictions and zero reader calls on denied requests.
2. Run `node tests/dashboard-auth-runtime.mjs` for actual Next.js page/API boundaries, signed synthetic sessions, logout and missing-configuration behavior. It uses synthetic auth settings and disables Google reporting credentials; it does not establish a live Google sign-in.
3. Run `npm test`, `npx tsc --noEmit`, and the production build. Check changed files with ESLint; existing unrelated lint failures should be recorded separately.
4. After configuring the Google client, sign in locally as `info@caminolegal.com.mx`, try an unlisted account, verify logout and expired-session recovery, and confirm the browser never receives provider credentials.
5. Configure production secrets and both callback settings, then deploy only when requested and repeat the real sign-in check on the production origin.

This access layer supersedes the historical authentication deferral in the original dashboard spec and setup. Source implementation and local synthetic checks do not prove production deployment or a successful live OAuth callback.
