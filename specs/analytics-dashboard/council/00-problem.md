# Analytics Dashboard — Problem Anchor

## The Main Problem
Camino Legal needs to know what website tracking is configured in Google and Meta, what those platforms actually observe, and what the resulting website metrics say about performance. Configuration, implementation and observation must remain distinguishable so the team can identify missing or misleading measurement.

## Context
- User confirmed tracking inventory and performance together in v1, website tracking first and advertising later; subsequently requested specifications and the planning council.
- Input draft: `.claude/analytics/dashboard/plan.md`. This is not a previous council verdict.
- Current application has 27 canonical events, five services, eleven catalogued public URLs. GA4 receives the detailed catalog; Meta receives PageView, Lead and Contact mappings.
- Existing repository evidence is local; production provider settings and event observation remain unverified. No live account review has occurred in this council.
- Existing app does not supply an established admin identity or reporting datastore.

## Known constraints
- Planning artifacts only; no implementation, account changes or deployment.
- Existing Next.js application and measurement semantics; read installed framework guides before implementation.
- Spanish user-facing interface. User explicitly deferred authentication design; access implementation is outside this council deliverable.
- Analytics must preserve consent boundaries and public form operation.
- Meta reporting feasibility remains unverified; send credentials do not prove read access.

## Out of scope (declared up front)
- Advertising spend/campaigns, social-profile analytics, CRM/revenue, visitor timelines, account-setting writes.
- File-level implementation tasks.
- Authentication design and implementation for now, per explicit user steering.

## Interrogation outcomes
- All six personas reviewed unanswered requirements before proposals. Repeated concerns: Meta quantitative-read feasibility, asset-discovery scope, evidence provenance, production ownership and delivery boundaries.
- User accepted automated Google reports plus verified Meta inventory/mapping/evidence/console links with a clearly shown limitation when readable Meta website metrics are unavailable.
- User requested active, legacy and excluded assets be identified separately. Discovery coverage remains bounded by actual permissions.
- User said “for now dont worry about auth”; no auth design or auth-approval questionnaire belongs in this plan.
- Unanswered non-blocking requirements are retained in the spec: production owners/resources/hosting, date-range and evidence-freshness policy. These do not prevent specification or design, but live integrations need real configuration.

## Council seated
| Persona | Seat | Why seated |
|---|---|---|
| rafachafa | Pragmatist | Smallest useful deliverable |
| gamachiel | Architect | Evidence and provider boundaries |
| kings | Product | Inventory completeness and useful business outcomes |
| estebanquito | Engineering Manager | Sequencing and acceptance gates |
| cuid | Risk / QA | Private access and misleading metrics |
| ponykiller | Infra / SRE | Hosting, credentials, quotas and failures |

## Mode & sizing
Greenfield canonical specification based on an existing planning draft. Three independent proposals, up to three debate rounds, six voices executed in batches within available concurrency. Main Problem anchored in the user's already-confirmed scope rather than asking for repeated confirmation. Outstanding decisions are explicitly recorded; lack of response does not approve a scope reduction.
