# Analytics Dashboard — Proposals

Independent proposals were authored against `../spec.md` without access to each other's proposals. This record condenses their returned designs; contested arguments and concessions are retained in the decision record.

## Proposal A — Direct provider reads (author: rafachafa, Pragmatist)
- **Approach:** One read-only page; current measurement definitions, reviewed inventory/evidence manifest, bounded provider reads. Two concrete provider modules and one presentation result shape; no configurable connector platform. Discovery enriches but never automatically changes owner classification or production selection.
- **Phase outline:** Establish resource/capability matrix; deliver inventory and catalog; add bounded reports and console reconciliation; verify site isolation and data canaries.
- **Data-model changes:** No new database. Asset, ProductionSelection and VerificationEvidence records; ephemeral ReportResult and DiscoveryResult unless existing host retention is suitable. Separate evidence claims rather than a healthy Boolean.
- **Explicitly cut:** Auth, editing, history, scheduled refresh, external alerts, provider writes, advertising, warehouse and visitor timelines.
- **Author-admitted risks:** Manifest requires maintenance; host uncertainty prevents shared-limit and retained-report promises; Meta may remain inventory-only; legacy contamination blocks comparisons. Proposed 90-day custom range and 30-day manual-evidence expiry may not fit review cadence.
- **Operational proposal:** 15-minute refresh eligibility, one in-flight request per report key, finite deadlines, no automatic rate-limit retry. Final request/page budgets depend on verified provider capabilities. Cache loss is unavailable until successful read.
- **Traces to:** FR1–FR20, TR1–TR8.

## Proposal B — Explicit evidence contracts (author: gamachiel, Architect)
- **Approach:** Relate expected measurement, verified configuration and observed reports through typed resource identities. Keep GA4 property/stream/measurement IDs distinct. Provider-specific facts share provenance and failure metadata without pretending metric equivalence. Reuse measurement definitions and maintain reviewed evidence externally.
- **Phase outline:** Establish identities/evidence/comparison contracts; deliver inventory and coverage; add provider-separated reporting and compatibility checks; verify operational failure behavior and public-site isolation.
- **Data-model changes:** No warehouse/database required. Asset, DiscoveryResult, ReportingSelection, EvidenceClaim, ReportResult and TrackingGap contracts. Report metadata includes definition version, resource, period, timezone, filters, retrieval time, coverage, nullable values and state.
- **Explicitly cut:** Auth, editing/history, arbitrary reports, sequential funnels, provider writes, advertising, unified cross-provider leads and permanent storage solely for continuity.
- **Author-admitted risks:** Contracts can become ceremony; external evidence can go stale; breakdowns may be unsupported; auth deferral is not a public-access decision; per-process caching does not prove fleet-wide limits.
- **Traces to:** FR1–FR20, TR1–TR8, AC2–AC14.

## Proposal C — Product-first evidence and performance (author: kings, Product)
- **Approach:** Answer “What is happening?” and “Can I trust tracking?” together. Overview pairs Google performance with compact coverage status; each metric leads to its event meaning, selected resource, period and evidence. Meta fallback is a useful verified inventory rather than a disabled chart. Discovery is reconciliation, including duplicates and blind spots.
- **Phase outline:** Establish reporting truth and resource selection; deliver all four information areas with Google default-period performance and useful Meta coverage; add remaining period/comparison controls, resilience, reconciliation and accessibility. An inventory-only preview is not the first complete product milestone or completed v1.
- **Data-model changes:** Compact classified-asset/selection read model, event-to-provider coverage, evidence, provider-separated reports and derived gaps. Gap includes missing evidence, known/unknown owner, next action and date; no assignment lifecycle.
- **Explicitly cut:** Custom dashboard builders, decorative metrics, advertising/revenue, cross-provider unique totals, editing, alerts, durable history, sequential funnels and auth design. No extra database required.
- **Author-admitted risks:** Google access may delay complete milestone; Meta asymmetry should be explained, not disguised; discovery blind spots and unknown owners can remain unresolved. Auth deferral does not settle deployment access.
- **Traces to:** FR1–FR20, TR1–TR8.

## Outcome
- **Selected:** Hybrid of A's concrete readers/manifest, B's resource/evidence/query identity and C's complete owner workflow. See `03-decisions.md` for two-round critique, concessions and closure.
- **Rejected — and why they lost:** Undefined operation budgets (ponykiller/estebanquito), incomplete zero/evidence/cache semantics (cuid/ponykiller), inventory as completed v1 (kings/estebanquito), and a collapsed healthy badge (rafachafa). No full proposal was discarded; their compatible parts survived.
- **Budget dissent:** gamachiel proposed 20 calls/five pages; Chair chose 12/three absent measured need, which gamachiel conceded. Verbatim dissent is preserved in D4.
- **Post-debate revisions:** All authors accepted per-metric zero semantics, binding invalidation, immutable cache identity, safe dimensions, separate freshness and demonstrated capability gates. kings accepted independent evidence statuses and revision-bound detail links; gamachiel confirmed plain records and derived gaps, not separate stores.
