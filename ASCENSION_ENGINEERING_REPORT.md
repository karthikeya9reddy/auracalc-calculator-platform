# AuraCalc Project Ascension Ω

## Product audit and design direction

This pass builds on Aegis checkpoint `43d7b67`. The design observations are a heuristic review of the existing interface and source. They are not findings from a user study.

| Journey | Friction identified | Response |
| --- | --- | --- |
| New visitor or student | The fullscreen introduction and marquee delayed access to the main search. | Bring the search and direct links to common tasks into a compact hero. |
| Engineering or finance visitor | Plain-language queries could fall behind titles that happened to contain the same words. | Rank selected intents against existing tools with documented scope. |
| Converter visitor | A category heading only appeared after its pairs reached the current page of the list. | Make the quantities selectable independently of list pagination. |
| Keyboard or screen-reader user | Calculator validation announced a message without a direct way to reach the problem input. Several catalog regions could announce at once. | Add a linked error summary and field-level text. Use the search result count as the primary announcement. |

The visual direction uses AuraCalc’s lime accent, the existing dark surfaces, and the orbit on larger screens. The main action is the search form, followed by task links and the calculator catalog. Linear provides a reference for visible product controls, Omni for topic grouping, and GOV.UK for linking errors to the fields users can correct. The interface and styling here are implemented in AuraCalc’s own components. [Linear](https://linear.app/) · [Omni Calculator physics directory](https://www.omnicalculator.com/physics) · [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)

## Information architecture and design system

- **Home and discovery.** The search still reads formula definitions, converter definitions, mapped fields, and specialized destinations. Curated search intents link to real method IDs for room area, monthly loan payments, hydrostatic pressure and electricity cost. Field browsing stays in the directory. The categorized converter view uses the existing physical quantity labels, with currency in its own category.
- **Controls.** Shared CSS variables cover control size, radius, surface, border, muted text, error color and motion duration. The new search and quick links use a 44 px minimum control height. Result digits use tabular numerals. The form has a visible keyboard focus ring.
- **Motion.** The homepage orbit is static and removed on compact layouts. Quick-link color transitions last 150 ms and stop under reduced motion. Existing calculator diagrams and result animations remain available. The homepage search uses a 110 ms input debounce and explicit Enter submission, which moves focus to the results heading.
- **Error recovery.** The engine retains its original calculation error codes and annotates parse failures with a field ID. When there is a matching input, the calculator marks it invalid and associates its error text via `aria-describedby`. The summary link focuses the input. Whole-form errors still appear in the summary.

## Delivery and remaining verification

The full regression suite passed all 160 tests. A local Node comparison against Aegis used 30 timed iterations of five converter queries over an already built index. The median was 101.02 ms before and 103.90 ms after. This run showed no improvement in search compute time. The debounce still reduces the number of searches issued while typing.

Implementation lives in `web/index.html`, `web/home-app.mjs`, `web/aura-theme.css`, `web/converters/index.html`, `web/app.mjs`, `web/unified-search.mjs`, and `src/calculation-core/engine.mjs`. The existing formula definitions, accepted units, storage keys, production origin and public route scheme continue to apply. Search remains local to the browser. No provider, user telemetry or external script was added.

The local server started, but the browser webview did not attach after two attempts. Automated results do not establish the rendered layout, assistive technology behavior, or browser performance. The release still needs phone and desktop review of search, keyboard focus, result validation, quantity filtering, history and Calculation Flow. Repeat the comparable Lighthouse and accessibility audits noted in Aegis. Scenario comparison remains available in Studio. General solver expansion, a user research pass, and reviewed hosted feedback delivery are follow-up work.

To continue, use `aura-v1.1`, run `npm.cmd run dev`, and review the home page, a calculator and `/converters/`. Run `npm.cmd test`, set `AURACALC_PUBLIC_URL`, run `npm.cmd run build`, then run `node scripts/check-static-build.mjs`. Generated source files left by the Aegis baseline remain separate from this checkpoint. Obtain the owner’s approval before any merge into `main`.
