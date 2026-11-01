# Meta capability and fallback evidence
> Status: source mapping verified; real asset and read capability unverified · Task: T1.3

## Evidence identity
- Inspected: 2026-10-24 04:44 UTC.
- Sources: `app/lib/analytics.ts`, `app/lib/metaCapi.ts`, `app/components/ui/AnalyticsScripts.tsx` and current operations checklist.
- Actual business/dataset/Pixel IDs, owner, console link and supported Graph version: **unknown**.
- Read permissions: **not established**. No authenticated live Meta read was executed.
- Unavailable-reporting reason for this phase: no approved resource identity or reporting access is available locally. This is **not evidence that Meta does not support the requested metrics**.

## Confirmed application mappings
| Canonical event | Meta destination | Evidence meaning |
|---|---|---|
| `page_view` | Browser `PageView` | Implemented mapping; receipt unverified |
| `lead_submitted` | Browser `Lead`; eligible accepted receipt also sends server `Lead` | Implemented browser/server lane; live deduplication unverified |
| `whatsapp_click` | Browser `Contact` | One member of shared intent aggregate |
| `email_click` | Browser `Contact` | One member of shared intent aggregate |
| `quote_request_intent` | Browser `Contact` | One member of shared intent aggregate |
| Remaining 22 canonical events | No Meta destination | Intentionally not applicable, not missing registration |

- Browser lead event ID and server event ID matching is a verification requirement. Fake SDK/HTTP evidence does not prove Events Manager deduplication.
- A returned aggregate `Contact` count must not be copied into all three canonical action rows.
- `sendMetaLead` sends `POST /{pixelId}/events` and checks `events_received`; this is a send capability, not a report reader. It was **not invoked** during this phase.
- `META_ACCESS_TOKEN` and `META_GRAPH_API_VERSION` are consumed by the existing send integration. Their local absence and unknown production values do not establish read permission or current supported versions.

## Accepted fallback and its missing evidence
The user accepts verified identity/ownership, event mappings, dated evidence and a useful provider-console link with an explicit quantitative-reporting limitation. The mapping portion above is established from source. Identity/ownership, real console link and actual reception/configuration evidence remain missing, so the fallback is **not yet fully verified**.

Public discovery recorded in the plan suggested a Pixel-metadata candidate. That lead has neither current official/version validation nor live permission proof in this phase; no reader endpoint has been selected or promised. Advertising metrics must not substitute for website metrics.

## To close T1.3
1. Establish the intended dataset/Pixel and owner; record a safe direct console link and owner verification date.
2. Determine actual read capabilities using a supported version and appropriate read access, or obtain dated owner-verified fallback evidence.
3. Document what is readable, inaccessible or unsupported separately; verify reception/deduplication claims only with actual matching evidence.

Trace: FR5, FR8, FR11, FR21; TR1. AC8 prerequisite remains blocked; source mapping alone does not pass it.

## User implementation direction
The user subsequently stated: “for now just assume access, we have setup keys on the .env”. Proceed with implementation assuming the required access will be supplied through environment configuration. The local key/file-presence findings above apply only to this inspected checkout/process; they do not deny configuration in another environment. Do not expose values or mark live resource/read/host evidence verified until actually demonstrated.
