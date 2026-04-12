@AGENTS.md

# Camino Legal — Project Context

## About the Brand

Camino Legal is a Mexican law firm specializing in trademark registration (registro de marca) and intellectual property protection. The firm helps entrepreneurs and businesses register their brands with the Instituto Mexicano de la Propiedad Industrial (IMPI). The website is a Spanish-language landing page targeting Mexican clients.

## Tech Stack

- **Framework**: Next.js 16 (App Router) — always check `node_modules/next/dist/docs/` before using APIs
- **React**: 19
- **Styling**: Tailwind CSS v4 with `@theme inline` for custom colors
- **Font**: Poppins (via `next/font/google`)
- **Language**: TypeScript

## Design System

### Colors (defined in `app/globals.css`)

| Token        | Hex       | Usage                                     |
|-------------|-----------|-------------------------------------------|
| background  | `#F2ECEA` | Page background (warm cream)              |
| foreground  | `#2F2A2B` | Body text (dark brown)                    |
| primary     | `#622831` | Navbar bg, brand accent (burgundy)        |
| secondary   | `#AC2E18` | Highlight text, card accent (red)         |
| button-bg   | `#2F2A2B` | Button backgrounds                        |
| button-text | `#F2ECEA` | Button text                               |

All colors are registered in `@theme inline` as Tailwind utilities (e.g., `bg-primary`, `text-secondary`).

### Typography

- **Font family**: Poppins (weights 300–700), set via CSS variable `--font-poppins`
- **Mobile-first sizing**: `text-sm` base, scaling up with `md:` and `lg:` breakpoints

### Responsive Breakpoints

Mobile-first design. Key breakpoints:
- **Mobile**: default (< 768px)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)

Desktop gets significantly more padding (`lg:py-40` on sections), larger text, and centered hero.

## File Structure

```
app/
  components/
    layout/        → Navbar, Footer (structural, persist across pages)
    sections/      → Hero, Services, Process, About, FAQ (page content blocks)
    ui/            → Button, ServiceCard, TermsModal, CustomCursor, BackgroundCurves (reusable)
  globals.css      → CSS variables, animations, custom cursor styles
  layout.tsx       → Root layout with Poppins font and CustomCursor
  page.tsx         → Landing page composing all sections
public/
  camino-legal-white.png           → Navbar logo (white, horizontal)
  camino-legal-complete-white.png  → Footer logo (white, stacked with icon)
```

## Patterns & Conventions

### Component Categories

- **`layout/`**: Components that wrap or frame page content (Navbar, Footer). These use `"use client"` when they have interactive state.
- **`sections/`**: Full-width page sections. Each has an `id` attribute matching its nav link (e.g., `id="services"`). Server components unless they need client interactivity.
- **`ui/`**: Small, reusable building blocks. Accept props for customization. Use `"use client"` when they need state or effects.

### Animation Patterns

1. **Fade-up on load** (Hero): CSS-only via `.animate-fade-up` with staggered `.animation-delay-*` classes. Fast (0.3s) and subtle (0.5rem travel).
2. **Fade-up on scroll** (ServiceCard): `IntersectionObserver` with `threshold: 0.2`. One-shot — unobserves after triggering.
3. **Scroll-driven tilt** (ServiceCard): `tiltDeg` prop controls initial rotation (e.g., -5/0/5 degrees). Uses `requestAnimationFrame`-free scroll listener. Desktop only (`window.innerWidth >= 1024`).
4. **Slide-in from left** (Process steps): `IntersectionObserver` + staggered `transitionDelay`.
5. **Wiggle on hover** (Navbar logo): CSS `@keyframes wiggle` with `.hover-wiggle` class.
6. **Custom cursor** (desktop only): `requestAnimationFrame` loop with lerp factor 0.15. Hidden on mobile. Click shrinks + fades.

### Section IDs (for nav smooth scroll)

- `#services` → Services
- `#process` → Process
- `#about` → About
- `#faq` → FAQ

### Content Language

All user-facing content is in **Spanish** (targeting Mexican audience). Use HTML entities for accented characters (e.g., `&oacute;`, `&eacute;`, `&ntilde;`) rather than raw Unicode when possible.

### External Links

External links (social media, WhatsApp) are defined directly in the Footer and Hero components. Refer to those files for current URLs.
