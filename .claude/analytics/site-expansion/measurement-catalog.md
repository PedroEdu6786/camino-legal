# Measurement catalog: expanded Camino Legal site
> Status: implemented locally; production verification pending · Companion to `spec.md` · 2026-10-23

Canonical events describe business meaning, not provider-specific calls. Core events are required business coverage; engagement events are bounded secondary coverage and never lead conversions. Marketing events require granted consent; operational email records have the separate rules below. This catalog supersedes conflicting landing-page event semantics when the new specification is approved.

## Page and service identities

| Canonical path | Page type | Service context |
|---|---|---|
| `/` | `home` | `unspecified` |
| `/servicios` | `service_directory` | Selected preview only; no implicit expressed interest |
| `/servicios/registro-de-marca` | `service_detail` | `registro-de-marca` |
| `/servicios/contratos-y-convenios` | `service_detail` | `contratos-y-convenios` |
| `/servicios/derechos-de-autor` | `service_detail` | `derechos-de-autor` |
| `/servicios/consultoria-legal` | `service_detail` | `consultoria-legal` |
| `/servicios/paquete-web-legal` | `service_detail` | `paquete-web-legal` |
| `/cotizaciones` | `quotation` | Actual displayed selection; explicit valid `servicio` context separately identified |
| `/nosotros` | `about` | `unspecified` |
| `/preguntas` | `faq` | Item/link-specific service only when explicit |
| `/contacto` | `contact` | Explicit or consented referral context, otherwise `unspecified` |

These are eleven URLs and seven page types. A local service selector is not a new page. A quotation query selector can change the quotation context without changing its canonical path. Generic navigation never defaults service attribution to trademark registration.

## Shared data contract

| Field | Type / permitted meaning |
|---|---|
| `schema_version` | Integer, initially `1` |
| `event_name` | Catalog enum below |
| `event_id` | Opaque event identity; stable on retransmission |
| `occurred_at` | Event timestamp; not retransmission time |
| `page_view_id` | Opaque identity of current navigation; repeated arrival has a new identity |
| `page_path`, `page_type` | Canonical path and seven-type enum above |
| `service_id` | Five service slugs or `unspecified` |
| `service_context` | `explicit`, `referral`, `displayed_default`, `unspecified`; explicit selection outranks referral |
| `source_surface` | Registered surface from coverage table |
| `action_id`, `content_id` | Registered stable identity where relevant; no visible/free-text labels |
| `destination_kind` | `internal`, `whatsapp`, `email`, `social`, `official_reference`, `dialog` |
| `destination_id` | Canonical route or registered destination alias; no full external URL, email address, or query body |
| `consent_status` | `granted` for marketing records; operational records permit `granted`, `denied`, `unknown` |
| `form_id` | `contact` or `trademark_evaluation` when applicable |
| `form_instance_id`, `attempt_id`, `quote_id` | Opaque lifecycle correlation only; not reporting dimensions |
| `retry_parent_attempt_id` or `attempt_number` | Optional opaque prior-attempt identity or bounded positive retry ordinal; not a person identity |
| `interaction_origin` | `user` for deliberate controls; `visibility` for impressions |

Optional attribution fields are consented session source/medium/campaign categories and sanitized previous canonical page, never raw URLs or arbitrary campaign strings. Event and lifecycle IDs identify events, not people. Unsupported fields are excluded. Provider delivery metadata and canonical event identity must not be mistaken for guaranteed provider deduplication.

Quotation snapshot fields: `quote_id` (stable per quotation instance), `quote_type` (`estimate` or `custom`), `service_id`, `classes` (1–10 or null), `ownership_rules` (boolean or null), `payment_count` (1–3 or null), `estimated_total_minor` (integer or null), `evaluation_minor` (integer or null), `currency` (`MXN`), `price_kind` (`estimate`). Amounts reflect the displayed calculator; evaluation-only interest can include `evaluation_minor` without implying a purchase. The four custom services have null monetary values and null trademark-only controls.

## Core events

| Event | Observable trigger | Additional fields / counting |
|---|---|---|
| `page_view` | Current page after initial load, internal navigation, history arrival, or mid-page consent grant | One per eligible navigation identity; no duplicate from provider initialization |
| `navigation_click` | User activates ordinary internal navigation | `action_id`, source, canonical destination; not also `cta_click` for the same action |
| `cta_click` | User activates business CTA to service, quotation, contact, or evaluation | Action/source/destination; service and quotation snapshot where applicable |
| `service_select` | User changes directory preview service | `previous_service_id`, new `service_id`; not initial preview |
| `quote_view` | Quotation meets visibility threshold | Snapshot; once per quotation instance per page view |
| `quote_change` | User changes quotation configuration | `control_id`: `service`, `classes`, `ownership_rules`, `payment_count`; previous bounded value and resulting snapshot |
| `quote_request_intent` | User activates quotation mail request | Snapshot, action/source, `channel=email`; counts intent only |
| `evaluation_open` | Evaluation dialog becomes open after user request | `form_id`, quotation context; the open button is this event, not another business conversion |
| `evaluation_close` | User closes evaluation dialog | `close_reason`: `dismiss`, `escape`, `backdrop`, `success_done`, limited to supported paths |
| `form_view` | Form meets visibility threshold | `form_id`; once per visible form instance per page view, including evaluation |
| `form_start` | First deliberate interaction in each form instance | `form_id`; once per instance, no field value |
| `form_submit_attempt` | User submits either form | New `attempt_id` per deliberate attempt; pending double activation does not create another send |
| `form_validation_failed` | A submission is rejected before transport | `field_id` allowlist and `error_category`: `required`, `format`, `length`, `other_validation`; no error text |
| `form_submit_failed` | A valid attempt has transport rejection/failure or uncertain outcome | `failure_category`: `recipient_rejected`, `transport_failure`, `unknown`; retry is a new attempt |
| `lead_submitted` | Intended recipient accepted a valid website message | One canonical conversion per logical successful submission; same outcome identity for browser/server reporting |
| `whatsapp_click` | WhatsApp link activation | Action/source; `destination_id=business_whatsapp`; contact intent only |
| `email_click` | Ordinary mail link activation, excluding quotation request | Action/source; `destination_id=business_email`; intent only |
| `social_click` | Social link activation | `network=instagram|facebook|linktree`; intent only |
| `outbound_reference_click` | Official law reference activation | `destination_id=trademark_law`; informational, not contact intent |

One physical activation belongs to one primary action event above. A destination page view is a separate meaningful event. Do not sum `cta_click`, channel intent, and form success into a single “conversion” number. Existing provider-specific contact signals may represent intent but may not be relabeled as confirmed leads.

## Operational email events

These measure website email processing even without marketing consent. They are not automatically exported to marketing destinations. Allowed context is `event_id`, `occurred_at`, `attempt_id`, optional retry-parent identity or bounded attempt number, `submission_id` (opaque logical submission identity shared by automatic transport retries), `form_id`, `consent_status`, `stage`, `outcome`, `duration_ms` (nonnegative integer milliseconds), and a bounded error category. No user/profile, campaign, page history, recipient address, message content, or raw exception belongs here.

| Event | Trigger | Outcome |
|---|---|---|
| `email_attempted` | Validated message is actually handed to transport | One per actual transport attempt; invalid form is excluded |
| `email_result` | Transport operation reaches a known result or an uncertain terminal result | `accepted`, `recipient_rejected`, `transport_failure`, `unknown`; at most one terminal result per transport attempt |

`accepted` requires acceptance of the intended business recipient, not merely a resolved transport operation. `unknown` includes timeout/ambiguous acceptance; it is not a confirmed send. A reporting failure cannot turn accepted mail into rejected mail or cause another transport attempt. A new deliberate user retry is a distinct attempt linked to its prior attempt; re-delivery of the same metric outcome retains its event identity. An unknown transport outcome triggers exactly one automatic retry, with a distinct transport-attempt identity under the same logical submission; possible duplicate messages are accepted. Stop after the second transport attempt and flag any remaining uncertainty for operational review. Canonical leads count successful logical submissions, not transport attempts, unique people, or qualified clients; the automatic retry cannot create a second lead. No person-level deduplication or idempotent email-send requirement is introduced; separate accepted transport attempts may represent multiple messages, and reports retain that operational distinction. Browser and server representations of one accepted submission count once in marketing reports; operational send metrics and marketing lead totals are different populations.

## Secondary engagement events

| Event | Trigger and bounded properties | Maximum / distinction |
|---|---|---|
| `section_view` | Qualified visibility of registered section; `content_id` | Once per section/page view |
| `trademark_step_view` | Qualified visibility of actual step content; `step_id=01..05` | Once per step/page view; arrow position never qualifies |
| `faq_toggle` | Deliberate open/close; registered `faq_id`, `state=open|closed` | One per actual state change |
| `process_step_select` | Deliberate tab, next, or previous action; `step_id`, `control_id` | Automatic scroll progression excluded |
| `review_interaction` | Deliberate previous/next/dot control or manual swipe; `control_id` | Autoplay excluded; stable review ordinal only if needed |
| `quote_disclosure_toggle` | Deliberate quotation cost-detail open/close | `content_id=quote_cost_breakdown|quote_payment_schedule`, `state=open|closed`; each disclosure has its own identity |
| `scroll_depth` | Qualified 25/50/75/90% progress | Once per threshold/page view |
| `utility_interaction` | Menu, theme, or legal dialog/tab action | Optional lower-priority tier; bounded utility/action/state, never a conversion |

Visibility and scroll rules are specified in TR8. Consent grant while content remains visible starts a new eligibility window; past visibility is not replayed. Native form value edits, incidental focus, animation ticks, and hidden content are not engagement measures.

## Action and content coverage

Identity format is a registry convention, not a requirement about application structure. `{service}` expands to all five registered slugs; `{destination}` and `{item}` expand only to registered controls, never arbitrary strings. Responsive variants use the same semantic action plus `source_surface` to distinguish placement. Apply coverage to rendered surfaces, not unused legacy components.

| Surface | Stable action/content identities | Expected events |
|---|---|---|
| Shared desktop navigation | `nav.logo`, `nav.home`, `nav.services`, `nav.quotation`, `nav.about`, `nav.faq`, `nav.contact`; surface `navbar_desktop` | Navigation links; contact is CTA |
| Shared mobile navigation | Same semantic links; `nav.contact` on top pill and expanded menu distinguished by `navbar_mobile_pill` / `navbar_mobile_menu`; `nav.menu` utility | Navigation/CTA, optional utility |
| Shared footer | `footer.contact`, `footer.email`, `footer.social.{network}`, `footer.legal` | CTA, email/social intent, optional legal open |
| Legal dialog | `legal.email.{tab}`, `legal.tab.{item}`, `legal.close` | Email intent; optional tab/close utility; no legal content values |
| Consent controls | `consent.accept`, `consent.decline`, `consent.cookies`, `consent.privacy` | Consent behavior verified locally; no denied/unknown marketing event to report the choice |
| Mobile sticky bar where rendered | `sticky.contact`, `sticky.whatsapp` | CTA and WhatsApp intent |
| Home hero | `hero.services`, `hero.contact`, `hero.theme` | CTA; optional theme utility |
| Home service cards | `home.service.{service}`, `home.services_all`, `home.quotations` | CTA with explicit service for each card |
| Home/about process | `process.tab.{item}`, `process.previous`, `process.next`, `process.contact`, `process.quotation`, `process.start`, `process.continue` | Deliberate process engagement, CTA, or navigation by action meaning |
| Home story/banner | `home.about`, `home.banner_contact` | CTA |
| Home/about reviews | `reviews.previous`, `reviews.next`, `reviews.dot.{item}`, `reviews.swipe` | Manual review interaction; autoplay excluded |
| Service directory | `directory.select.{service}`, `directory.preview.{service}`, `directory.index.{service}`, `directory.contact` | Service select; service/contact CTAs |
| Every service detail | `service.breadcrumb`, `service.quote.{service}`, `service.back` | Navigation or quotation CTA with explicit service |
| Service detail sections | `service.scope`, `service.deliverables`, `service.investment`, `service.preparation` | Section impressions per service |
| Trademark route | `trademark.route`, `trademark.step.01` through `.05`, `trademark.milestones`, `trademark.law` | Section/step impressions; official outbound reference |
| Trademark FAQ | `trademark.faq.{item}` for its five published questions | FAQ toggles |
| Quotation workspace | `quote.service`, `quote.classes`, `quote.ownership_rules`, `quote.payment_count`, `quote.includes`, `quote.cost_breakdown`, `quote.payment_schedule`, `quote.request_email`, `quote.evaluation` | Quote view/change, includes navigation, cost-breakdown/payment-schedule disclosure open/close, request intent, evaluation open |
| Evaluation dialog | `evaluation.whatsapp`, `evaluation.submit`, `evaluation.close`, `evaluation.done`; form `trademark_evaluation` | Channel intent; form/email/lead lifecycle; open/close lifecycle |
| About | `about.contact`, `about.services`; belief/principles/process/reviews registered section identities | CTA, visibility and manual content engagement |
| Standalone FAQ | `faq.item.{item}`, `faq.link.{item}` for each published FAQ and linked answer | FAQ toggles and destination CTA/navigation |
| Contact page | `contact.whatsapp`, `contact.email`, `contact.submit`; form `contact` | Channel intent and form/email/lead lifecycle |
| Page-wide | Registered major intro/body/closing sections on each page, including quotation workspace and before-start guidance | Bounded section impressions and scroll milestones |

The implementation inventory must expand each item pattern to the current published items and give any newly rendered action a semantic registry ID. Link wording changes must not create new historical identities. Any relevant interactive disclosure found during that inventory is included; decorative graphics are excluded.

## Reporting contract

- **Traffic:** Eligible page views and consented sessions by page type, canonical path, device category, sanitized source/medium/campaign, and explicit unknown attribution. Provider-native aggregate geography may be used; no precise location collection.
- **Service interest:** Detail arrivals, card/source clicks, directory choices, and quotation selection by all five services. Displayed defaults remain distinguishable from expressed choices.
- **Journey:** Page discovery → service exploration → quotation view/change → contact intent → confirmed website lead. Show direct-contact paths and separate email/WhatsApp exits; this is not a mandatory linear checkout.
- **Quotation:** Views, interacted instances, configuration choices, service switches, evaluation opens, and request intents. Interacted instances are distinct `quote_id` values with at least one `quote_change`, `evaluation_open`, or `quote_request_intent`; no separate implied quotation-start event is counted. Displayed estimate distributions describe interest, not revenue.
- **CTA performance:** Activations by stable action/source/page/service, and downstream eligible leads where consented session context permits association. Click-through rate uses matching eligible visible surface impressions when available; otherwise report clicks, not an invented rate.
- **Forms:** Visible form instances, started instances, attempted submissions, validation failures, transport failures, successful submissions, and retries separately for contact/evaluation. View-to-start, start-to-success, and attempt-to-success rates state their denominator; inferred abandonment is started instances without observed success in the consented reporting window, not a guaranteed delivered browser-exit event.
- **Email operations:** Attempt and result counts by form/outcome, acceptance ratio = accepted / actual attempts, and duration distribution. Unknown outcomes remain visible; email-link intents are excluded.
- **Canonical conversion:** `lead_submitted` only; one per successful logical submission. Meta browser/server reporting represents that same outcome and cannot be summed into extra leads. GA4/Meta reconciliation may differ due to consent, blockers, attribution, and delivery limits; operational accepted-email totals cover a broader population.
- **Engagement:** Section/FAQ/process/review/trademark-step engagement is secondary, with no animation-derived completion rate.

## Current gaps and migration evidence (nonnormative)

The legacy specification describes landing-page coverage. Current source inspection shows gaps on new navigation/service/quotation surfaces and no evaluation submit-success tracking. Page-view behavior must be verified against actual destination settings: GA4 automatic navigation behavior can depend on configuration, while Meta currently declares its page view at initialization. Do not assume either no SPA page views or complete SPA coverage without runtime evidence.

Current generic emitters do not independently recheck consent; section observation can consume impressions before consent; the contact form keeps a page-lifetime event UUID and success guard rather than distinct per-attempt lifecycle. Evaluation has no phone and does not currently provide the same lead metadata. Email transport success currently reflects the send operation rather than a recipient-acceptance measurement contract. These are planning inputs, not claims that this specification has been implemented.

Preserve legacy spec/plan/tasks. Before launch, identify legacy names and provider key-event settings that would duplicate new canonical events, record their retirement/continuity mapping, and verify page-view ownership and one-outcome counting with actual destinations. No provider-side deduplication guarantee follows merely from attaching an event ID.

## References

- [Google: Measure page views](https://developers.google.com/analytics/devguides/collection/ga4/views) — automatic and manual page-view overlap can duplicate counts.
- [Google: Measure single-page applications](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications) — navigation measurement and verification guidance.
- [Google: Avoid sending personally identifiable information](https://support.google.com/analytics/answer/6366371/) — personal data restrictions include URL-related surfaces.

These references support measurement constraints; final provider mappings and live account settings remain implementation verification work.
