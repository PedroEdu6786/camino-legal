# Analytics — Technical Plan

Consolidated technical view of everything under `.claude/analytics/`. The three documents divide the work like this:

| Doc | Role |
|---|---|
| `spec.md` | **What & why** — goals, event model, decisions (consent banner, CAPI in scope) |
| `tasks.md` | **How** — 10 ordered tasks with complete code, FR/NFR mapping, acceptance criteria |
| `plan.md` (this file) | **Full technical requirements + gap analysis** — what the other two assume, what was missing, what is accepted as a limitation |
| `improvements.md` | **Deferred** — Microsoft Clarity, Umami (out of scope for this build) |

---

## 1. Architecture

### Client data flow

```
Visitor lands
   └─ ConsentBanner (no stored choice) ── "Rechazar" ──► choice persisted, nothing ever loads
                                       └─ "Aceptar"  ──► localStorage + CONSENT_GRANTED_EVENT
                                                              │
AnalyticsScripts (listens) ◄──────────────────────────────────┘
   ├─ mounts GA4 (gtag.js, afterInteractive) ──► page_view auto
   └─ mounts Meta Pixel (fbevents.js)        ──► PageView auto

Components ──► app/lib/analytics.ts (trackEvent / trackMeta)
   ├─ window.gtag?.(…)  — no-ops if GA4 absent (declined / blocked / no env var)
   └─ window.fbq?.(…)   — no-ops if Pixel absent
```

### Server data flow (form submission)

```
Contact form (consent granted)
   ├─ hidden field metaEventId = crypto.randomUUID()   ← generated in effect, post-hydration
   └─ submit ──► sendEmail.ts (server action)
                    ├─ nodemailer sendMail ── fails ──► error state, NO analytics anywhere
                    └─ success
                         ├─ metaEventId present ──► metaCapi.ts ──► POST graph.facebook.com/v21.0/{pixel}/events
                         │      Lead { event_id, em: sha256(email), ph: sha256("52"+phone) }
                         │      (errors logged + swallowed — never fails the form)
                         └─ success state ──► client useEffect
                                ├─ gtag  contact_form_submit
                                └─ fbq   Lead { eventID: metaEventId }  ← Meta dedups the pair
```

### Module responsibilities

| Unit | Responsibility | Depends on |
|---|---|---|
| `app/lib/analytics.ts` | Consent state (read/write/notify) + the only `gtag`/`fbq` call sites | browser globals only |
| `app/components/ui/AnalyticsScripts.tsx` | Mount scripts when consent allows | `analytics.ts`, `next/script` |
| `app/components/ui/ConsentBanner.tsx` | Capture the choice | `analytics.ts` |
| `app/components/ui/SectionViewTracker.tsx` | All `section_view` events from one observer | `analytics.ts` |
| `app/lib/metaCapi.ts` | Server CAPI `Lead`, PII hashing | `node:crypto`, env vars |
| Instrumented components | One-line `trackEvent`/`trackMeta` calls in existing handlers | `analytics.ts` |

---

## 2. Technical Requirements (consolidated)

### Configuration & infrastructure

- **TR-01** Create `.env.local` — **the file does not exist yet** (verified; `.gitignore` line 34 already excludes `.env*`, so it is safe to create):
  ```env
  NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
  NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXXX
  META_ACCESS_TOKEN=...        # server-only; never NEXT_PUBLIC_
  ```
- **TR-02** `NEXT_PUBLIC_*` values are **inlined at build time** — changing them in production requires a rebuild/redeploy, not just an env edit. Production values live in the hosting dashboard (and SMTP vars already follow this pattern, so the deployment mechanism exists).
- **TR-03** No new npm dependencies. `next/script` (`afterInteractive` verified as the Next 16 default in `node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md`), `node:crypto`, and browser `crypto.randomUUID()` (available in secure contexts — production HTTPS and localhost both qualify) cover everything.
- **TR-04** Graph API pinned to `v21.0`. Meta sunsets versions roughly every two years — record an expectation to bump the version string in `metaCapi.ts` when Meta announces deprecation.

### Client tracking core

- **TR-05** Single tracking module (`analytics.ts`): closed union of event names, optional-chained `gtag`/`fbq` so every call is a safe no-op when scripts are absent (declined consent, ad blocker, missing env var).
- **TR-06** Consent persisted under `localStorage["analytics-consent"]` (`"granted"`/`"denied"`); mid-session grants propagate via a `window` event so scripts mount without a reload.
- **TR-07** Scripts render `null` until consent — verifiable as zero network requests to `googletagmanager.com` / `connect.facebook.net` before acceptance.

### Event instrumentation

- **TR-08** Eight events as specified in `spec.md` §Event Model: `cta_click(source)`, `whatsapp_click(source)`, `email_click(source)`, `social_click(network)`, `section_view(section)`, `form_start`, `contact_form_submit`, plus native `page_view`/`PageView`. Param values are fixed low-cardinality strings (`navbar|hero|services|banner|sticky_bar`, `contact_card|sticky_bar|footer`, `instagram|facebook|linktree`, section ids).
- **TR-09** Fire-once guards: `section_view` unobserves per section; `form_start` and `contact_form_submit` use refs. All per page view.
- **TR-10** `section_view` comes from one dedicated tracker component so server components (`Process`, `About`, `FAQ`) stay server components.

### Server side (CAPI)

- **TR-11** `Lead` dedup contract: same UUID travels client → hidden field → server `event_id` → client Pixel `eventID`. Both events named `Lead`. Meta requires `event_name` + `event_id` to match for dedup.
- **TR-12** PII normalization before hashing (Meta's matching spec): email `trim().toLowerCase()`, phone digits-only with country code (`"52" + phone` — the form already restricts input to 10 digits).
- **TR-13** Failure isolation: CAPI errors are logged (`console.error`) and swallowed; missing env vars return early; the user-visible form result is unaffected in every case.
- **TR-14** Consent reaches the server **implicitly**: no `metaEventId` field ⇒ no consent ⇒ no CAPI call. No separate consent flag needed.

### Legal content

- **TR-15** Aviso de Privacidad (TermsModal): add Google LLC + Meta Platforms to the §III transfers list; rewrite §VIII cookies paragraph to reflect the consent banner. Aviso de Cookies: add a processors paragraph. Spanish with HTML entities, per project convention.

### External (non-code) setup

- **TR-16** GA4 property + measurement ID; link to Google Search Console; mark `contact_form_submit` and `whatsapp_click` as key events; **enable Enhanced Measurement** (gap G-03 below).
- **TR-17** Meta Business: Pixel + CAPI system-user token; verify dedup in Events Manager → Test Events.
- **TR-18** UTM convention for owned links (gap G-02 below).

---

## 3. Gap Analysis

Things the spec/tasks did not cover, found while consolidating. Each is either **resolved here** (folded into the requirements above) or **accepted** (recorded in §4).

| # | Gap | Disposition |
|---|---|---|
| G-01 | **`.env.local` doesn't exist** — tasks.md said "add to `.env.local`" assuming it existed. No `.env*` file is present in the repo. | **Resolved** → TR-01 creates it; `.gitignore` already covers it. |
| G-02 | **No UTM convention.** The spec's first goal is "where do visitors come from," but the Instagram bio, Linktree, and any boosted posts won't attribute cleanly without tagged URLs (Instagram app webviews often strip referrers). | **Resolved** → TR-18: tag owned inbound links `?utm_source=instagram\|facebook\|linktree&utm_medium=social` (and `utm_medium=paid` + `utm_campaign=<name>` for boosted posts). One-time manual task alongside TASK-10. |
| G-03 | **GA4 Enhanced Measurement unmentioned.** Free, admin-toggle scroll/outbound/site-search tracking; its history-change tracking is also what makes `page_view` work across client-side navigations in Phase 2. | **Resolved** → TR-16: enable it during TASK-10. Overlap note: its generic `click` outbound event coexists fine with our richer custom events. |
| G-04 | **GA4 DebugView needs a debug signal** — events don't appear in DebugView without `debug_mode` or the Google Analytics Debugger extension. tasks.md verification steps assumed it just works. | **Resolved** → verification protocol in §5. |
| G-05 | **Consent-grant race window.** Between clicking "Aceptar" and the scripts finishing load, `gtag`/`fbq` are undefined, so a click event in that ~1–2s window is silently dropped. | **Accepted** (L-02). Mitigation (stub queues in `analytics.ts`) isn't worth the complexity for a banner-adjacent edge case. |
| G-06 | **React Strict Mode dev double-fire.** Next enables Strict Mode; dev builds double-invoke effects, so `section_view` observers mount twice and may double-report in dev. | **Accepted** (L-03). Dev-only; production unaffected. Verify counts in production builds (`npm run build && npm run start`), which TASK-10 already prescribes. |
| G-07 | **Phase 2 (multi-page) Pixel pageviews.** GA4 handles SPA navigations via Enhanced Measurement (G-03), but Meta Pixel fires `PageView` only on script load — client-side route changes need a manual `fbq('track', 'PageView')` on pathname change. | **Deferred by design** → recorded as a required line item for the architecture-refactor spec (`.claude/architecture-refactor/spec.md`). Nothing to build now. |
| G-08 | **No CSP today, but a trap later.** `next.config.ts` sets no security headers, so no allowlisting is needed now. If a CSP is ever added, it must allow `googletagmanager.com`, `*.google-analytics.com`, `connect.facebook.net` (script/connect) — and nothing for CAPI (server-to-server). | **Resolved** → recorded here as a constraint on future work. |
| G-09 | **No UI to revoke consent.** The cookies notice (TASK-09) tells users to clear site data — legally adequate under LFPDPPP, but there's no in-page way to change a stored decision. | **Accepted** (L-04) → future improvement: a "Cookies" footer link that clears the stored choice and re-shows the banner. Added to `improvements.md` territory; not in this build. |
| G-10 | **Ad-blocker blind spot.** Client events (everything except the form `Lead`) have no server backup; uBlock-class blockers also block GA4 entirely. | **Accepted** (L-01) — inherent to the free client-side stack; the highest-value event (`Lead`) is the one CAPI protects. |
| G-11 | **No automated tests.** The repo has no test runner; tasks.md verification is lint + build + manual protocol. | **Accepted** — consistent with the whole repo. Introducing a test framework for analytics glue would be scope creep; the logic-bearing unit (`analytics.ts`) is trivial by design. |

No unresolved blockers — every gap is either folded into the requirements or consciously accepted below.

---

## 4. Known Limitations (accepted)

| # | Limitation | Why it's acceptable |
|---|---|---|
| L-01 | Ad blockers drop all client events; only the form `Lead` has a server-side backup | Free-stack constraint; affected share of a Mexican SMB audience is modest; relative funnel comparisons stay valid |
| L-02 | Events in the seconds between consent grant and script load are lost | Rare path (user must convert *immediately* after accepting); zero-complexity tradeoff |
| L-03 | Dev builds may double-fire effect-driven events (Strict Mode) | Production unaffected; verification protocol uses production builds |
| L-04 | Consent revocation requires clearing browser site data | LFPDPPP-adequate; revocation UI listed as a future improvement |
| L-05 | Declined consent = invisible visitor (no cookieless ping; we chose hard gating over Google Consent Mode) | Simpler and stricter than the legal minimum; Consent Mode matters for EEA, not Mexico |
| L-06 | GA4 data sampling above 500k sessions/report | Far beyond current traffic |

---

## 5. Verification Protocol (consolidates TASK-10 + G-04)

1. **Build gates** — `npm run lint && npm run build` after every task (already in tasks.md).
2. **GA4 debug** — verify events in DebugView using the Google Analytics Debugger extension, or temporarily append `{ debug_mode: true }` to the `gtag('config', …)` call in `AnalyticsScripts.tsx` while testing (remove before merging).
3. **Meta debug** — Meta Pixel Helper extension for browser events; Events Manager → Test Events for CAPI, confirming the browser/server `Lead` pair shows **Deduplicated**.
4. **Consent matrix** — fresh profile: (a) no choice → zero analytics requests, banner visible; (b) decline → zero requests forever, banner gone after reload; (c) accept → scripts load *without* reload, all 8 events fire; (d) accept + reload → scripts load from stored consent, banner stays hidden.
5. **Production-mode pass** — full event sweep on `npm run build && npm run start` (avoids L-03 noise).
6. **Failure injection** — unset `META_ACCESS_TOKEN`, submit form → success state still shown, error logged server-side only.

---

## 6. Out of Scope (this build)

- Microsoft Clarity, Umami (`improvements.md`)
- Consent revocation UI (G-09 follow-up)
- GA4 dashboards/explorations and Looker Studio reports — dashboard building happens after data accumulates
- A/B testing, scroll-depth percentages, heatmaps
- Phase 2 route-change tracking (G-07 — belongs to the architecture refactor)

---

## 7. Readiness

With G-01…G-04 folded in, `tasks.md` is implementable end-to-end: 10 tasks, no unresolved dependencies, no missing decisions. The only work that can't be done in this repo is TASK-10's account setup (GA4 property, Meta pixel + token), which needs owner access to Google/Meta business accounts.
