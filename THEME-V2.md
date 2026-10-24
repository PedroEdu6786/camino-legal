# Restored original Lino y azul

Worktree `/private/tmp/camino-legal-blue-v2`, branch `test/blue-theme-v2`.
Preview http://localhost:3013; lab /color-lab.

Latest direction: restore the Lino y azul approved before strict-brand iterations.
Brand colors are guidelines, not an exhaustive set. Preserve the varied service
card colors; do not flatten them to a single surface.

Restored light values: linen #F2ECEA, paper #FFF8F3, soft blue #D1E7F4,
charcoal #2F2A2B, wine #622831, logo/sticker orange #CB5432,
button/highlight orange #BB4D2E with #FFF8F3 labels.
Restored earlier dark palette as well.

Removed rejected presets, generated palette overrides and session-choice script.
Restored service-card accent classes by removing the blanket surface override.
Old palette URLs/session values no longer affect the site. Main worktree and v1
remain untouched. Changes are uncommitted; no deployment.


## Editable lab copy

The original is immutable. `/color-lab?theme=linen-custom&compare=linen` opens
an independent editable copy with 13 color controls: page, hero, cards, invitation
panel, body text, headings, emphasized words, links, button fill/text, footer
fill/text and logo. Color pickers and validated six-digit hex inputs update the
preview immediately. Each field and the whole copy can be reset. Switching to
the original does not discard the copy. URL parameters preserve valid overrides
for refresh and sharing. Contrast feedback covers text/background pairs.
All editing is scoped to the lab preview. The main site and service-card accents
are unchanged. No full-site application of the edited copy is implemented or implied.


## Main-site preview and hero icons

The editor now has “Previsualizar en la página principal”. Valid hex overrides
are applied before hydration and persisted in sessionStorage for this tab only.
A floating toolbar returns to the editor with the same draft or restores the
original. Card overrides affect the service cards only when explicitly edited;
otherwise their individual colors remain. This supersedes the earlier lab-only
limitation. Preview is a light-theme preview; original dark-mode preference is
restored when exiting it.

The four floating hero illustrations, including the theme-toggle bulb, have a
separate `heroIcons` color picker. A dedicated SVG ink-mask filter recolors only
these assets, preserving transparency, animation and bulb interaction. The logo
and service illustrations retain independent colors. The lab shows the same
four illustrations with per-preview filter IDs, so the original comparison
remains unchanged. URLs and reset controls include the new color.


## Selected default

User selected `/?preview=custom&action=%237D0402` and explicitly requested it as
the default. Light-mode button backgrounds are now #7D0402 in the site, the lab
baseline/reset and preview fallback. Only the action color changed: heading
highlights, curves, logo, hero icons, backgrounds, service accents and the dark
palette remain as before. No preview query is required. This supersedes the
older #BB4D2E default action value above.


## Button-only scope correction

The approved #7D0402 change applies only to primary button fills. Quote totals
and service-investment panels previously shared --button-bg and were unintentionally
recolored. They now use independent panel-emphasis tokens retaining their original
#BB4D2E background/#FFF8F3 text (and original dark pair). The floating lab shortcut
also retains its original orange. No heading, icon, logo, panel or card palette change
is part of this button-only selection.

## Approved version for feature branch

Light mode keeps Lino y azul with #7D0402 primary buttons. Service previews use
translucent blue, linen and clay; background curves use 12% opacity. Camila's
banner uses the original `7-removebg.png`, not the rejected generated edit.
Service-detail panels use #BEE0FA; the trademark price panel matches the primary
button. Trademark-route icon ink is muted #B37560. The contact form and quotation
controls have stronger separation from the page background.

Dark mode retains #172A36 ground and #213B4B surfaces. The approved softened
orange is #F29370 for actions, highlights and emphasis panels, with #E9825C
for the logo and #2F2A2B button/panel text.

Quotation consultation offers email and WhatsApp, with side-by-side desktop
buttons and a soft green WhatsApp treatment. Both use `quote_request_intent`
with distinct channel/action IDs, mapped through existing consent-aware Google
and Meta tracking. Header navigation resets scroll to the top, and the trademark
route uses elapsed-time easing without a fixed speed cap to catch up after fast
scrolling or dropped frames.
