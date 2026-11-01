# Dashboard operating evidence and decisions
> Status: approved policies recorded; host-dependent decisions blocked · Task: T1.4

## Local inspection
- Inspected: 2026-10-24 04:44 UTC; repository base `f1eeae2` on `feat/camino-site-expansion`.
- Existing feature branch retained; default remote branch is `origin/main`. No branch creation, commit, push or deployment performed.
- No root `.env*` files, relevant inherited analytics/Google credential/hosting keys, `.vercel/project.json`, `vercel.json`, `.netlify/state.json`, `netlify.toml` or `Dockerfile` were present in the inspected workspace.
- `next.config.ts` contains an empty Next configuration. `package.json` supplies Next dev/build/start and local test scripts; it does not identify a production host or a shared cache facility.
- README's Vercel link is standard deployment guidance, not proof the project is deployed there. `public/vercel.svg` is not deployment evidence.
- Parent tooling discovery found no connected Google Analytics, Meta or hosting connector. No authenticated deployment settings were inspected.
- Actual host, topology, operator/recovery owner, credential mechanism and retained-cache facility remain **unknown**. The local absence of bindings does not imply there is no deployed site.

## Approved user policies
| Policy | Approved meaning |
|---|---|
| 90 days per selected query | Non-functional workload bound, not retention/deletion or a limit on how old selectable dates may be |
| Equal previous comparison | At most another 90 days; maximum 180 reporting days across both periods |
| 15-minute refresh eligibility | Dashboard refresh policy, not a guarantee that provider processing finishes in 15 minutes |
| 30-day verification reminder | Mark configuration/manual evidence as needing recheck; never expire accounts, delete data, stop tracking or disable reports |

Resource/configuration changes invalidate evidence applicability immediately, independently of age. Report retrieval does not renew discovery or manual-verification timestamps. Authentication remains deferred by user instruction.

## Council execution defaults awaiting actual-host validation
| Bound | Planned value | Verification state |
|---|---|---|
| Total upstream calls per logical operation | 12, including comparisons/pagination | Not exercised on actual host |
| Pages per collection | 3 | Not exercised |
| Total accumulated rows | 5,000 | Not exercised |
| Concurrent calls | 2 | Not exercised |
| Individual deadline | 5 seconds | Host compatibility unknown |
| Aggregate elapsed deadline | 20 seconds | Host compatibility unknown |
| Automatic retries | 0 | Not implemented in dashboard yet |
| Cooldown scope | Full report identity plus shared provider/resource gate across query identities | Shared facility not selected |
| Provider Retry-After | Honor longer interval | Not exercised |
| Cache | Only actual supported facility; immutable complete identity; loss means unavailable retained result | Facility/topology unknown |

Discovery and report refresh are separate explicit operations. Exhausted budgets return partial/deferred coverage, not complete success. No paid service or durable database is assumed.

## Decisions required to close T1.4
- Name actual host and operational owner, document instance/concurrency topology and execution limits.
- Choose a supported server-only credential mechanism; keep tokens/private material outside these records and the browser.
- Demonstrate shared enforcement across actual instances or verify a genuine single-instance operating constraint. A process-local limiter on an unknown fleet is insufficient.
- Identify available cache semantics and recovery behavior; no promise of cross-restart retained data until demonstrated.
- Record any measured policy changes explicitly. Account data access and authentication design are distinct; this task does not add auth requirements.

Trace: FR8, FR18; TR2, TR5, TR7, TR9. AC12 remains unverified for the actual host.

## User implementation direction
The user subsequently stated: “for now just assume access, we have setup keys on the .env”. Proceed with implementation assuming the required access will be supplied through environment configuration. The local key/file-presence findings above apply only to this inspected checkout/process; they do not deny configuration in another environment. Do not expose values or mark live resource/read/host evidence verified until actually demonstrated.
