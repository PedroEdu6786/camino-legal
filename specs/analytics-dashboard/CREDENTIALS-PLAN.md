# Plan: create `GOOGLE_ANALYTICS_CREDENTIALS_JSON`

Written 2026-11-03. Goal: replace the temporary one-hour `GOOGLE_ANALYTICS_ACCESS_TOKEN` with a durable, read-only service-account key so `/admin/analitica` stays connected.

This supersedes the credential steps in [SETUP.md](SETUP.md) §2–3 only where they differ. No credential, token or key value belongs in this file, in chat, in source or in Git.

Current progress: the service account and local JSON configuration are in place. After enabling the Data API, live summary and insights both return `available`, with all seven insights slices present. See [connection evidence](evidence/service-account-connection.md). Dashboard login separately requires the OAuth web client from [AUTH-SETUP.md](AUTH-SETUP.md).

## Verified identifiers (read from the GA4 Admin API on 2026-11-03)

| Item | Value |
|---|---|
| Account | `accounts/397941897` (Camino Legal) |
| Property ID → `GOOGLE_ANALYTICS_PROPERTY_ID` | `541634908` |
| Web stream ID → `GOOGLE_ANALYTICS_STREAM_ID` | `15069768375` (Camino Legal (WEB), `https://caminolegal.com.mx`) |
| Measurement ID → `NEXT_PUBLIC_GA4_ID` | `G-5HSW700C07` |
| Reporting time zone → `GOOGLE_ANALYTICS_TIME_ZONE` | `America/Mexico_City` |

The property ID `541253827` that was previously in `.env` does not exist under this account and returned `403`. It has been corrected.

## What the app needs

`app/lib/server/dashboard/googleAccess.ts` signs a JWT with the service account and exchanges it at Google's fixed token endpoint for the scope `analytics.readonly`. It accepts the key only when `type` is `service_account` and both `client_email` and `private_key` are present. It ignores any `token_uri` in the file. If `GOOGLE_ANALYTICS_ACCESS_TOKEN` is also set, the access token wins, so it must be removed once the key works.

## Steps

### 1. Prerequisites (who and what)
- A Google account that can manage **Property access** on the GA4 property (Administrator role there).
- A Google Cloud project to host the service account. Prefer a project dedicated to Camino Legal over a personal or shared one.
- Decide the owner who will rotate the key (see §6).

### 2. Create or choose the Cloud project
1. Open https://console.cloud.google.com/ and select or create the project.
2. Note the project ID. Billing is not needed for the Analytics Data API.

### 3. Enable the API
1. **APIs & Services → Library → Google Analytics Data API → Enable.**
2. Optional: also enable **Google Analytics Admin API** only if a future discovery feature will read accounts and properties. The current dashboard does not need it.

### 4. Create the service account
1. **IAM & Admin → Service Accounts → Create service account.**
2. Name: `camino-analytics-reader`. Description: "Read-only GA4 reporting for /admin/analitica".
3. Grant no project roles. Finish.
4. Copy the email, which ends in `.iam.gserviceaccount.com`.

### 5. Grant GA4 read access
1. In Google Analytics, open the property `541634908`.
2. **Admin → Property access management → + → Add users.**
3. Paste the service-account email, role **Viewer**. Do not use Editor or Administrator. Do not notify by email.

### 6. Create the key
1. Open the service account → **Keys → Add key → Create new key → JSON → Create.**
2. A file downloads once. Google cannot show it again.
3. If key creation is blocked by an organization policy (`iam.disableServiceAccountKeyCreation`), stop. Do not change the policy. Record the constraint and choose an alternative (see "If keys are blocked").

### 7. Install it locally
1. Convert the file to one line, preserving the `\n` escapes in `private_key`:
   ```sh
   jq -c . ~/Downloads/<key-file>.json
   ```
2. In `.env.local` (gitignored by `.env*`) set:
   ```dotenv
   GOOGLE_ANALYTICS_CREDENTIALS_JSON='<the one-line JSON>'
   ```
3. **Delete** `GOOGLE_ANALYTICS_ACCESS_TOKEN` from `.env.local`.
4. Move the downloaded file into a password manager or encrypted store, then delete it from `~/Downloads`.
5. Restart `next dev`. Environment changes are not hot-reloaded.

### 8. Verify
1. `GET /api/admin/analytics/summary?days=28` returns `state: available`, with `resourceId` `541634908` and `streamId` `15069768375`.
2. `GET /api/admin/analytics/insights?days=28` returns `state: available` with all slices non-null.
3. Reconcile visitors, page views, sessions and bounce rate in GA4 (Reports → Reports snapshot) for the same stream, time zone and complete days.
4. Check the response bodies do not contain the key, `client_email` or `private_key`.
5. Run `npm test` (the service-account path is covered by `tests/dashboard-summary.test.mjs`).

Failure guide:

| Symptom | Likely cause |
|---|---|
| `not_connected` | A variable is missing or the JSON is invalid. |
| `forbidden` (403) | The service-account email lacks Viewer on the property, or the Data API is not enabled in the key's project. |
| `error` | Malformed `private_key` (lost `\n` escapes), or the clock is wrong. |
| `deferred` | Within the 15-minute cooldown. Wait for `nextRefreshAt`. |

### 9. Deploy (separate authorization required)
1. Add the same four server-only variables in the hosting platform's secret store: `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_ANALYTICS_STREAM_ID`, `GOOGLE_ANALYTICS_TIME_ZONE`, `GOOGLE_ANALYTICS_CREDENTIALS_JSON`.
2. Never use a `NEXT_PUBLIC_` prefix for any of them.
3. Redeploy, then repeat §8 against the deployed URL.
4. Configure and verify the implemented dashboard authentication using [AUTH-SETUP.md](AUTH-SETUP.md) before serving the dashboard with live credentials. The original auth deferral has been superseded; Google OAuth login configuration remains separate from this reporting key.

## Security rules
- Read-only scope only (`analytics.readonly`). The account holds no project roles.
- One key per environment (local and production), so one can be revoked without breaking the other.
- Never log, echo or commit the JSON. Tests use synthetic keys only.
- Treat any key pasted into a chat or ticket as compromised and rotate it.

## Rotation and revocation
- Rotate every 90 days, or immediately after any suspected exposure: create a new key, install it, verify, then **delete the old key** in the Cloud console (Keys tab).
- Record the key's creation date and owner in the team's secret store. No dates or IDs go in this repository.
- To revoke access entirely, remove the service-account email in GA4 Property access management.

## If keys are blocked
1. Ask the organization administrator for an exception for this one project, or
2. Use Workload Identity Federation from the hosting platform, which needs a code change in `googleAccess.ts` (new task, not part of this plan), or
3. Keep the short-lived access-token bridge for local checks only. It is never a production configuration.

## Cleanup after success
- Revoke the OAuth Playground refresh token at https://myaccount.google.com/permissions.
- Delete `~/.config/camino-legal/ga-refresh-token` and `.env.local`'s `GOOGLE_ANALYTICS_ACCESS_TOKEN`.
- Tick the verification items in [SETUP.md](SETUP.md) §4 and record the reconciliation in `evidence/` without secrets.

## Done when
- [ ] Service account exists with no project roles and GA4 Viewer on property `541634908`.
- [ ] A key is stored in the team secret store; the downloaded file is deleted.
- [ ] Local summary and insights endpoints return `available`; figures reconcile with GA4.
- [ ] Access token and refresh token are removed and revoked.
- [ ] Production variables are set, and the admin routes are protected, before any deployment.
