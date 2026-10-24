# Spec: Website Analytics and Tracking Inventory
> Status: draft · Slug: analytics-dashboard

## Problem
Camino Legal cannot yet establish from one place which Google and Meta website-tracking assets are relevant, what is configured, what is actually observed, and what website performance means. Locally implemented tracking does not prove production registration or receipt, and unknown or overlapping metrics can mislead business decisions.

## Goal
Provide a Spanish-language website analytics view combining a trustworthy asset/event inventory, automated Google performance reports, and verified Meta coverage with explicit capability limitations.

## Requirements
### Functional (EARS)
- **FR1:** THE SYSTEM SHALL present website performance, asset inventory, event/conversion coverage and tracking-health information in Spanish.
- **FR2:** WHEN relevant assets are discovered THE SYSTEM SHALL identify each as active, legacy, excluded or awaiting classification, preserving the reason and known owner.
- **FR3:** WHEN reporting assets are designated THE SYSTEM SHALL restrict performance reporting to the explicitly selected production resources without merging legacy or excluded assets.
- **FR4:** WHEN discovery results are displayed THE SYSTEM SHALL state the accessible scope, discovery date and unresolved coverage so inaccessible assets are not represented as nonexistent.
- **FR5:** THE SYSTEM SHALL list each asset's provider, identifier type/value, known owner, environment, relationship to selected website resources and provider-console link where available, with unknown fields marked unknown.
- **FR6:** THE SYSTEM SHALL show the existing expected event catalog with business meaning, trigger, website scope, Google/Meta mapping and lead, intent or engagement classification.
- **FR7:** THE SYSTEM SHALL distinguish implemented tracking, configured destination, applicable provider registration and observed events as independent evidence claims.
- **FR8:** WHEN a verification claim is displayed THE SYSTEM SHALL identify its resource/environment, source, manual/automated method, verification time, applicable period and relevant measurement/configuration revision; changed bindings SHALL make prior claims inapplicable to the current setup. Configuration/manual verification evidence older than 30 days SHALL display a recheck reminder without disabling tracking or reports.
- **FR9:** WHEN a valid reporting period is selected THE SYSTEM SHALL show Google website visitors (`totalUsers`), page views (`screenPageViews`, web scope) and bounce rate (`bounceRate`, percentage of non-engaged sessions) as the primary dashboard metrics, with available sessions, observed lead events, contact-intent counts and page/service/acquisition breakdowns as supporting information; unavailable values and unsupported breakdowns SHALL be explicitly labeled.
- **FR10:** WHEN comparable periods are available THE SYSTEM SHALL present previous-period comparisons using identical metric definitions and equal-duration periods; otherwise it SHALL explain why comparison is unavailable.
- **FR11:** WHERE Meta website metrics are verified as readable THE SYSTEM SHALL report those metrics separately; otherwise it SHALL show useful verified Meta inventory, event mappings, dated evidence, console links and the explicit reporting limitation.
- **FR12:** THE SYSTEM SHALL show each metric's definition, provider, reporting period, timezone, retrieval time and relevant coverage/processing limitations.
- **FR13:** IF a source or metric is disconnected, inaccessible, unsupported, failed, stale, partial, withheld or has no observations THEN THE SYSTEM SHALL distinguish that condition from a successfully measured zero; an omitted value SHALL become zero only when verified provider semantics establish complete coverage and that interpretation.
- **FR14:** IF one provider fails THEN THE SYSTEM SHALL preserve independently available information from other providers and the expected tracking catalog.
- **FR15:** THE SYSTEM SHALL keep Google and Meta lead counts separate and distinguish observed marketing leads, contact intent, operational email acceptance and revenue without implying interchangeability.
- **FR16:** WHEN material tracking gaps are found THE SYSTEM SHALL identify the evidence missing, known responsible owner, next verification action and verification date without changing provider settings.
- **FR17:** IF production/test separation or measurement-cutover comparability cannot be established THEN THE SYSTEM SHALL label affected data and comparisons as unverified or incompatible rather than claim clean production reporting.
- **FR18:** WHEN a refresh is requested THE SYSTEM SHALL communicate refreshed, deferred or failed status and preserve honest freshness information for any retained result.
- **FR19:** THE SYSTEM SHALL keep ordinary event observation separate from key-event/custom-definition registration and mark intentionally absent provider mappings as not applicable.
- **FR20:** THE SYSTEM SHALL report aggregate form-stage counts without describing them as unique people or an ordered journey unless such interpretation has verified supporting evidence.
- **FR21:** WHEN a provider event aggregates multiple canonical actions THE SYSTEM SHALL show the shared mapping without assigning the aggregate count to each individual action unless independently supported.

### Technical / Non-functional
- **TR1:** Provider integrations shall be read-only; v1 shall not create/delete conversions, change account configuration or send diagnostic marketing events.
- **TR2:** Reports and diagnostics shall exclude credentials, raw provider error bodies and visitor personal/contact data, including message text and matching hashes; externally supplied dimensions and labels shall be restricted to approved canonical/bounded values before display, retention or logging.
- **TR3:** Expected events and mappings shall remain consistent with the existing website measurement definitions; marketing consent behavior shall not change.
- **TR4:** Dashboard use shall not produce marketing analytics events, and reporting failures shall not affect public contact/evaluation or navigation behavior.
- **TR5:** Reporting shall limit each selected period to 90 complete days and use 15-minute refresh eligibility, with bounded timeouts and request/retry budgets; deployment-specific enforcement shall be verified before production reporting is claimed operational. The range cap bounds query workload, not historical retention or the age of selectable dates; an equal preceding comparison period is separately bounded to 90 days.
- **TR6:** The dashboard shall remain usable by keyboard and on mobile, with textual state labels independent of color.
- **TR7:** No claim of durable history or last-known availability shall exceed the actual retained evidence or report data.
- **TR8:** Technical correlation identifiers shall not become report dimensions or visitor-level timelines.
- **TR9:** Reused or retained reports shall preserve an immutable identity covering provider, selected resource/environment, period, timezone, metric/definition versions, dimensions, effective filters and relevant reporting settings; incompatible requests shall never reuse or relabel old results.

## Inputs & Outputs
- Inputs: existing website measurement definitions; accessible Google/Meta asset metadata; owner-confirmed production selection and asset classification; read-only aggregate reports; dated verification evidence; requested period/provider filter.
- Outputs: Spanish overview, classified inventory, event/mapping coverage, provider-separated metrics, evidence provenance, freshness/limitations and actionable tracking gaps.
- Existing business semantics: 27 canonical events across five services and eleven catalogued public URLs. Google receives the detailed catalog. Meta mappings: `page_view` → `PageView`; `lead_submitted` → `Lead`; `whatsapp_click`, `email_click`, `quote_request_intent` → `Contact`. No Meta mapping is expected for the remaining events.
- GA4's intended lead key event is `lead_submitted`; legacy `contact_form_submit` conversion cutover requires verification. Technical event/form/page/quotation IDs are not business dimensions.
- Actual production resource IDs, owners and reporting permissions: [NEEDS CLARIFICATION: Which owner can verify the production Google property/stream and Meta dataset/Pixel and grant read access?]

## Scope
### In scope
- Inventory and website performance together in v1.
- Active, legacy, excluded and unclassified assets within accessible discovery; explicit discovery blind spots.
- Automated Google reporting and verified Meta coverage; Meta inventory with clearly shown metric limitations is an explicitly accepted v1 outcome.
- Read-only configuration/observation comparison and actionable verification gaps.
- Planning/specification only in this session.
### Out of scope (non-goals)
- Authentication design and implementation, explicitly deferred by the user. Revisit in a separate access/deployment task; this deferral does not select a public-access model.
- Google/Meta advertising spend, campaigns and ROAS; revisit after website reporting is trusted and advertising is requested.
- Search Console/social-profile analytics, CRM/revenue and total-business-lead accounting; revisit with explicit business requirements and reliable sources.
- Account-setting writes, in-page ownership/evidence editing, external alerts and assignment workflows; revisit if read-only maintenance demonstrably fails.
- Durable audit history, warehouse, visitor timelines and true sequential funnels; revisit only with an explicit retention or analytical requirement.

## Assumptions
- User confirmed both inventory/performance, advertising later, Meta limitation fallback, and active/legacy/excluded discovery. User explicitly deferred auth.
- The page is informational and a named maintainer can submit reviewed inventory/evidence updates outside it. Unknown ownership remains visible and does not prevent drafting.
- No live provider/account verification has occurred; existing local tests prove application behavior only.
- Proposed default is the last 28 complete days, with 7/28/90-day presets. User accepted a 90-day maximum as a non-functional query-workload constraint and approved 15-minute refresh eligibility; neither is a provider retention or data-latency promise.
- [NEEDS CLARIFICATION: What production host and operational owner will support provider credentials, bounded refresh and recovery?]
- User approved marking configuration/manual verification evidence as needing recheck after 30 days. This age label does not expire accounts, delete data, stop tracking or disable reports. Relevant resource/configuration changes still invalidate prior claims immediately; a report refresh does not renew unrelated verification evidence.

## Acceptance Criteria
- [ ] **AC1:** All four information areas have Spanish labels and usable keyboard/mobile states. (verifies FR1; TR6)
- [ ] **AC2:** A fixture containing active, legacy, excluded and unclassified assets retains classification, reason and unknown owners; only explicitly selected production assets drive reports. (verifies FR2, FR3, FR5)
- [ ] **AC3:** Partial discovery clearly states inaccessible/unknown scope and discovery time; no result claims organization-wide completeness without evidence. (verifies FR4)
- [ ] **AC4:** Every current canonical event appears with correct meaning and destination mapping; deliberately unmapped Meta events are not missing-registration errors. (verifies FR6, FR19; TR3)
- [ ] **AC5:** An implemented event with a configured ID but no receipt evidence is not displayed as observed; manual and automated evidence remain distinguishable and resource-bound; selection/configuration change makes previous evidence inapplicable. Fresh report retrieval never renews manual or discovery verification. Configuration/manual verification older than 30 days displays a recheck reminder while tracking and reports remain available. (verifies FR7, FR8)
- [ ] **AC6:** Available Google metrics reconcile against the provider for a representative identical period, timezone, filters and reporting identity; unsupported dimensions are explicit. Visitors use `totalUsers` rather than `activeUsers`; page views are web-scoped and include repeat views; bounce rate is formatted from a 0–1 fraction as a percentage and is unavailable when no sessions provide a denominator. (verifies FR9, FR12)
- [ ] **AC7:** Previous-period calculations retain equal-duration semantics and reject incompatible definitions or contaminated/cutover comparisons with an explanation. (verifies FR10, FR17)
- [ ] **AC8:** Meta either shows verified available website metrics or verified inventory/mappings/evidence/links with an explicit limitation; advertising conversions never substitute for website metrics. (verifies FR11)
- [ ] **AC9:** Explicit zero, omitted rows, withheld/partial data, disconnected, forbidden, unsupported, stale and failed fixtures render distinct meanings; a Meta outage does not erase Google results or the catalog. (verifies FR13, FR14)
- [ ] **AC10:** The UI cannot add provider leads into unique total leads or label clicks as accepted leads/revenue; form-stage totals are not labeled a sequential funnel. (verifies FR15, FR20)
- [ ] **AC11:** Each material gap names missing evidence and next action, with unknown owner explicit; no remediation modifies provider configuration. (verifies FR16; TR1)
- [ ] **AC12:** Refresh success, throttling, timeout and cache loss render accurately, stay within defined aggregate budgets including pagination/comparisons, and never invent retained evidence; resource/query changes cannot reuse or relabel incompatible reports. (verifies FR18; TR5, TR7, TR9)
- [ ] **AC13:** Credential/visitor-data canaries do not appear in responses, logs or diagnostics; correlation IDs are absent from custom reporting dimensions. (verifies FR8, FR12; TR2, TR8)
- [ ] **AC14:** Dashboard navigation produces no marketing events; provider-report failure leaves public forms and consent behavior unchanged. (verifies FR14; TR3, TR4)
- [ ] **AC15:** A Meta `Contact` aggregate appears once as a shared measure; the three mapped canonical actions do not each inherit its count. (verifies FR21)

## Open Clarifications
- [NEEDS CLARIFICATION: Which owner can verify the production Google property/stream and Meta dataset/Pixel and grant read access?]
- [NEEDS CLARIFICATION: What production host and operational owner will support provider credentials, bounded refresh and recovery?]
