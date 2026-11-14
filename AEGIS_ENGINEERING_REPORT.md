# AuraCalc Project Aegis Ω

## Baseline

The clean starting revision was `5c1be5a` on `aura-v1.1`. The public build has 303 formula calculators, 3,038 directed unit converter pages, a separate currency converter and 48 field pages. The earlier Lighthouse, WebPageTest and WAVE readings came from different environments. They remain historical observations.

The code path runs from the homepage, individual static tool routes and specialized entry modules through the catalog registries and shared calculation core. Units, input parsing, result provenance and transfers live in the core. Browser storage holds preferences, saved results and feedback. Currency quotes use Frankfurter. Studio evaluates its own restricted expression language. Measure uses calibrated photo geometry, WebXR and device speed, with an optional local vision endpoint. The generators supply page metadata, the sitemap and robots rules. Cloudflare Pages serves `dist` and the project's verification files.

The baseline install initially failed with sandbox DNS restrictions. An authorized retry completed with one dependency installed and zero npm advisories reported. The baseline test suite recorded 157 passes and one skipped loopback check. The build with the public origin set completed. Read-only production requests returned 200 for the homepage, percentage change, Ohm’s law, converter index and a directed converter, Studio, Currency, Fields, Measure, sitemap and robots. The sitemap was served as XML. An unknown path returned 200 with the homepage. Google’s verification file request redirected with 308. The sampled homepage HTML did not expose an analytics script, so production analytics collection remains unconfirmed.

## Findings and repairs

| Priority | Finding | Change |
| --- | --- | --- |
| High | Both homepage modules imported the combined catalog. Converter generation, validation and search indexing ran before users searched. | Split formula and converter entry points while preserving the combined export. Defer the converter registry and search indexes on the homepage. Reuse the directory’s initial sorting and keep topic controls mounted during same-category updates. |
| High | Phone-width converter navigation forced horizontal scroll. At 360 CSS pixels, the converter index exceeded the viewport by 199 pixels and the percentage change page by 5. | Reuse the mobile menu on both converter entry routes and compact the shared generated-page header. Both measured zero overflow after the fixes. |
| High | Early RC charging voltages could round down to zero due to subtraction of nearly equal numbers. | Use the equivalent `expm1` form and bump the method to 1.0.1. The new reference case checks a 10⁻¹⁷ V result and the exact zero-time boundary. |
| Medium | Generic containers used named ARIA without a suitable role. A required select lacked a placeholder. Two scripts could create dialogs sharing one accessible-name ID. | Give the named groups a group role, add a select placeholder while retaining its default, remove unreachable homepage modal code, and create the input guide on first use. Use pressed states for the guide buttons and make search focus and catalog metadata more visible. |
| Medium | Production served the homepage for missing URLs. | Add Cloudflare Pages’ top-level `404.html` with working catalog links. Confirm the HTTP status on a Pages preview. |
| Medium | The worker embedded an unused list of every catalog route. Production builds also rewrote source pages. | Remove the route list, bump cache versions, keep bounded runtime caching and generate production routes in `dist`. Fix Studio generation so its replacement does not accumulate whitespace. |
| Medium | The live homepage headers lacked CSP. The print report used inline CSS. | Add a candidate policy in report-only mode and move report styling into a local stylesheet. Allow the documented analytics script and reporting hosts, Frankfurter, same-origin workers, and local image and media sources. |

## Performance and user journeys

An alternating Node 24 benchmark ran five fresh processes per variant. Each measured the public catalog import and list calls. The combined entry point took 4,921, 4,138, 4,661, 4,124 and 3,535 ms, with a 4,138 ms median. The formula entry point took 1,297, 1,126, 1,150, 1,170 and 1,005 ms, with a 1,150 ms median. The worker source fell from 191,441 bytes to 3,604 bytes before compression. These tests do not measure browser TBT or LCP. A common Lighthouse profile with repeated cold and warm runs is needed to compare the historical browser readings.

Browser testing exercised homepage search for `500 N to lbf`, transfer of `500` into the correct directed converter, keyboard submission yielding `112.404472 lbf`, and saving that result to history. Ohm’s law yielded `6 Ω` for `12 V` and `2 A`. The input guide loaded compatible resistance converters, and Calculation Flow filled the next tool’s first resistor with `6 Ω`. Phone-width rendering was sampled across Home, Percentage Change, Converters, Studio, Currency, Fields and Measure. The converter menu opened with Enter.

## Assurance and release

The final full suite with loopback access passed all 159 tests. The production-format build passed. Its audit checked 3,393 unique canonical pages and 375 distinct linked local paths.

Existing tests cover representative execution and units across the formula catalog, independently maintained reference cases for selected tools, all directed converter executions and reversals, input boundaries, history and transfer compatibility, simulated offline behavior, rate failure, and simulated measurement states. This does not amount to a new independent scientific review of all 303 methods. The build audit checks unique canonical routes, the availability of linked local paths, structured data syntax, crawler metadata, preservation of verification files, and the presence of the 404 page and security header.

CSP remains report-only pending verification of the hosted analytics beacon, currency requests, print reports, photo objects and WebXR on a Pages preview. The project loads its vendored Lenis from the same origin. For automatically injected analytics, Cloudflare manages script integrity. No integrity hash was guessed for a provider-managed script. See [Cloudflare’s analytics/CSP guidance](https://developers.cloudflare.com/web-analytics/faq/) and [Pages routing behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/).

Feedback stays local. To deliver it, the owner needs to supply a destination such as a managed form endpoint or a public support address. Add a separate, explicit send action with a clear payload and retention terms. Existing local messages should remain on the device unless a visitor chooses to send them.

## Next verification

1. Use a Pages branch preview to check the real 404 status, headers, verification URLs, analytics collection and absence of unexpected CSP violations. Keep report-only until hosted workflows pass.
2. Run comparable desktop and mobile Lighthouse samples, an HTML validator, WAVE or axe, and a manual screen-reader pass. Recheck zoom, browser caching and partial offline failures on real devices.
3. Check remaining external source links, complete the interactive matrix for Studio, Currency and Measure, and validate camera, location and AR permissions on compatible hardware. Review other numerical edge cases and source applicability by calculator family.
4. Review the candidate on `aura-v1.1` before release. Production continues to use Cloudflare Pages with `npm ci && npm run build`, publishing `dist`. The owner must approve the merge into `main`. If production needs rollback after that release, use the last known good Pages deployment and reconcile the source with a revert commit.
