# AuraCalc — Studio, Measure and calculator reliability update

Date: 11 November 2026. This record describes implemented local changes, not a public deployment or a claim of universal calculation accuracy.

## Calculator reliability and layout

- Fixed a shared input bug: the browser sends blank optional quantities as `{ value: '', unit: 'mV' }`. The engine previously treated that object as a supplied value and tried to parse an empty number. Blank optional quantity objects now remain unknowns; blank required fields still fail, and zero remains a supplied value.
- Reproduced the reported Ohm’s law case in the browser: blank voltage with mV selected, 32 A and 12 Ω produces **384 V**. All three missing-value paths and mixed-unit cases have regression coverage. Ohm’s law version 1.0.1 rejects a zero-resistance result outside its stated positive-resistance model.
- Calculator answers sit **below the input panel** on desktop and mobile. Inputs use two columns when space permits and one on narrow screens. Errors receive focus; clearing a form also clears its active calculation record.
- Replaced the incorrect universal two-resistor sketch with an actual single-resistor Ohm’s law diagram. Other electrical tools without an authored topology use a calculation map rather than an invented circuit.
- Added a whole-catalog input-unit equivalence check, alongside representative execution, known-answer and invalid-input suites. This is regression evidence, not an independent scientific certification for every real-world use.
- Added two sourced planning tools: final-exam score needed and GPA needed to reach a target. Impossible goals are identified, and institutional grading assumptions are explicit. The catalog now contains **303 formula calculators**; **3,038 directed unit converters remain separate**.

## Formula Studio

- Scientific functions, explicit pi()/e() constants, named inputs and controlled parsing without eval.
- Templates for room area, circle area, hypotenuse, margin pricing and compound growth.
- Worked operation steps, four pinned scenarios with input restoration, and a 21-point input exploration plot with an accessible data table.
- Undefined samples remain explicit; editing values invalidates stale results and plots. The varied input can remain blank when exploring its range.
- Device-local saved formulas and input values, history integration and readable text reports. User-authored formulas do not automatically validate physical units or suitability.

## Measurement workspace

- Separate Photo + AI, Live AR and Speedometer modes with a clearer sequence and responsive controls.
- A synthetic practice board makes length, area and angle tools usable without uploading a private photo or enabling a camera.
- A notebook holds up to 40 photo readings, with selectable results, deletion, reference snapshots and a human-readable report including points, method and answer.
- Changing reference values invalidates the current calibration. Existing readings retain their original reference snapshot. Crossed or degenerate polygons and non-finite geometry are rejected.
- Angle measurement uses the middle of three marked points. It measures an image-plane angle, which perspective can distort.
- Searchable measurement destinations carry values into compatible calculator inputs without retyping. Input bounds and dimensions are checked; the user must select the intended physical meaning.
- AR checks browser support, requires steady tracked hits, resets on tracking-space changes, supports repeated readings and rejects very short distances. Desktop unsupported-device messaging was checked; simulated session tests cover tracking and lifecycle behavior.
- The speedometer expires stale readings rather than indefinitely presenting an old speed as current.
- AI remains a real, optional server-configured guidance service. No live paid provider request or private photo upload was made during these checks. It does not infer guaranteed real-world dimensions from an uncalibrated photograph.

## Presentation and delivery

- Distinct converter, Studio and Measure gallery panels replace the repeated homepage banners. A shared custom A-and-orbit mark now appears across the site.
- Desktop and narrow-screen checks cover selected home, Studio, measurement and calculator flows. The measured narrow-screen views had no horizontal overflow.
- Service-worker installation now downloads fewer than 100 shell assets instead of the entire catalog. A separate visited-resource cache is limited to 180 entries; API requests are excluded and unknown offline routes show an explicit reconnect page.
- Page generation preserves unchanged files and removes only obsolete generated pages. Interrupted builds retain an ownership marker so they can be retried safely.
- The static bundle includes basic security and permission headers for hosts supporting `_headers`. Configure equivalents on other providers and verify actual deployed headers.

## Validation record

- Local full suite: **158 tests, 157 passed, 0 failed, 1 skipped**. The skip is the local vision HTTP integration check because loopback connections are restricted in that test environment. Browser checks accessed the running site separately.
- Production static build succeeded for 303 formula pages, 3,038 converter pages and 48 field pages. `npm audit --omit=dev` reported zero known dependency vulnerabilities at the time of this check; this is not a complete application security audit.
- Formula execution and accepted-unit equivalence were checked across all 303 published formula definitions.
- All 3,038 directed unit conversions have automated execution and reverse-conversion coverage.
- Browser: the reported Ohm’s law case, vertical results, Studio template calculation and scenario pinning, sampled plot, photo reference length, 90° angle, notebook and text export, and unsupported AR handling.
- Physical AR/camera accuracy, real moving-device speed, a live paid AI provider request, screen-reader evaluation, and production traffic capacity were not verified.

## Public release dependencies

Choose the real HTTPS domain and build with `AURACALC_PUBLIC_URL` to produce absolute canonical URLs and a sitemap. Deploy only `dist/`. The local photo-AI endpoint is intentionally not a public backend: launch needs an authenticated, rate-limited service with spending controls and privacy arrangements if that feature is offered online. Real-device measurement validation, deployment checks, operational monitoring and load tests remain required before making production-capacity claims.
