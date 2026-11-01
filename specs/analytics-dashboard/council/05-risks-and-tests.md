# Analytics Dashboard — Risks & Test Scenarios

## Edge cases
- **EC1:** Accessible account list is empty or permission-limited → state exact discovery scope and unknown coverage, not “no assets exist”. (FR4)
- **EC2:** Same asset name occurs under different typed IDs, or legacy Pixel remains connected → preserve identities/classification, never select by name or first returned resource. (FR2–FR5)
- **EC3:** Explicit measured zero versus omitted row versus thresholded/withheld/partial data → use per-metric availability/completeness and verified zero semantics. (FR13)
- **EC4:** Property, stream, mapping or configuration revision changes while evidence/cache is fresh → invalidate applicability/reuse immediately; old facts retain original scope if retained. (FR7–FR8, TR9)
- **EC5:** Successful Google reports coexist with failed Meta requests → Google and expected catalog remain usable, Meta alone shows its failure. (FR14)
- **EC6:** Meta Contact count spans WhatsApp, email and quotation intent → show one provider aggregate and unavailable per-action counts unless supported separately. (FR21)
- **EC7:** Custom 90-day period plus equal preceding period → count 180 reporting days inside one operation budget; prior zero produces no meaningful percentage baseline. (FR10, TR5)
- **EC8:** Legacy test traffic or old lead definition contaminates prior period → mark scope/comparison incompatible, do not claim clean production growth. (FR17)
- **EC9:** Restart or instance swap loses cache → show no retained result, never invent last-success data. (TR7)
- **EC10:** New date range requested during resource cooldown → return deferred state; do not show prior range under new controls. (FR18, TR9)
- **EC11:** Provider row/title/path/campaign contains personal data → safe projection removes/buckets unexpected values before cache/output/logging. (TR2)
- **EC12:** Report refreshed after manual verification expires → report timestamp advances, manual claim stays stale. (FR8, FR12)
- **EC13:** Direct dashboard load, SPA entry with SDK loaded, back/forward or delayed SDK callback → dashboard context never produces marketing events. (TR4)

## Failure modes
- **FM1:** Provider token expires or lacks required read capability → one provider loses observations; map to safe unavailable state and next action. Never infer permission from CAPI send success. (FR11, FR13–FR16)
- **FM2:** Discovery/report query exceeds call/page/row/time caps → partial/deferred coverage with original query identity; no completeness claim. (FR4, FR18, TR5)
- **FM3:** Several instances or varied range queries bypass local limits → quota exhaustion across team; prevent through actual-host shared budget/cooldown or demonstrated single-instance constraint. (TR5)
- **FM4:** SDK auto-collection survives a component unmount → dashboard traffic/potential metadata enters marketing stream; explicit collection boundary, real network verification, fresh-document transition if suspension cannot be proved. (TR4)
- **FM5:** Evidence maintenance has no responsible owner → gaps remain unresolved; show unknown owner and dated missing evidence, do not invent a workflow or owner. (FR16)
- **FM6:** Provider data changes between console and API checks → record both timestamps and exact query semantics; accept only an explained provider-supported limitation, otherwise metric remains unverified. (FR9, FR12)
- **FM7:** Core Google metric cannot be read despite a mock-based implementation → v1 incomplete; prerequisite live discovery prevents a false completion claim. (FR9)

## Key test scenarios
- **TS1:** Given candidate assets of every class, when selection changes, then only approved current resources drive reports and prior evidence cannot validate the new selection. (AC2–AC5)
- **TS2:** Given explicit zero, absent row, partial and withheld fixtures, when normalized, then only semantically supported zero becomes numeric zero. (AC9)
- **TS3:** Given reports for resource A/range X and request B/range Y, when cached data exists, then incompatible identity cannot be served under B/Y labels, even after failure. (AC7, AC12)
- **TS4:** Given a multi-page discovery and comparison refresh, when any numeric cap is reached, then requests stop at the aggregate limit and response completeness remains partial/deferred. Repeat under actual deployment concurrency. (AC3, AC12)
- **TS5:** Given old manual evidence and a new report, when refreshed, then manual verification and discovery age remain unchanged. (AC5)
- **TS6:** Given provider output containing synthetic email/phone/query/token strings in unexpected dimensions and metadata, when projected, then responses, retained projections and diagnostics contain none of those strings. (AC13)
- **TS7:** Given granted consent and initialized SDKs on a public page, when navigating to/from the dashboard or using history, then dashboard marketing requests are absent and normal public consent/form behavior remains correct. Repeat direct dashboard load and delayed SDK readiness. (AC14)
- **TS8:** Given one Meta Contact aggregate, when event coverage renders, then the total is not copied into all three canonical intent rows or summed as three leads. (AC10, AC15)
- **TS9:** Given identical stable console/API queries, when reconciled, then the record contains resource, metric, period, timezone, filters, settings/definition identity, retrieval times and both values; unexplained mismatch leaves the metric unverified. (AC6–AC8)
- **TS10:** Given keyboard/mobile operation, when changing date, opening details or encountering provider failure, then states and next actions remain comprehensible without color or hover. (AC1)
- **TS11:** Given an implemented/configured event with no receipt evidence, when overview renders, then independent statuses show unknown observation rather than a healthy badge. (AC4–AC5, AC11)

## Accepted risks
- Meta may remain a verified inventory/evidence view without quantitative website reporting; explicitly accepted by the user. (D8)
- No new persistence solely for history/continuity. A restart may lose cached reports; honest unavailable state is accepted by all proposal authors. (D9)
- Conservative limits may yield partial discovery or deferred queries; scope remains visible and caps can be revised with capability evidence. (D4)
- A new uncached period may wait up to the resource cooldown; ponykiller accepts this for a non-real-time internal workflow. Revisit if owner testing demonstrates interactive exploration needs shorter limits. (D4)
- Auth design is deferred by explicit user instruction; no auth architecture or public-access conclusion is introduced. (D8)
- Exact owners, assets and hosting remain open configuration dependencies. They do not prevent a reviewed plan but prevent claiming live integration evidence exists. (D5)
