# Implementation verification

Status: all six application implementation phases complete and locally verified; production activation gates remain open.

## Local checks performed

- 33 native tests passed with Node 26: existing quotation behavior, all calculator combinations/custom amounts, canonical contracts, bounded buffering/readiness, consent and GA disable sequencing, safe service attribution, responsive visibility targets, email outcomes/retry limits, signed cookies/encrypted receipts, trusted website context, and operational report reconciliation.
- ESLint, TypeScript (`tsc --noEmit`), and `git diff --check` passed.
- Next 16.2.3 production build passed. Root tracking remains behind Suspense; cookies/headers are read in server actions. Existing static/SSG routes remain static; quotation retains its existing request-dependent query rendering.
- Real local SMTP tests use Nodemailer over loopback TCP: acceptance/rejection, DATA timeout followed by acceptance, two unknown results, and unknown followed by rejection. Exactly two transports maximum; one submission identity; no live email.
- The actual Meta HTTP client ran against Postman local mocks: accepted response, invalid synthetic token/HTTP 400, injected HTTP 503, and a response exceeding its deadline. Final accepted request includes canonical synthetic source and synthetic user agent. Request logs showed the real client reached the stand-in. No live Meta call.
- Operational report CLI was run against extracted synthetic NDJSON: one logical submission, two transport attempts, one automatic retry, one confirmed submission, zero unresolved submissions. Safe lookup/export and malformed-line behavior have native tests. The server-rendered quotation/contact HTML was also fetched directly and confirmed to omit client-only lifecycle IDs.

## Browser evidence and acceptance mapping

Isolated Chrome uses synthetic SDKs, blocks other external requests, and sends SMTP only to a local fixture. Browser results establish application event ownership and business flow behavior; they do not establish actual Google/Meta SDK automatic collection or account configuration.

| Acceptance criteria | Local evidence | Production or remaining evidence |
| --- | --- | --- |
| AC1 | Eleven direct URLs each produced exactly one GA4 and one Pixel page view; internal/history arrival and query-only quotation changes checked. | Verify actual SDK/account automatic page views are disabled. |
| AC2 | Rendered controls have registered semantic identities; desktop/mobile navigation checked. | Final regression passed; see below. |
| AC3–AC4 | Five directory choices, quote changes/disclosures, calculator fixtures and custom unknown amounts passed. | None for pure calculation contracts. |
| AC5 | Both forms: native validation, rejection, retained fields, accepted results, deliberate retry, email-only evaluation. | Final regression passed; see below. |
| AC6 | Native injected transport and real local SMTP failure/uncertainty/retry tests passed across operational consent states. | Host SMTP deadlines must fit deployment limits. |
| AC7 | Same accepted outcome deduplicated in runtime; one retry remains one submission. | Actual Meta browser/server deduplication and GA4 key-event setup. |
| AC8 | Quotation mail activation produced intent without lead; registered channel mappings checked. | Actual email/WhatsApp delivery is outside website observability. |
| AC9–AC10 | Qualified target selection, manual process/review events versus automatic progress, bounded scroll/step observers implemented. | Real hidden-tab/foreground qualification and 25/50/75/90 once-per-page milestones passed; see below. |
| AC11–AC12 | Unknown/denied gating, grant, revoke, storage failure, queue clearing, and revoked-during-pending-SMTP checks passed locally. | Actual SDK network inspection after configuration; in-flight requests cannot be recalled. |
| AC13 | Queue bounds/expiry/readiness/outages verified with fake adapters and real HTTP timeout. | Browser-owned attribution remains best effort. |
| AC14 | Enum/field allowlists, URL sanitization, synthetic PII canaries, encrypted matching evidence, content-free operational logs. | Inspect actual implicit SDK payloads before enabling browser providers. |
| AC15 | Synthetic email reconciliation and report CLI passed; funnel/denominator/cutover definitions in operations.md. | Demonstrate export/search and retention on actual hosting logs. |
| AC16–AC17 | Native matrix and production build pass; form/quotation visibility use one owner and per-instance guards. | Final browser form-instance/flow regression passed; see below. |

## Browser regression result

Final production-build browser run exited 0 and reported `{result: "passed", smtpTransactions: 4, smtpConnections: 5}`. Verified:

- Eleven URLs, exactly one initial eligible page view per GA4 and Pixel destination, SPA/history/query behavior, desktop/mobile navigation, all directory choices, quotation changes/disclosures/custom unknown prices, and intent without a lead.
- Qualified form views, first edits, native validation, rejected submissions, retained fields, exactly one unknown-outcome retry, one lead, email-only evaluation success, and a new form instance when the modal is reopened.
- Two synchronous pending submit activations produce one submission attempt/transport. Revoking during held SMTP acceptance produces no marketing conversion; subsequent denied activity stays suppressed.
- Server HTML omits random lifecycle IDs; post-hydration quotation view/change and form view/start IDs match. No hydration warnings or runtime exceptions.
- Actual trademark-step visibility, crafted personal query exclusion, unsafe-query Pixel suppression, and payload PII canaries. Unsafe hash changes revoke Pixel collection; clearing the hash resumes eligibility without an extra page view. Query/anchor-only history retains canonical page identity and impression guards.
- A real second tab in the same browser window backgrounds the evaluation form for 1.4 seconds: zero form views while hidden, then one qualified view after foregrounding. Long-page bottom/top/bottom scrolling records each of 25/50/75/90 exactly once.
- A real visible browser click navigates the existing process under normal motion. Offscreen programmatic clicks were replaced with a visible user-flow check; no animation redesign was needed.

The stricter provider checks found and fixed a first-consent Meta readiness race: provider availability now remains separate from consent, so the first eligible page can queue before SDK initialization while dispatch still rechecks consent/context. Same-choice consent confirmation is a no-op; a genuine regrant creates a fresh page-view identifier for exposure denominators (native regression assertions pass).

Earlier missing impressions were traced to background headless tabs: actual `document.visibilityState` was hidden, so suppression was correct. The harness now brings its target to the foreground when qualifying visibility. Hidden responsive content is excluded from representative targets, and replaced targets cancel stale timers.

## Production gates

- [ ] Named reporting/provider and deployment-log owners.
- [ ] Approved analytics/log retention and demonstrated real-host search/export/access.
- [ ] Supported Meta version, required fields/permissions, and Events Manager deduplication evidence.
- [ ] Actual Google/Meta SDK privacy/network inspection and automatic-measurement settings.
- [ ] Production secret, trusted website origin, provider credentials, and deployment-compatible SMTP bounds.
- [ ] Legacy event/key-event cutover and baseline reset approval; deployment date recorded.

Browser providers stay disabled unless `NEXT_PUBLIC_ANALYTICS_PROVIDERS_REVIEWED=true` is explicitly set at build time. Meta server dispatch additionally requires fresh signed consent, a valid five-minute encrypted accepted receipt, trusted website evidence, and configured credentials/version. See [operations.md](./operations.md). The synthetic test server, SMTP fixtures, and Postman simulations were stopped. A regular build with browser provider activation disabled replaces the synthetic build; the development preview remains available at localhost:3000. Verification did not deploy the site or mutate provider accounts.
