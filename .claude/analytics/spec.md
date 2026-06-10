# Analytics Spec — Camino Legal

## Goal

Understand how visitors interact with the landing page and measure which channels drive real business outcomes (WhatsApp conversations, contact form submissions). No paid providers. The data should help answer:

- Where do visitors come from (organic, social, paid)?
- Which CTA paths actually lead people to the contact section?
- How many click the WhatsApp CTA vs. fill out the form?
- Do people start the form and abandon it?
- Which devices/regions dominate?

---

## Tools in Scope

| Tool | Purpose |
|---|---|
| **Google Analytics 4 (GA4)** | Traffic sources, user behavior, SEO insights, conversion funnel |
| **Meta Pixel (client)** | Social attribution, retargeting audiences, ad conversion tracking |
| **Meta Conversions API (server)** | Reliable `Lead` reporting (ad blockers, iOS restrictions) |

Ads context: organic social is the baseline with occasional Instagram/Facebook campaigns. The Pixel runs continuously so retargeting audiences accumulate between campaigns. CAPI is in scope (decided — not optional).

Microsoft Clarity and Umami were evaluated and deferred — see `improvements.md`.

---

## Event Model (site audit — current as of the Phase 1 CTA work, commit `758da97`)

| Event | Where it fires | Params | Why |
|---|---|---|---|
| `cta_click` | Navbar "Contáctanos" (desktop + mobile), Hero "Cuéntanos tu caso", Services bottom CTA, Banner CTA, MobileStickyBar "Escribir" | `source` | Phase 1 added five paths into Contact; this tells us which CTA earns its place |
| `whatsapp_click` | Contact section WhatsApp card, MobileStickyBar WhatsApp button | `source` | Primary conversion path. Also fires Meta `Contact` |
| `contact_form_submit` | Contact form success (client: GA4 event + Pixel `Lead`; server: CAPI `Lead`) | — | Primary conversion. See dedup design below |
| `form_start` | First focus on any contact form field (once per page view) | — | Distinguishes "nobody tried" from "tried and abandoned" |
| `email_click` | Contact section email card, Footer mailto link | `source` | Secondary conversion. Also fires Meta `Contact` |
| `social_click` | Footer (Instagram, Facebook, Linktree) | `network` | Outbound interest |
| `section_view` | All sections with an `id`: services, process, about, reviews, faq, contact | `section` | Scroll-depth funnel; reuses the existing IntersectionObserver pattern |
| `page_view` | All pages | auto | Both tools handle this natively |

**Stale-location note**: the Hero CTAs are internal scroll links (`#services`, `#contact`) — WhatsApp links live only in the Contact section and the sticky bar. Earlier drafts of this spec placed `whatsapp_click` on the Hero; that is no longer correct.

**Phase 2 proofing**: events carry no single-page assumptions. `section_view` keys on section id, and GA4's native `page_view` handles the planned multi-page split without event changes.

---

## Consent (decided: lightweight consent banner)

All tracking is gated behind explicit consent:

- A small dismissible banner offers accept/decline; the choice persists (e.g., `localStorage`).
- GA4 and Meta Pixel scripts load **only after acceptance** — not on page load.
- CAPI respects the same consent: the client includes the Meta `event_id` hidden field only when consent was granted, and the server fires CAPI only when that field is present. No consent → no server event.
- The banner links to the existing cookies/privacy pages.

---

## Google Analytics 4

**Cost**: Free
**Best for**: Traffic source analysis, user behavior, SEO insights
**Limits**: Unlimited hits; data sampled in some reports above 500k sessions

- Loaded via `next/script` with `strategy="afterInteractive"` in `app/layout.tsx`, conditional on consent
- Custom events via `gtag('event', ...)` calls
- Tracks sessions, bounce rate, geography, device breakdown
- Built-in integration with Google Search Console → connect for keyword data
- No server-side component needed

---

## Meta Pixel + Conversions API

**Cost**: Free
**Best for**: Measuring ROI on Instagram/Facebook ads; building retargeting audiences between campaigns
**Prerequisite**: A Meta Business account with a pixel created

**Client-side Pixel** (browser)
- Loaded via `next/script` in `app/layout.tsx`, conditional on consent
- Fires `PageView` automatically
- Fires `Lead` on contact form success state (`state?.success === true`)
- Fires `Contact` on WhatsApp/email clicks

**Conversions API / CAPI** (server)
- Fires from `app/actions/sendEmail.ts` on successful email send
- Sends a `Lead` event with hashed PII (email, phone) to Meta's Graph API
- Bypasses ad blockers and iOS restrictions
- Required fields: `pixel_id`, `access_token` (from Meta Events Manager)

**Dedup design** (client `Lead` and server `Lead` must count once):
1. The client generates a UUID (`crypto.randomUUID()`) per submission attempt and submits it as a hidden form field (only when consent was granted).
2. `sendEmail.ts` fires the CAPI `Lead` with that UUID as `event_id` after the email sends successfully.
3. On `state?.success`, the client fires the Pixel `Lead` with the same UUID.
4. Meta deduplicates the pair by `event_id` + `event_name`.

**CAPI endpoint**: `POST https://graph.facebook.com/v21.0/{pixel-id}/events`

```ts
// Rough shape of the server call (in sendEmail.ts)
await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    data: [{
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId, // must match client pixel event_id for deduplication
      action_source: "website",
      user_data: {
        em: [sha256(email)],
        ph: [sha256("+52" + phone)],
      },
    }],
    access_token: process.env.META_ACCESS_TOKEN,
  }),
});
```

---

## Implementation Notes

### Loading in `app/layout.tsx`

```tsx
// GA4 (rendered only after consent)
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
<Script id="ga4-init" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
`}</Script>

// Meta Pixel (rendered only after consent)
<Script id="meta-pixel" strategy="afterInteractive">{`
  !function(f,b,e,...) { /* pixel base code */ }
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
`}</Script>
```

All use `strategy="afterInteractive"`. The theme-init script already uses `beforeInteractive` correctly. Consent gating means these render conditionally — a client component reads the stored consent and mounts the scripts.

### Event firing locations

| Event | Where to add the call |
|---|---|
| `cta_click` | `onClick` on the contact-bound CTAs in `Navbar.tsx`, `Hero.tsx`, `Services.tsx`, `Banner.tsx`, `MobileStickyBar.tsx` |
| `whatsapp_click` | `onClick` on the WhatsApp `<a>` tags in `Contact.tsx` and `MobileStickyBar.tsx` |
| `email_click` | `onClick` on email `<a>` tags (Contact + Footer) |
| `form_start` | `onFocus` (first field interaction) in `Contact.tsx` |
| `contact_form_submit` | `useEffect` watching `state?.success` in `Contact.tsx` |
| `contact_form_submit` (CAPI) | Inside `sendEmail.ts` after `transporter.sendMail` succeeds, when `event_id` present |
| `section_view` | Reuse the existing `IntersectionObserver` pattern per section |

### Environment variables needed

```env
# GA4
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXXX
META_ACCESS_TOKEN=your-capi-system-user-token   # server-only, CAPI only
```

`NEXT_PUBLIC_` prefix exposes vars to the browser. `META_ACCESS_TOKEN` is server-only (no prefix).

---

## Privacy / LFPDPPP Compliance

Mexico's data privacy law (LFPDPPP) requires:
- An **Aviso de Privacidad** explaining what data is collected and how it's used — update it to name Google and Meta as third-party processors
- Cookie consent is not strictly mandated by LFPDPPP (unlike GDPR), but this project goes beyond the minimum with the consent banner above

The consent banner links to the existing privacy/cookies pages (added in commit `0971fd0`).
