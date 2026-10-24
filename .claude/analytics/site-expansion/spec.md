# Spec: Site-wide analytics for Camino Legal
> Status: implemented locally; production verification pending · Slug: site-expansion-analytics · Date: 2026-10-23

## Problem
Analytics currently describe an earlier landing page and leave gaps across the expanded site, service exploration, quotation controls, and evaluation requests. Camino Legal cannot reliably compare which services and calls to action lead to contact intent or distinguish an email link click from a successfully submitted website message.

## Goal
Measure the complete website journey across every current page and service, from discovery through quotation and contact intent to confirmed website email submission, with trustworthy counts and explicit consent boundaries.

## Requirements
### Functional (EARS)
- **FR1:** WHEN a visitor arrives at a page through initial load, internal navigation, or browser history THE SYSTEM SHALL record one eligible page view for that navigation.
- **FR2:** WHEN a page view is recorded THE SYSTEM SHALL classify it by the canonical page type and service context in the measurement catalog.
- **FR3:** WHEN a visitor activates a rendered navigation link or call to action THE SYSTEM SHALL record its stable action identifier, source surface, and sanitized destination.
- **FR4:** WHEN a visitor deliberately selects a service in the directory THE SYSTEM SHALL record the selected service and previous service.
- **FR5:** WHEN a quotation becomes visible THE SYSTEM SHALL record one quotation view with its selected service and current configuration.
- **FR6:** WHEN a visitor changes a quotation service, class count, ownership option, or payment option THE SYSTEM SHALL record the changed control and resulting configuration.
- **FR7:** WHEN a visitor activates a quotation email request THE SYSTEM SHALL record quotation contact intent with the current configuration.
- **FR8:** WHEN a visitor opens or closes the evaluation dialog THE SYSTEM SHALL record the corresponding dialog action.
- **FR9:** WHEN a visitor first interacts with a contact or evaluation form THE SYSTEM SHALL record one form start per form instance.
- **FR10:** WHEN a visitor submits either website form THE SYSTEM SHALL record a distinct submission attempt.
- **FR11:** IF submission validation fails THEN THE SYSTEM SHALL record a validation failure classified by field identifier and safe error category.
- **FR12:** WHEN a valid website submission is handed to email transport THE SYSTEM SHALL record an operational email attempt independently of marketing consent.
- **FR13:** WHEN email transport reports intended-recipient acceptance, recipient rejection, transport failure, or an uncertain result THE SYSTEM SHALL record the corresponding operational outcome. An unknown result triggers exactly one automatic retry with its own transport-attempt identity under the same logical submission; a second unknown stops retries and is flagged for operational review. Possible duplicate emails are accepted; confirmed failures/rejections do not trigger this retry.
- **FR14:** WHEN email transport confirms intended-recipient acceptance of a valid contact or evaluation submission THE SYSTEM SHALL record one eligible canonical lead conversion for the logical submission.
- **FR15:** IF a submission or its analytics delivery is repeated THEN THE SYSTEM SHALL distinguish a new user submission attempt from repeated delivery of the same outcome.
- **FR16:** WHEN a visitor activates WhatsApp, a direct email link, or a social link THE SYSTEM SHALL record channel-specific intent without reporting a submitted lead or sent email.
- **FR17:** WHEN a content section meets its visibility threshold THE SYSTEM SHALL record one eligible section impression per page view.
- **FR18:** WHEN a trademark journey step meets its visibility threshold THE SYSTEM SHALL record one eligible step impression independently of the animated arrow position.
- **FR19:** WHEN a visitor opens an FAQ item, selects a process step, or manually navigates reviews THE SYSTEM SHALL record the content identifier and deliberate action.
- **FR20:** WHEN a visitor reaches a configured page scroll threshold THE SYSTEM SHALL record that threshold at most once per page view.
- **FR21:** WHILE marketing consent is unknown or denied THE SYSTEM SHALL prevent browser and server marketing measurement and discard events that occur in that state.
- **FR22:** WHEN consent is granted during a page visit THE SYSTEM SHALL begin measurement with the currently visible page and eligible subsequent interactions.
- **FR23:** WHEN marketing consent is revoked THE SYSTEM SHALL stop subsequent marketing measurement, including calls through already loaded providers.
- **FR24:** WHILE consent is granted and a measurement destination is temporarily unready THE SYSTEM SHALL retain only bounded, short-lived eligible events.
- **FR25:** WHEN service attribution is attached to an interaction THE SYSTEM SHALL distinguish explicit service context, consented referral context, and unspecified context.
- **FR26:** WHEN site-wide reports are produced THE SYSTEM SHALL distinguish page discovery, service exploration, quotation engagement, contact intent, confirmed website submissions, and email failures.
- **FR27:** IF analytics are unavailable or fail THEN THE SYSTEM SHALL preserve navigation, animations, quotation calculations, form feedback, and email submission behavior.
- **FR28:** WHEN a contact or evaluation form becomes visibly exposed THE SYSTEM SHALL record one eligible form view per form instance per page view.

### Technical / Non-functional
- **TR1:** The existing free GA4 and Meta measurement direction remains the constraint; this specification introduces no paid analytics provider. Provider-specific naming is a later mapping concern, while catalog event semantics are canonical.
- **TR2:** Generic analytics and operational metric records exclude names, emails, phone numbers, brand names, free text, email subjects/bodies, full query strings, raw exceptions, and persistent personal identifiers. Exclusion covers implicit page locations, titles, referrers, automatic link/form collection, and diagnostic payloads as well as custom fields.
- **TR3:** Any existing explicitly consented Meta identity matching remains a separate restricted lane; only its required matching data may be used there, never copied into generic events or operational metrics. Evaluation submissions cannot require an absent phone number to qualify as a lead.
- **TR4:** A canonical lead counts once per successful logical submission across browser/server delivery and repeated success rendering. A new intentional submission has a new attempt identity; retransmission retains the original event identity. Leads count successful logical submissions, not transport attempts, unique people, or qualified clients. The automatic unknown-outcome retry shares the original logical submission and cannot create a second lead. A deliberate retry links to its prior attempt through an opaque retry-parent identity or bounded attempt number; this introduces no person profile or requirement to make email transport idempotent.
- **TR5:** Page and destination identity use canonical paths; only the validated `servicio` selector may represent query-derived service context. Unknown selector values become unspecified query context; the actual displayed quotation selection remains separately measurable.
- **TR6:** Stable catalog identifiers survive copy, layout, theme, animation, and language changes. Field names, enums, and optionality follow the catalog; unregistered strings and arbitrary page content are rejected.
- **TR7:** Money uses integer minor units and `MXN`; unknown/custom quotation amounts are null. Estimates and evaluation prices are not purchases, collected revenue, or payment events.
- **TR8:** Section/step visibility requires at least 50% of the tracked content target visible for one continuous second in a visible document. Oversized sections use a bounded representative content target. Scroll milestones are 25%, 50%, 75%, and 90% of scrollable page progress; pages with no scrollable distance produce none.
- **TR9:** Delayed eligible event retention is limited to 50 events and 30 seconds; repeated pending page/section impressions coalesce by their identity. Revocation clears retained events; expired events and overflow are discarded without retrospective replay.
- **TR10:** Animation frames, raw pointer movement, raw scroll ticks, automatic review rotation, rerenders, and programmatic default selection produce no deliberate-interaction events.
- **TR11:** Correlation IDs are opaque, short-lived event/page/form/quotation/attempt identifiers, excluded from high-cardinality reporting dimensions. Consented session attribution contains sanitized source/medium/campaign categories only; no cross-site or persistent person profile is introduced.
- **TR12:** Operational email metrics cover all website email attempts regardless of marketing consent, with attempt correlation, form kind, safe stage/outcome, and duration only. They carry no marketing session identity, campaign data, or contact content when consent is absent.
- **TR13:** Consent is evaluated at collection and marketing dispatch, including server dispatch; granting consent never replays pre-consent actions. Marketing failures do not change an accepted email outcome or trigger another email send.

## Inputs & Outputs
- **Inputs:** Current canonical page, rendered action/content identifiers, valid service selection, quotation configuration, deliberate user interactions, viewport visibility, consent state, form attempt lifecycle, and email transport result.
- **Output A — consented journey events:** Typed canonical event records defined in `measurement-catalog.md`, including page and source context and permitted event-specific properties.
- **Output B — operational email metrics:** `email_attempted` and `email_result` records for website form messages, without personal data or marketing attribution for nonconsenting visitors.
- **Output C — reporting contract:** Service/source/channel breakdowns and defined funnel, intent, conversion, and failure measures from the catalog.
- **Current monetary fixtures:** One trademark class without ownership rules = 589977 cents; evaluation = 79900; management = 228700 per class; official fee = 281377 per class; ownership rules = 61600 once. Quotation analytics reflect the currently displayed estimate if prices change.

## Scope
### In scope
- Eleven current canonical URLs, seven page types, five services, all quotation selections, both website forms, shared navigation/footer/sticky surfaces, and all rendered conversion-oriented links.
- Core business events and the bounded engagement events explicitly listed in the catalog.
- Consent correctness, sanitized attribution, browser/server outcome deduplication, reporting definitions, and acceptance evidence.
- Website-generated emails, currently the contact and trademark evaluation messages; future website email kinds must declare a catalog identity before launch.
### Out of scope (non-goals)
- Implementation, provider account setup, deployment, purchases, invoices, CRM status, signed engagements, or paid-service completion.
- Firm-wide mailbox monitoring or emails sent outside the website.
- Confirming an external mail app actually sent a message, WhatsApp conversation delivery, inbox delivery, opens, clicks inside delivered email, bounces, or replies; these are not observable in the current website flow.
- Session replay, heatmaps, keystroke/field-value tracking, per-frame animation analytics, or new persistent visitor profiles.

## Assumptions
- Existing provider direction and explicit opt-in remain the intended product choices; this is a proposed replacement measurement contract, not evidence that tracking is already complete.
- “All emails sent” means website-generated outbound messages. Intended-recipient transport acceptance is the success boundary and does not prove inbox delivery; ambiguous outcomes remain unknown.
- Proposed visibility thresholds, scroll milestones, and retention bounds are defaults for this draft and may be adjusted before implementation planning.
- Direct quotation links carry explicit service context; a generic contact request remains `unspecified` unless an explicit or consented referral context exists. The quotation calculator's default service is a displayed selection, not proof of the visitor's expressed interest.
- Legacy analytics documents remain historical context; conflicting event/counting semantics are superseded by this draft once approved. Historical metric continuity needs an explicit mapping before launch.

## Acceptance Criteria
Local implementation evidence for every criterion is recorded in `verification.md`. The release checklist below remains open where actual provider/account or hosting evidence is required; local mocks are not production approval.
- [ ] **AC1:** All eleven URLs record one page view on direct load, internal arrival, and back/forward arrival; query-driven quotation changes and local selections are classified without duplicate page views from provider readiness or rerenders. (verifies FR1–FR2, TR5)
- [ ] **AC2:** Every rendered navigation and conversion action in the coverage inventory has a stable source/action/destination identity on desktop and mobile; unrendered legacy components produce no events. (verifies FR3, TR6)
- [ ] **AC3:** All five directory selections and quotation service selections report the correct previous/new service; initial defaults do not masquerade as user choices. (verifies FR4–FR6, TR10)
- [ ] **AC4:** Quotation fixtures cover classes 1 and 10, rules off/on, payment counts 1/2/3, and four custom services; snapshots match displayed estimates, with null money for custom proposals. (verifies FR5–FR7, TR7)
- [ ] **AC5:** Opening/closing evaluation, first field interaction, validation failure, valid submission, failure, retry, and success produce their prescribed lifecycle records for both forms without field values. (verifies FR8–FR11, TR2)
- [ ] **AC6:** Both forms emit operational attempted/result counts for intended-recipient acceptance, recipient rejection, transport failure, and unknown transport outcomes under granted, denied, and unknown consent; validation rejection produces no transport attempt. Unknown triggers exactly one retry; verify unknown→accepted, unknown→unknown, and unknown→failure with distinct transport records, no third automatic attempt, and at most one lead per logical submission. (verifies FR12–FR13, TR12)
- [ ] **AC7:** Accepted contact and evaluation messages each create one eligible lead; repeated success handling or browser/server delivery counts once, while a new intentional attempt has a new identity. (verifies FR14–FR15, TR3–TR4)
- [ ] **AC8:** Quotation mail links, all direct mail links, WhatsApp links, and social links report intent and never increment accepted-email or canonical-lead totals. (verifies FR7, FR16)
- [ ] **AC9:** Section/step tests distinguish actual visibility from arrow progress; repeated scrolling, hidden tabs, reduced-motion mode, and automatic review rotation do not inflate impressions or deliberate actions. (verifies FR17–FR19, TR8, TR10)
- [ ] **AC10:** Each configured scroll threshold records at most once per page view and produces no raw scroll stream. (verifies FR20, TR8, TR10)
- [ ] **AC11:** Unknown/denied consent causes zero GA4/Meta browser or server traffic; a mid-page grant records only the current page and qualifying subsequent events, including content still visible after grant. (verifies FR21–FR22, TR13)
- [ ] **AC12:** Revocation stops loaded-provider and server marketing dispatch and clears retained events; pre-grant actions never appear after a later grant. (verifies FR21–FR24, TR9, TR13)
- [ ] **AC13:** Delayed provider readiness preserves eligible event identity without duplicating the current page; blocked providers, overflow, expiration, and missing configuration preserve the user journey. (verifies FR24, FR27, TR9)
- [ ] **AC14:** Payload and diagnostic inspection finds no forbidden personal data, including crafted query/referrer/free-text values and provider automatic collection; generic contact has no invented trademark attribution. (verifies FR25, TR2–TR3, TR5, TR11–TR12)
- [ ] **AC15:** Reports reconcile one canonical conversion with one successful logical website submission, separate intents from sends, expose missing/unknown attribution, and identify consent-limited totals. (verifies FR26, TR4, TR11–TR12)
- [ ] **AC16:** A coverage checklist crosses every page type/service, desktop/mobile controls, consent state, reload/history navigation, validation/transport outcomes, duplicate deliveries, and analytics outage without breaking functional behavior. (verifies FR1–FR28, TR1–TR13)
- [ ] **AC17:** Contact and evaluation forms record one view per visible form instance per page view; hidden or unmounted forms produce no exposure event, and repeated rendering does not inflate the view-to-start denominator. (verifies FR28, TR8)

## Open Clarifications
- [NEEDS CLARIFICATION: Who owns approval of conversion/key-event definitions and access to the existing GA4 and Meta reporting destinations?] Nonblocking for this specification; required before production verification.
- [NEEDS CLARIFICATION: What retention periods are approved for consented analytics and content-free operational email metrics?] Nonblocking for authoring; required before collection changes go live.
- [NEEDS CLARIFICATION: Which existing historical event names/key events must retain reporting continuity?] Nonblocking for event semantics; required before final provider mappings and cutover.
