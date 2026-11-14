# Reforge engineering record — work in progress

Branch: `aura-v1.1`. Starting commit: `6b6726c`. Production deployment and merge are not authorized by this work.

## Baseline

The initial tree contained changes in `web/builder/index.html` and `web/calculators/rc-capacitor-charging-voltage/index.html`. These are preserved and excluded from this checkpoint. Test/page generation can also update generated pages; those are excluded from this checkpoint.

Baseline: 160 tests, 159 passed, one skipped (loopback unavailable), no failures. The source catalog has 303 formula calculators and 3,038 generated unit-conversion routes; converter route count does not represent independent formulas.

## Implemented first increment

* Feedback: browser form now sends to `/api/feedback`. Acceptance follows storage, never local browser persistence. Failure keeps the message. Timeout retries use an identical ID. Optional email and affected page are included. Categories cover bugs, accuracy, conversion, accessibility, performance, ideas and general reviews.
* Shared server contract: same-origin JSON, streamed 8 KiB body limit, field validation, five submissions per hour per client, no-cache responses, duplicate ID handling, and failure without false acceptance. Cloudflare adapter uses prepared D1 statements; raw IPs are not stored, and keyed quota identifiers rotate hourly.
* Local development: durable files outside the web root; owner can retrieve them with `node scripts/read-feedback.mjs`. Integration tests submit through the shared HTTP Request handler, save to a temporary disk store, retry, and retrieve exactly one submission. This is local automated evidence, not a public deployment or browser test.
* Result discoverability: explicit successful submission focuses the result, scrolling only when its beginning is outside the useful viewport. Reduced motion is respected. Unit changes do not force scrolling.
* Reading: scoped method/result text sizes, comfortable line spacing, wrapping and stronger headings. Physical screen and 200% zoom inspection remains pending.
* Topic discovery: specialist category is preserved while broad Percentages, Geometry, Motion and Energy topics gain related tools. A whole-catalog check ensures counts and filtering agree and every calculator retains its primary category. This is an initial cross-topic layer, not a completed expert taxonomy review.
* Search: salary increases, tile requirements and everyday motion questions now return the intended existing calculator first. Distance/time maps to speed; displacement/time is deliberately not treated as speed.
* Scientific workspace: `/scientific/` adds a safe parsed expression interface with arithmetic, parentheses, powers, roots, trigonometry and inverse functions, degree/radian selection, logs, factorial, combinations, permutations, signed remainder, constants, memory, copy and 30-entry session history. Domain errors and non-finite results fail explicitly. It uses floating point, not arbitrary precision or complex arithmetic. The standalone route is included in build-generated sitemap entries and linked from the homepage/search. Rendering and keyboard interaction still need browser validation.

## Verification for this checkpoint

The regression run after these changes completed 166 tests: 165 passed, zero failed, one local-loopback test skipped. The new scientific tests cover precedence, unary signs, explicit percentage semantics, degree/radian trigonometry, inverse trig, combinatorics, invalid domains, zero denominators, overflow and unsupported identifiers. Feedback tests cover disk persistence/retrieval, duplicate retries, cross-origin rejection, malformed fields, size limits, throttling and failed storage.

An initial run found a service-worker test coupled to cache version v8. It now discovers the active runtime cache and still verifies its 180-resource bound. The new shell version includes the feedback client.

Search comparison against commit `6b6726c`: all three requested sentence examples previously returned no results. They now rank percentage-change, tile-quantity-estimate and average-speed first respectively. This is a small explicit benchmark, not evidence of general semantic understanding or improved latency.

## Feedback operation and outstanding provisioning

Cloudflare Pages supports D1 bindings: https://developers.cloudflare.com/pages/functions/bindings/ . The selected implementation uses Pages Functions and D1, without introducing a paid third-party provider or an extra public admin login. No Cloudflare resources or settings have been changed.

Before a preview can deliver feedback:

1. Create a D1 database and apply `migrations/0001_feedback.sql`.
2. Bind that database to the **preview** environment as `FEEDBACK_DB` and set a random server secret `FEEDBACK_RATE_SECRET`.
3. Deploy the development branch to a preview with Pages Functions enabled.
4. Submit a real test message from that preview, then retrieve its ID/message through the authenticated Cloudflare D1 console. Record that evidence before claiming owner delivery works publicly.

Owner access uses the existing Cloudflare account and D1 console, not a public endpoint. For review, run `SELECT id, category, message, contact, page, created_at, status, notes FROM feedback ORDER BY created_at DESC LIMIT 100;`. Categories and status can be filtered in SQL; update status/notes there and export through approved database tooling. Escape spreadsheet formula characters if later exporting user text to CSV.

Operational proposal: remove resolved feedback and contact details after 90 days. This retention job is **not configured**. Per-client rate limiting is basic abuse resistance, not comprehensive bot defense; evaluate Turnstile before wider release. If implemented, server validation is mandatory: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ . No external challenge is currently loaded.

## Remaining Reforge work

| Workstream | Status |
| --- | --- |
| Real feedback | Local storage/retrieval tested; Cloudflare provisioning, public receipt verification, operational retention pending |
| Measurement architecture and practical tools | Investigation/implementation pending |
| Photo reconstruction and vision model evaluation | Pending; no automatic physical-size claims |
| AR stability and world tracking | Pending real-device investigation |
| Object speed tracking | Pending; unsupported world-space tracking must not be advertised |
| Measurement-to-calculation suggestions | Pending |
| Search | Initial intent improvements tested; larger before/after relevance benchmark pending |
| Taxonomy | Cross-topic discovery/count invariants implemented; full semantic review pending |
| Method typography | Implemented; visual and zoom validation pending |
| Result reveal | Implemented; browser keyboard/mobile verification pending |
| Converter expansion | Pending needs/units audit |
| Universal scientific calculator | Initial implementation and expression tests complete; browser validation and additional polish pending |
| 15–30 useful formula additions | Pending source research and validation |
| Sitemaps | Existing generated routes retained; new feature routes not yet created |
| README | Operational increment recorded; complete rewrite follows implemented capability audit |
| System-wide suggestions | Pending deeper relevance review |

No measured physical accuracy, real-device AR test, public feedback delivery, production readiness or full Reforge completion is claimed. The owner must approve any merge into `main`.
