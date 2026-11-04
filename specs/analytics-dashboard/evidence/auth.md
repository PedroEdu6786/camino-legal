# Reader authentication verification — 2026-11-03

Implemented Google sign-in with an explicit server-side reader allowlist, separate GA4 reporting credentials, encrypted eight-hour sessions, Spanish access states and logout. The dashboard checks authorization before building inventory; summary and insights handlers use the same authorization-first reporting wrapper. A session endpoint supports expiry/revocation handling in open tabs.

## Verified locally

- `npm test`: **80 passed**, including seven focused auth tests. The full suite required localhost permission for its existing SMTP tests.
- `npx tsc --noEmit`: passed.
- ESLint on all auth-related TS/TSX/MJS changes: passed.
- `npm run build`: default Turbopack production build passed, including the dynamic login, dashboard, reporting, session and OAuth routes. The sandbox attempt stalled; the network-enabled retry passed. An optional webpack attempt hit an existing pure-selector error in `app/color-lab/color-lab.module.css`; no unrelated CSS was changed.
- `node tests/dashboard-auth-runtime.mjs`: production Next.js HTTP checks passed for every current reader API, denied-page redirects, authorized server-rendered inventory, private/no-store caching, logout cookie clearing, and missing-configuration denial. Tests use encrypted synthetic sessions and blank reporting credentials, with no Google OAuth/GA4 calls.
- `AUTH_TEST_INSPECT=1 node tests/dashboard-auth-runtime.mjs`: passed with the actual login screen inspected at 1440, 768 and 390px. Screenshots reviewed; no overflow or obscured controls. Inspector: zero failures, two warnings for the existing brand's warm palette and intentional empty space around the single sign-in action. Temporary screenshots: `/private/tmp/camino-auth-inspect/`.
- `git diff --check`: passed.

## Remaining external verification

The approved production origin is `https://caminolegal.com.mx`; the initial reader is `info@caminolegal.com.mx`. Local `.env.local` has the localhost origin, reader allowlist, generated private session secret and the subsequently downloaded OAuth web-client credentials, installed without displaying values. The client JSON registers both documented callback URLs. Live local initiation on `localhost:3000` passed: sign-in screen HTTP200, Google authorization redirect HTTP302, exact localhost callback, only `openid email` scopes, PKCE S256 and HttpOnly auth cookies. No account login or final OAuth callback was performed by the probe. Full Google login/callback, production secret configuration and deployment remain unverified. See [activation instructions](../AUTH-SETUP.md).

## Existing repository/tooling limitations

- Full `npm run lint` reports an unrelated `react-hooks/set-state-in-effect` error and effect dependency warning in `TermsModal.tsx`; the auth files pass their scoped lint check.
- Production dependency audit reports advisories in existing dependencies, including Nodemailer. Auth.js inherits Nodemailer's audit classification through its optional mail-provider peer; this change enables Google login only. No dependency-wide remediation was included.
- The installed Postman CLI does not recognize `postman status`; that command could not establish workspace health. The access contract is documented locally and verified by the native tests and running Next.js HTTP checks.
- No commit, push or deployment was performed; pre-existing reader changes in this checkout were preserved.
