# Analytics operations and release checklist

Application implementation and local evidence do not establish production provider configuration, inbox delivery, or retained hosting logs. Deployment is separate.

## Configuration

| Setting | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GA4_ID` | Reviewed GA4 web stream ID, `G-…`. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Reviewed numeric Meta Pixel ID. |
| `NEXT_PUBLIC_ANALYTICS_PROVIDERS_REVIEWED=true` | Enables browser providers only after the account and SDK privacy checks below. Build-time flag; rebuild to change. Omit until reviewed. |
| `ANALYTICS_SERVER_SECRET` | Dedicated random server-only secret of at least 32 bytes for consent signatures and authenticated-encrypted conversion receipts. Never expose through `NEXT_PUBLIC_`. Rotation invalidates existing consent evidence/receipts. |
| `META_ACCESS_TOKEN` | Existing server-only Meta token; never log it or put it in browser configuration. |
| `META_GRAPH_API_VERSION` | Explicit supported `vN.N` version approved against Meta's current documentation. No implicit version is selected. |
| `META_WEBSITE_ORIGIN` | Trusted HTTPS site origin without query, credentials, or non-root path, e.g. `https://caminolegal.com.mx`. CAPI uses this plus a registered form path; never the request Host or a submitted absolute URL. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Existing email transport. SMTP remains independent of marketing configuration/consent. |

Missing/short signing secret disables server marketing evidence and receipts, not email. Missing provider settings disable that destination. Browser provider review does not authorize server Meta activation: verify both separately before supplying all server credentials/version/origin. Website source and a bounded request user agent stay in the restricted encrypted-receipt/Meta lane, outside generic events and logs; missing website evidence disables the handoff.

## Launch checks requiring the production owner

- Identify the GA4/Meta reporting owner and deployment log administrator; record their approvals in release evidence.
- Disable GA4 Enhanced Measurement history page views, automatic forms, outbound clicks, and overlapping scroll collection. `send_page_view:false` alone does not disable history collection. Use application-owned page views and inspect actual SDK requests.
- Inspect actual provider initialization, automatic traffic, locations, referrers, titles, and custom payloads with synthetic personal-data canaries. Do not enable browser providers until safe behavior is demonstrated. The GA disable flag is set before revocation; consent-mode denial alone is insufficient to promise no cookieless traffic.
- Meta browser measurement is suppressed for query/hash URLs, unknown paths, unsafe referrers, and stale queued events from another path. SDK implicit URL collection cannot be made safe by a custom `page_location` override. Separately eligible CAPI handoffs do not depend on Pixel readiness.
- Confirm the supported Meta Graph version and permissions, and validate `Lead`/matching browser `eventID` and server `event_id` in Events Manager. Local fake SDKs/HTTP simulations do not establish live deduplication.
- Register `lead_submitted` as the single GA4 lead key event; retire the overlapping `contact_form_submit` conversion. Keep channel intent events out of accepted-lead totals.
- Approve analytics and operational-log retention periods and access roles. Demonstrate a real hosting export/search before claiming production reporting. No deployment platform is assumed.
- Record the deployment/cutover date, schema version `1`, old-to-new event mapping, and baseline reset for evaluation coverage. Do not compare old contact-only totals directly with new contact + evaluation totals.

## Operational email reporting

The server emits content-free JSON `email_attempted` and `email_result` lines. Each has a server-generated logical `submission_id`, a distinct transport `attempt_id`, form kind, and `attempt_number` 1 or 2. Results distinguish `accepted`, `recipient_rejected`, `transport_failure`, and `unknown`. These records exist regardless of marketing consent; never enrich them with addresses, messages, campaign history, or matching hashes.

Exactly one automatic retry follows an unknown transport outcome. Both attempts belong to one submission and can produce at most one canonical lead. Possible duplicate messages are accepted. If the retry fails after an earlier unknown, the logical result stays unknown because the first message may have been accepted. Analytics/logging failures never trigger SMTP retries. Confirmed recipient rejection or known pre-send failure does not trigger this automatic retry.

Extract the structured message field from the actual host's logs into NDJSON, then run:

```sh
node scripts/email-report.mjs /path/to/extracted-email-records.ndjson
node scripts/email-report.mjs /path/to/extracted-email-records.ndjson SUBMISSION_UUID
node scripts/email-report.mjs /path/to/extracted-email-records.ndjson > email-totals.json
```

The first command exports totals; the second finds safe attempt records for one submission. Malformed/unrelated lines are counted as ignored, never echoed. Repeated event records are deduplicated. Confirm extraction completeness and time bounds; missing logs are not zero sends. Investigate unresolved submissions through the firm’s existing email process before deciding whether another manual send is necessary. SMTP acceptance does not prove inbox delivery, opens, or replies.

Before launch, demonstrate: accepted submission lookup, both retry attempts under one submission, unresolved lookup, totals export, authorized access, retention, and the host’s delivery limitations. Attach evidence without message contents or credentials.

## Business reporting definitions

| Question | Definition |
| --- | --- |
| Which pages/services attract interest? | Eligible `page_view` by canonical page/type/service; `service_select` and deliberate service CTAs. Displayed defaults are distinct from expressed interest. |
| How many engage with a quotation? | Distinct technical `quote_id` with `quote_change`, `quote_request_intent`, or `evaluation_open`; denominator distinct qualified `quote_view` instances. Do not register IDs as dimensions. |
| Which configurations matter? | Actual calculator snapshots, integer MXN cents, classes/rules/payment controls. Custom proposal amounts remain unknown/null, never zero revenue. |
| Where do forms lose visitors? | Qualified `form_view` → first `form_start` → deliberate `form_submit_attempt` → accepted `lead_submitted`, separately by form. State the denominator for each rate. |
| How many requests succeeded? | Distinct operational submissions with confirmed acceptance. Keep unknown and failed submissions separate. Marketing totals cover consented, observable accepted submissions only. |
| What produced the visits? | Explicit bounded `session_source`, `session_medium`, `session_campaign` categories; service context explicit/referral/displayed default/unspecified. Canonical URLs remove raw UTMs/referrers, so provider-native attribution may differ. |
| What content helps? | Qualified sections/actual trademark steps and deliberate FAQ/process/review actions. No arrow frames, raw scroll stream, or autoplay interactions. |

Low-cardinality reporting dimensions: page type/canonical path, service/context, source surface, action/content ID, form kind, control ID, safe failure category, quote type, classes/payment count/rules, and acquisition categories. Event/page/form/attempt/quotation IDs remain technical correlation parameters; never register them as report dimensions.

## Repeatable local checks

Use Node 26 (native TypeScript stripping) and the installed Chrome/Chromium for browser checks. `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` cover native contracts and build integration. Browser checks require a dedicated synthetic-config server and local SMTP fixture, never production SMTP; see `tests/analytics-browser.mjs`.

Build and start the isolated browser target in separate terminals, then run the harness. The harness owns the SMTP fixture on loopback port 4525; leave that port free. These are synthetic settings, not production credentials:

```sh
NEXT_PUBLIC_ANALYTICS_PROVIDERS_REVIEWED=true NEXT_PUBLIC_GA4_ID=G-TEST123 NEXT_PUBLIC_META_PIXEL_ID=123456 npm run build
ANALYTICS_SERVER_SECRET=synthetic-browser-secret-32-bytes-long META_WEBSITE_ORIGIN=https://site.example.test SMTP_HOST=127.0.0.1 SMTP_PORT=4525 SMTP_USER=test@example.test SMTP_PASS=test SMTP_SECURE=false META_ACCESS_TOKEN= META_GRAPH_API_VERSION= npm start -- --port 3001
ANALYTICS_TEST_URL=http://localhost:3001 ANALYTICS_TEST_SMTP_LOCAL_ONLY=1 npm run test:browser
```

Do not deploy the synthetic build. Rebuild with the reviewed deployment settings for release. Browser fixtures never establish real provider-account readiness.

Postman local simulations model only the Meta HTTP contract used here, not a full Meta implementation. Narrowed public Orbit discovery found Meta’s send-events endpoint, but its integration brief could not establish user-agent/deduplication requirements and its example version was stale; no owner mock was obtained. Official Meta documentation was rate-limited during implementation; supported Graph version, required-field review, and live mapping approval remain gates. No Postman workspace publishing is needed.

```sh
postman simulation run postman/simulations/analytics.sim.yaml --port 4901 --output ndjson
META_SIMULATION_URL=http://127.0.0.1:4901/meta node tests/analytics-meta-simulation.mjs
postman simulation run postman/simulations/analytics-error.sim.yaml --port 4902 --output ndjson
META_SIMULATION_URL=http://127.0.0.1:4902/meta META_SIMULATION_MODE=error node tests/analytics-meta-simulation.mjs
postman simulation run postman/simulations/analytics-slow.sim.yaml --port 4903 --output ndjson
META_SIMULATION_URL=http://127.0.0.1:4903/meta META_SIMULATION_MODE=timeout node tests/analytics-meta-simulation.mjs
```

Keep synthetic simulation logs out of Git. Production personal data/credentials must never be used with these fixtures. Requests already sent cannot be recalled; the fresh post-SMTP handoff narrows consent races but does not provide instantaneous global revocation across in-flight requests.
