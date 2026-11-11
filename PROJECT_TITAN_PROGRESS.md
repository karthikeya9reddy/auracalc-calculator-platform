# AuraCalc Project Titan — implementation record

This file records only work present in the local source tree. It is not a deployment or independent engineering certification.

## Baseline checked

- 198 published formula-based calculators, counted from the calculator registry.
- 3,038 unit converters, counted separately and excluded from the calculator total.
- 48 mapped research fields.
- Static Node.js site with per-tool pages, unit-aware calculation core, formula/source metadata, search, field landing pages, calculator history, recursive input guidance, editable calculator-to-calculator handoffs, responsive visuals, and an offline service worker.
- Existing verification: `npm.cmd test` passed 106 tests; `npm.cmd run build` generated all 198 calculator pages, 3,038 converter pages, and 48 field pages.
- New photo measurement workspace: `/measure/`; local-only image handling; user-marked scale and geometry; explicit 2D/perspective limitations; transfers measurements to dimension-compatible calculators. It is not object-recognition AI, depth reconstruction, or a calibrated instrument.

## Build target

The attached Project Titan directive requests 100 additional formula-based calculators beyond the baseline above. Converters do not count. The target is 298 formula calculators, subject to formula traceability, field tagging, boundary behavior, representative known-answer checks, and a buildable page per published tool. A count is not evidence of quality; a tool should remain unpublished or be removed from the total if it cannot meet those checks.

## Status

- [x] Inspect current architecture and preserve existing user work.
- [x] Add and verify the first local photo-measurement workspace.
- [x] Run the existing automated suite and static production build.
- [x] Add 100 additional traceable formula calculators in reviewable batches.
- [x] Keep unit converters in a separate catalog and exclude them from calculator counts.
- [x] Run the complete regression suite: `npm.cmd test` passed all 112 tests.
- [x] Generate the static production site: `npm.cmd run build` created pages for 298 formula calculators, 3,038 converters, and 48 field pages.
- [ ] Audit contrast, control sizes, responsive layouts, and guided handoffs across calculator, converter, and field pages.
- [ ] Close and document the remaining release gaps below.

## Current implementation

- The Titan milestone reached 298 formula-based calculators: the original 198 plus 100 new definitions. The subsequent food-label energy tool and two sourced physics pilot methods bring the current registry to 301. See TITAN_RECONSTRUCTION.md for the latest verification record.
- Each of the 100 added calculators has an independently maintained known-answer regression case, input boundaries, traceable method metadata, and field tags; catalog tests also verify result traces and next-step handoffs.
- The new unit definitions are dimension-checked and versioned in the shared SI unit registry.
- The build creates individual calculator and converter routes and updates field landing pages from the registry.
- Verification is automated and local. It is not independent professional review, certification, live-provider validation, or a production deployment.

## Known release gaps

- No production deployment was performed.
- A Frankfurter reference-rate integration is implemented with dated quotes, refresh, caching and explicit stale fallback. Automated tests use controlled provider responses; live provider operation was not verified in this batch. Quotes are not bank transaction prices.
- No hosted generative-AI service is configured. Input help and next-step suggestions are deterministic, local, and source-scoped.
- No production-grade AR/WebXR measurement, automatic image recognition, or depth sensing is claimed.
- Static hosting has not been load-tested for millions of simultaneous users; that requires a measured hosting/CDN architecture and traffic tests.
- Financial, medical, safety-critical, and professional design tools require jurisdiction-appropriate data, review, and release controls before use in consequential decisions.

