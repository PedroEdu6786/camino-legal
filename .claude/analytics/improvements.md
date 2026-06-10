# Analytics — Future Improvements

Options evaluated but deferred from the initial implementation scope.

---

## Microsoft Clarity

**Best for**: UX debugging — heatmaps, session recordings, rage clicks, dead clicks
**Cost**: Free, unlimited (data retained 90 days)

- Loaded via `next/script` in `app/layout.tsx`
- No custom event API needed — works out of the box
- Shows which sections get the most scroll depth and clicks
- Complements GA4: GA4 tells you *what*, Clarity shows you *why*
- Session recordings mask form fields by default

**When to revisit**: When the team wants to understand *why* visitors don't convert rather than *how many* don't.

---

## Umami (self-hosted, open source)

**Best for**: Privacy-first analytics; no cookies; no consent banner needed
**Cost**: Free if self-hosted on Railway, Render, or Vercel Postgres

- Drop-in `<script>` tag, cookieless
- Custom events via `umami.track('event-name', { prop: value })`
- Simple dashboard: pageviews, referrers, countries, devices
- LFPDPPP-friendly — no personal data leaves your infrastructure
- Requires one-time server setup (Postgres + Node)

**Trade-off**: No ads attribution. GA4 + Meta Pixel still needed if running paid campaigns.

**When to revisit**: If privacy compliance requirements tighten or data ownership becomes a priority.
