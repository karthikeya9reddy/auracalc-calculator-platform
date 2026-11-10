# AuraCalc Calculator Platform

AuraCalc is a responsive, statically deployable calculator website backed by a shared, dependency-free calculation engine. The Emergent-inspired homepage now uses the provided visual direction; the current live catalog is a small, source-backed set. Its 48-field directory is a research map, not a claim that every field has a finished calculator.

## Run the website locally

Install Node.js 20 or newer, open a terminal in this folder, and run:

```text
npm run dev
```

Open `http://127.0.0.1:4173`. Press `Ctrl+C` in the terminal to stop the local server.

The local server only serves this project’s website, catalog, calculation core, and existing prototype. It does not provide an API or transmit calculation inputs.

## Build a static deployment bundle

```text
npm run build
npm run preview
```

The build creates `dist/`. The build script replaces that folder only when it recognizes an AuraCalc-generated marker (or the previous Nexora marker). You can deploy the contents of `dist/` to a static host that serves clean URLs and static ES modules. If a public HTTPS domain is configured, set `AURACALC_PUBLIC_URL` before building to generate a sitemap. No provider account, paid service, or public deployment is configured in this workspace.

## Run checks

```text
npm test
```

The checks use Node’s built-in test runner. Lenis is bundled locally for smooth wheel scrolling; the deployed site does not fetch it from a third-party CDN.

## What works in this stage

- AuraCalc's Emergent-inspired dark visual system with eased Lenis wheel scrolling, reduced-motion-aware reveals, pointer-responsive card tilt, animated hero, search-first catalog, favorites, and responsive navigation
- Four published R0 starter definitions: percentage change, rectangle area/perimeter, rectangular-prism volume, and average speed
- Unit conversion across the current curated physical-unit registry, with dimensional and temperature-role checks
- Typed, dimension-checked area-to-volume handoff with formula-version provenance
- Localized numeric input/display options, responsive layout, dark theme, keyboard search shortcut, and reduced-motion styling
- Device-local result history with view, restore, delete, pause, and clear controls
- JSON result export, local feedback capture/export, generated calculator information pages, and a static build
- A consent-gated advertising adapter interface; no ad provider is connected

## Boundaries

- The four catalog methods are limited to general, low-risk educational or household use. They do not approve structural, vehicle-safety, medical, tax, or other consequential decisions.
- Medical, finance, mining safety, code-based engineering, and similar high-consequence calculators require their own source, jurisdiction, qualified review, and release evidence before publication.
- Starter release records show developer self-review and executable reference cases; no independent domain review is recorded. “Published” here means included in this local product catalog, not deployed publicly.
- The unit registry and locale support are curated subsets, not exhaustive global coverage. Precision and rounding metadata do not yet select decimal or arbitrary-precision backends.
- AI is not connected. Search uses local metadata and synonyms. The camera, AR, and visual interaction remain in `prototype/` and are not production measurement tools.
- History and feedback are stored in the current browser profile. Feedback is not transmitted to the project owner. Sensitive values should not be stored on a shared device.
- The service worker caches the app shell and previously requested same-origin resources. Offline behavior was not verified in a browser.
- No browser-based visual/device audit, deployment, load test, or scale benchmark has completed. Do not claim production operation or million-user capacity.

## Project map

- `web/` — AuraCalc website, responsive theme, catalog search, calculator modal, history, converter, service worker, and consent-gated ad adapter
- `catalog/public/` — published starter definitions and registry
- `catalog/field-directory.mjs` — the 48-group research map
- `src/calculation-core/` — shared units, dimensions, parsing, arithmetic, release gates, execution, and workflow handoff
- `test/` — core and calculator reference tests
- `prototype/` — earlier product interaction demo, kept separate from the calculator website
- `calculation-assurance-policy.md` — source, verification, risk, and release requirements
- `baseline-engineering-report.md` — original workspace audit and implementation-stage records
- `deployment-and-maintenance.md` — provider-neutral static deployment and monthly maintenance guide

Keep `sources/` read-only. Read the assurance policy before adding a calculator.
