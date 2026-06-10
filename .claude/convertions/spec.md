# Conversion Improvements Spec — Camino Legal

## Goal

Increase lead generation on the landing page by adding strategically placed CTAs and upgrading the contact experience. Both WhatsApp and the contact form are treated as equal conversion paths. No hard trust numbers, no free consultation hook, no aggressive copy — the brand tone stays warm and empowering.

---

## CTA Strategy

**Intent funnel — educate first, convert later.**

The page currently pushes visitors to WhatsApp immediately (Hero). This is too high-commitment for first-time visitors still evaluating. Instead, undecided visitors are guided into the page to learn about services first; CTAs to contact appear after the user has had a reason to trust the firm.

**Intent ladder:**

| Stage | Section | CTA |
|---|---|---|
| 1. Arrive, explore | Hero | "Ver servicios" → scroll to `#services` |
| 2. Learn what we do | Hero (secondary) | "Cuéntanos tu caso" → scroll to `#contact` |
| 3. See specific services | Services | Single block below cards → `#contact` |
| 4. Reassurance (risk) | Banner | CTA + subtle risk line |
| 5. Social proof peak | Reviews | CTA after carousel |
| 6. Objections resolved | FAQ | Closing CTA |
| Always visible (mobile) | Sticky bar | WhatsApp + form scroll |

**Two equal paths:** WhatsApp and the contact form are never ranked — both are options, never one primary and one fallback. WhatsApp appears only in: the Contact section (as an equal card), the mobile sticky bar, and the Footer.

**Copy register:**
- "Ver servicios"
- "Cuéntanos tu caso"
- "Hablemos de tu marca"
- "¿Listo para dar el paso? Hablemos."
- "¿Todavía tienes dudas? Cuéntanos."
- "Protege lo que ya construiste." *(risk line — one use only, Banner)*

---

## Section-by-Section Changes

### Navbar

**Change:** Add a "Contáctanos" button on the right side.

- Style: `bg-button-bg text-button-text`, same as existing buttons
- Action: smooth scroll to `#contact`
- Breakpoints: visible on all sizes; on mobile sits alongside the existing menu toggle (may need layout adjustment)

---

### Hero

**Change:** Replace single WhatsApp button with two CTAs side by side.

| Button | Label | Action | Style |
|---|---|---|---|
| Primary | "Ver servicios" | Scroll to `#services` | Filled (`bg-button-bg`) |
| Secondary | "Cuéntanos tu caso" | Scroll to `#contact` | Ghost / outline |

WhatsApp is removed from the Hero entirely. The WhatsApp number remains accessible in the Contact section and Footer.

---

### Services

**Change:** Add a single CTA block **below the cards grid**, after all 5 service cards.

```
¿No sabes cuál necesitas? Cuéntanos y te orientamos.

[Cuéntanos tu caso]  →  scroll to #contact
```

No per-card CTAs. The cards stay clean and informational.

---

### Banner

**Change:** Add a CTA and subtle risk line below the existing tagline.

```
"El camino se hace al decidir avanzar"

Protege lo que ya construiste.

[Cuéntanos tu caso]  →  scroll to #contact
```

This is the one place the risk framing is used. Keep it brief — one line, not a headline.

---

### Reviews

**Change:** Add a single CTA block after the testimonials carousel.

```
¿Listo para dar el paso? Hablemos.

[Cuéntanos tu caso]  →  scroll to #contact
```

---

### FAQ

**Change:** Add a closing CTA after the last accordion item.

```
¿Todavía tienes dudas? Cuéntanos tu caso.

[Escríbenos]  →  scroll to #contact
```

---

### Contact Section (architecture upgrade)

**Current:** Left side has copy + email link. Right side has the contact form.

**New:** Present both channels as equal choices.

- **Left side** → "Escríbenos por WhatsApp" card
  - WhatsApp icon + number
  - A WhatsApp link button: `https://api.whatsapp.com/send/?phone=529992505160`
  - Brief copy: "Respuesta rápida, sin formularios."
- **Right side** → existing contact form, unchanged

Both sides should be visually equal in weight. Neither is labeled "primary."

---

### Mobile Sticky Bar

**New component:** Fixed bar at the bottom of the screen, mobile only (`lg:hidden`).

**Behavior:**
- Hidden initially
- Appears after the user scrolls past the Hero section (`IntersectionObserver` on Hero)
- Hides again when the Contact section (`#contact`) is in view — the user is already there
- Two icon+label buttons side by side:
  - Left: WhatsApp icon + "WhatsApp" → opens `https://api.whatsapp.com/send/?phone=529992505160`
  - Right: Message icon + "Escribir mensaje" → smooth scroll to `#contact`

**Style:** `bg-background border-t border-foreground/10`, full width, safe area padding for iOS home indicator.

---

## What's Intentionally Left Out

- No per-service-card CTAs (too invasive on the card layout)
- No free consultation hook (firm does not offer one)
- No hard trust numbers (not available)
- No aggressive fear-based copy
- No WhatsApp as the first/primary CTA above the Contact section

---

## Related

See `.claude/architecture-refactor/spec.md` for Phase 2 — converting the landing page into a multi-page website. Phase 1 (this spec) ships first and is independent of the refactor.
