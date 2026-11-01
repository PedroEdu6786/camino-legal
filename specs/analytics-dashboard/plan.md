# Plan: Website Analytics and Tracking Inventory
> Status: draft · Slug: analytics-dashboard · Spec: ./spec.md

## Approach
Build one read-only analytics surface inside the existing Next.js application, provisionally `/admin/analitica`, using concrete Google/Meta integrations, a reviewed inventory/evidence manifest and the existing measurement definitions. Combine A's small implementation surface, B's explicit evidence/query identities and C's complete owner workflow: Google performance and useful verified Meta coverage must coexist before v1 is complete. Authentication is explicitly deferred; this plan does not design login, roles or sessions. (FR1–FR21, TR1–TR9)

## Components affected
- **Analytics page and detail views:** Spanish overview, inventory, catalog and health; date/provider controls, metric definitions, independent evidence states, next actions and keyboard/mobile detail drawer. No overall green badge. (FR1, FR5–FR8, FR12–FR16, FR19–FR21; TR6)
- **Measurement catalog projection:** Derive expected names and mappings from the existing contract/runtime; reviewed descriptions supply meaning, triggers and classification without a second authoritative event registry. (FR6, FR19, FR21; TR3, TR8)
- **Inventory and verification projection:** Reviewed asset classifications/selection/manual claims merged with access-bounded discovery; derive gaps rather than maintain a separate issue store. (FR2–FR8, FR16–FR17)
- **Concrete provider readers:** Google configuration and aggregate reports; Meta verified identity/capabilities and accepted manual-evidence fallback. Independent failures and safe provider-result projection. (FR4, FR9, FR11–FR15; TR1–TR2)
- **Report orchestration:** Immutable report identity, compatibility checks, bounded refresh/discovery, temporary cache and per-metric availability. (FR9–FR14, FR17–FR18, FR20; TR5, TR7, TR9)
- **Public measurement boundary:** Existing root layout mounts AnalyticsScripts/SectionViewTracker globally; establish eligible public-route collection before SDK activation, event creation, observers and queued dispatch so dashboard activity cannot become public-site analytics. (TR3–TR4; AC14)

## Data model changes
No new database or warehouse. These are plain record contracts within one application, not independent persisted subsystems. Reviewed non-secret asset/selection/evidence metadata lives in a versioned manifest; reports/discovery results are retained only in facilities the actual host supports. (TR7)

| Record | Required meaning | Trace |
|---|---|---|
| Asset | Provider; typed ID; known environment, owner and relationships; active/legacy/excluded/unclassified; reason; safe provider-console link | FR2–FR5 |
| DiscoveryResult | Accessible scope; discovered candidates; discovery time; complete/partial relative to that scope; blind spots | FR4 |
| ProductionSelection | Explicit typed resources; environment; effective selection/configuration revision; cutover context | FR3, FR17 |
| EvidenceClaim | Claim type; subject/resource/environment; relevant configuration and measurement revision; method/source; result; verified time; applicable period; expiry | FR7–FR8 |
| ReportIdentity | Provider; selected typed resource/environment; period; timezone; metric/dimension/filter sets; definition version; relevant reporting settings revision | TR9 |
| MetricResult | Nullable number; availability/completeness; verified zero interpretation when relevant; definition; provider; limitations; applicable aggregate/action scope | FR9–FR15, FR20–FR21 |
| ReportResult | Immutable identity; metrics; retrieval time; processing/coverage limitations; success/partial/error; optional matching last-success evidence | FR12–FR14, FR18 |
| TrackingGap | Derived missing evidence, affected scope, Spanish impact, known/unknown owner and next action | FR16 |

Changes in selected resource or relevant configuration make old evidence inapplicable; they do not rewrite historical facts. Retaining old facts is best effort, not a history service. A successful report refresh changes neither discovery timestamps nor manual verification dates. (FR7–FR8, TR7)

## Interfaces & contracts
- **Inventory read:** Approved selection/manifest and accessible discovery → classified assets, discovery scope and evidence claims. Discovery never silently selects production or overwrites reviewed classifications. Unknown ownership and inaccessible assets remain explicit. (FR2–FR5)
- **Catalog read:** Existing measurement definitions plus safe descriptions → canonical rows with Google/Meta mappings and separate implementation/configuration/registration/observation claims. Shared Meta `Contact` has one aggregate measure; action-specific counts remain unavailable unless separately evidenced. (FR6–FR8, FR19, FR21)
- **Report read:** Validated bounded period and selected provider → independently typed ReportResults. Provider resource IDs come from approved selection, not arbitrary browser input. Empty/withheld/partial/unsupported and zero are distinct per metric. No API response or cached result is relabeled with newer control values. (FR3, FR9–FR15, TR9)
- **Refresh:** Explicit report refresh or separate inventory-discovery action → refreshed, partial, deferred or failed result with original scope/freshness. Reads do not trigger provider setting writes, diagnostic events or background jobs. (FR18; TR1, TR5)
- **Errors:** Disconnected, forbidden, unsupported, timeout, throttled, incomplete, no-observations and stale remain safe structured states. Never expose raw provider bodies. (FR13–FR14; TR2)
- **Projection:** Only canonical registered paths, safe event/service identities and approved bounded acquisition categories enter responses/caches/logs. Unrecognized provider strings are dropped or safely bucketed without echoing them. Typed asset identifiers and reviewed operational labels are allowed separately from arbitrary visitor dimensions. (TR2, TR8)

### Reporting and comparison rules
- Google primary dashboard metrics, per subsequent user request: `totalUsers` (Visitantes), web-scoped `screenPageViews` (Vistas de página) and `bounceRate` (Tasa de rebote). Query `sessions` in the same aggregate report to preserve denominator semantics; a zero-session report has unavailable bounce rate. Format the provider's fractional bounce rate as a percentage; do not average daily rates or sum daily distinct users. Supporting lead/intent counts use separate filtered reports so those filters do not distort visitor/session metrics. Definition/capability matrix determines available breakdowns; unregistered custom definitions are unavailable, never zero. [Official metric definitions](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema). (FR9, FR12, FR15)
- Default last 28 complete property-timezone days; presets 7/28/90; custom 1–90 complete days. User accepted the 90-day cap as a non-functional query-workload constraint: older periods remain selectable where provider data exists; no retention/deletion policy is implied. Previous period has equal calendar-day duration immediately before selected start: at most 180 total reporting days across both periods. Denominators and percentage-change definition are explicit; prior value zero yields “sin base comparable”, not infinity. (FR10, FR12, FR17; TR5)
- Compare only compatible resource, measurement definition, filters, timezone, reporting settings and cutover/environment coverage. Native Google attribution and bounded application attribution must not share a misleading label. (FR10, FR12, FR17)
- Form stages are event counts; no sequential funnel or unique-submission conclusion. Marketing lead counts are not total business inquiries, operational SMTP acceptance or revenue. No combined Google+Meta total. (FR15, FR20)

### Provisional operating policy

The user approved the 90-day selected-range cap, 15-minute refresh eligibility and 30-day configuration/evidence recheck reminder. Other numeric execution limits remain council defaults pending actual-host/provider validation.
- Report refresh and inventory discovery are separate explicit operations; a report read never silently rediscovers every account.
- Each logical operation: **12 upstream HTTP calls total**, **3 pages per paginated collection**, **5,000 accumulated rows total**, **2 concurrent calls**, **5 seconds per call**, **20 seconds total elapsed**, **0 automatic retries**. Comparisons, pagination and any provider calls consume the same operation budget. Abort remaining work at expiry; exhausted scope is partial/deferred, never complete. (TR5)
- **15-minute refresh eligibility per full identity**, plus a shared per-provider/selected-resource cooldown across varied query identities; a new date range cannot bypass the upstream budget. Eligible cached results may be read without a new upstream operation. Invalid/failed attempts consume cooldown; retry policy honors any longer provider Retry-After. Fixture these rules before launch. (FR18, TR5)
- Configuration/manual evidence is labeled **needs recheck after 30 days**, as approved by the user. It is an evidence-age label, not account expiry, data deletion or a switch that stops tracking/reports. Discovery similarly shows its own age and a 30-day recheck label. Relevant binding changes invalidate applicability immediately. Report retrieval older than 15 minutes is stale for the UI; this is not a promise of upstream processing freshness. (FR4, FR7–FR8, FR12–FR13)
- Host discovery must choose demonstrably shared enforcement across actual instances or document/verify an actual single-instance operating constraint. No new paid service is assumed. Cache restart/loss means no retained report until successful read; if cached data is present it retains its full identity and age. (TR5, TR7, TR9)
- Caps may be adjusted only with measured capability evidence and a documented policy update; full v1 cannot pass by silently dropping core Google reports to fit a cap. (FR9; AC6, AC12)

## Implementation phases
1. **Verify resources and capabilities.** Record owner-confirmed production selection, accessible/legacy/excluded assets, successful representative read-only Google report, support matrix per metric/breakdown, and verified Meta identity/fallback evidence. Record actual host, request-budget enforcement choice and reconciliation inputs. Mock-backed work may proceed while access is unresolved; mocks cannot close this phase's evidence gate. (FR2–FR5, FR9, FR11, FR17; TR5)
2. **Build the inventory preview and evidence contracts.** Deliver the four-area shell, catalog, classified inventory, independent evidence states and safe gaps; add actual collection isolation. Label fixture-only or inventory-only progress as an internal preview. (FR1, FR6–FR8, FR13, FR16, FR19, FR21; TR2–TR4, TR6)
3. **Deliver the complete owner workflow.** Add default-period Google metrics, useful Meta fallback/verified metrics, all bounded period/comparison controls, projection, immutable cache identity and independent failure/refresh behavior. All four areas must be useful together; no claim that inventory alone completes v1. (FR9–FR18, FR20–FR21; TR5, TR7–TR9)
4. **Reconcile and verify.** Match representative reports against provider consoles; exercise failures and actual-host budgets; test network isolation, personal-data canaries and accessibility. All AC1–AC15 must pass or the feature remains incomplete with explicit evidence gaps. Auth is not added to this phase; access design remains separately deferred. (FR1–FR21, TR1–TR9)

## Dependencies & integrations
- **Google Analytics Admin API:** Read accounts/properties/streams and applicable key-event/custom-definition configuration. **Google Analytics Data API:** Read aggregate website reports. GA numeric property, stream and `G-…` measurement IDs are distinct. Actual read permissions and dimensions must be demonstrated. [Official configuration reference](https://developers.google.com/analytics/devguides/config/admin/v1/rest), [reporting overview](https://developers.google.com/analytics/devguides/reporting/data/v1). (FR3–FR9)
- **Meta:** Existing CAPI integration sends events; it is not a reporting permission or reader. Public discovery suggested Pixel metadata, but official documentation access was rate-limited and live capability remains unverified. Use only confirmed read support; accepted fallback requires owner-verified asset/mapping/evidence with a console link and truthful limitation. No automatic advertising substitution. (FR11, FR21)
- **Current application:** Reuse measurement contracts and operation definitions. The installed Next.js auth and route-handler guides were inspected for context; this plan adds no auth design. Read relevant installed docs again for concrete framework APIs when implementing.
- **Owners/host:** Account owner supplies resource approval/read access; operator establishes runtime secrets, actual execution bounds and recovery. Secrets remain server-only and outside versioned manifests. (TR2, TR5)

## Risks & tradeoffs
- Partial access cannot establish every organizational asset exists or is absent; display discovery scope and unresolved gaps. (FR4)
- Meta inventory-only fallback is accepted; quantitative symmetry is intentionally not promised. (FR11)
- Evidence maintained outside the page can go stale; dated claims, expiry and clear ownership preserve honesty. (FR8, FR16)
- Bounded reads can be partial; tune from actual capability evidence and keep core-report acceptance intact. (FR9, TR5)
- Global SDK instances may continue implicit collection after SPA entry; isolate public collection and prove transition behavior. Use a fresh-document boundary if safe suspension cannot be demonstrated. Already-sent public events cannot be recalled. (TR3–TR4)
- Legacy provider data can contain test traffic/unsafe dimensions and incompatible definitions; project safely and restrict comparisons. (FR17, TR2)
### Alternatives considered
- Standalone inventory as completed v1: rejected because performance was explicitly required. Internal preview remains useful.
- New persistence/connector platform: rejected; record shapes and two concrete readers meet current requirements. Revisit only for requested history or additional providers.
- Automatic zero imputation or a single healthy badge: rejected because partial evidence can look falsely complete.
- Twenty calls/five pages per operation: considered against twelve/three; choose the conservative ceiling absent measured need, retaining explicit partial results and a policy-revision path.

## Test strategy
- **AC1:** Browser keyboard/mobile checks across all four views; state meaning does not rely on color.
- **AC2–AC3:** Fixture discovery pages, inaccessible scopes, same-name assets, exclusion reasons and explicit production selection. Pagination truncation remains partial.
- **AC4–AC5:** Catalog/mapping coverage; implementation/config/registration/observation independent; changed binding invalidates claims; refreshing reports does not update unrelated dates.
- **AC6–AC8:** Real read-only reconciliation record with resource, metric, both values, range, timezone, filters, reporting identity, definition revision and timestamps. Require exact agreement for a matched stable query or a specific provider-supported explanation shown as a limitation; unexplained differences keep the metric unverified. Test cutovers, zero prior baseline and Meta fallback.
- **AC9–AC12:** Contract fixtures for explicit zero, omission, thresholded/withheld/partial data, independent outages, incompatible cache identities and budget/clock exhaustion. Multi-instance or verified single-instance enforcement test for actual host. No partial result earns complete coverage.
- **AC13:** Synthetic secret/visitor-data canaries in provider dimensions, labels, error bodies and metadata; inspect responses/cache projections/logs and excluded technical dimensions.
- **AC14:** Real-browser network checks on direct dashboard load, public→dashboard, dashboard→public, back/forward and pending SDK/queued event cases. Preserve existing consent/form regression tests. No dashboard marketing requests.
- **AC15:** One Meta Contact count links three intent mappings without three fabricated action counts.

## Assumptions
- User's explicit scope decisions in the spec govern all proposals; no further auth question blocks these artifacts.
- Existing development review can maintain non-secret inventory/evidence; unknown owners are visible until assigned.
- Numeric policies are conservative council defaults pending real host/provider validation, not claims about provider limits or business SLAs.
- No live account, deployment, credentials or provider settings were changed during planning.

## Open decisions
- Named resource/operational owners and actual selected production assets/read access.
- Actual host and enforcement/cache facilities; no unconditional durability or fleet-wide throttling claim until verified.
- Validate remaining numeric execution limits against the actual host/provider; the 90-day query cap, 15-minute refresh and 30-day verification reminder are approved.
- Access method remains outside scope by user instruction and is not designed here.
