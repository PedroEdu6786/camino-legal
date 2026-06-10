# Analytics Spec — Camino Legal

## Goal

Understand how visitors interact with the landing page and measure which channels drive real business outcomes (WhatsApp conversations, contact form submissions). No paid providers. The data should help answer:

- Where do visitors come from (organic, social, paid)?
- Do they reach the contact section?
- How many click the WhatsApp CTA vs. fill out the form?
- Which devices/regions dominate?

---

## Tools in Scope

| Tool | Purpose |
|---|---|
| **Google Analytics 4 (GA4)** | Traffic sources, user behavior, SEO insights, conversion funnel |
| **Meta Pixel** | Social attribution, retargeting audiences, ad conversion tracking |

---

## Conversion Points (site audit)

These are the events that matter for a law firm landing page:

| Event | Location | Type |
|---|---|---|
| `whatsapp_click` | Hero CTA button | Client — outbound link click |
| `contact_form_submit` | Contact section form | Server — `sendEmail` action success |
| `email_click` | Contact section + Footer | Client — mailto link click |
| `social_click` | Footer (Instagram, Facebook, Linktree) | Client — outbound link click |
| `page_view` | All pages | Auto (both tools handle this) |
| `section_view` | Services, Process, Contact | Client — IntersectionObserver |

---

## Google Analytics 4

**Cost**: Free
**Best for**: Traffic source analysis, user behavior, SEO insights
**Limits**: Unlimited hits; data sampled in some reports above 500k sessions

- Loaded via `next/script` with `strategy="afterInteractive"` in `app/layout.tsx`
- Custom events via `gtag('event', ...)` calls
- Tracks sessions, bounce rate, geography, device breakdown
- Built-in integration with Google Search Console → connect for keyword data
- No server-side component needed

**Considerations**: GA4 data goes to Google servers — mention in privacy notice.

---

## Meta Pixel

**Cost**: Free
**Best for**: Measuring ROI on Instagram/Facebook ads; building retargeting audiences
**Prerequisite**: A Meta Business account with a pixel created

**Client-side Pixel** (browser)
- Loaded via `next/script` in `app/layout.tsx`
- Fires `PageView` automatically
- Fires `Lead` on contact form success state (`state?.success === true`)
- Fires `Contact` on WhatsApp/email clicks

**Conversions API / CAPI** (server — optional, higher reliability)
- Fires from `app/actions/sendEmail.ts` on successful email send
- Sends a `Lead` event with hashed PII (email, phone) to Meta's Graph API
- Deduplicates with the client pixel using a shared `event_id`
- Bypasses ad blockers and iOS restrictions
- Required fields: `pixel_id`, `access_token` (from Meta Events Manager)

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
// GA4
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
<Script id="ga4-init" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
`}</Script>

// Meta Pixel
<Script id="meta-pixel" strategy="afterInteractive">{`
  !function(f,b,e,...) { /* pixel base code */ }
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
`}</Script>
```

All use `strategy="afterInteractive"`. The theme-init script already uses `beforeInteractive` correctly.

### Event firing locations

| Event | Where to add the call |
|---|---|
| `whatsapp_click` | `onClick` on the Hero CTA `<a>` tag |
| `email_click` | `onClick` on email `<a>` tags (Contact + Footer) |
| `contact_form_submit` | `useEffect` watching `state?.success` in `Contact.tsx` |
| `contact_form_submit` (CAPI) | Inside `sendEmail.ts` after `transporter.sendMail` succeeds |
| `section_view` | Reuse the existing `IntersectionObserver` pattern in components |

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
- An **Aviso de Privacidad** explaining what data is collected and how it's used
- Disclosure of third-party processors (Google, Meta) in the notice
- Cookie consent is not strictly mandated by LFPDPPP (unlike GDPR), but is best practice

The existing `TermsModal` is the right place to add a brief analytics/cookie notice.
