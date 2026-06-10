# Conversion Improvements — Task List

Based on `.claude/convertions/spec.md`. Tasks are ordered by dependency — earlier tasks have no blockers, later ones may depend on shared patterns established earlier.

---

## TASK-01 — Navbar: Add "Contáctanos" CTA button

**File:** `app/components/layout/Navbar.tsx`

**What to change:**
- Remove `{ href: "#contact", label: "Contacto" }` from the `navLinks` array (it will be replaced by a visible CTA button)
- On the **desktop nav** (`hidden md:flex` ul), add a styled button **after** the links list:
  ```tsx
  <a
    href="#contact"
    onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
    className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200"
  >
    Contáctanos
  </a>
  ```
- On **mobile menu**, keep a plain "Contacto" link in the list (the "Contacto" entry stays there for mobile nav completeness, since the sticky bar covers mobile CTAs separately)

**Acceptance criteria:** Desktop nav shows a visually distinct "Contáctanos" pill button after the nav links. Mobile menu still has a "Contacto" text link.

---

## TASK-02 — Hero: Replace single WhatsApp CTA with two buttons

**File:** `app/components/sections/Hero.tsx`

**What to change:**
- Find the `<div className="flex animate-fade-up animation-delay-400">` CTA wrapper
- Replace the single WhatsApp `<a>` with two side-by-side buttons:
  ```tsx
  <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-up animation-delay-400">
    {/* Primary */}
    <a
      href="#services"
      onClick={e => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}
      className="rounded-lg bg-button-bg px-8 py-4 text-sm font-semibold text-button-text tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
    >
      Ver servicios
    </a>
    {/* Secondary — ghost style */}
    <a
      href="#contact"
      onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
      className="rounded-lg border border-foreground/20 px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-200 ease-out hover:border-foreground/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
    >
      Cuéntanos tu caso
    </a>
  </div>
  ```
- Remove the WhatsApp `href` from this section entirely

**Acceptance criteria:** Hero shows two buttons side by side (stacked on mobile). WhatsApp link is gone from the Hero.

---

## TASK-03 — Services: Add CTA block below the cards grid

**File:** `app/components/sections/Services.tsx`

**What to change:**
- After the closing `</div>` of the cards grid (`flex flex-wrap justify-center gap-4`), add:
  ```tsx
  <div className="flex flex-col items-center gap-4 mt-10 md:mt-14 text-center">
    <p className="text-sm md:text-base opacity-60">
      ¿No sabes cuál necesitas? Cuéntanos y te orientamos.
    </p>
    <a
      href="#contact"
      onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
      className="rounded-lg bg-button-bg px-8 py-4 text-sm font-semibold text-button-text tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
    >
      Cuéntanos tu caso
    </a>
  </div>
  ```

**Note:** `Services` is a server component. The `onClick` won't work without adding `"use client"`. Either:
- Convert the component to `"use client"` (simplest), or
- Replace the `onClick` with a plain `href="#contact"` (native scroll, less smooth)

Prefer adding `"use client"` only if we decide smooth scroll matters here. Otherwise a plain `href="#contact"` is fine.

**Acceptance criteria:** A text + button block appears below the 5 service cards, centered.

---

## TASK-04 — Banner: Add risk line and CTA button

**File:** `app/components/sections/Banner.tsx`

**What to change:**
- After the closing `</h2>` of the tagline, add a risk line and button inside the text `<div>`:
  ```tsx
  <p className="text-sm md:text-base text-[#2F2A2B]/60 mt-3">
    Protege lo que ya construiste.
  </p>
  <a
    href="#contact"
    onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
    className="mt-6 inline-block rounded-lg bg-[#2F2A2B] px-8 py-4 text-sm font-semibold text-[#F2ECEA] tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
  >
    Cuéntanos tu caso
  </a>
  ```

**Note:** Banner is already `"use client"` so `onClick` works fine.

**Acceptance criteria:** Below the tagline, a muted risk line appears followed by a dark CTA button. The banner image on desktop still aligns correctly at the bottom right.

---

## TASK-05 — Reviews: Add CTA block after the carousel

**File:** `app/components/sections/Reviews.tsx`

**What to change:**
- After the closing `</div>` of the carousel controls block (`flex items-center justify-between mt-6`), add:
  ```tsx
  <div className="flex flex-col items-center gap-4 mt-10 md:mt-14 text-center">
    <p className="text-sm md:text-base opacity-60">
      ¿Listo para dar el paso? Hablemos.
    </p>
    <a
      href="#contact"
      onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
      className="rounded-lg bg-button-bg px-8 py-4 text-sm font-semibold text-button-text tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
    >
      Cuéntanos tu caso
    </a>
  </div>
  ```

**Acceptance criteria:** A text + button block appears below the reviews carousel and navigation dots/arrows.

---

## TASK-06 — FAQ: Add closing CTA after last accordion item

**File:** `app/components/sections/FAQ.tsx`

**What to change:**
- After the closing `</div>` of the `faqs.map(...)` block, add:
  ```tsx
  <div className="flex flex-col items-center gap-4 mt-10 md:mt-14 text-center">
    <p className="text-sm md:text-base opacity-60">
      ¿Todavía tienes dudas? Cuéntanos tu caso.
    </p>
    <a
      href="#contact"
      onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
      className="rounded-lg bg-button-bg px-8 py-4 text-sm font-semibold text-button-text tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
    >
      Escríbenos
    </a>
  </div>
  ```

**Acceptance criteria:** A text + button block appears below the FAQ accordion, inside the same `max-w-3xl` container.

---

## TASK-07 — Contact: Upgrade left side to WhatsApp card

**File:** `app/components/sections/Contact.tsx`

**What to change:**
- The left `<div className="flex flex-col gap-6">` currently has: sticker images, a heading ("Hablemos de tu caso"), a subtitle, and an email link
- Keep the heading and subtitle as-is
- Replace the email `<a>` link with two equal contact cards stacked vertically:

  ```tsx
  {/* WhatsApp card */}
  <a
    href="https://api.whatsapp.com/send/?phone=529992505160&text&type=phone_number&app_absent=0"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-4 rounded-2xl border border-foreground/8 bg-foreground/[0.02] p-5 hover:border-foreground/20 hover:bg-foreground/[0.04] transition-all duration-200 group"
  >
    <span className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
      {/* WhatsApp SVG icon */}
      <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </span>
    <div>
      <p className="text-sm font-semibold">Escríbenos por WhatsApp</p>
      <p className="text-xs opacity-50 mt-0.5">Respuesta rápida, sin formularios.</p>
    </div>
  </a>

  {/* Email card */}
  <a
    href="mailto:info@caminolegal.com.mx"
    className="flex items-center gap-4 rounded-2xl border border-foreground/8 bg-foreground/[0.02] p-5 hover:border-foreground/20 hover:bg-foreground/[0.04] transition-all duration-200 group"
  >
    <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
      </svg>
    </span>
    <div>
      <p className="text-sm font-semibold">info@caminolegal.com.mx</p>
      <p className="text-xs opacity-50 mt-0.5">También puedes escribirnos por correo.</p>
    </div>
  </a>
  ```

**Acceptance criteria:** Left side shows two equal-weight cards — WhatsApp and email — with consistent card styling. The right side (form) is unchanged.

---

## TASK-08 — Mobile Sticky Bar: New component

**New file:** `app/components/ui/MobileStickyBar.tsx`

**Component behavior:**
- `"use client"`
- Two `IntersectionObserver` instances:
  1. Watches the Hero section (`#services` element or a ref passed as prop — use `document.getElementById('hero-section')` or observe the hero via a sentinel div)
  2. Watches the Contact section (`#contact`)
- Bar is visible when: Hero has scrolled out of view **AND** Contact is not yet in view
- Fixed to bottom, `lg:hidden`, full width

**Add a sentinel `id` to the Hero section** in `Hero.tsx`:
- Add `id="hero-section"` to the outer `<section>` element (currently has no id)

**Component structure:**
```tsx
"use client";
import { useEffect, useState } from "react";

export default function MobileStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let heroGone = false;
    let contactVisible = false;

    const update = () => setVisible(heroGone && !contactVisible);

    const heroObs = new IntersectionObserver(
      ([e]) => { heroGone = !e.isIntersecting; update(); },
      { threshold: 0 }
    );
    const contactObs = new IntersectionObserver(
      ([e]) => { contactVisible = e.isIntersecting; update(); },
      { threshold: 0.1 }
    );

    const hero = document.getElementById('hero-section');
    const contact = document.getElementById('contact');
    if (hero) heroObs.observe(hero);
    if (contact) contactObs.observe(contact);

    return () => { heroObs.disconnect(); contactObs.disconnect(); };
  }, []);

  if (!visible) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-foreground/10 pb-safe">
      <div className="flex items-stretch">
        <a
          href="https://api.whatsapp.com/send/?phone=529992505160&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[#25D366] hover:bg-foreground/5 transition-colors"
        >
          {/* WhatsApp icon SVG */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wide uppercase">WhatsApp</span>
        </a>

        <div className="w-px bg-foreground/10" />

        <button
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-foreground hover:bg-foreground/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide uppercase">Escribir</span>
        </button>
      </div>
    </div>
  );
}
```

**Wire up in `app/page.tsx`:**
- Import `MobileStickyBar` and add it after `<Footer />` (or before, outside `<main>`)

**Tailwind safe area note:** `pb-safe` requires the `tailwindcss-safe-area` plugin or use `pb-[env(safe-area-inset-bottom)]` inline. Check if the plugin is installed; if not, inline style is fine.

**Acceptance criteria:** Bar appears on mobile after scrolling past the Hero, disappears when Contact section is visible. Tapping WhatsApp opens WhatsApp. Tapping "Escribir" scrolls to the contact form.

---

## Shared Pattern Note

Multiple tasks use the same smooth scroll pattern:
```tsx
onClick={e => { e.preventDefault(); document.getElementById('TARGET_ID')?.scrollIntoView({ behavior: 'smooth' }); }}
```

If this gets repetitive, extract to `app/lib/scrollTo.ts`:
```ts
export const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
```

Not required for Phase 1 but worth doing if you're touching 3+ files.

---

## Implementation Order

Recommended order to minimize back-and-forth:

1. TASK-02 (Hero) — establishes the dual CTA pattern
2. TASK-01 (Navbar) — visible immediately on load
3. TASK-03 (Services) — may need `"use client"` decision
4. TASK-04 (Banner)
5. TASK-05 (Reviews)
6. TASK-06 (FAQ)
7. TASK-07 (Contact) — most complex change
8. TASK-08 (Sticky Bar) — new component, wire up last
