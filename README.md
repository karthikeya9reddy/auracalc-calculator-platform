# AuraCalc Calculator Platform

## v1.1 development — Reforge in progress

Work takes place on `aura-v1.1`; the full Reforge upgrade is not complete. See [the engineering record](REFORGE_ENGINEERING_REPORT.md) for implemented changes, test evidence and remaining work.

Open `/scientific/` on your local site for the new arithmetic/scientific workspace. It supports real-number expressions, degree/radian modes, memory and session history. Results use floating-point arithmetic; complex numbers and arbitrary precision are not supported.

The development feedback form now sends messages to a server. Under `npm.cmd run dev`, submissions are stored in the ignored `.local-feedback/` directory, outside the public website. The owner can read them with `node scripts/read-feedback.mjs`. Public delivery requires the documented Cloudflare D1 binding and migration; a static preview alone cannot accept feedback. A message is reported as received only after the server confirms storage.

AuraCalc is a responsive, statically deployable calculator website backed by a shared, dependency-free calculation engine. The Emergent-inspired homepage now uses the provided visual direction; the current live catalog is a small, source-backed set. Its 48-field directory is a research map, not a claim that every field has a finished calculator.

## Run the website locally

Install Node.js 20 or newer, open a terminal in this folder, and run:

```text
npm.cmd run dev
```

Open `http://127.0.0.1:4173`. Press `Ctrl+C` in the terminal to stop the local server.

The local server serves this project and an optional local-only photo analysis endpoint. Ordinary calculations remain local. When explicitly requested, AI photo analysis sends the selected image and question to OpenAI. The endpoint is limited to same-origin requests from the local computer and does not log image content.

### Enable photo AI locally

Set `OPENAI_API_KEY` as a server-side environment variable, then restart `npm run dev`. The key is never entered into the website or sent to the browser. An OpenAI API account with model access and billing may be required. Do not put the key in source files, commit it, or paste it into chat. The default model is `gpt-4.1-mini`; an operator can set `AURACALC_VISION_MODEL` to another compatible model. The optional AI button sends the resized photo and the user's question only when clicked. The model provides measurement guidance; numerical measurements still use the user-selected reference and calculation engine. The API request sets `store: false`; provider data handling remains subject to OpenAI's policy.

In PowerShell, in this project folder, use the following to enter the key without echoing it on screen. The key is available only to processes started from this terminal session:

```powershell
$auraSecret = Read-Host 'OpenAI API key' -AsSecureString
$env:OPENAI_API_KEY = [System.Net.NetworkCredential]::new('', $auraSecret).Password
Remove-Variable auraSecret
npm.cmd run dev
```

The static build has no AI server. Public deployment requires a separately engineered authenticated backend, rate limits, cost controls, and privacy policy; do not expose the local endpoint to the internet. Live AR needs HTTPS (or localhost), browser support for immersive AR, hit testing and DOM overlays, and camera permission. It estimates the distance between two user-selected tracked surface points and has not been validated on physical devices.

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
- A catalog of 303 published formula calculators, 3,038 separately counted unit-conversion pages, and a currency converter
- Unit conversion across the current curated physical-unit registry, with dimensional and temperature-role checks
- A currency converter using dated Frankfurter reference rates, with refresh and device-local history. Repeated requests share a bounded in-memory quote cache; outages explicitly mark a recent fallback as stale. It requires an internet connection; the rate date can precede today and the result excludes transaction fees.
- Formula Studio with scientific functions, named inputs, worked steps, saved definitions, four-scenario comparison, sampled plots and readable exports. Personal formulas are not part of the public catalog and do not check physical units.
- Typed, dimension-checked area-to-volume handoff with formula-version provenance
- Localized numeric input/display options, responsive layout, dark theme, keyboard search shortcut, and reduced-motion styling
- Device-local result history with view, restore, delete, pause, and clear controls
- Readable print/Save as PDF reports and text downloads containing inputs, recorded method steps, results, precision notes and sources; server-backed feedback capture with legacy local-draft export, generated calculator information pages, and a static build
- Shared search with bounded typo tolerance, selected natural-language intents, and exact conversion-quantity prefill such as `500 N to lbf`. Prefilled values remain editable and require Calculate.
- Scientific display for tiny nonzero and very large results, malformed-history isolation, and stricter range/semantic checks on connected calculations
- A consent-gated advertising adapter interface; no ad provider is connected

## Boundaries

- Catalog methods are limited to their documented educational and estimate scopes. They do not approve structural, vehicle-safety, medical, tax, or other consequential decisions.
- Medical, finance, mining safety, code-based engineering, and similar high-consequence calculators require their own source, jurisdiction, qualified review, and release evidence before publication.
- Starter release records show developer self-review and executable reference cases; no independent domain review is recorded. “Published” here means included in this local product catalog, not deployed publicly.
- The unit registry and locale support are curated subsets, not exhaustive global coverage. Precision and rounding metadata do not yet select decimal or arbitrary-precision backends.
- Search uses local metadata and synonyms. Photo AI requires the optional local server configuration. The AR tool requires compatible hardware and is an estimate; automatic object dimensions, depth reconstruction, and camera-based object-speed tracking are not implemented.
- Calculation history stays in the current browser profile. Feedback is sent to the configured server; public delivery needs the D1 setup described in the Reforge record. Sensitive values should not be stored on a shared device or included in feedback.
- The service worker installs a small shell and bounds its visited-resource cache to 180 entries. It does not download the whole catalog on install. Offline behavior is covered by simulated tests; physical-device offline behavior still needs checking.
- Browser checks cover selected calculator, Studio, photo measurement, navigation, export and responsive flows. Public deployment, real-device AR, load testing, screen-reader testing and production-host verification remain outstanding. No million-user capacity claim has been established.

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
- `TITAN_RECONSTRUCTION.md` — latest change record, verification evidence, measured search performance and unresolved release gates

Keep `sources/` read-only. Read the assurance policy before adding a calculator.
