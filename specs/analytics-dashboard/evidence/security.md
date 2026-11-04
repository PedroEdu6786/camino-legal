# Reader security validation — 2026-11-03

Scope: Google reader login, encrypted sessions, summary/insights/session endpoints, service-account access, local credential handling and production dependency inventory. No production deployment or cloud policy changes were performed. This is a bounded application review, not a penetration-test certification.

## Fixes and repeatable checks

| ID | Severity | Confidence | Finding | Result |
| --- | --- | --- | --- | --- |
| SEC-SAST-001 | Low | High | Admin responses lacked framing, MIME and referrer protections | Added DENY/frame-ancestors, nosniff, no-referrer, restricted browser permissions and noindex headers to admin/auth routes. Runtime assertions pass. CSP here is limited hardening, not a complete script allowlist. |
| SEC-SAST-002 | Low | High | Google helper followed redirects and did not independently constrain destinations | HTTPS exact-host allowlist and redirect:error prevent forwarding credentials to redirected destinations. Regression tests reject arbitrary hosts, ports, userinfo and metadata URLs before fetch. |
| SEC-SAST-003 | Low | High | Malformed callback URLs could throw; JWT callback accepted nonfinite/far-future expiry | Fixed destination fallback and tightened identity/expiry checks. Existing report authorization already rejected invalid expiry. |

Run `npm run test:security` for focused regressions. Run `npm run build` then `npm run test:security:runtime` for the actual production Next.js boundaries using synthetic credentials and encrypted sessions.

Validated:
- Verified Google email and exact allowlist; outsiders, tampered/wrong-secret/expired cookies and removed readers denied before report fetching.
- Absolute eight-hour sessions; client session updates cannot replace identity or extend expiry; provider access/refresh tokens excluded from session.
- Fixed callback origin despite forwarded-host spoofing; malformed/external redirect destinations never become redirects to attacker hosts.
- Missing CSRF cannot start Google OAuth or clear session cookies; forged callback cannot issue a session. Valid logout clears cookie.
- Secure, HttpOnly, SameSite=Lax auth cookies under production HTTPS configuration; no permissive CORS on protected routes.
- Private/no-store responses, generic errors, denied dashboard omits inventory, unsupported report POST returns 405.
- Service-account assertion uses analytics.readonly and ignores credential-provided token_uri (existing summary test).
- Versionable files scanned for Google credential payloads/private keys. Downloaded credential filenames now ignored; local .env.local remains ignored and mode 0600. This pattern scan is not a complete historical secret scan.
- Browser build artifacts checked against actual configured secrets without printing their values; no matches.

Results: full `npm test` **83/83 passed**; scoped ESLint and `git diff --check` passed; production build including TypeScript passed; expanded production runtime suite passed. Runtime suite does not complete an interactive Google login or call live GA4.

## Open release checks

| ID | Severity | Confidence | Concern | Required action |
| --- | --- | --- | --- | --- |
| SEC-SCA-001 (initial finding; production remediated below) | Critical (registry rating) | High for installed-version match | `npm audit --omit=dev` reports 9 affected dependency entries: 1 critical, 7 high, 1 moderate. Next 16.2.3 is critical; other entries include nodemailer, inherited auth entries, sharp and PostCSS. This is inventory evidence, not proof every advisory is exploitable here. | Upgrade and regression-test the framework/dependency stack before release. Audit proposes Next 16.4.5; do not use force-fix (it proposes an incompatible next-auth downgrade). No dependency risk acceptance is implied. |
| SEC-SECRETS-001 | Medium | High for prior exception; current cloud state unverified | Project service-account key-creation restriction was disabled to issue the key | Restore restriction after issuance; verify effective policy. Keep downloaded JSON files in protected storage and configure deployment secrets privately. Existing-key access is separate from issuance policy. |

Full Google user callback, production HTTPS/HSTS/proxy configuration, secret-store permissions, cloud IAM effective grants and deployment behavior still require verification. Stateless logout deletes this browser's cookie; a copied valid cookie remains usable until expiry, allowlist removal or AUTH_SECRET rotation. No per-session revocation store is claimed.

No applicable exception file or shared review log was present at the skill's legacy location. Evidence is kept with this project.

## Dependency remediation — 2026-11-03

Upgraded Next.js and eslint-config-next from 16.2.3 to 16.4.5, Nodemailer from 8.0.5 to 10.3.1, and compatible transitive packages via npm audit fix. package-lock.json records the resolved tree. Production audit now reports **zero vulnerabilities**, including critical/high/moderate.

NextAuth and @auth/core still declare optional Nodemailer peer ranges limited to versions 7/8. Scoped overrides select the app's patched Nodemailer 10.3.1. This app uses Google authentication, not the Auth.js email provider. The app's synthetic SMTP delivery test, auth runtime suite, all 83 tests, production build/typecheck, and scoped ESLint passed. Do not add an Auth.js email provider without rechecking this override.

Full audit retains **16 moderate development dependency entries**, all resulting from GHSA-g3hv-75wg-m249 (minimatch globparts amplification). These are lint tooling dependencies, not production runtime dependencies. The patched minimatch 11 API is incompatible with current eslint-plugin-import callers that invoke the module as a function; global override would break those consumers. npm's force-fix proposes obsolete eslint/config downgrades and was not used. This remains open pending compatible upstream updates; no risk acceptance or zero-vulnerability claim for the full development tree is implied.
