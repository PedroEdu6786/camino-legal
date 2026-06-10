# Architecture Refactor — Problem Statement

**Status:** Needs a dedicated brainstorming session before implementation planning begins.

---

## The Problem

Camino Legal is currently a single-page landing page. That architecture made sense to ship fast, but it now creates real constraints on conversion, SEO, and content scalability.

### SEO

The entire site lives on one URL. Each service Camino Legal offers — trademark registration, contracts, copyright, consulting, web legal package — is a distinct search intent. Potential clients actively searching for "registro de marca México", "contrato prestación de servicios freelance", or "derechos de autor INDAUTOR" find no dedicated page to land on. All organic traffic is forced into one generic experience, and the site cannot rank for long-tail, high-intent terms.

### UX and Lead Quality

A visitor who already knows they need trademark registration has to scroll through the full landing page — all five services, the process steps, about section, reviews, FAQ — before reaching the contact form. There is no direct path for high-intent visitors. This increases drop-off and reduces lead quality, since the experience is identical for cold and warm visitors.

### Content Depth

Individual service pages could carry richer, more persuasive content: detailed process steps per service, service-specific FAQs, estimated timelines, cost context, and real case examples. None of this is practical on a single landing page without overwhelming the layout or making the page unwieldy for general visitors.

### Scalability

There is no content architecture to grow into. Adding new services, blog posts, educational guides (IMPI process, copyright registration, NDA basics), or campaign-specific landing pages all require modifying the single root page. A proper site structure makes this incremental.

---

## High-Level Direction

Convert to a multi-page Next.js App Router website. Rough page structure:

| Route | Content |
|---|---|
| `/` | Home — condensed hero, service overview grid, social proof, single CTA |
| `/servicios/[slug]` | One page per service (marca, contratos, derechos-de-autor, consultoria, web-legal) |
| `/nosotros` | About page — brand story, team, why choose us, "not for you if" |
| `/contacto` | Dedicated contact page — form + WhatsApp side by side, always reachable from nav |
| `/recursos` *(optional, Phase 3)* | Blog/guides for inbound SEO |

The Navbar evolves from scroll-based anchor links to full page navigation with routes.

---

## What This Spec Does NOT Define

A full brainstorming session is required before implementation. Open questions include:

- **Routing and slug conventions** — exact URL structure, how slugs map to service names
- **Home page condensation** — what stays from the current landing, what moves to service pages
- **Per-service page content** — what unique content each service page carries beyond the current card description
- **Nav redesign** — how the navbar handles routes + the existing mobile menu
- **SEO strategy** — metadata per page, structured data, sitemap
- **Animation continuity** — how existing scroll-driven animations carry over across page transitions
- **`/recursos` scope** — whether a blog/content section is in Phase 2 or deferred to Phase 3

---

## Relationship to Phase 1

The conversion improvements (`.claude/convertions/spec.md`) ship first and are independent of this refactor. Phase 1 improves the current landing page. Phase 2 restructures the site entirely. The two can be executed in sequence without one blocking the other.
