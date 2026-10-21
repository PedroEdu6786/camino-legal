# Camino Legal site expansion

## Design constraint

The user rejected the initial editorial redesign: the existing landing-page design is the source of truth. Extend that design; do not introduce another art direction or apply taste-skill house rules that replace its visual identity.

The original homepage composition, hero, wording, typography, cards, illustrations, process, reviews, contact form, cookie banner and footer are restored. Existing user edits from before this task, including removal of the custom cursor, remain intact.

Homepage additions are limited to links on the original service cards and navigation to service and quotation routes. New routes reuse the original header/footer and background curves. New-page styles are isolated in `app/site-pages.css`, using the existing colors, rounded cards, modest heading sizes and buttons. The service directory reuses the original Services component.

## Routes and scope

- `/`: original landing page with service links.
- `/servicios`: original service cards linking to dedicated pages.
- `/servicios/[slug]`: five service pages with scope, deliverables, required information and quotation links.
- `/cotizaciones?servicio=...`: service selector and trademark estimate; other services request tailored pricing.
- `/nosotros`: brand information and existing client reviews.

Existing email/contact implementation and analytics consent are retained. Quotation requests open an email draft; no payment is collected and no test emails were sent.

## Confirmed pricing

The user selected the Cotización Registro de Marca PDF over the alternative PDF:
- Evaluation once per brand: $799.00 MXN.
- Preparation and follow-up per class: $2,287.00 MXN.
- Official IMPI fee per class: $2,813.77 MXN.
- One-class total: $5,899.77 MXN, IVA included.
- Each additional class: $5,100.77 MXN, calculated from those components.
- Rules of Use for multiple holders: $616.00 MXN additional. Timing of this extra charge is left to confirm for split payments because the PDF does not specify it.
- Additional authority charges are excluded.

Calculations use integer cents. Other services have no invented amounts. Bank details from the PDFs are not published.

## Verification

`node --experimental-strip-types --test tests/quotation.test.mjs` checks rates, per-class multiplication, optional charges, invalid class counts and email encoding. The build and application lint are checked. Browser checks cover routes, quote controls and responsive overflow. Email delivery was not revalidated because no backend work was requested.

The discarded editorial screenshots and aesthetic scores do not describe the final design and must not be used as its reference.

## Engagement pass

The user approved the restored direction and asked for a more engaging site. The existing design stays intact. Added a five-choice service recommendation that highlights the corresponding original card, one-time scroll reveals via Web Animations (content visible without JS), sticker hover/pointer response, numbered process steps and checklist details on service pages, and change feedback on quote totals/payment options. Existing illustrations supply all artwork. Motion respects the OS reduced-motion setting; no looping animations or custom cursor are introduced.

### Compact homepage services entry

The homepage uses a single illustrated ServicesPreview panel linking to /servicios and /cotizaciones. The full service cards and interactive finder appear only on /servicios. The hero services CTA links directly to that directory. The original services anchor remains for existing links and section analytics.

### Interactive process section

The homepage process uses a dotted path with five selectable stops and a single illustrated step in focus. Native buttons implement the tabs pattern with arrow/Home/End keyboard navigation; next/back controls support sequential reading. Existing stickers and handwritten notes change with the selected step. Contact and quotation links remain in the relevant steps, with a final contact action. The layout stacks on mobile and respects reduced-motion preferences. This replaces the earlier accordion treatment following user feedback.

### Homepage brand introduction

Conoce a Camino pairs the existing portrait with a handwritten brand message and three plain-language principles. The portrait moves from the following CTA banner into the introduction, including on mobile. A direct link opens /nosotros. The old positive/negative bullet cards are replaced; the existing brand palette and type remain.

### Full-page design iteration

Following feedback that the dedicated pages were boring, /servicios now uses ServiceExplorer with five selectable needs, a live illustrated preview, and crawlable links to every detail page. /nosotros uses the existing portrait, a brand statement, illustrated principles, and the same interactive process as the homepage. All five service pages now use a large illustrated hero, section shortcuts, numbered scope rows, a deliverables panel, a burgundy investment section, and an optional local preparation checklist. Pricing, scope, trademark qualifications, FAQs, and quotation routing are preserved. This supersedes the earlier dedicated-page layout descriptions; the homepage remains as previously approved.

### Dedicated contact page

/contacto now owns the existing form, WhatsApp and email options. Navigation, hero, journey, service directory, footer and mobile sticky links point to that route, with their existing analytics events retained. The homepage closes after FAQs with a compact “¿Te quedó alguna duda?” row and one contact button, replacing the repeated slogan banner and embedded form. The oversized blue invitation was rejected and removed. Its #contact anchor remains as a useful destination for older homepage links. The email action and submission logic are unchanged.

### Homepage FAQ integration

The homepage FAQ now uses a two-column illustrated introduction and rounded native disclosures, stacking on mobile. Questions open one at a time, support native keyboard interaction, and link to the service directory and quotation page where relevant. The pricing answer uses the confirmed one-class total. The compact contact invitation remains directly below it.

### Owner visibility and slogan preference

The user explicitly requested no owner portrait in the Camino introduction. Both the homepage and /nosotros now use shared BrandArtwork with the existing white Camino logo and brand message; no rendered page references the portrait asset. The original slogan “El camino se hace al decidir avanzar” returns in a compact, pale-burgundy closing panel with a contact CTA, adapted to the current design. This supersedes the portrait and closing-copy decisions above.

Homepage order: reviews, slogan/contact panel, then FAQ as the final section before the footer, per the latest user preference.

### Scroll-driven process

The shared process journey now pins within a measured scroll track and advances/reverses its five steps with scroll position. Direct step and next/back controls jump to the corresponding point in the track. Panels reserve equal height, a skip link exits the scene, and reduced motion or insufficient viewport height preserves manual navigation without a long scroll track. Mobile sizing reserves room for the sticky contact bar. The homepage FAQ remains last; Clientes is omitted from desktop/mobile navigation.
