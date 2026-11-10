# Baseline Engineering Report

**Audit date:** 10 November 2026  
**Scope:** Workspace files outside `sources/`. The synced `sources/` directory was not edited.  
**Purpose:** Record the actual starting condition before implementing the universal calculation foundation.

## 1. Current project condition

The workspace is a research and product-planning project with a standalone browser prototype. It is not yet a production web application. The project has no package manifest, build pipeline, test suite, deployment configuration, or Git metadata in this workspace.

The project already has substantial architecture, risk, demand, field, physics, camera, and calculator-inventory research. The rough eventual estimate of about 2,000 calculation definitions is marked as an estimate rather than an audited count.

## 2. Existing architecture

The runnable experience is `prototype/index.html`, `prototype/app.css`, and `prototype/app.js`, with `prototype/history-store.js` and `prototype/history.css` for local demo history. It is a single-page, dependency-free browser experience. Navigation uses in-page anchors; there is no routing system or server API.

The prototype includes task suggestions made by local keyword rules, a generic three-step workflow, an illustrative scenario slider, a planar camera-measurement demonstration, a traceability placeholder, guided explanations, a walkthrough, export, and local history for demonstration entries. The assistant is not connected to an AI model. The camera function requires a known reference and assumes a shared flat plane; it does not provide AR depth, perspective correction, or production measurement accuracy.

Architecture and governance material includes:

- `calculator-platform-foundation.md`
- `technical-implementation-blueprint.md`
- `calculation-assurance-policy.md`
- field, physics, everyday-use, camera, photo-measurement, and VFX/CGI research documents

The research and planning documents are not connected to executable calculator definitions.

## 3. Architectural weaknesses and gaps

| Area | Observed condition | Consequence |
|---|---|---|
| Calculator catalog | No machine-readable registry or calculator definitions | No governed way to add, version, review, or publish methods |
| Calculation engine | No shared parser, unit system, dimensional checks, validation pipeline, precision policy, uncertainty model, or structured result | Prototype calculations cannot be treated as verified product calculations |
| UI/application | Single page and one large browser script; no page/router/component architecture | Difficult to grow into a large site without separation work |
| Search/navigation | Local keyword demo and anchor navigation only | No real catalog discovery, ranking, field routes, or query recovery |
| Services/data | No backend, external-data adapters, database, user accounts, or AI service | No protected service capability or cross-device state |
| History | Local browser storage for demo snapshots only | Not integrated with verified calculation results or formula-version replay |
| Accessibility | Some labels, status announcements, and text descriptions exist; no documented screen-reader or keyboard audit | Conformance and real-device usability are unknown |
| Responsive design | CSS includes 900px and 600px breakpoints | Responsiveness exists in code but has not been audited across devices, browsers, or input modes |
| Performance | No bundle, rendering, network, memory, camera, or load benchmarks | No evidence for speed or concurrency claims |
| SEO | Page title and basic viewport metadata exist; no site routes, canonical strategy, sitemap, or per-calculator content | Search discoverability is only a prototype-level shell |
| Security/privacy | Camera is local in the prototype; history is local. No service/API boundary exists. External Google Fonts are imported by CSS. | Production threat model, service controls, privacy disclosure, and external asset review remain outstanding |
| Operations | No hosting, CI, backups, monitoring, alerts, or recovery instructions | No production readiness or maintenance path yet |
| Version control | No `.git` metadata is present in this workspace | Changes cannot be reviewed or reverted through Git here |

The stylesheet contains a remote Google Fonts import. Performance, privacy, and availability implications have not been measured. The existing JavaScript is about 29 KB before compression; no browser performance measurements have been made.

## 4. Baseline checks run

- `node --check prototype/app.js` — passed.
- `node --check prototype/history-store.js` — passed.
- Runtime available in the workspace: Node.js `v24.19.0`, npm `11.17.0`.
- No `package.json`, Git metadata, or common deployment configuration was found at the workspace root.
- No browser, accessibility, integration, formula, load, security, or cross-device audit has been run. There are no actual verified calculator definitions to independently validate.

These checks establish syntax only. They do not verify UI behavior or calculation correctness.

## 5. Recommended universal framework

Keep the prototype as a separate design demonstration. Add a dependency-free JavaScript ES-module calculation core under `src/calculation-core/` with a small runtime contract, a versioned SI-based unit registry, dimensional checks, strict localized numeric parsing, a verified-release gate, and structured result provenance. Use Node's built-in test runner initially; the installed runtime supports it, avoiding a new dependency before the architecture settles.

The runtime must fail closed: unknown calculator, missing input, malformed number, unsupported unit, dimension mismatch, non-finite output, invalid output unit, or unverified release returns a structured error and no normal-looking answer. The definition's calculation function remains isolated from UI, storage, network, and AI.

The initial unit set is deliberately a core subset, not a claim of global unit completeness. Currency conversions, logarithmic units, context-dependent standards, complex arithmetic, symbolic algebra, tensors, simulations, and domain-specific rules need their own scoped modules and review.

## 6. Proposed directory structure

```text
src/
  calculation-core/
    errors.mjs
    dimensions.mjs
    units.mjs
    number-input.mjs
    definition.mjs
    registry.mjs
    engine.mjs
    index.mjs
  catalog/
    README.md              # remains empty of publishable methods initially
test/
  calculation-core/
    dimensions.test.mjs
    units.test.mjs
    number-input.test.mjs
    engine.test.mjs
test-fixtures/
  rectangle-area.mjs     # test-only; never loaded as catalog content
```

The standalone prototype remains under `prototype/`. A later website framework can import the core through a stable package boundary rather than embedding calculation logic in page components.

## 7. Core interfaces and data contracts

Every production definition should carry:

- stable calculator ID and method version;
- field, category, purpose, audience, scope, and risk class;
- input/output identifiers, quantity dimensions, accepted units, and bounds;
- an isolated calculation function;
- references, assumptions, exclusions, warnings, and limitations;
- release status, reviewer/evidence records, and verification-case IDs.

The initial engine accepts explicit `{ value, unit }` quantities, parses localized text using a selected locale, validates units/dimensions, normalizes to each input's canonical unit, calls only a verified definition, checks the structured outputs, and returns entered and normalized inputs with formula version and provenance.

No actual field-specific calculator is included in this stage. Test fixtures are explicitly test-only and must not be registered in a public catalog.

## 8. Mathematical engine design

- Represent dimensions as immutable exponent vectors for SI base dimensions plus a separately typed plane-angle dimension.
- Represent units through explicit scale, offset, dimension, and semantic role. Temperature absolute values and temperature differences are distinct; converting between them implicitly is rejected.
- Use finite IEEE-754 numbers for the first generic engine contract, reject `NaN`/infinities and invalid domains, and keep numeric formatting outside the calculation method. This is not sufficient for every financial, exact, symbolic, or ill-conditioned computation.
- Provide extension boundaries for decimal/fixed-point and rational/integer arithmetic, complex values, matrices, symbolic methods, solvers, and simulations. Do not claim these advanced methods are implemented until their own algorithms and verification suites exist.
- Keep raw user entry, canonical quantity, computed output, displayed rounding, and uncertainty as separate data.
- Inject locale and clock context where needed; do not let method functions read global state or perform network requests.

## 9. Testing and verification strategy

The first core test suite should cover:

- dimension equality and algebra;
- conversions in both directions, including affine temperature and temperature-difference rejection;
- locale parsing for at least `en-US`, `de-DE`, and `hi-IN`, plus malformed grouping, ambiguous input, blank input, and non-finite values;
- missing/optional inputs, accepted-unit checks, dimension mismatch, canonical normalization, bounds, and error details;
- rejection of draft/unverified definitions;
- malformed/non-finite output, wrong output dimensions, and provenance/version retention;
- a test-only, independently calculated geometry fixture that is never published as a calculator.

Formula tests for real calculators require formula-specific authoritative sources and independent expected values. Platform contract tests do not substitute for domain review. Later audits should add accessibility, cross-device/browser, security, performance, and load suites when the corresponding application or service exists.

## 10. Implementation sequence, risks, and trade-offs

1. Add the baseline report and isolated core skeleton.
2. Implement dimension vectors, the reviewed unit subset, conversions, and temperature semantics.
3. Implement localized numeric parsing and definition validation.
4. Implement registry, verified-release gate, execution pipeline, and provenance-rich results.
5. Add unit and contract tests using test-only fixtures.
6. Connect the core to future app pages only after the contract is stable.
7. Expand numerical types, domain modules, workflows, AI, visualizations, and infrastructure in separately reviewed stages.

Main trade-offs and risks:

- A small unit set is safer and easier to verify than a broad, unreviewed registry, but cannot yet support every discipline.
- Plain JavaScript avoids dependency installation and runs in the available Node/browser environments, but TypeScript should be reconsidered when the production app is scaffolded.
- A shared engine standardizes execution but cannot determine whether an engineering/medical method is applicable; only per-definition source and domain review can do that.
- Local tests provide early evidence, not concurrency, browser, or production assurance.
- No hosting or scale claim is justified until a workload model and deployment are measured.

`sources/` remains read-only. No external services will be purchased and nothing will be deployed publicly as part of this baseline implementation.

## 11. First-stage implementation outcome

The initial calculation-core stage is now implemented under `src/calculation-core/`. It provides immutable dimension and unit definitions, SI-based quantity operations, locale-aware number parsing, definition validation, metadata snapshots, release gates, and a structured execution result containing entered values, normalized values, warnings, formula version, and provenance. The current unit registry is curated and versioned; it is not a complete global unit catalog.

There are still **zero publishable calculator definitions**. The rectangle-area example lives only in `test-fixtures/`, is marked test-only, and cannot be registered or executed in product mode. It exists to exercise the platform contract, not to claim formula approval. No individual engineering, medical, financial, or other field calculator was selected or implemented.

The first-stage checks completed:

- `npm test`: 28 tests passed, 0 failed. Coverage includes dimension algebra, unit and temperature conversion, locale parsing, quantity operations, registry and release gates, malformed outputs, unsupported field types, duplicate units, and absolute-zero input/output rejection.
- JavaScript syntax audit: 17 files checked successfully across the core, tests, test fixture, and existing prototype scripts.
- A browser visual/device review could not be completed: desktop browser access timed out before a page could be inspected. Responsive behavior, accessibility, cross-browser behavior, performance, and camera usability therefore remain unaudited.

This result is a calculation foundation, not a production site. IEEE-754 binary64 is the current numeric representation; precision and rounding are recorded as metadata but not implemented as selectable computational policies. Exact/decimal arithmetic, uncertainty propagation, extensive unit and locale coverage, calculator-specific source review, automated reference checks, website search, accounts, synchronized history, AI, camera/AR, deployment, monitoring, and load testing remain future stages. The workspace has no evidence for million-user capacity or production readiness.

The next stage should establish the actual website shell and connect it to this stable engine boundary. Before publishing any calculator, require a source-backed method definition, explicit assumptions and exclusions, independently derived verification cases, risk classification, qualified review appropriate to that risk, and a deliberate publication record. Continue to keep `sources/` read-only.

## 12. Website and starter-catalog implementation outcome

The next implementation stage is now present under `web/`, `catalog/public/`, and `scripts/`:

- Built a responsive Nexora website with searchable catalog cards, category filters, theme control, number-format selection, keyboard search, and a 48-group field research map.
- Added four source-backed, versioned R0 catalog methods: percentage change, rectangle area/perimeter, rectangular-prism volume, and average speed. The global unit converter uses the curated unit registry and links its conversion-factor reference. These are a deliberately narrow starter catalog, not broad professional engineering coverage.
- Added one configured area-to-volume workflow handoff. The core checks result version, publication status, dimensions, temperature role, and source allowlists. The carried input remains editable and its source is stored in workflow/history records.
- Added browser-local history with view, restore, delete, pause, and clear behavior; JSON result export; and local feedback storage/export. Feedback is not sent to the project owner because no backend endpoint is configured.
- Added generated calculator information pages, page metadata, a static build, local preview server, app manifest, and a service worker shell cache. A consent-gated ad-provider adapter exists, but no provider, consent manager, or ad network is connected.
- Added tests for catalog definitions, source/release metadata, numerical reference cases, edge cases, and workflow handoffs.

Latest completed checks:

- `npm test`: 39 passed, 0 failed.
- `npm run build`: completed and generated the static bundle with four calculator pages in `dist/`.
- JavaScript syntax audit: 58 files checked successfully across source, tests, catalog, website, scripts, prototype, and generated bundle.
- Static bundle audit: the four calculator pages, manifest, service worker, calculation core, and catalog modules were present.
- Browser verification did not complete. The development server started, but the shell’s loopback HTTP request was blocked by its socket permission boundary and the in-app browser timed out connecting to it. Therefore visual layout, route behavior in a real browser, accessibility behavior, history interactions, and device responsiveness are not claimed as verified.

The final audit pass corrected an inaccurate phrase in the starter release records: they now state developer self-review and executable reference cases, with no independent domain review recorded. It also hardened local history and feedback behavior when browser storage is unavailable or full; dedicated tests cover these failure cases. The expanded suite now reports 39 passed and 0 failed. The browser check was retried with elevated access but still timed out, so real-browser verification remains open.

Still outstanding: choose and configure a hosting account/domain, verify the built pages through a browser, complete accessibility and cross-device audits, add a deployment privacy/consent flow before any ads, connect actionable feedback, decide if/when a protected AI service is justified, and research/review further calculator families. Camera measurement, live motion/astronomy, AR/VR, AI, accounts, synchronized history, high-precision arithmetic, uncertainty propagation, load testing, monitoring, and scale claims remain unimplemented or unverified. No public deployment or paid service was used. The files in `sources/` remain untouched.
