# Asset discovery evidence
> Status: locally inspected; live discovery blocked · Task: T1.1

## Evidence identity
- Inspected: 2026-10-24 04:44 UTC (2026-10-23 America/Merida).
- Source: current local working tree at base commit `f1eeae2`, branch `feat/camino-site-expansion`; no provider account request performed.
- Scope: repository configuration, relevant local environment key presence, current measurement contracts and existing release evidence. No claim of complete Google/Meta organizational discovery.
- Owner approval: not supplied. Selected production resources: none confirmed.

## Local findings
| Subject | Evidence | Interpretation |
|---|---|---|
| Google destination | `app/components/ui/AnalyticsScripts.tsx` reads `NEXT_PUBLIC_GA4_ID` | Application expects a GA4 measurement ID; numeric account/property/stream identities are not established |
| Meta destination | Same component reads `NEXT_PUBLIC_META_PIXEL_ID`; `app/lib/metaCapi.ts` uses it for server events | Application expects a Pixel/dataset destination; ownership and production selection are unknown |
| Local configuration | No root `.env*` files; relevant analytics/Google-credential environment keys absent from this process | No local configured account identity was available for this inspection; deployment configuration may differ |
| Existing catalog | `app/lib/measurement/contracts.ts`: 27 event names, five services, eleven canonical public routes | Expected tracking coverage, not received provider events |
| Prior provider verification | `.claude/analytics/site-expansion/verification.md` production gates remain open | Local test success does not approve live account configuration |
| Example IDs | Historical plans contain `G-XXXXXXXXXX`; tests/operations contain synthetic IDs; preview contains demo IDs | Excluded from candidate production inventory; not evidence that real assets exist |

## Discovery and classification result
- Live discovery state: **not performed — account/read access unavailable**.
- Active, legacy, excluded and unclassified **real assets: unknown**, not zero.
- No asset has been auto-selected, assigned a fabricated owner, or imported from the illustrative preview.
- Typed fields still needed: provider account/business ID, Google numeric property and web stream ID with measurement ID relationship, Meta dataset/Pixel ID, environment, owner, classification/reason, safe console link, discovery scope/time and owner approval date.
- Approval must name the intended production resources explicitly; access to an asset alone does not select it for reporting.

## Cutover and contamination
- Current intended GA4 lead event: `lead_submitted`; historical documents refer to `contact_form_submit` and different key-event settings.
- `.claude/analytics/site-expansion/operations.md` supersedes that historical setup and requires a cutover date and baseline reset. No actual cutover date or historical test-data separation was verified.
- Production-only filtering and comparable historical periods remain unverified until the selected property is inspected.

## To close T1.1
1. Identify the owner and obtain appropriate read access through the chosen credential channel, without storing secrets here.
2. Discover accessible candidate assets, including older/duplicate resources; record access blind spots and pagination completeness.
3. Obtain explicit production selection and classifications/reasons; record owner and time independently from automated discovery.
4. Establish cutover/environment coverage or retain a visible limitation for contaminated periods.

Trace: FR2–FR5, FR17; prerequisite evidence for AC2–AC3. Neither acceptance criterion is passed by this local record alone.

## User implementation direction
The user subsequently stated: “for now just assume access, we have setup keys on the .env”. Proceed with implementation assuming the required access will be supplied through environment configuration. The local key/file-presence findings above apply only to this inspected checkout/process; they do not deny configuration in another environment. Do not expose values or mark live resource/read/host evidence verified until actually demonstrated.
