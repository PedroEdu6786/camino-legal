# Google capability and metric-definition evidence
> Status: expected contract documented; live report blocked · Task: T1.2

## Evidence identity
- Inspected: 2026-10-24 04:44 UTC.
- Local sources: `app/lib/measurement/contracts.ts`, `app/lib/analytics.ts`, `.claude/analytics/site-expansion/operations.md`, approved dashboard plan.
- Numeric property/stream, owner, reporting identity, timezone, effective permissions: **unknown**.
- Representative read-only report: **not executed**; no authenticated reporting connection or selected property was available.
- This matrix describes requested/expected capabilities, not account-confirmed support.

## Candidate report matrix
| Business label | Candidate metric/query meaning | Breakdown | Current evidence state |
|---|---|---|---|
| Usuarios activos | `activeUsers` | Selected resource and complete-day period | Live support/reconciliation pending |
| Sesiones | `sessions` | Selected resource and complete-day period | Live support/reconciliation pending |
| Vistas de página | `screenPageViews` | Canonical path | Live support and path projection pending |
| Solicitudes observadas | Event count restricted to `lead_submitted` | Approved form/service breakdown only if available | Source emits expected event; live report/key-event setup unknown |
| Clics en WhatsApp | Event count restricted to `whatsapp_click` | Approved surface/service if available | Source definition only |
| Clics en correo | Event count restricted to `email_click` | Approved surface/service if available | Source definition only |
| Solicitud por cotización | Event count restricted to `quote_request_intent` | Approved quotation/service if available | Source definition only |
| Interés por servicio | Available event counts with bounded service identity | Five registered services plus unspecified | Custom-definition registration/support unknown |
| Adquisición | Native provider attribution or bounded application categories, distinctly labeled | Source/medium/campaign | Native dimension availability and custom registration unknown |

## Expected registration checks
- Confirm `lead_submitted` is the intended lead key event; inspect legacy `contact_form_submit` cutover rather than assume it was retired.
- Inspect only required low-cardinality custom definitions: page type, service/context, source surface, action/form kind and approved acquisition categories as applicable to the supported metric matrix.
- Never register event, page-view, form-instance, attempt or quotation IDs as report dimensions.
- Account automatic-measurement settings require verification: application-owned page views/forms/clicks must not be duplicated by provider automatic collection. Source `send_page_view:false` alone does not establish those account settings.

## Zero and comparison rules to prove
- Explicit zero is valid only with successful compatible query and verified provider semantics. Empty rows, unavailable dimensions, withheld/thresholded or incomplete data retain their specific limitations.
- Use property timezone, complete-day ranges and exact resource/filters/reporting identity. The approved selected range is at most 90 days, with a separately bounded equal preceding comparison.
- No comparison across incompatible cutover, environment coverage, definition or reporting-setting revisions.
- Reconciliation must record property, metric, query period, timezone, filters, reporting identity, definition/configuration revision, API and console retrieval times, both values and explained differences. Unexplained discrepancy remains unverified.

## Provider references
Previously reviewed official references: [Admin API](https://developers.google.com/analytics/devguides/config/admin/v1/rest), [Data API](https://developers.google.com/analytics/devguides/reporting/data/v1). They establish candidate public interfaces, not this property's permissions or data. This phase did not repeat public discovery or execute provider requests.

## To close T1.2
Confirm resource ownership/selection and read credential resolution, execute a representative read-only report, record actual support and registration evidence per metric/breakdown, then reconcile the result. Unsupported dimensions must remain explicit rather than removing required core reporting without a scope decision.

Trace: FR7, FR9–FR10, FR12–FR13, FR19; TR1, TR8. AC6 live prerequisites remain blocked.

## User implementation direction
The user subsequently stated: “for now just assume access, we have setup keys on the .env”. Proceed with implementation assuming the required access will be supplied through environment configuration. The local key/file-presence findings above apply only to this inspected checkout/process; they do not deny configuration in another environment. Do not expose values or mark live resource/read/host evidence verified until actually demonstrated.
