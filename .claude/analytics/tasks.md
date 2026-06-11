# Analytics — Task List

Based on `.claude/analytics/spec.md`. Tasks are ordered by dependency — TASK-01 to TASK-03 build the consent + loading foundation everything else relies on; TASK-04 onward wire individual events.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consent-gated GA4 + Meta Pixel + Meta CAPI tracking covering every conversion surface on the landing page.

**Architecture:** A single client module (`app/lib/analytics.ts`) owns consent state and exposes `trackEvent`/`trackMeta` helpers that no-op when scripts aren't loaded. A `ConsentBanner` writes consent; an `AnalyticsScripts` component conditionally mounts the GA4/Pixel `next/script` tags. Server-side, `sendEmail.ts` calls a CAPI helper only when the consent-gated `metaEventId` field arrives with the form.

**Tech Stack:** Next.js 16 App Router, `next/script` (`afterInteractive`, verified in `node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md`), `node:crypto` for PII hashing. No new dependencies.

**Verification note:** This project has no automated test infrastructure (no test script in `package.json`). Each task verifies with `npm run lint` + `npm run build` (both must pass) plus the manual checks in its acceptance criteria against `npm run dev`.

---

## Functional Requirements

| ID | Requirement | Tasks |
|---|---|---|
| FR-01 | A consent banner appears until the visitor accepts or declines; the choice persists in `localStorage`; the banner links to `#cookies` and `#privacidad` (which open the existing TermsModal) | TASK-03 |
| FR-02 | GA4 loads only after consent is granted — including when consent is granted mid-session without a reload | TASK-01, TASK-02 |
| FR-03 | Meta Pixel loads only after consent is granted and fires `PageView` on load | TASK-01, TASK-02 |
| FR-04 | `cta_click` fires with a `source` param from all five contact-bound CTAs: navbar, hero, services, banner, sticky_bar | TASK-04 |
| FR-05 | `whatsapp_click` fires with `source` (contact_card, sticky_bar) and also fires Meta `Contact` | TASK-05 |
| FR-06 | `email_click` fires with `source` (contact_card, footer) and also fires Meta `Contact` | TASK-05 |
| FR-07 | `social_click` fires with a `network` param (instagram, facebook, linktree) from the Footer | TASK-05 |
| FR-08 | `section_view` fires once per page view per section for: services, process, about, reviews, faq, contact | TASK-06 |
| FR-09 | `form_start` fires once per page view on first focus of any contact form field | TASK-07 |
| FR-10 | On form success: GA4 `contact_form_submit` + Pixel `Lead` fire client-side, the `Lead` carrying the shared `eventID` | TASK-07 |
| FR-11 | Server fires a CAPI `Lead` with the same `event_id` and sha256-hashed email/phone — only when the consent-gated `metaEventId` field is present | TASK-07, TASK-08 |
| FR-12 | The Aviso de Privacidad and Aviso de Cookies name Google (Analytics) and Meta as third-party processors | TASK-09 |

## Non-Functional Requirements

| ID | Requirement | Tasks |
|---|---|---|
| NFR-01 | **Performance**: all scripts use `strategy="afterInteractive"`; nothing analytics-related blocks render; the banner is `position: fixed` so it causes no layout shift | TASK-02, TASK-03 |
| NFR-02 | **Resilience**: tracking helpers no-op when `gtag`/`fbq` are absent (declined consent, blocked scripts); a CAPI failure never fails the form submission; missing env vars degrade silently (no crash, no broken UI) | TASK-01, TASK-02, TASK-08 |
| NFR-03 | **Privacy/security**: no raw PII in any GA4/Pixel event params; PII reaches Meta only sha256-hashed via CAPI; `META_ACCESS_TOKEN` stays server-only (no `NEXT_PUBLIC_` prefix) | TASK-01, TASK-08 |
| NFR-04 | **Maintainability**: every tracking call goes through `app/lib/analytics.ts` — no inline `gtag`/`fbq` calls scattered in components | TASK-01, all |
| NFR-05 | **Compatibility**: banner respects dark mode tokens, sits above the MobileStickyBar (`z-[60]`), uses Spanish copy with HTML entities | TASK-03 |
| NFR-06 | **Phase-2 proof**: no event assumes a single page; `section_view` keys on section id; `page_view` is native to both tools | TASK-06 |

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/lib/analytics.ts` | Create | Consent read/write + `trackEvent`/`trackMeta` wrappers (single tracking entry point) |
| `app/components/ui/AnalyticsScripts.tsx` | Create | Conditionally mounts GA4 + Pixel scripts based on consent |
| `app/components/ui/ConsentBanner.tsx` | Create | Accept/decline UI, persists choice |
| `app/components/ui/SectionViewTracker.tsx` | Create | One IntersectionObserver for all `section_view` events |
| `app/lib/metaCapi.ts` | Create | Server-side CAPI `Lead` with hashed PII |
| `app/layout.tsx` | Modify | Mount `AnalyticsScripts` + `ConsentBanner` |
| `app/page.tsx` | Modify | Mount `SectionViewTracker` |
| `app/components/layout/Navbar.tsx` | Modify | `cta_click` (desktop + mobile pills) |
| `app/components/sections/Hero.tsx` | Modify | `cta_click` |
| `app/components/sections/Services.tsx` | Modify | `cta_click` |
| `app/components/sections/Banner.tsx` | Modify | `cta_click` |
| `app/components/ui/MobileStickyBar.tsx` | Modify | `cta_click` + `whatsapp_click` |
| `app/components/sections/Contact.tsx` | Modify | `whatsapp_click`, `email_click`, `form_start`, `contact_form_submit`, hidden `metaEventId` |
| `app/components/layout/Footer.tsx` | Modify | `email_click`, `social_click` |
| `app/actions/sendEmail.ts` | Modify | CAPI call after successful send |
| `app/components/ui/TermsModal.tsx` | Modify | Google/Meta processor disclosure |

---

## TASK-01 — Analytics core module

**New file:** `app/lib/analytics.ts`

The single entry point for all tracking (NFR-04). Helpers no-op when scripts aren't loaded (NFR-02), so call sites never need to check consent themselves.

- [ ] **Step 1: Create the module**

```ts
export type ConsentStatus = "granted" | "denied" | null;

const CONSENT_KEY = "analytics-consent";
export const CONSENT_GRANTED_EVENT = "analytics-consent-granted";

export function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(status: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, status);
  } catch {
    // localStorage unavailable (private mode) — consent simply won't persist
  }
  if (status === "granted") {
    window.dispatchEvent(new Event(CONSENT_GRANTED_EVENT));
  }
}

type AnalyticsEvent =
  | "cta_click"
  | "whatsapp_click"
  | "email_click"
  | "social_click"
  | "section_view"
  | "form_start"
  | "contact_form_submit";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: AnalyticsEvent, params?: Record<string, string>) {
  window.gtag?.("event", name, params);
}

export function trackMeta(
  event: "Contact" | "Lead",
  options?: { eventID: string },
) {
  window.fbq?.("track", event, {}, options);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run lint && npm run build`
Expected: both pass (module compiles; nothing imports it yet)

- [ ] **Step 3: Commit**

```bash
git add app/lib/analytics.ts
git commit -m "feat: add analytics core module with consent state and tracking helpers"
```

**Acceptance criteria:** Module exports `getConsent`, `setConsent`, `trackEvent`, `trackMeta`, `CONSENT_GRANTED_EVENT`. Event names are a closed union type. Calling `trackEvent`/`trackMeta` with no scripts loaded does nothing and throws nothing.

**Requirements:** FR-02, FR-03 (foundation), NFR-02, NFR-03, NFR-04

---

## TASK-02 — Conditional script loading

**New file:** `app/components/ui/AnalyticsScripts.tsx`
**Modify:** `app/layout.tsx`

Mounts GA4 + Pixel only after consent, and reacts to consent granted mid-session via `CONSENT_GRANTED_EVENT` (FR-02, FR-03). Missing env vars render nothing (NFR-02).

- [ ] **Step 1: Create the component**

```tsx
"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_GRANTED_EVENT, getConsent } from "../../lib/analytics";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function AnalyticsScripts() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (getConsent() === "granted") setEnabled(true);
    const onGrant = () => setEnabled(true);
    window.addEventListener(CONSENT_GRANTED_EVENT, onGrant);
    return () => window.removeEventListener(CONSENT_GRANTED_EVENT, onGrant);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}');
          `}</Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}
```

- [ ] **Step 2: Mount in `app/layout.tsx`**

Add the import next to the existing `CustomCursor` import:

```tsx
import AnalyticsScripts from "./components/ui/AnalyticsScripts";
```

Add the component inside `<body>`, after `<CustomCursor />`:

```tsx
<CustomCursor />
<AnalyticsScripts />
{children}
```

- [ ] **Step 3: Add env vars to `.env.local` (values from GA4 admin / Meta Events Manager; placeholders fine until TASK-10)**

```env
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXXX
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual (`npm run dev`): with no consent stored, the Network tab shows **no** requests to `googletagmanager.com` or `connect.facebook.net`. Run `localStorage.setItem("analytics-consent", "granted")` in the console, reload — both scripts load.

- [ ] **Step 5: Commit**

```bash
git add app/components/ui/AnalyticsScripts.tsx app/layout.tsx
git commit -m "feat: load GA4 and Meta Pixel conditionally on consent"
```

**Acceptance criteria:** No tracking requests before consent. After consent (stored or granted mid-session), GA4 and Pixel load and Pixel fires `PageView`. Unset env vars render nothing without errors.

**Requirements:** FR-02, FR-03, NFR-01, NFR-02

---

## TASK-03 — Consent banner

**New file:** `app/components/ui/ConsentBanner.tsx`
**Modify:** `app/layout.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { getConsent, setConsent } from "../../lib/analytics";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (status: "granted" | "denied") => {
    setConsent(status);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[60] bg-background border-t border-foreground/10 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs md:text-sm opacity-70 flex-1">
          Usamos cookies para entender c&oacute;mo se usa el sitio y mejorar tu
          experiencia. Consulta nuestro{" "}
          <a href="#cookies" className="underline font-medium">
            aviso de cookies
          </a>{" "}
          y{" "}
          <a href="#privacidad" className="underline font-medium">
            aviso de privacidad
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => decide("denied")}
            className="rounded-lg border border-foreground/20 px-4 py-2 text-xs font-semibold transition-colors hover:border-foreground/40"
          >
            Rechazar
          </button>
          <button
            onClick={() => decide("granted")}
            className="rounded-lg bg-button-bg px-4 py-2 text-xs font-semibold text-button-text transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount in `app/layout.tsx`** after `<AnalyticsScripts />`:

```tsx
<CustomCursor />
<AnalyticsScripts />
<ConsentBanner />
{children}
```

with the import:

```tsx
import ConsentBanner from "./components/ui/ConsentBanner";
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual: fresh session (clear localStorage) shows the banner. "Aceptar" hides it and loads scripts without reload (TASK-02's listener). "Rechazar" hides it and never loads scripts. Reload after either choice — banner stays hidden. The `#cookies` / `#privacidad` links open the TermsModal tabs. On mobile, the banner overlays (sits above) the MobileStickyBar while undecided. Check dark mode rendering.

- [ ] **Step 4: Commit**

```bash
git add app/components/ui/ConsentBanner.tsx app/layout.tsx
git commit -m "feat: add analytics consent banner"
```

**Acceptance criteria:** Banner shows only when no choice is stored; both buttons persist the choice; accept enables tracking immediately (no reload); links open the existing modal tabs; no layout shift (fixed position); legible in dark mode.

**Requirements:** FR-01, NFR-01, NFR-05

---

## TASK-04 — `cta_click` on the five contact-bound CTAs

**Modify:** `app/components/layout/Navbar.tsx`, `app/components/sections/Hero.tsx`, `app/components/sections/Services.tsx`, `app/components/sections/Banner.tsx`, `app/components/ui/MobileStickyBar.tsx`

All five surfaces use the same `onClick={e => { e.preventDefault(); scrollTo("contact"); }}` pattern. Add a `trackEvent` call before the scroll. All files are already `"use client"`.

- [ ] **Step 1: Add the import to each file**

```tsx
import { trackEvent } from "../../lib/analytics";
```

(Path is `../../lib/analytics` from `components/layout`, `components/sections`, and `components/ui` alike.)

- [ ] **Step 2: Update each handler**

`Navbar.tsx` — both the desktop pill and the mobile pill (two `<a href="#contact">` elements):

```tsx
onClick={e => { e.preventDefault(); trackEvent("cta_click", { source: "navbar" }); scrollTo("contact"); }}
```

`Hero.tsx` — only the "Cuéntanos tu caso" anchor (the "Ver servicios" anchor is not a contact CTA; leave it untouched):

```tsx
onClick={e => { e.preventDefault(); trackEvent("cta_click", { source: "hero" }); scrollTo("contact"); }}
```

`Services.tsx` — the bottom CTA anchor:

```tsx
onClick={e => { e.preventDefault(); trackEvent("cta_click", { source: "services" }); scrollTo("contact"); }}
```

`Banner.tsx` — the CTA anchor:

```tsx
onClick={e => { e.preventDefault(); trackEvent("cta_click", { source: "banner" }); scrollTo("contact"); }}
```

`MobileStickyBar.tsx` — the "Escribir" button:

```tsx
onClick={() => { trackEvent("cta_click", { source: "sticky_bar" }); scrollTo("contact"); }}
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual: accept consent, click each CTA, confirm in GA4 DebugView (or the console via `window.dataLayer`) a `cta_click` with the right `source`. With consent declined, clicks still scroll normally and emit nothing.

- [ ] **Step 4: Commit**

```bash
git add app/components/layout/Navbar.tsx app/components/sections/Hero.tsx app/components/sections/Services.tsx app/components/sections/Banner.tsx app/components/ui/MobileStickyBar.tsx
git commit -m "feat: track cta_click with source across contact-bound CTAs"
```

**Acceptance criteria:** Each of the five CTAs emits `cta_click` with its distinct `source` value; scroll behavior is unchanged; nothing breaks when consent is declined.

**Requirements:** FR-04, NFR-02, NFR-04

---

## TASK-05 — Outbound conversions: WhatsApp, email, social

**Modify:** `app/components/sections/Contact.tsx`, `app/components/ui/MobileStickyBar.tsx`, `app/components/layout/Footer.tsx`

Outbound links keep navigating; the tracking call rides the same click. WhatsApp and email also fire Meta `Contact` (standard event used for retargeting audiences).

- [ ] **Step 1: Contact.tsx — WhatsApp card and email card**

Add to the imports (file is already `"use client"`):

```tsx
import { trackEvent, trackMeta } from "../../lib/analytics";
```

On the WhatsApp card `<a>` (the one with the `api.whatsapp.com` href), add:

```tsx
onClick={() => { trackEvent("whatsapp_click", { source: "contact_card" }); trackMeta("Contact"); }}
```

On the email card `<a>` (the `mailto:` one), add:

```tsx
onClick={() => { trackEvent("email_click", { source: "contact_card" }); trackMeta("Contact"); }}
```

- [ ] **Step 2: MobileStickyBar.tsx — WhatsApp button**

(`trackEvent` import already added in TASK-04; extend it with `trackMeta`.) On the WhatsApp `<a>`, add:

```tsx
onClick={() => { trackEvent("whatsapp_click", { source: "sticky_bar" }); trackMeta("Contact"); }}
```

- [ ] **Step 3: Footer.tsx — email and the three social links**

Add the import (file is already `"use client"`):

```tsx
import { trackEvent, trackMeta } from "../../lib/analytics";
```

On the `mailto:` link:

```tsx
onClick={() => { trackEvent("email_click", { source: "footer" }); trackMeta("Contact"); }}
```

On each social `<a>` (matching its `aria-label`):

```tsx
onClick={() => trackEvent("social_click", { network: "instagram" })}
onClick={() => trackEvent("social_click", { network: "facebook" })}
onClick={() => trackEvent("social_click", { network: "linktree" })}
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual: with consent accepted, each link still opens its target (WhatsApp tab, mail client, social tab) and the matching event appears with the right `source`/`network`. Meta `Contact` events visible via Meta Pixel Helper.

- [ ] **Step 5: Commit**

```bash
git add app/components/sections/Contact.tsx app/components/ui/MobileStickyBar.tsx app/components/layout/Footer.tsx
git commit -m "feat: track whatsapp, email and social outbound clicks"
```

**Acceptance criteria:** `whatsapp_click` from both locations with distinct sources; `email_click` from both locations; `social_click` with the right network; WhatsApp/email also fire Meta `Contact`; navigation never blocked.

**Requirements:** FR-05, FR-06, FR-07, NFR-04

---

## TASK-06 — `section_view` tracker

**New file:** `app/components/ui/SectionViewTracker.tsx`
**Modify:** `app/page.tsx`

One client component observes all six sections from a single IntersectionObserver — no need to touch the section components (some are server components). Mirrors the existing `threshold: 0.2`, fire-once pattern from `ServiceCard`.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect } from "react";
import { trackEvent } from "../../lib/analytics";

const SECTION_IDS = ["services", "process", "about", "reviews", "faq", "contact"];

export default function SectionViewTracker() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trackEvent("section_view", { section: entry.target.id });
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
```

- [ ] **Step 2: Mount in `app/page.tsx`** — add the import and place it next to `<MobileStickyBar />`:

```tsx
import SectionViewTracker from "./components/ui/SectionViewTracker";
```

```tsx
<Footer />
<MobileStickyBar />
<SectionViewTracker />
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual: scroll the page top to bottom with consent accepted — exactly one `section_view` per section, in scroll order. Scrolling back up emits no repeats.

- [ ] **Step 4: Commit**

```bash
git add app/components/ui/SectionViewTracker.tsx app/page.tsx
git commit -m "feat: track section_view across landing page sections"
```

**Acceptance criteria:** Six sections each emit `section_view` exactly once per page view with `section` set to the element id. Renders nothing; zero visual impact.

**Requirements:** FR-08, NFR-06

---

## TASK-07 — Contact form events (client side)

**Modify:** `app/components/sections/Contact.tsx`

Three additions: `form_start` on first field focus, the consent-gated hidden `metaEventId` field, and the success-state events (`contact_form_submit` + Pixel `Lead` with `eventID`).

- [ ] **Step 1: Extend imports and add state**

Update the React import and analytics import (analytics import exists from TASK-05):

```tsx
import { useActionState, useEffect, useRef, useState } from "react";
import { CONSENT_GRANTED_EVENT, getConsent, trackEvent, trackMeta } from "../../lib/analytics";
```

Inside the `Contact` component, after the existing `phone` state:

```tsx
const [eventId, setEventId] = useState("");
const formStartedRef = useRef(false);
const submitTrackedRef = useRef(false);

useEffect(() => {
  const generate = () => {
    if (getConsent() === "granted") setEventId(crypto.randomUUID());
  };
  generate();
  window.addEventListener(CONSENT_GRANTED_EVENT, generate);
  return () => window.removeEventListener(CONSENT_GRANTED_EVENT, generate);
}, []);

useEffect(() => {
  if (state?.success && !submitTrackedRef.current) {
    submitTrackedRef.current = true;
    trackEvent("contact_form_submit");
    trackMeta("Lead", eventId ? { eventID: eventId } : undefined);
  }
}, [state, eventId]);

const handleFormFocus = () => {
  if (!formStartedRef.current) {
    formStartedRef.current = true;
    trackEvent("form_start");
  }
};
```

(The `eventId` is generated in an effect — not during render — so the server-rendered HTML and the client hydration match.)

- [ ] **Step 2: Wire the form element**

Add `onFocus` to the `<form>` (React uses `focusin` under the hood, so child-field focus bubbles here) and the hidden field as its first child:

```tsx
<form action={action} onFocus={handleFormFocus} className="flex flex-col gap-4">
  {eventId && <input type="hidden" name="metaEventId" value={eventId} />}
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual: focusing any field fires `form_start` once (re-focusing fires nothing). With consent accepted, the hidden `metaEventId` input exists in the DOM; with consent declined it does not. Submitting successfully fires `contact_form_submit` and a Pixel `Lead` (check Meta Pixel Helper shows the `eventID`).

- [ ] **Step 4: Commit**

```bash
git add app/components/sections/Contact.tsx
git commit -m "feat: track form_start and contact_form_submit with shared Meta event id"
```

**Acceptance criteria:** `form_start` once per page view; hidden `metaEventId` present only with granted consent; success fires GA4 event + Pixel `Lead` carrying the same UUID the server will use; no hydration warnings.

**Requirements:** FR-09, FR-10, FR-11 (client half), NFR-02, NFR-03

---

## TASK-08 — Meta Conversions API (server side)

**New file:** `app/lib/metaCapi.ts`
**Modify:** `app/actions/sendEmail.ts`

Server `Lead` deduplicates against the client Pixel `Lead` via the shared `event_id`. Fires only when `metaEventId` arrived (i.e., consent was granted). A CAPI failure must never fail the form (NFR-02).

- [ ] **Step 1: Create the CAPI helper**

```ts
import { createHash } from "node:crypto";

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export async function sendMetaLead({
  email,
  phone,
  eventId,
}: {
  email: string;
  phone: string;
  eventId: string;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              action_source: "website",
              user_data: {
                em: [sha256(email.trim().toLowerCase())],
                ph: [sha256(`52${phone}`)],
              },
            },
          ],
          access_token: accessToken,
        }),
      },
    );
    if (!res.ok) {
      console.error("[metaCapi] CAPI responded", res.status, await res.text());
    }
  } catch (error) {
    console.error("[metaCapi] CAPI request failed:", error);
  }
}
```

- [ ] **Step 2: Call it from `sendEmail.ts`**

Add the import:

```ts
import { sendMetaLead } from "../lib/metaCapi";
```

Read the field next to the other form fields:

```ts
const metaEventId = (formData.get("metaEventId") as string)?.trim();
```

After the `try/catch` around `transporter.sendMail` (i.e., once the send succeeded), before the success `return`:

```ts
if (metaEventId) {
  await sendMetaLead({ email, phone, eventId: metaEventId });
}
```

- [ ] **Step 3: Add the server-only env var to `.env.local`**

```env
META_ACCESS_TOKEN=your-capi-system-user-token
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual: submit the form with consent accepted — Meta Events Manager (Test Events tab) shows one server `Lead` deduplicated against the browser `Lead` (same `event_id`). Submit with consent declined — no server event. Unset `META_ACCESS_TOKEN` and submit — the form still succeeds.

- [ ] **Step 5: Commit**

```bash
git add app/lib/metaCapi.ts app/actions/sendEmail.ts
git commit -m "feat: send Meta CAPI Lead with hashed PII and event dedup"
```

**Acceptance criteria:** Server `Lead` carries the client's UUID as `event_id`; email/phone reach Meta only sha256-hashed; no `metaEventId` → no CAPI call; CAPI errors are logged and swallowed — the user still sees the success state.

**Requirements:** FR-11, NFR-02, NFR-03

---

## TASK-09 — Privacy disclosure: name Google and Meta

**Modify:** `app/components/ui/TermsModal.tsx`

LFPDPPP requires disclosing third-party processors. Two small content additions — match the existing HTML-entity style.

- [ ] **Step 1: Aviso de Privacidad — extend the transfers list**

In the privacy content, under `<SectionHeading>III. Transferencias de Datos Personales</SectionHeading>`, add one `<li>` to the existing `<ul>` (after the "Plataformas de pago" item):

```tsx
<li>
  Proveedores de anal&iacute;tica web: Google LLC (Google Analytics) y Meta Platforms,
  Inc. (Meta Pixel), que procesan datos de uso del sitio y, en el caso de Meta, datos de
  contacto cifrados, conforme a sus propios avisos de privacidad.
</li>
```

- [ ] **Step 2: Aviso de Privacidad — update section VIII**

Replace the paragraph under `<SectionHeading>VIII. Uso de Cookies</SectionHeading>`:

```tsx
<p>
  El sitio web utiliza cookies y tecnolog&iacute;as similares de Google Analytics y Meta
  Pixel para mejorar la experiencia del usuario y medir el uso del sitio, &uacute;nicamente
  cuando usted lo acepta mediante nuestro aviso de cookies. Puede rechazarlas desde el
  propio aviso o configurar su navegador para bloquearlas; sin embargo, algunas
  funcionalidades podr&iacute;an no operar correctamente.
</p>
```

- [ ] **Step 3: Aviso de Cookies — add a processors paragraph**

In `CookiesContent()`, after the first `<p>` (the one ending in "de forma permanente."), add:

```tsx
<p>
  Las cookies de anal&iacute;tica de este sitio son provistas por Google Analytics
  (Google LLC) y Meta Pixel (Meta Platforms, Inc.) y se activan &uacute;nicamente si
  usted las acepta en el aviso de cookies que aparece al visitar el sitio. Puede cambiar
  su decisi&oacute;n borrando los datos del sitio en su navegador.
</p>
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: both pass

Manual: open `#privacidad` and `#cookies` — new text renders with proper accents, consistent styling.

- [ ] **Step 5: Commit**

```bash
git add app/components/ui/TermsModal.tsx
git commit -m "docs: disclose Google and Meta as analytics processors in privacy notices"
```

**Acceptance criteria:** Both notices name Google and Meta, explain consent gating, and read naturally in Spanish with HTML entities.

**Requirements:** FR-12

---

## TASK-10 — External setup & end-to-end verification (no code)

Manual checklist outside the repo. Do this last; until then placeholder env values are fine because components render nothing without real IDs.

- [ ] **Step 1: GA4** — create the GA4 property (analytics.google.com), copy the `G-…` measurement ID into `NEXT_PUBLIC_GA4_ID`, and link the property to Google Search Console for keyword data.
- [ ] **Step 2: GA4 key events** — in GA4 Admin → Events, mark `contact_form_submit` and `whatsapp_click` as key events (conversions).
- [ ] **Step 3: Meta** — in Meta Events Manager, create the Pixel, copy its ID into `NEXT_PUBLIC_META_PIXEL_ID`; generate a Conversions API system-user access token into `META_ACCESS_TOKEN` (server env only — Vercel/host dashboard for production, never committed).
- [ ] **Step 4: End-to-end** — with real IDs in a production-like build (`npm run build && npm run start`): accept consent, exercise every event (each CTA, WhatsApp, email, social, full scroll, form submit), and confirm them in GA4 DebugView and Meta Test Events; confirm the form `Lead` shows **deduplicated** browser + server events; confirm declining consent produces zero requests to Google/Meta.

**Acceptance criteria:** All FR events visible in both dashboards with correct params; Lead dedup confirmed; declined consent verified silent.

**Requirements:** all FRs (verification), NFR-03 (token handling)

---

## Implementation Order

1. TASK-01 — analytics core (everything imports it)
2. TASK-02 — script loading (needs TASK-01)
3. TASK-03 — consent banner (needs TASK-01; testable with TASK-02)
4. TASK-04 — `cta_click` (mechanical, five files)
5. TASK-05 — outbound clicks
6. TASK-06 — `section_view`
7. TASK-07 — form events client side
8. TASK-08 — CAPI server side (needs TASK-07's hidden field)
9. TASK-09 — privacy disclosures
10. TASK-10 — external setup + end-to-end verification
