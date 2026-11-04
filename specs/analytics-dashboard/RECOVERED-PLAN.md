# Recovered analytics work — 2026-11-03

Recovered from existing repository documents, Git history and Engram memories. This is a navigation and resumption note, not evidence of current production configuration. The original planning files are intact.

## 1. Fix production collection with account access

Source: [site expansion operations checklist](../../.claude/analytics/site-expansion/operations.md).

- Confirm the intended production GA4 property and web stream and their reporting owner.
- Review GA4 Enhanced Measurement: disable overlapping history page views, automatic forms, outbound clicks and scroll collection, because the application owns these events. Verify actual SDK requests; `send_page_view:false` alone was not considered sufficient.
- Make `lead_submitted` the single GA4 lead key event and retire the overlapping `contact_form_submit` conversion. Channel clicks remain intent, not accepted leads.
- Review provider initialization and automatic payloads, consent and revocation, and safe URLs/referrers before enabling the build-time `NEXT_PUBLIC_ANALYTICS_PROVIDERS_REVIEWED=true` flag. Rebuild when changing this flag.
- Use low-cardinality reporting dimensions. Do not register event, form, attempt or quotation identifiers as report dimensions.
- Record the production cutover date and schema version 1. Historical contact-only totals are not directly comparable to expanded contact plus evaluation coverage.
- Meta separately needs supported Graph version/permissions and live browser/server Lead deduplication verification. Google account access does not close these checks.

These were recorded launch requirements; their completion has not been revalidated during recovery.

## 2. Connect the existing analytics dashboard

Source: [original setup handoff, dated 2026-10-24](SETUP.md).

The implemented route is `/admin/analitica`. The KPI slice shows visitors, page views, sessions and bounce rate, with 7/28/90-day and custom ranges.

The recorded next setup step was Google read credentials:

1. Obtain the numeric GA4 property and web stream IDs and confirm the stream matches the existing `G-…` measurement ID.
2. Enable the Google Analytics Data API in the intended Cloud project.
3. Create the planned `camino-analytics-reader` service account and grant its email Viewer access on the GA4 property.
4. Configure server-only `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_ANALYTICS_STREAM_ID`, `GOOGLE_ANALYTICS_TIME_ZONE` and `GOOGLE_ANALYTICS_CREDENTIALS_JSON` through the environment. Keep credentials out of source and chat.
5. Use `America/Mexico_City`: this was confirmed from the user's screenshot. The earlier `America/Merida` example was superseded.
6. Restart the app and check `/api/admin/analytics/summary?days=28`; reconcile all four metrics with the same property, stream, timezone and complete-day range in GA4.

The October handoff recorded `not_connected`; account IDs, service-account setup and live figures were unconfirmed there. That is historical evidence, not a claim about today's access.

## 3. Preserve the agreed dashboard scope

Sources: [specification](spec.md), [implementation plan](plan.md), [task list](tasks.md), [summary contract](evidence/summary-contract.md).

- Four areas: Resumen; Cuentas y configuración; Eventos y conversiones; Estado del seguimiento.
- Reuse the 27-event catalog and distinguish implemented, configured, registered and observed evidence.
- Include active, legacy and excluded assets, with explicit production selection.
- Website performance and tracking inventory first; advertising later. Application authentication was explicitly deferred in the original decisions.
- Meta's accepted fallback is verified inventory/mappings/evidence plus console links when automated website metrics cannot be read.
- Never convert missing data into zero or add Google and Meta counts into a unique-lead total.
- Approved policy: maximum 90-day query interval and a 30-day evidence-review reminder that does not stop tracking or reporting.
- Full discovery, comparisons, reporting breakdowns, production runtime verification and live console reconciliation remained open in the handoff.

The older `.claude/analytics/dashboard/plan.md` explicitly points to this specification package as its replacement.

## 4. Newer reader fix recovered from Git

Commit `06d67b06d17bbc4d3fbf79b69be9d6b57a943948`, dated 2026-11-03, is titled `fix: per-period cooldown for GA summary reader`.

It changes cooldown to resource plus period, permits up to 8 provider calls per resource in 15 minutes, respects a resource-wide Retry-After pause and raises request timeout to 15 seconds. It updates the reader, its tests and the summary contract. Older setup prose describing a different period as necessarily deferred is therefore stale relative to this commit.

The working checkout during recovery was `fix/analytics-dashboard-reader`. No branch switch, production change or deployment was performed during recovery. Deployment of this commit has not been established.

## Recovery evidence and limits

- Engram observations 1142 and 1149 preserve the original scope and initial inventory implementation decisions.
- Original documents and the newer Git commit were read directly.
- The separate original conversation for today's production repair was not located in the searched Codex session files. This note reconstructs recoverable written work; it is not a verbatim transcript.
- No current Google account or production endpoint was inspected during recovery.
