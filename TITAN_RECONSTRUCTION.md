# AuraCalc reconstruction — 11 November 2026

## Baseline and system map

Node >=20, native browser modules and static HTML; Lenis is the only package dependency. No React, database, or production AI backend is present.

| Boundary | Source of truth | Consumers |
|---|---|---|
| Formulas | catalog/public and calculation-core/definition | registry, execution, generated pages |
| Units and dimensions | src/calculation-core/units and dimensions | input validation, converters, transfers |
| Discovery | field-directory, field-tool-index, unified-search | home, fields, converter directory, input help |
| Rendering | generate-pages-lib, app, home-app | individual routes, forms, results |
| Connected calculations | core/workflow, next-step-engine, input-assistant | user-confirmed carry and recursive input help |
| Persistence | storage; existing nexora/auracalc browser keys | history, saved tools, restore |
| Reports | result-report | export actions |
| Measurement | measure modules and vision-service | calibrated photo, experimental WebXR, device GPS |
| External rates | currency-core | Frankfurter dated reference quotes |
| Release | build-static, dev-server, node:test | static dist and local API proxy |

Baseline: 299 formula definitions, 3,038 converter definitions, 48 field routes. `npm.cmd test`: 138 tests, 137 passed, 1 loopback test skipped, 44.08 s on this machine. Finite-result catalog checks are smoke checks, not independent verification of every formula. The 100 Titan additions have separate known-answer fixtures. Real device and provider tests remain outstanding.

Existing uncommitted application work was scanned for common secret patterns and preserved in a local Git checkpoint before changes. Synced sources and project metadata are excluded from submission.

## Defect register and design critique

1. Search requires every word to match literally; numeric conversion requests, common typos and natural phrases fail. Keep exact unit tokens strict and add bounded typo matching for longer words.
2. Exports are text-only. Add a separate readable report view with browser print / Save as PDF, actual recorded steps, precision and source records; retain text export.
3. Result actions are below lengthy visuals and recommendations. Promote useful actions above optional explanations; group continuation options without adding dialogs for every action.
4. History accepts malformed entries with an ID but unusable bodies. Preserve stored bytes, validate rendering/restore boundaries, and show unavailable entries without crashing the list.
5. The progress record incorrectly says no exchange-rate integration exists. Update readiness claims and distinguish configured code from verified service operation.
6. 299 entries are not 299 independently reviewed engineering products. Existing equivalent formulas and generic visual fallbacks need further editorial review; no inflated count target.

## Implementation order and gates

Preserve baseline → shared search and exact conversion intent → report workspace and results organization → boundary tests and small sourced formula pilot → full tests/build → representative visual inspection → secret scan and GitHub push. No production deployment or new paid services.

Retain established routes, history keys and full-precision handoffs. Use existing declarative definitions. Do not replace the shared engine or introduce a frontend framework: these do not address the observed defects.

## Remaining release risks

No measured Core Web Vitals, real-user load test, independent professional formula certification, production AI service, automatic calibrated object recognition, or real-device AR accuracy certification. Browser print PDF depends on the user's browser print dialog. Search metadata is heuristic, never authority to execute calculations. Public hosting requires its own server-side AI design and controls.

## Completed implementation batch

- Shared discovery now tolerates bounded spelling errors and recognizes selected natural phrases. Exact short unit symbols remain strict. A numeric directed conversion search can carry its quantity into the matching converter without guessing units or automatically executing it.
- Result actions appear immediately after answers. Added an escaped print report with browser Print / Save as PDF, Copy answer, and retained text download. Reports include actual stored steps, sources, assumptions and numerical precision.
- Nonzero magnitudes below 0.000001 no longer round to a displayed zero; scientific notation is used instead. Localized numeric restoration preserves decimal meaning.
- Malformed history entries cannot crash the list or redirect users to stored external URLs. They remain deletable; stored history data is not migrated or erased.
- Connected calculations check target bounds, integer requirements and declared semantic types in addition to unit compatibility. Semantic annotations are not yet comprehensive across older definitions.
- Two formula calculators added: net radiative heat transfer and sound intensity level. Both have explicit assumptions, OpenStax sources, independent numeric fixtures, boundary and scaling/sign checks. The logarithmic dB output cannot be handed to an ordinary scalar input.
- Currency requests share a bounded cache with request coalescing, explicit refresh and a labelled fallback limited to 24 hours. A successful refresh updates the displayed check time and reference-rate date.
- Shared calculator typography, form controls, action groups, surfaces and narrow-screen layout rules updated. Existing reduced-motion behavior retained. These changes have not passed rendered visual QA.
- Added GitHub Actions verification for tests and static build. It does not deploy the site or contact a paid AI provider.

## Evidence and readiness scorecard

| Area | Evidence | Limit |
|---|---|---|
| Inventory | Build generated 301 formula pages, 3,038 directed converter pages, 48 field pages | Counts describe definitions, not independent expert review |
| Final regression | npm.cmd test: 147 tests; 146 pass, 0 fail, 1 skip; 63.49 seconds | Loopback server test skipped because connections were unavailable |
| Formula assurance | Representative execution across the public catalog; 100 Titan known-answer cases; 2 new pilots with independent fixtures and boundaries | Not an exhaustive mathematical proof or professional certification |
| Converter assurance | Every directed definition executes and round-trips; separate known conversion and temperature-role checks | Not every conversion factor has an independent external fixture |
| Build | npm.cmd run build passed after all implementation changes | No public hosting or production AI backend configured |
| Dependency advisories | npm.cmd audit --omit=dev: 0 reported vulnerabilities, one runtime dependency | An advisory scan is not a complete security audit |
| Search timing | Same 3,339-definition registry and 8-query corpus: baseline median 1.92 ms / p95 2.66 ms; updated median 5.41 ms / p95 8.21 ms | Warm Node search calls only; additional intent handling costs time; no browser INP claim |
| Visual/device QA | Attempted Windows Chrome inspection stopped when tool could not reliably determine browser URL | No completed desktop/mobile screenshots, screen-reader audit, camera/AR device verification or CWV measurements |
| External integrations | Currency, AI configuration and request boundaries tested using controlled responses | No paid AI call, real-camera calibration or live-rate reliability measurement in this batch |

The first full regression run found two field listings stale after the new calculator additions. Regenerating the pages resolved that failure; the final suite above passes. Boundary tests also caught reverse-direction conversion ranking and a synchronous quote-fetch retry issue, both corrected before the final run.

Reproduce search timings with `node scripts/benchmark-search.mjs`. The comparator loads the preserved baseline from commit `1192b2c`; results vary by machine and do not measure page loading or rendering.

## Git and remaining work

Recoverable baseline: `1192b2c` (preserved existing application changes). The checkout's former AuraCalc remote no longer exists; the surviving user-owned repository is `karthikeya9reddy/auracalc-calculator-platform`. Submission targets that repository, without creating another repository or deploying the site. Synced sources, machine metadata, environment secrets, installed packages and generated dist are excluded.

This is a bounded reconstruction batch, not completion of every aspirational feature in the directive. Next priorities are a rendered desktop/mobile and keyboard audit, broader semantic metadata for input assistance and transfers, consolidation of the complete domain/subdiscipline taxonomy, and independent review of consequential formula families. Thousands of additional formulas, arbitrary photo measurement, guaranteed AR accuracy, and million-user capacity are not claimed.
