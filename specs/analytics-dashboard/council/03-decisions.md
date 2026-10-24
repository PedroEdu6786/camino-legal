# Analytics Dashboard — Decision Records

## User decisions governing the council
- Both inventory and performance belong in v1; website tracking first, advertising later.
- “for now dont worry about auth” — authentication design/implementation deferred.
- Meta verified inventory, mapping, evidence and console links with an explicit reporting limitation is acceptable when website metrics cannot be read.
- Include active, legacy and excluded assets separately, with access-bounded discovery.

## Round 1 dispute ledger
All three proposals were steelmanned by cuid, ponykiller and estebanquito before critique.

| ID | Point | Raised by | Severity | Status |
|---|---|---|---|---|
| D1 | Empty/omitted data is not necessarily zero | cuid | blocking | Conceded by all authors; closed in round 2 |
| D2 | Evidence must lose current applicability after binding changes | cuid | blocking | Conceded by all authors; closed in round 2 |
| D3 | Immutable report/cache identity must include all effective query inputs | ponykiller, cuid | blocking | Conceded by all authors; closed in round 2 |
| D4 | Numeric budgets and deployment-wide enforcement are unspecified | ponykiller, estebanquito | blocking | Revised; Chair ceiling accepted by gamachiel; closed in round 2 |
| D5 | Discovery exit needs demonstrated real capabilities | estebanquito | blocking | Conceded by all authors; closed in round 2 |
| D6 | Inventory preview versus complete v1 | estebanquito, kings proposal | major | Conceded by A/B; resolved |
| D7 | Separate evidence freshness; safe dimensions; reconciliation evidence | cuid, ponykiller, estebanquito | major | Conceded by all authors; resolved |

## Objections preserved

**cuid (Risk / QA), D1:** “Nullable values and source states do not yet specify when an omitted metric can legitimately become zero.” Scenario: successful report omits a row because data is unavailable/withheld/incomplete; normalization emits zero and the owner concludes no leads occurred. Proposed fix: per-metric availability/coverage and verified zero semantics, with explicit zero/omission/partial fixtures.

**cuid (Risk / QA), D2:** “Evidence provenance lacks an explicit rule invalidating current verification after resource or measurement configuration changes.” Scenario: selected production stream/event mapping changes but recent former evidence remains verified. Proposed fix: resource/configuration-version binding; historical evidence does not certify the current setup.

**ponykiller (Infra), D3:** “Report metadata is specified, but the identity used for caching and in-flight deduplication is not.” Scenario: production property, filters or definition changes and cached values appear under current labels. Proposed fix: immutable provider/resource/environment/period/timezone/metric/dimension/filter/definition identity; compatible retention only.

**ponykiller (Infra), D4:** “\"Finite deadlines\" and capability-dependent budgets do not define an enforceable bounded reporting workload.” Scenario: breakdowns, comparisons, pagination and multiple instances multiply upstream requests despite a per-process cooldown. Proposed fix: numeric aggregate requests/pages/deadline/retries/range, partial on exhaustion, verified deployment scope.

**estebanquito (Engineering Manager), D5:** “The proposals do not define what evidence closes discovery sufficiently to commit the reporting implementation.” Scenario: assumed permission/dimension support drives implementation without a representative read from the intended property. Proposed fix: owner-confirmed selection, successful Google read, support decisions and verified Meta/fallback evidence; mocks do not close this gate.

**estebanquito (Engineering Manager), D6:** “Neither proposal explicitly distinguishes its inventory milestone from completed v1.” Scenario: Google access is delayed and an inventory-only page is labeled complete. Proposed fix: internal preview distinct from v1; completion includes reconciled Google reports and accepted Meta outcome.

**cuid (Risk / QA), D7:** “Aggregate-only reporting does not by itself keep visitor data out of externally supplied dimension values or labels.” Proposed fix: canonical-path/bounded-category projection and provider-dimension canaries.

**ponykiller (Infra), D7:** “The plan needs separate freshness rules for configuration verification and report retrieval.” Proposed fix: refresh renews only the claim actually checked; manual expiry independent of report age.

**estebanquito (Engineering Manager), D7:** “\"Reconciliation\" lacks an evidence format and discrepancy policy, leaving completion subjective when provider processing changes between checks.” Proposed fix: resource/query/identity/timestamps/values record; unexplained discrepancies stay unverified.

## D1 — Do not infer zero from missing data
- **Context/options:** Nullable provider results versus per-metric completeness and verified zero semantics.
- **Arguments for:** cuid — absence can mean withheld, filtered or incomplete data, not zero leads.
- **Arguments against:** No author defended zero imputation; original contracts were incomplete.
- **Verdict:** Consensus; FR13 and AC9 require distinct omission/partial/withheld cases and explicit supported zero interpretation.
- **Who ticked:** rafachafa, gamachiel and kings: “tick tick tick”.
- **Dissent (kept):** None remaining; authors conceded an omission.
- **Revisit trigger:** New provider report semantics require different normalization evidence.

## D2 — Verification binds to the configuration it actually checked
- **Context/options:** Recent timestamps alone versus resource/environment/configuration/measurement revision binding.
- **Arguments for:** cuid and gamachiel — recent evidence from a previous selection cannot certify the new one.
- **Arguments against:** None after failure scenario; retained history remains useful only in its original scope.
- **Verdict:** Consensus; FR8/AC5 invalidate applicability on material changes; manual dates never advance from report refresh.
- **Who ticked:** All authors; kings also explicitly conceded metric-to-evidence navigation must bind revision.
- **Dissent (kept):** None remaining.
- **Revisit trigger:** Introduce durable historical audit requirements.

## D3 — Immutable report identity governs caching and comparison
- **Context/options:** Vague report key versus explicit complete query/resource identity.
- **Arguments for:** ponykiller and cuid — compatible caching must prevent plausible values from appearing under a different resource or period.
- **Arguments against:** No defense of incomplete keys after scenario was demonstrated.
- **Verdict:** Consensus; TR9 and AC12 require resource/environment/period/timezone/metric-definition/dimensions/filters/relevant settings identity and original response metadata.
- **Who ticked:** All authors.
- **Dissent (kept):** None remaining.
- **Revisit trigger:** Additional report-affecting settings or identity semantics.

## D4 — Bounded operations with conservative provisional limits
- **Context:** Operational acceptance was untestable without numeric totals, and per-process cooldown was not a deployment-wide guarantee.
- **Options considered:** Deferred budgets; rafachafa's 12 calls/three pages; gamachiel's 20 calls/five pages. Both revised proposals use zero automatic retries, two concurrent calls, five seconds/call, twenty seconds/operation and ninety days/selected period.
- **Arguments for:** ponykiller/estebanquito require explicit aggregate caps and actual-host enforcement; rafachafa favors smaller bounds without evidence of broader need. gamachiel contributes separate discovery operation, row cap and 180-day maximum including comparison.
- **Arguments against:** gamachiel initially reserved more headroom for multiple report shapes and pagination.
- **Verdict:** Chair selected 12 calls/three pages with 5,000 total rows; gamachiel accepted. Discovery separate; comparisons included; shared cooldown across identities prevents date changes bypassing bounds. Exhaustion is partial/deferred. Actual-host enforcement remains demonstrable, not assumed.
- **Who ticked:** gamachiel: “tick tick tick — I concede 20 calls/five pages. There is no measured evidence requiring those higher ceilings.” All authors conceded undefined bounds.
- **Dissent (kept verbatim):** “The initial 20-call/five-page proposal reserved room for multiple report shapes and pagination; it was a provisional allowance, not a demonstrated requirement.”
- **Revisit trigger:** Measured workloads cannot meet required coverage within caps; identify necessary calls and quota/hosting cost before revising. Also revisit cooldown if owner testing shows unacceptable interactive delay.

## D5 — Feasibility requires actual reads, not a capability assumption
- **Context/options:** Draft capability matrix versus demonstrated intended-resource reads and owner confirmation.
- **Arguments for:** estebanquito — mocked UI success cannot establish permissions or dimensions; selected resource must be confirmed.
- **Arguments against:** No proposal author rejected the gate; mock-backed work can proceed before it closes.
- **Verdict:** Consensus; phase 1 requires production selection, successful representative Google read, metric support matrix and useful verified Meta fallback. Production operating claims also require actual-host evidence.
- **Who ticked:** All authors; estebanquito confirmed closure in round 2.
- **Dissent (kept):** None remaining.
- **Revisit trigger:** Different provider capabilities or changed selected resources.

## D6 — Inventory can be a preview; v1 includes performance
- **Context/options:** A/B sequence inventory early; C requires combined business usefulness for first complete milestone.
- **Arguments for:** kings and estebanquito — calling inventory complete drops half the user's requirement.
- **Arguments against:** A/B's staged sequence is useful for early feedback, but authors did not defend labeling it completed v1.
- **Verdict:** Consensus; keep internal preview, require all four views, reconciled Google reports and accepted Meta coverage plus all acceptance criteria for complete v1.
- **Who ticked:** rafachafa and gamachiel accepted; no staged-development prohibition.
- **Dissent (kept):** No remaining disagreement; sequencing retained without a false completion label.
- **Revisit trigger:** Explicit user scope reduction.

## D7 — Trust evidence must be safe and understandable
- **Context/options:** Technical metadata alone or compact green summary versus separate evidence states with concise Spanish impact/actions and detailed provenance.
- **Arguments for:** cuid demands safe external-value projection; ponykiller separates timestamps; estebanquito requires reproducible reconciliation; rafachafa rejects a healthy badge that hides missing registration; kings demands business-readable next actions.
- **Arguments against:** No defense of raw provider strings or collapsed statuses. kings initially proposed compact coverage without spelling out independent dimensions.
- **Verdict:** Consensus; no overall green badge. Independent implementation/configuration/applicable-registration/observation, distinct report/discovery/manual clocks, projected safe dimensions, recorded reconciliation and next action. Meta Contact is one aggregate, not three inferred action counts. Direct/SPA SDK isolation is required because root tracking is global.
- **Who ticked:** All authors; kings: “tick tick tick. I accept both objections.”
- **Dissent (kept):** None remaining; compact presentation survives through summaries plus details, without hiding distinctions.
- **Revisit trigger:** New data dimensions or evidence kinds require projection/meaning review.

## D8 — User-steered scope governs feasibility
- **Context/options:** Quantitative Meta parity versus verified fallback; current IDs only versus legacy discovery; auth design now versus deferred.
- **Verdict:** Explicit user decisions: accept useful verified Meta fallback, retain active/legacy/excluded discovery, defer auth entirely. No council auth approval gate is added.
- **Who ticked:** Not a council dispute; user instructions supersede proposal assumptions.
- **Dissent (kept):** None.
- **Revisit trigger:** User requests advertising, different Meta acceptance, or access design.

## D9 — Plain records, no speculative data platform
- **Context/options:** A's concrete readers/manifest versus interpreting B's contracts as independently persisted subsystems.
- **Arguments for:** rafachafa — independent stores introduce synchronization and stale-state problems without requirements. gamachiel — explicit record shapes preserve correctness without those stores.
- **Verdict:** Consensus; plain records, two concrete readers, derived gaps, no new database/warehouse/connector framework. C provides the owner-facing structure.
- **Who ticked:** gamachiel confirmed records remain in the existing app; no separate storage was required by B.
- **Dissent (kept):** None; no authors advocated the speculative framework.
- **Revisit trigger:** Explicit history/retention or additional-provider requirements.

## Round 2 closure and synthesis
- cuid: “Converge — no remaining blocking objections.” Zero semantics, evidence applicability, immutable cache identity and external projection resolved.
- ponykiller: “Converge: no remaining blocking objections.” Bounds, report identity and independent freshness resolved; cooldown delay explicitly accepted as a tradeoff.
- estebanquito: “tick tick tick — converge; no remaining blocking objections.” Preview/completion, discovery and reconciliation gates are testable.
- Author responses addressed peer critiques; no blocking objection remains. Stop at two rounds.
- Selected: A's small execution surface + B's identity/evidence contracts + C's complete owner workflow. No complete proposal was rejected; undefined semantics and higher unproven limits were rejected as recorded above.

## Over-engineering audit
- Every planned component traces to FR/TR/AC IDs. No auth implementation, database, history service, arbitrary report builder, provider-setting editor, advertising connector, assignment workflow or external alerting was added.
- Numeric limits and read contracts serve TR5/AC12; they are implementation design defaults, not invented provider guarantees.
- Former `.claude/analytics/dashboard/plan.md` remains historical input and points to this canonical package; its original auth assumption no longer governs the scope.

## Post-council policy confirmation
- User approved the 90-day selected-period limit as a non-functional query-workload constraint, the 15-minute refresh eligibility and the 30-day configuration/evidence recheck reminder.
- The 90-day limit is not data retention; older periods remain selectable where data exists. The 30-day reminder does not expire accounts, delete data, stop tracking or disable reports.
- Updated spec FR8/TR5/AC5, plan and tasks. Only actual accounts/read-access and hosting/operational ownership remain open specification clarifications. Other technical execution caps still require environment validation.
