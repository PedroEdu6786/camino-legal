# Google website summary — contract and scope

User requested visitors, page views and bounce rate as visible dashboard metrics. This is a scoped reporting slice of phase 3; it does not complete discovery, Meta reporting, all breakdowns, comparison periods or production reconciliation.

## Internal read contract

- `GET /api/admin/analytics/summary?days=7|28|90`, default 28 complete days.
- Custom range: `start=YYYY-MM-DD&end=YYYY-MM-DD`, 1–90 complete days; dates interpreted in the configured property timezone.
- Property, stream, timezone and credentials come from server environment configuration, not request-supplied resource IDs.
- Return provider/resource/period/timezone/retrieval metadata, per-metric values or explicit unavailable state, and safe limitations. Retained reports must keep their original query identity.
- Auth remains deferred per user instruction. No provider settings, tracking events or account resources are mutated.

## Metric meanings

| Spanish label | GA4 API metric | Meaning / rendering |
|---|---|---|
| Visitantes | `totalUsers` | Distinct users with at least one event in the selected web scope; not daily users summed and not `activeUsers` |
| Vistas de página | `screenPageViews` | Views restricted to the selected web stream and web platform; repeat views count |
| Tasa de rebote | `bounceRate` | Non-engaged sessions divided by sessions; fraction 0.375 displays 37.5% with Spanish locale formatting |
| Sesiones | `sessions` | Same unfiltered-by-event report scope; zero sessions makes bounce rate unavailable |

Lead/intent event filters must not be applied to this aggregate report because they would change the population underlying users and bounce rate. Those reports remain separate work. Empty, partial and withheld results are not automatically zero.

## Upstream contract

- `POST https://analyticsdata.googleapis.com/v1beta/properties/{numericPropertyId}:runReport`.
- Four metrics above, one date range, no dimensions, explicit `streamId` and `platform=web` filters.
- Read metric values by matching returned header names; inspect metadata for processing/threshold/sampling/truncation limitations and timezone.
- Fixed official Google OAuth token endpoint for service-account credentials; provider access remains read-only. Never honor an arbitrary token endpoint from untrusted JSON.
- No production credentials or values appear in test fixtures, simulation logs or this document.

## Verification sources

- [Google metric schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema).
- [runReport request/response](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport).
- [Response metadata](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData).
- Orbit returned an unrelated Matomo endpoint; it was not adopted.
- Postman owner-mock search could not run because this CLI has no login. The local stand-in models the documented Google request/response shape, not a provider-owned implementation.

## Local simulations

- `postman/simulations/google-summary.sim.yaml`: synthetic successful response with 120 visitors, 340 page views, 160 sessions and 0.375 bounce fraction.
- `postman/simulations/google-summary-error.sim.yaml`: injected 503 failure.
- The simulations exercise the real reader through HTTP; they do not establish actual account access or reconcile live Google results. Execution outcomes are recorded after running, not inferred from the fixtures.

## Configuration

For the setup checklist and current handoff, see [SETUP.md](../SETUP.md). The user's GA4 screenshot confirmed Mexico City Time: configure `America/Mexico_City`.

Set server-only `GOOGLE_ANALYTICS_PROPERTY_ID` (numeric property ID), `GOOGLE_ANALYTICS_STREAM_ID` (numeric web stream ID), and `GOOGLE_ANALYTICS_TIME_ZONE` (the property's exact IANA timezone). Supply either `GOOGLE_ANALYTICS_CREDENTIALS_JSON` with a service account granted read access to the property, or `GOOGLE_ANALYTICS_ACCESS_TOKEN` with analytics read scope. Measurement IDs beginning with `G-` are not numeric property or stream IDs. Never use a `NEXT_PUBLIC_` variable for credentials.

The reader enforces a 15-minute per-resource cooldown and bounded cache within one process. Shared enforcement across instances and restarts remains a production-host task. Provider reporting latency is independent of refresh eligibility.

## Recorded results — 2026-10-24

- Nine summary contract tests passed; lint, TypeScript validation and production build passed.
- Local Postman success simulation returned actual HTTP 200 through the reader, validated all four metrics, cache reuse and changed-period deferral. The injected-error simulation returned actual HTTP 503 and unavailable values without leaking credentials.
- Responsive inspector captured desktop (1440), tablet (768) and mobile (390), with no findings or console errors. Screenshots reviewed for layout; this does not complete the interactive acceptance walkthrough.
- The local application endpoint returned the explicit `not_connected` state. Live account figures and console reconciliation remain unverified in this environment.
- No deployment or provider mutation performed.
