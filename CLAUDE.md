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
| background  | `#D1E7F4` | Page and navigation background (powder blue) |
| foreground  | `#2F2A2B` | Body text (dark brown)                    |
| primary     | `#622831` | Supporting links and detail (burgundy)    |
| secondary   | `#CB5432` | Large highlights matching the navbar logo |
| button-bg   | `#BB4D2E` | Deeper logo orange for readable light labels |
| button-text | `#FFF8F3` | Warm-white button labels                  |
| surface     | `#FFF8F3` | Papel cálido cards, panels and dialogs    |
| brand-blue  | `#B9DAEF` | Blue artwork and preview fields            |
| brand-orange | `#CB5432` | Logo silhouette                           |
| brand-burgundy | `#622831` | Footer in both themes                    |

This branch is a palette experiment; see `PALETTE-EXPERIMENT.md`. `BrandLogo` uses the original white logo assets as CSS masks so their shapes remain intact in orange. `StickerInk` renders the existing sticker artwork as burnt-orange linework without its pale backing in light mode. Dark mode uses deep blue surfaces with peach actions and retains the original stickers.

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
    ui/            → Button, ServiceCard, TermsModal, BackgroundCurves (reusable)
  globals.css      → CSS variables and animations
  layout.tsx       → Root layout with Poppins font
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

Use the normal browser cursor; do not hide it or replace it with a custom cursor.

### Section IDs (for nav smooth scroll)

- `#services` → Services
- `#process` → Process
- `#about` → About
- `#faq` → FAQ

### Content Language

All user-facing content is in **Spanish** (targeting Mexican audience). Use HTML entities for accented characters (e.g., `&oacute;`, `&eacute;`, `&ntilde;`) rather than raw Unicode when possible.

### External Links

External links (social media, WhatsApp) are defined directly in the Footer and Hero components. Refer to those files for current URLs.


## Theme v2 worktree

This branch is `test/blue-theme-v2`, based on `feat/camino-site-expansion` at `f1eeae2`.
The default light palette is Azul costero: ground #DCECF5, surface #F1F7FC,
text #163650, buttons #235584, orange logo #CB5432, supporting wine #622831.
The older table above describes the imported v1 palette; see `THEME-V2.md` and
`app/color-lab/themes.ts` for current v2 values. Preserve latest navigation,
analytics, quotation and trademark journey behavior when exploring styles.


V2 feedback revision: default is now Lino y azul, warm #F2ECEA ground,
#FFF8F3 paper and #2F2A2B charcoal text. Blue-font options were removed.
Use blue only in limited supporting surfaces; retain wine/orange typography.
See themes.ts and THEME-V2.md for the current four options.


## Authoritative brand correction (latest)

Only Lino y azul is approved. All alternatives were rejected. Exact palette:
Terracota #CD3F00, Tinto #7D0402, Gris oscuro #1D1D1D,
Azul cielo #BEE0FA, Marfil #F5EEEB. This supersedes every older palette
in this document. Do not create wine shades/pinks or blue typography.
The explorer now shows only the approved composition and official swatches.


## Latest direction: restore original Lino y azul

Strict five-color restriction is superseded. User requests original approved Lino
palette (THEME-V2.md) and expressly likes varied service-card colors. Brand palette
is guidance, not an exhaustive allowed set. Do not flatten the service accents.


Latest approved default: original Lino y azul with light button fill #7D0402.
This is the only change from the restored palette; keep orange highlights/icons
and varied service-card accents. Lab original/reset must match this default.

Latest approved dark accents: #F29370 actions/highlights/emphasis panels,
#E9825C logo, #2F2A2B action text. See THEME-V2.md for the final feature-branch
state. Preserve Camila's original photo; the generated cup-logo edit was rejected.
