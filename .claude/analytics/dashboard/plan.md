# Analytics dashboard and tracking inventory

> Superseded planning input: the council-reviewed specification and design are at [`specs/analytics-dashboard/`](../../../../specs/analytics-dashboard/spec.md). Follow that package for current scope. The user subsequently deferred authentication and accepted Meta's explicit reporting fallback and active/legacy/excluded asset inventory.

Status: planning draft, 2026-10-23. No implementation or provider-account changes authorized by this document.

## Problem and agreed scope

Camino Legal needs one place to understand website performance and establish what is configured in Google and Meta, what the application intends to send, and what the providers actually observe.

User confirmed both the inventory and performance dashboard belong in v1. Website tracking comes first; advertising accounts, campaigns and spend are deferred. Proposed route: `/admin/analitica`, private and Spanish-language. Access audience and login method remain to be confirmed.

## Current evidence

- `app/lib/measurement/contracts.ts` defines 27 canonical event names, five services and canonical public page identities. The existing measurement catalog covers eleven URLs and seven page types.
- `app/lib/analytics.ts` sends the detailed catalog to GA4. Meta receives `page_view` as `PageView`, `lead_submitted` as `Lead`, and WhatsApp/email/quotation request intent as `Contact`. Other events intentionally have no Meta destination.
- `app/lib/metaCapi.ts` sends accepted, eligible lead receipts through Meta CAPI. It is a send integration, not a reporting integration.
- `.claude/analytics/site-expansion/operations.md` defines provider readiness, the canonical GA4 lead key event, safe dimensions, operational email reporting and production gates.
- Existing verification is local evidence. Repository documentation explicitly leaves production account configuration, actual SDK collection, Meta deduplication and hosting-log export unverified. This planning session did not inspect live accounts or deployment configuration.
- No admin authentication or reporting datastore was found in the reviewed application and dependencies. Existing consent signatures are not an admin identity system.

## Page experience

Use the existing warm cream/burgundy brand, with a compact admin layout and responsive tables. Keep public navigation unchanged. Suggested title: **Analítica del sitio**.

Global controls: date range (7/28/90 days and custom), comparison with previous equal-length period, provider filter, last successful refresh, and a bounded refresh action. Default to the last 28 complete days in the reporting property's timezone. Clearly distinguish reporting period from retrieval time.

| Area | Questions answered | Content |
| --- | --- | --- |
| Resumen | What attracts visits and contact interest? | GA4 users, sessions, views and observed `lead_submitted` events; trend; leading pages/services; acquisition breakdown; separate WhatsApp/email intent counts. Meta results appear separately only where verified read access supports them. |
| Cuentas y configuración | What belongs to Camino Legal, and where? | GA account, numeric property ID, web stream and measurement ID; Meta business and dataset/Pixel IDs where confirmed; domain/environment, responsible owner, provider links, access state and verification date. |
| Eventos y conversiones | What do we expect, configure and observe? | Searchable canonical event catalog, Spanish meaning, trigger, page/service scope, GA4 and Meta mapping, expected key-event/custom-dimension configuration, observed count and evidence source. |
| Estado del seguimiento | What needs attention? | Missing required configuration, inaccessible provider, outdated evidence, expected versus actual registration drift, cutover status, and links to concrete verification steps. |

An event detail drawer explains its trigger and lead/intent/engagement classification. Keep the full event catalog available even when reporting access is unavailable.

## Requirements

1. Protect the page and every reporting handler on the server using an approved team identity mechanism and an explicit allowlist/role. No public signup. Exclude the route from indexing and marketing collection; neither hiding a link nor `noindex` supplies authorization.
2. Reuse the existing measurement contract/catalog for expected tracking. Do not create a second handwritten event registry that can drift.
3. Separate application implementation, environment configuration, provider registration and provider observation. A configured ID or successful SDK call proves neither provider receipt nor report availability.
4. Show registration as applicable: GA4 key events and custom dimensions need configuration evidence; ordinary events and Meta standard events must not all be labeled as requiring a registration. Intentionally unmapped Meta events display “No aplica”.
5. Record source and time for each verification. Distinguish API-verified evidence from dated manual owner verification. Manual evidence never appears as a live automated check.
6. Separate `not_connected`, `forbidden`, `unsupported`, `error`, `stale`, `no_observations` and a successfully measured zero. Partial provider failure must preserve other results.
7. Never sum GA4 and Meta leads into a unique-lead total. Their coverage, consent, attribution and reporting semantics differ. A channel click is intent, not a confirmed lead or sale. SMTP acceptance is not inbox delivery.
8. Show GA4 `lead_submitted` as observed marketing lead events. An all-submission operational total requires a verified hosting-log source; until then show it as unavailable. Keep unknown and failed operational outcomes separate if that source is added.
9. Preserve safe, low-cardinality reporting dimensions. Never register event, page-view, form-instance or quotation IDs as custom dimensions. No raw messages, email addresses, phone numbers or matching hashes in the dashboard.
10. Display metric definitions, source, timezone, available coverage and processing limitations. An absence of observations is not automatically a tracking failure, particularly for low traffic or denied consent.
11. Exclude test/development data; show the production cutover date and avoid unqualified comparisons between legacy contact-only and expanded contact/evaluation coverage.
12. Treat all provider connections as read-only in v1. No creation/deletion of conversions, event registration or account settings from the dashboard.

## Architecture and integrations

Stay within the existing Next.js application. Add a protected admin surface, server-side provider adapters and a small normalization layer. Read installed Next.js documentation before choosing concrete framework APIs during implementation.

**Google:** use Analytics Admin API to inventory accessible accounts/properties/streams, key events and custom definitions; use Analytics Data API for aggregate reports. Numeric property ID and `G-…` measurement ID are different identifiers. Use a server-managed identity granted read-only access to the intended property, with credentials outside the browser and repository. Choose the deployment-supported credential mechanism during discovery.

**Meta:** start with verified dataset/Pixel identity, current event mapping and dated configuration/deduplication evidence. Validate exactly which website-event counts or diagnostics are readable for the actual account and supported Graph version before promising automated charts. Existing CAPI send credentials do not establish reporting permission. Where read access is unsupported, show a clear limitation and a provider-console link; do not substitute advertising conversions for website-event counts.

**Reporting:** retrieve bounded aggregate reports, cache them briefly (proposed 15 minutes) and expose independent per-provider freshness/error states. Refresh must be rate-limited; secrets and raw provider errors stay server-side. Store last successful results only in storage appropriate to the actual host. If no durable snapshot exists after a restart, report unavailable instead of fabricating a last-known value.

**Registry:** initially keep the reviewed expected configuration and non-secret ownership metadata in a versioned manifest; combine it with runtime/API evidence. The existing event contract remains the source of event names/mappings. A new database or warehouse is not required solely for v1; durable verification history is a separate decision if needed.

Logical report contract: `source`, `resourceId`, `period`, `timezone`, `retrievedAt`, `lastSuccessAt`, `status`, `metrics`, `coverage`, and safe `limitations`. Metric values are nullable when unavailable. Validate date ranges and allowlist requested dimensions. Internal interfaces must enforce authorization before reading provider data or caches.

Do not call basic ratios of aggregate event totals a user-level sequential funnel. Start with form-stage event counts and clearly defined rates. A true same-session/instance ordered funnel requires a verified supported reporting method and is deferred until that feasibility is established.

## Delivery phases and exit criteria

### 1. Inventory and feasibility

Identify real GA4 property/stream, Meta dataset/Pixel, owner, production deployment and access mechanism. Compare account settings with the existing operations checklist. Verify read-only reporting capability and document which metrics each provider can supply. Exit: an evidence-backed inventory with explicit unknowns, plus a signed-off metric/source matrix. No secrets in documents.

### 2. Protected page and tracking inventory

Establish admin access, build the responsive page shell and event catalog, show provider mappings and registration/evidence states. Exit: unauthorized page and data access is denied, secrets remain server-side, and expected coverage matches the existing contract.

### 3. Performance reporting

Add GA4 aggregate reporting and confirmed Meta read capabilities. Add date filters, comparison periods, definitions, caching and independent error states. Exit: values reconcile against each provider using the same period, timezone, filters and reporting identity; unavailable metrics remain visibly unavailable.

### 4. Tracking health and release verification

Add configuration drift checks, last-verification evidence and actionable diagnostics. Recheck current production gates with the owner, including lead key-event setup, legacy conversion cutover and Meta deduplication. Exit: a production smoke check establishes what is actually configured and observed, and no provider outage affects public contact/evaluation flows.

## Verification strategy

- Unit checks for catalog coverage, provider mapping, evidence-state transitions, null versus zero, and allowed filters.
- Authorization checks for direct page loads and all data endpoints, including cached responses.
- Provider contract tests with sanitized fixtures: pagination, permission denial, expired credentials, rate limiting, timeout, empty reports, partial data and schema changes.
- Browser checks for range selection, responsive tables, accessible drawer, independent stale/error states and no admin marketing events.
- Live read-only reconciliation against provider consoles. Local fixtures establish UI/adapter behavior only, not account readiness.
- Existing site tests remain regression coverage for consent and contact/evaluation flows when shared code changes.

## Deferred scope

Google Ads and Meta Ads spend/campaign/ROAS reporting, Search Console, social-profile insights, CRM/revenue attribution, a tracking warehouse, visitor-level timelines and automated writes to provider configuration. Revisit advertising only after website inventory and reporting are trusted and the user requests it. Record other discovered assets as out of scope rather than implying they do not exist.

## Open decisions

- Which people should access the page, and which identity provider can they use?
- Who owns the Google/Meta assets and can grant read-only access? Discover accessible assets, then explicitly select the intended production ones; never automatically use the first account.
- Where is production hosted, and what secret management, cache and log export facilities are available?
- Which Meta website reporting capabilities are available for this account? This is the main integration uncertainty.
- Is a versioned configuration manifest sufficient, or is durable admin-editable ownership/verification history needed?

## Research evidence and limits

Google documents configuration discovery in its [Admin API](https://developers.google.com/analytics/devguides/config/admin/v1/rest), read-only [key-event listing](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties.keyEvents/list), and aggregate reporting in its [Data API](https://developers.google.com/analytics/devguides/reporting/data/v1). These are separate data sources for inventory and performance.

Public API discovery through Postman Orbit returned unrelated Coveo endpoints for the Google query, so none were adopted. Official Google documentation supplies the capability evidence above. The official Meta documentation request was rate-limited; no Meta reporting endpoint, version or permission is considered verified by this plan. Live account access remains unperformed.

A separate Orbit search and integration brief identified `GET /act_{account_id}/adspixels` as a candidate for Pixel identity and last activity. Its brief explicitly reports partial fit and no deeper website-event analytics. Treat this as a discovery lead requiring official/version/account validation, not a confirmed dashboard capability. It does not expand v1 into advertising performance reporting.
