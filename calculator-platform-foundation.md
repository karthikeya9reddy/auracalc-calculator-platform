# Final Refined Framework: Global Multi-Discipline Calculator Platform

**Status:** Final framework; full-feature platform is the Version 1 target.  
**Scope:** Shared product, calculation, safety, data, interface, and operational rules for a global calculator platform. Implementation may be sequenced, but the V1 target includes the complete platform feature set below. Individual calculator definitions still require their own research and verification before publication; “full-feature V1” does not mean publishing unreviewed formulas or claiming the catalog is exhaustive.
**Catalog planning estimate:** About **2,000 distinct calculation definitions** at eventual full breadth. This is a rough capacity-planning estimate, not a researched or audited count. The actual total must be established by enumerating, scoping, sourcing, and deduplicating definitions; workflows, language/unit variants, and duplicate pages do not add to the count.
**Implementation status:** The initial dependency-free calculation core is under `src/calculation-core/`; the baseline audit is recorded in [baseline-engineering-report.md](baseline-engineering-report.md). It is a foundation, not yet a production website or a catalog of verified field calculators.

## Purpose and boundary

Build a dependable, globally usable platform for calculations and computational tools across professional and everyday fields. This document establishes the final shared requirements and architecture. It deliberately does not select or implement individual calculators. Every result must be reproducible, inspectable, and clear about its assumptions and limits. The platform can assist engineering, clinical, business, scientific, and everyday work; it cannot replace applicable codes, professional judgment, clinical care, or independent review.

## Framework in plain language

The website is one organized home for many kinds of calculations. A user can find a task, enter or capture values, and get a result from a reviewed method. The platform checks that inputs make sense, uses explicit units, and shows the steps, assumptions, source, version, and limits. When one task requires several calculations, a guided workflow carries compatible results forward so the user does not need to restart elsewhere.

The platform grows by adding reviewed definitions and field modules that use the shared engine. V1 includes connected workflows, camera/sensor input, astronomy guidance, visual explanations, demonstrations, and an AI task assistant. These help people provide inputs or understand results; they do not decide or invent the underlying formulas. Every calculator must pass its safety and verification gates before it becomes public.

```text
Find a task → enter/capture inputs → validate and calibrate
    → reviewed calculation engine → result, steps, sources, limits
    → optional next calculation or saved/exported workflow
```

## V1 feature set

All of these capability areas are part of the first public platform target. The calculator catalog itself is content: each definition is added when its research, source, reviewer, and verification record is ready.

1. **Global calculator hub:** search and browse across the 48 field groups, subfields, everyday tasks, and aliases; show why a tool matches the user's task.
2. **Trusted calculation engine:** shared formulas and numerical methods, unit/dimension handling, input checks, precision/rounding, uncertainty, errors, and result provenance.
3. **Dynamic catalog:** versioned calculation definitions and domain modules for formulas, conversions, statistics, solvers, data-backed estimates, decision models, and simulations.
4. **Connected workflows:** guide multi-step tasks, carry typed results forward, preserve assumptions, branch scenarios, compare outcomes, and export a complete result record.
5. **Camera and sensor tools:** photo/live measurement, calibrated video motion analysis (position, speed, acceleration), device/GNSS/depth inputs, and quality/confidence display. Driving interaction is prohibited; sensor estimates are not certified instruments.
6. **Astronomy mode:** time/location/orientation-aware sky map, likely star and planet labels, constellation boundaries, telescope and celestial calculation workflows, and a photo plate-solving path where supported.
7. **Science imaging:** math/graph capture with user confirmation and method-specific chemistry colorimetry using explicit calibration standards; no general chemical identification from a photo.
8. **Visual learning:** live diagrams, plots, 2D/3D views, timelines, motion paths, optional video demonstrations, captions, transcripts, and accessible non-visual equivalents.
9. **Reviewed AI guide:** map natural-language tasks to approved definitions, explain fields and results from reviewed records, confirm parsed inputs, and guide users through workflows. It cannot generate or change numeric methods.
10. **Global access:** localized language and number/date formats, explicit units, SI/US customary support, right-to-left readiness, keyboard/screen-reader support, responsive mobile interface, and reduced-motion behavior.
11. **Searchable public content:** useful field/topic pages, formula explanation, references and limits, canonical URLs, and crawlable result-free examples that do not expose user inputs.
12. **Private by default:** no account required for ordinary calculations; local-first sessions where feasible; clear camera permissions; no raw image or sensitive input upload/analytics by default.
13. **Maintainable operations:** managed hosting, versioned content, source-freshness reminders, monitoring, backups/rollback, issue reporting, and a monthly review routine.
14. **Full physics coverage:** research and calculator paths for classical, modern, applied, experimental, computational, and interdisciplinary physics branches, detailed in the [physics calculation taxonomy](physics-calculation-taxonomy.md).
15. **History and restore:** every calculator exposes the shared history view. Save successful non-sensitive runs locally when history is enabled; let the user pause saving, skip a run, delete one entry, or clear all. Sensitive tools require an explicit save choice. Each record retains exact inputs and units, the original result, method/data version, assumptions, warnings, and timestamp. Users can reopen the original answer or restore inputs into the current calculator; a changed method produces a clearly marked new result and never overwrites history. Never save camera frames or expose history values in URLs or analytics.

## Product principles

1. **Correctness before breadth.** A calculation is not publishable until its equations, units, assumptions, and verification evidence have been reviewed.
2. **Traceability by default.** Every result can be traced to an identified formula version, source, input set, unit conversion, and rounding rule.
3. **Explicit scope.** State the intended use, assumptions, exclusions, and relevant jurisdiction or standard edition alongside results.
4. **Predictable shared behavior.** Units, validation, precision, errors, and result presentation work consistently across domains.
5. **Accessible and international.** Support keyboard and screen-reader use, localized text and number formats, and explicit unit systems.
6. **Low operational burden.** Prefer static delivery and managed services, automated checks, a small dependency footprint, and an editorial workflow that does not require frequent maintenance.
7. **Visual when it helps.** Use interactive diagrams, plots, timelines, or 3D views when they make a relationship or workflow easier to understand; keep them optional and accessible.
8. **AI that assists, calculations that stay grounded.** AI may help users express a task, find a reviewed workflow, understand inputs, and interpret a result. Published numeric results come from the versioned calculation engine and reviewed data, not free-form model generation.

## Requirements

### Functional requirements

- A shared calculation core accepts typed quantities and returns typed results, warnings, and provenance; it has no UI or network dependency.
- A dimension and unit system handles base dimensions, derived dimensions, unit aliases, prefixes, affine units where applicable, and conversion validation. Dimensional mismatches are errors, never silent coercions.
- Inputs declare type, dimension, allowed range, required status, precision expectations, and validation rules. Validation errors identify the affected input and explain the correction.
- Formula definitions carry stable IDs and versions, equations, variable definitions, dimensional expectations, assumptions, limitations, source citations, and review status.
- Domain modules (civil, mechanical, electrical, and future disciplines) register calculations through a stable interface and share the common engine and presentation conventions.
- Results expose the unrounded value to the internal calculation path and a separately formatted display value, plus units, significant figures or decimal policy, and uncertainty/context notes where relevant.
- Each calculation can provide a human-readable derivation or equation view, input summary, source links, and a shareable/exportable report that preserves formula version and assumptions.
- Support multi-calculator workflows within and across fields. Users can carry a typed result into a next step, inspect the dependency chain, reuse compatible inputs, and see how upstream assumptions affect downstream results. Workflow composition preserves provenance and validation at every step.
- Provide relevant next-step and related-calculation discovery based on the user's task, input/output dimensions, and field context. Explain why a related calculation is suggested; do not add steps solely to increase time on site.
- Let users keep a private working session for a multi-step task, with clear controls to reset, export, or save locally. Do not require an account or send sensitive input values to analytics by default.
- Where a visual materially improves understanding, show a linked visualization (for example, a curve, motion path, geometry sketch, time sequence, or scenario chart) whose values update with the calculation and can be read without color or motion.
- Offer concise demonstrations for complex workflows: captioned, transcribed, localized where useful, and paired with a written step-by-step guide. Demos explain the workflow and its limits; they do not replace formula references or independent verification.
- If an AI assistant is offered, it can translate natural-language intent into candidate task/workflow matches, explain field labels and results from approved content, identify missing inputs, and help compare user-selected scenarios. It must ask the user to confirm mapped inputs before calculation and show which approved definitions and sources it used.
- Allow photo- and live-camera-assisted measurement as optional cross-field input methods. Distinguish pixel measurements from real-world dimensions and require a known scale, camera calibration/depth, or documented multi-view method before presenting physical measurements. On supported devices, live AR may place editable measurement overlays and show tracking/depth quality; unsupported devices fall back clearly. Image-derived values retain capture/calibration provenance and uncertainty when passed into other calculations. See the [photo measurement research](photo-measurement-research.md).
- Add a separate camera/sensor input layer for timestamped video tracking, GNSS speed, inertial readings, device orientation, AR depth, and scientific image/catalog input. It must return calibrated observations with uncertainty and quality flags; a camera view alone cannot establish physical speed or scale. Support education-safe motion plots (position, velocity, acceleration), astronomy sky identification using time/location/orientation plus versioned catalogs, and method-specific chemistry imaging only with calibration standards. See the [camera and sensor research](camera-sensor-calculator-research.md).
- Localization supports translated interface strings, locale-aware decimal/group separators, right-to-left layout readiness, and region-appropriate unit defaults without changing calculation meaning.
- Searchable, indexable discipline and topic landing pages provide original explanatory content, clear metadata, canonical URLs, structured metadata where appropriate, and crawlable links.
- Product discovery spans technical professions, skilled trades, education, and everyday tasks. The platform’s taxonomy and demand research must be broad enough to surface unmet needs outside the initial engineering disciplines, including mining and extractive industries.
- Include an explicit **Everyday life** category for common consumer tasks such as quick arithmetic, percentages and shopping, splitting bills, household budgets, pay and recurring costs, cooking and food quantities, home projects, time/date planning, travel/fuel, utilities, and carefully governed health/fitness estimates. These are candidate task areas; the research report does not establish their relative global frequency.
- The platform supports multiple computation patterns—equations, unit conversions, algorithms, decision-support rules, simulations, and versioned data-backed calculations—through governed interfaces. Each published tool declares its method and evidence; the platform must not imply it can solve every possible problem in a field.

### Quality and safety requirements

- Never display a plausible-looking result after invalid input, failed conversion, overflow, unsupported operating range, or failed internal check.
- Distinguish blocking errors from non-blocking warnings. Warnings cover out-of-range use, assumptions, and missing context; they are not hidden behind tooltips.
- A result intended for safety-critical design must identify governing standards, edition/jurisdiction, and required independent verification. Do not imply code compliance unless the calculation and its applicability have been reviewed for that claim.
- Every calculation and workflow has a risk classification, explicit intended use and exclusions, a named owner, qualified reviewers, independent reference cases, and a publish gate proportional to potential harm. High-consequence workflows require two qualified reviewers, including one independent of implementation; critical/time-sensitive use is excluded until dedicated assurance and regulatory controls are established.
- Verification is evidence about a specified method and use, not a blanket guarantee. Disclaimers cannot replace validated methods, risk controls, or professional/regulatory requirements. Never claim universal or perfect accuracy.
- Provide a way to pause/disable a calculation, report an issue, assess affected versions, publish a correction record, and notify users when a known error could change consequential results.
- Medical, clinical, diagnostic, dosing, business-finance, legal, and other consequential tools require field-specific risk classification, qualified review, jurisdictional analysis, and clear intended-use limits. High demand never waives these gates.
- Protect against malformed input, injection in labels/URLs, denial-of-service inputs, and accidental disclosure of user-entered values. Avoid storing inputs by default.
- Maintain versioned sources and review records. A source change or formula update requires impact review and regression verification.
- Meet WCAG 2.2 AA as the accessibility target; verify keyboard-only operation, semantic labels, visible focus, contrast, zoom/reflow, and announced result/error updates.
- Define service objectives and recovery expectations before launch. Keep the user-facing calculator path available without an account.

## Architecture

```text
Browser UI / field pages / task finder / workflow workspace
        │ manual values + locale + units                 Camera / GNSS / IMU / depth / sky data
        ▼                                                         │
Input schema and validation ◄──── calibrated observation + uncertainty/provenance
        │
        ├────► Domain calculation registry ◄──── reviewed formula/data/method records
        │                         │
        └──────────────► Shared calculation core
                                      │
                    typed result + diagnostics + provenance
                                      ▼
            explanation / visualization / workflow / export
```

### 1. Shared calculation core

Keep the core as a pure, deterministic library: same normalized inputs and formula version produce the same result. Separate parsing, validation, calculation, and display formatting. Represent quantities as a numeric magnitude plus a dimension and canonical unit; prohibit unitless values where a physical dimension is required. Use adequate internal precision and explicit algorithms; avoid binary floating-point for exact decimal input/output policies where it would create avoidable rounding surprises. Define policies for overflow, underflow, NaN/infinity, domain errors, and numerical conditioning. The core returns structured diagnostics rather than user-facing strings so translations remain outside the math layer.

Calculation contract (conceptual):

```text
CalculationDefinition = {
  id, version, discipline, titleKey,
  inputs: InputDefinition[],
  formula: FormulaMetadata,
  compute(normalizedInputs) -> ResultDefinition,
  verificationCases, status
}
```

The core should not choose a formula or silently infer missing engineering context. A calculation module supplies those decisions and its review evidence.

### Dynamic computation and extensibility

“Dynamic” means the catalog can grow and adapt by adding reviewed modules, supported methods, units, locales, and versioned reference data without rewriting the shared platform. It does not mean an unrestricted natural-language solver or automatic publication of generated answers.

- Use governed computation types: closed-form formula; numerical algorithm; scenario/decision model; simulation; and lookup or data-backed computation. A module declares which type it uses, its dependencies, validity range, and reproducibility requirements.
- Keep computation definitions and metadata data-driven where practical. Validate schemas and dimensional contracts at build time. Dynamic loading is restricted to signed/versioned first-party modules; do not execute arbitrary user-supplied code.
- For iterative or simulation methods, set explicit convergence, iteration, time, and memory limits; return non-convergence as an error with diagnostics, never as a confident result.
- Version external datasets and model parameters, record update dates and provenance, and preserve the exact version used in reports. Define a freshness policy per module; stale data must be disclosed or block a result.
- Permit multi-step workflows only when each step exposes inputs, transformations, intermediate outputs, sources, and error propagation. Users can inspect how the final result was produced.
- V1 AI-assisted interpretation may help users identify tasks, understand inputs, and explain reviewed outputs, but must not silently invent formulas, citations, clinical recommendations, or results. Deterministic calculation and evidence remain authoritative; AI behavior requires separate evaluation and user-facing disclosure.

### AI assistance, visualizations, and demonstrations

Build assistance around real user tasks, not a generic chat box. The experience can be distinctive when it helps a person move from an unclear question to the right reviewed workflow, then understand and communicate the result.

- **Task finder:** interpret a user's description and suggest matching calculation definitions/workflows from the approved catalog. Show why each match fits and offer a non-AI browse/search path.
- **Input helper:** explain required fields, units, and acceptable ranges using reviewed metadata. For natural-language values, display the parsed field/value/unit mapping and require confirmation before use.
- **Workflow guide:** ask only for missing context needed by the selected workflow, explain why each question matters, and support edit/back/skip where valid.
- **Result explainer:** summarize the deterministic result, steps, assumptions, warnings, and source metadata from structured engine output. The assistant cannot alter a result or infer professional advice beyond the reviewed scope.
- **Source-grounded retrieval:** retrieve from approved formula records, source references, help content, and tool documentation. Cite the exact records/pages used; if evidence is absent or ambiguous, say so and hand back to the user rather than improvising.
- **Visual layer:** offer domain-appropriate diagrams, plots, timelines, curves, or lightweight 3D previews tied to the same calculation state. A visual is optional, has a text/table equivalent, honors reduced-motion preferences, and makes model assumptions visible.
- **Video and guided demonstrations:** use short captioned demonstrations for workflows with meaningful sequences or visual interpretation. Include transcripts, keyboard-accessible controls, localized captions where justified, and a static guide for low-bandwidth access. Keep demonstration inputs fictional and clearly labeled.
- **Photo measurement assistance:** computer vision may propose object boundaries or landmarks for user confirmation. It must show overlays, scale source, calibration assumptions, and uncertainty; reject or downgrade results when perspective, depth, image quality, or scale is insufficient. An inferred typical object size must never be presented as a measured fact.
- **Live measurement mode:** where native camera/AR capabilities are available, guide the user in real time, track surface/device confidence, let them place and edit endpoints or outlines, then confirm a scan before passing values into another workflow. Provide a still-photo/manual reference fallback and account for the additional mobile-platform maintenance.
- **Live physics motion:** track a user-confirmed object in video and calculate position/velocity/acceleration only with a valid timebase and physical-scale calibration. Show tracking points, fit/smoothing choice, uncertainty, and a graph/table; camera motion and noise must not be silently confused with object motion.
- **Vehicle measurements:** offer a parked setup or passenger-operated video/GNSS estimate, with sensor accuracy and limitations displayed. Do not require or invite driver interaction, and never present a phone estimate as a certified speedometer, enforcement measurement, or vehicle control.
- **Astronomy sky mode:** align likely sky objects with time, location, phone orientation, and versioned catalogs/ephemerides. Separate IAU constellation regions from star-line art and cultural patterns; let users correct time/location/orientation and show candidate confidence.
- **Chemistry imaging:** support only named, validated colorimetric methods with standards, controlled capture guidance, and calibration records. Do not claim that a camera can identify an unknown substance or quantify a sample without method-specific calibration.
- **Safety boundaries:** no AI-generated formula execution, fabricated citations, unreviewed code, or autonomous high-stakes conclusions. Medical, safety-critical engineering, financial/legal, or regulated flows need an approved scope and qualified human review even if an AI explains them.
- **Evaluation and privacy:** test task-match accuracy, input parsing, source faithfulness, safe refusal/escalation, accessibility, and user comprehension against reviewed cases before release. Do not use entered health, financial, client, or unreleased production data for model training; minimize retention and disclose any external processing.
- **V1 completeness:** include the reviewed task assistant, visual layer, demonstrations, and camera/sensor capabilities in the first public platform. Build and integrate them in sequence, then launch the complete V1 only after privacy, device-support, accessibility, safety, and evaluation gates pass. Do not replace the reviewed task assistant with an unrestricted chat model.

### Multi-calculator workflows

Many users solve a larger problem by chaining several calculations—for example, converting measurements, estimating a quantity, then comparing cost or capacity. Treat these as first-class guided workflows rather than a disconnected collection of pages.

- Represent a workflow as a versioned directed graph of reviewed calculation definitions, named data transformations, and optional user decisions. A workflow has a clear task goal, start/end points, and a defined completion state.
- Pass values only through typed, dimension-checked connections. Show the source field and destination field, including units and any conversion. Never silently reinterpret an output as a different physical quantity.
- Preserve each step's formula/data version, inputs, output, assumptions, warnings, and source references. The final report includes the whole chain and identifies which upstream inputs influence each result.
- Permit branching and scenario comparison; let users change one assumption and recompute only dependent steps. Provide a visible summary of what changed.
- Make each step understandable and usable on its own. Allow skip, back, edit, reset, and export. Users should not repeat information already entered in the same session.
- Recommend related tools only when they help complete the stated task. Explain the connection in task language and allow dismissal. Measure successful task completion and user trust, not raw session length as the product goal.
- Apply workflow-specific safety classification. A low-risk step can become high consequence when combined with downstream interpretation; enforce the strictest applicable review and warning requirements.
- Do not let a workflow graph dynamically invoke unreviewed or arbitrary code. Build-time validation checks for cycles, missing inputs, incompatible dimensions, stale dependencies, and unreachable outputs.

### 2. Units and dimensions

- Define a canonical dimension vector system and a registry of units, symbols, aliases, scale factors, and offsets.
- Convert input quantities to canonical units before calculation; convert results only at the presentation boundary.
- Treat temperature and other offset units with explicit absolute-versus-difference semantics.
- Validate equations and input/output dimensions during development and registration.
- Store user preference separately from calculation data. Preserve the unit shown for every input and output in saved or exported reports.
- Unit definitions and supported aliases require references and tests, especially where regional notation differs.

### 3. Precision and rounding

- Separate input parsing precision, internal precision, and displayed precision.
- Never round intermediate values for convenience. Rounding is applied to display/export according to a declared policy.
- Each formula declares a default display policy and may expose significant figures, decimal places, or engineering notation when appropriate.
- Preserve enough precision in reports to reproduce the displayed answer. Explain when the displayed value is rounded.
- Do not claim accuracy beyond input precision, model assumptions, or known measurement uncertainty.

### 4. Validation and diagnostics

Validation runs in layers: syntax and locale parsing; required/type checks; finite-value checks; unit and dimension checks; physical/domain range checks; cross-field constraints; then formula-specific applicability checks. Return stable diagnostic codes, affected fields, severity, and localization keys. Keep field values on recoverable errors. Do not automatically clamp or “fix” engineering inputs.

### 5. Formula metadata and source traceability

Every formula record must include:

- stable formula ID, semantic version, owner/reviewer, status, and last review date;
- equation in readable form and machine implementation identifier;
- variable names, symbols, meanings, dimensions, and sign conventions;
- assumptions, boundary conditions, applicability range, exclusions, and known limitations;
- primary references: publication/standard title, issuing body or author, edition/date, section/page/table, stable URL or identifier, and access date where relevant;
- verification evidence and reviewer notes; change history and superseded versions.

Use statuses such as `draft`, `review`, `verified`, `published`, and `retired`. Only `published` definitions are available to public pages. A source citation must support the equation and its applicability, not merely mention a related topic. Never fabricate citations. Where a standard is paywalled, record precise bibliographic/section details and link to the official source page; do not reproduce restricted content.

The separate [Calculation Assurance Policy](calculation-assurance-policy.md) defines risk classes, required independent evidence, publish gates, runtime safeguards, and incident handling. It is normative for future calculator work: do not publish a calculation that fails its assigned risk-class gate.

### 6. Domain modules

Each discipline is an independently maintained package or bounded module with its own vocabulary, schemas, formula records, verification cases, and domain reviewers. Modules depend on the shared engine through a versioned interface and must not fork unit conversion or rounding behavior. Initial domain boundaries include civil, mechanical, electrical, and an extensible “other disciplines” namespace. Cross-discipline calculations declare their participating domains and review owners. This plan establishes extension points only; it does not define calculator entries.

#### Extensible field taxonomy

Organize discovery by user task and field, not just by academic discipline. Use a two-level taxonomy that can evolve without changing calculation IDs:

- **Engineering and built environment:** civil/structural, mechanical, electrical/electronics, chemical/process, environmental, geotechnical, materials, industrial, architecture/building services, surveying, water, transportation, and construction trades.
- **Mining and extractive industries:** exploration/geology, mine planning, drilling/blasting, ventilation, ground control, mineral processing/metallurgy, haulage, tailings/water, and mine economics. Treat these as discovery areas only; any future formula needs qualified review and explicit operating limits.
- **Energy and utilities:** power systems, renewables, fuels, storage, heating/cooling, and utility operations.
- **Manufacturing and operations:** machining, fabrication, quality, production, logistics, and maintenance.
- **Agriculture and natural resources:** crop/soil/water, forestry, fisheries, and land management.
- **Science, education, and daily use:** mathematics, chemistry, physics, statistics, education, household conversions, and other low-risk practical needs.
- **Astronomy, astrophysics, and cosmology:** sky coordinates and visibility, star/planet identification, telescope setup, celestial mechanics, distance/redshift, and model-based cosmology. Keep the meanings of IAU constellation boundaries, star-pattern traditions, and catalogued objects distinct; this is a research branch under physics in the current taxonomy, not a demand-validated product decision.
- **Physics across all branches:** use the [physics calculation taxonomy](physics-calculation-taxonomy.md) to research classical, mathematical, solid/fluid, thermal, electromagnetic, optical/acoustic, nonlinear, relativistic, quantum/AMO, nuclear/radiation, particle/accelerator, condensed-matter/materials, plasma/fusion, astronomy/cosmology, geophysical/climate, interdisciplinary, experimental, and computational physics. Every subfield gets a research path; each calculator still needs its own authoritative method and review.
- **Medical and health:** unit/reference tools, laboratory and research calculations, clinical support, and population-health analysis. These have very different risk levels; patient-specific diagnosis, treatment, and dosing require strict clinical governance and may be excluded at launch.
- **Software and data:** algorithm/runtime and capacity estimates, networking, storage, cloud cost, statistics, data transformation, security configuration, and developer workflow calculations. Record assumptions about versions, workloads, provider pricing, and changing specifications.
- **Hardware and electronics:** component selection, power/thermal budgets, signal and timing analysis, storage, interfaces, and compatibility. Track datasheet provenance, revisions, tolerances, and operating conditions.
- **Business and economics:** pricing, margins, unit economics, inventory, staffing, forecasting, project planning, and operations. Mark assumptions; financial, tax, investment, and legal outputs require jurisdiction-specific governance and must not imply professional advice.
- **Everyday consumer calculations:** quick arithmetic; percentages, discounts, and unit-price comparisons; tax-inclusive/exclusive prices; tips, service charges, and bill splits; household budgets, recurring costs, and savings scenarios; pay and time conversions; cooking portion scaling and ingredient/unit conversions; home and garden material estimates; date/time planning; travel, commute, and fuel cost estimates; household energy/water estimates; and general health/fitness estimates. Localize conventions and make assumptions visible. Financial, health, and food-safety outputs require appropriate risk review.
- **Artificial intelligence and machine learning:** model sizing, token/context and inference-cost estimation, data sizing, evaluation metrics, throughput/latency, and deployment capacity. Pin model/provider/pricing/specification versions and label estimates that depend on variable vendor behavior.
- **VFX, CGI, animation, and motion design:** frame/timecode coordination, retiming, motion paths and curves, camera shutter/motion blur, simulation scale/timestep, render time, storage, and shot planning. Respect DCC-specific timing conventions and preserve artistic intent; do not present simplified physics or estimates as production guarantees. See the [VFX/CGI motion research](vfx-cgi-motion-research.md).
- **Regulated or high-consequence topics:** patient-specific health, finance/tax, aviation, transport safety, and legal/compliance calculations require a separate risk and governance decision before inclusion; broad demand alone is not sufficient.

Keep this taxonomy as a discovery map, not a promise that every field will be served. The accompanying research map enumerates 48 field groups, from mathematics, clinical care, and engineering specialties through software, business, trades, everyday tasks, and VFX/CGI/motion design. The consumer research report separately maps recurring daily-life calculation jobs. These groups and tasks overlap and are not evidence of equal demand. Each future item is tagged with user role, job/task, geography, language, unit convention, risk class, computation type, data freshness needs, and review expertise required. Allow cross-tags and aliases because users search by task language, local terminology, abbreviations, and units rather than formal discipline names. Medical, software, hardware, business, AI, VFX/CGI, and everyday consumer areas are in scope for research; that does not constitute approval to publish tools in them.

The [field-by-field catalog](field-by-field-calculation-research.md) records why users calculate, recurring task families, evidence strength, safety context, and differentiation opportunities across all 48 groups. The newer [field calculator inventory](field-calculator-inventory.md) expands these into subfields, candidate calculation families, dynamic workflow design, and a record schema for future research. Use both as task-discovery baselines. For a future catalog that may contain thousands of entries, count reviewed calculation definitions separately from composed workflows, localized variants, and explanatory pages; do not inflate the catalog with duplicate SEO pages. Differentiation should come from traceability, unit-safe workflows, scenario comparison, helpful explanations, privacy, and current source data.

Current initial consumer-demand evidence gives a provisional research priority to housing/borrowing, health/fitness, savings/interest, and general math/percentages. This is based on third-party US keyword-volume estimates, not global comparable usage data. Treat these as priority areas for validation only: measure country/language differences, competitor saturation, trust/source requirements, and safety before selecting any calculator.

#### Deep demand and opportunity research

Before selecting a future calculator, conduct a documented research pass across the taxonomy. The objective is to find unmet, recurring user tasks whose calculation can be supported safely and maintained monthly—not to maximize a raw keyword count.

1. **Build the search landscape.** For each field, collect task phrases and variants: “calculator,” “estimator,” “converter,” “formula,” “how to calculate,” common misspellings, acronyms, regional names, and unit-specific queries. Record geography, language, date, source, and whether the phrase signals an actual calculation task.
2. **Measure demand with more than one signal.** Combine keyword-planner ranges, trend direction and geography, search suggestions/related queries, relevant public forums and professional communities, user interviews or short surveys, and evidence of repeated manual spreadsheet/software workflows. Do not equate search interest with number of people: Google Trends is normalized relative interest, and low-volume queries can appear as zero; Keyword Planner reports averages conditioned on its date range, location, network, and query settings ([Google Trends data FAQ](https://support.google.com/trends/answer/4365533?hl=en), [Keyword Planner metrics](https://support.google.com/google-ads/answer/6325025?hl=en-en)).
3. **Inspect the actual results page.** Sample organic results by locale and query intent. Record direct calculator competitors, software products, authoritative reference pages, forum answers, result features, freshness, mobile quality, language coverage, and whether results satisfy the task. Distinguish “many results” from genuine saturation; identify weaknesses and defensible gaps rather than assuming an opportunity from a high-volume keyword.
4. **Check trust and formula feasibility.** Identify authoritative sources, applicable standards and editions, domain reviewers, independently checkable reference cases, ambiguity in conventions, and foreseeable harm from misuse. If equations or usage limits cannot be verified, mark the opportunity blocked regardless of demand.
5. **Estimate business and operating fit.** Assess likely repeat use, audience reach, plausible monetization (ads, sponsorship, paid professional features, API/licensing, or education), acquisition channels, revenue constraints, privacy obligations, hosting/dependency needs, update frequency, support burden, and expected monthly maintenance. Clearly label monetization as a hypothesis until validated; do not let ads compromise calculation clarity or impartiality.
6. **Score and preserve uncertainty.** Use a 1–5 evidence-backed score for demand, unmet need/competition gap, source and verification readiness, safety manageability, monetization fit, and maintenance fit. Apply hard gates: traceable source, qualified reviewer, testable outputs, acceptable risk, and monthly maintenance feasibility. Keep evidence links and confidence (`high`, `medium`, `low`) beside each score. A weighted total can order candidates but cannot override a failed gate.
7. **Validate before commitment.** For the strongest candidates, test a lightweight non-calculator concept page or interview prototype, measure qualified interest and task completion, and revisit the evidence. Do not publish a formula or imply product availability during demand tests.

Maintain a research ledger with candidate/task, taxonomy tags, target users, query set, locale/date, demand evidence, result-page/competitor notes, source/reviewer feasibility, risk, monetization hypothesis, infrastructure and monthly upkeep, score/confidence, unresolved questions, and decision history. Refresh volatile demand and competitor evidence before selection; retain source snapshots or citations so the decision can be audited.

### 7. User interface and accessibility

Use semantic forms with visible labels, units adjacent to fields, descriptive help text, and understandable examples only after a future calculation is selected. Make keyboard flow and error recovery complete. Announce validation and updated results to assistive technology without moving focus unexpectedly. Use text and icons in addition to color. Ensure equations and symbols have accessible text alternatives. On small screens, show input, result, assumptions, and sources in a clear reading order. For multi-step workflows, provide a clear progress indicator, accessible step navigation, and a summary of completed and remaining steps. Charts and diagrams need text/table equivalents, keyboard-accessible controls, and reduced-motion behavior. Video demonstrations need captions and transcripts. Provide a printable result/source view for a single calculation or the complete workflow.

### 8. Localization and global behavior

Keep interface copy, formula labels, and diagnostic text in translation catalogs. Parse according to the selected locale while making accepted formats explicit and unambiguous. Do not infer a unit from locale alone: show and retain a unit on every physical input. Support unit-system preferences (for example SI and US customary) while allowing field-level overrides. Dates, decimal marks, thousands separators, and directionality must be locale-aware. References remain in their original bibliographic language with localized summaries where reviewed.

### 9. SEO and content model

Create indexable pages for disciplines and educational topics, with stable URLs and unique, useful descriptions. A future calculator page should explain its scope, variables, assumptions, formula provenance, and limitations; avoid thin pages generated from metadata alone. Use server-rendered or statically generated content for crawlability, structured data only when accurate, canonical URLs, sitemap, robots policy, descriptive titles, and internal linking. Do not put user-entered values in URLs, analytics, or page metadata. Avoid promises of compliance or guaranteed design outcomes in search snippets.

### 10. Deployment and operations

The full-feature V1 should use a low-maintenance, managed deployment. Serve public pages and reviewed definitions as static/pre-rendered content where suitable; run ordinary deterministic calculations in the browser; add managed services for camera/sensor processing, astronomy data, AI assistance, accounts, or heavy simulation only where needed. Keep each service optional to the calculator core, versioned, monitored, and replaceable. Calculations should remain usable when analytics or other optional services are unavailable.

For a first-time builder, the operations path is: build and preview locally; publish a private/staging preview; connect the final site address and HTTPS; publish the V1 site; then follow the monthly upkeep checklist. The host handles routine server operation, while the project still needs a named owner for source updates, dependency/security notices, uptime, backups, rollback, issues, and monthly review. Keep privacy-minimal analytics with consent appropriate to launch regions, and avoid storing user inputs by default. Specific host, domain, app store, and service choices are implementation decisions; they do not reduce V1 feature scope.

## Verification strategy

Verification is a release gate, not an afterthought.

1. **Unit tests:** unit conversions, dimension algebra, parsing, validation, rounding, diagnostics, and individual formula implementations.
2. **Reference cases:** independently sourced worked examples with expected values, units, assumptions, and allowed tolerance documented.
3. **Property tests:** dimensional consistency, conversion round trips, monotonicity or invariants where mathematically justified, and boundary behavior.
4. **Differential checks:** compare against an independently implemented trusted reference for selected cases; investigate discrepancies rather than widening tolerance by default.
5. **Regression tests:** preserve all previously reviewed cases across formula, dependency, and unit-registry changes.
6. **Human review:** a qualified domain reviewer checks equation transcription, assumptions, source edition, signs/conventions, and applicability.
7. **Release checks:** accessibility, localization parsing, browser/device behavior, SEO rendering, dependency/security checks, and rollback rehearsal.

Every test fixture must record its source and expected tolerance. Tolerances reflect the reference and algorithm, not a desire to make a failing test pass. Changes to a published formula require a new version, migration note, re-review, and regression run.

## Phased build plan

### Phase 0 — Foundation and decisions

Agree on intended audience, supported jurisdictions, risk posture, privacy approach, governance owners, and initial languages/unit systems. Define the formula review policy, source citation format, versioning policy, accessibility target, and content approval workflow. Finalize the field taxonomy and research ledger template. No individual calculators are selected in this phase.

**Exit:** approved requirements, risk classification, governance process, and architecture decision record.

### Phase 0B — Global opportunity research (parallel planning track)

Map needs across the full field taxonomy, including mining, medical, software, hardware, business, AI, and everyday consumer tasks. Collect and triangulate demand evidence, assess local competition and source quality, estimate monetization and maintenance, and flag high-consequence areas for separate governance. For dynamic or data-backed ideas, also assess data/API access, version drift, execution limits, reproducibility, and freshness costs. This is research across candidate categories, not selection or implementation of a calculator.

**Exit:** an evidence-linked opportunity landscape with confidence and hard-gate findings, ready for a later prioritization decision.

### Phase 1 — Platform contracts

Specify quantity/dimension types, unit registry format, formula metadata schema, calculation interface, workflow graph/step contract, sensor/vision data contract, AI task-assistant contract, visualization/accessibility interfaces, diagnostic codes, precision policy, localization keys, and report provenance fields. Select implementation technologies against maintainability, managed deployment, evaluation, and accessibility needs.

**Exit:** reviewed schemas and interfaces; architecture decisions documented; no discipline-specific formula needed.

### Phase 2 — Shared engine foundation

Implement the shared engine components: quantity and unit primitives, parser/validator framework, deterministic execution contract, structured diagnostics, metadata loading, display formatting, calculation registry, provenance store, and workflow graph validation/execution primitives. Build the privacy, versioning, and deployment foundations alongside them.

**Exit:** core can load versioned definitions, reject invalid inputs, preserve provenance, and execute workflow fixtures without exposing unreviewed results publicly.

### Phase 3 — Governance and quality pipeline

Add formula review states, reference records, independent verification fixtures, publish gates, dependency/security checks, accessible UI primitives, translation workflow, source-freshness checks, and managed deployment preview. Define incident, correction, rollback, and retirement procedures.

**Exit:** a sample definition can move through draft and review to a simulated publish gate with all provenance and checks visible; still no public calculator selection.

### Phase 4 — Complete V1 feature integration

Integrate the full V1 feature set: global task finder and field catalog; calculation modules and multi-step workspaces; AI task assistant; camera/sensor measurement and astronomy mode; visualizations and demonstrations; localization; accessible responsive UI; SEO pages; private sessions; exports; and operations/issue reporting. Populate every catalog entry from its own evidence and review record. All capability areas are in V1 scope; entries that have not passed their calculation-specific gates remain unpublished until they do.

**Exit:** each V1 feature area works end-to-end with representative reviewed definitions and workflows; camera/sensor, AI, and cross-domain handoffs retain their quality and safety metadata.

### Phase 5 — V1 launch readiness and public release

Complete cross-device and cross-locale verification, accessibility review, qualified calculation reviews, privacy/security review, performance checks, issue reporting, backups, rollback rehearsal, hosting/domain/HTTPS setup, and maintenance ownership. Publish the full V1 capability set only when its required operating and calculation gates are met.

**Exit:** public site is live, monitored, supportable with the agreed monthly maintenance level, and can disable or correct a faulty definition quickly.

### Phase 6 — Monthly operation and catalog growth

Review uptime, source freshness, security updates, user-reported issues, accessibility regressions, and privacy-minimized usage signals on the agreed monthly cadence. Add further calculation definitions and field content through the same research and review pipeline. This grows the catalog without postponing any V1 platform feature.

**Exit:** each catalog addition has an owner, evidence, verification record, and support capacity; the platform remains within the assurance policy.

## Governance and release checklist

Before any calculation is published, confirm: source is authoritative and traceable; formula and conditions were independently reviewed; units and dimensions are checked; input limits and diagnostics are defined; reference cases and regression checks pass; displayed precision is justified; assumptions and limitations are visible; accessibility and locale behavior are reviewed; the calculation has an owner and review date; versioning, correction, and retirement paths are ready. If any item is missing, keep the definition unpublished.

## Implementation decisions still to make

These choices do not reopen or narrow the finalized framework. Resolve them during implementation and market research:

- target countries, languages, unit defaults, and jurisdiction-specific code/reference coverage;
- qualified reviewers and owners for each high-consequence field;
- the researched, deduplicated calculator definition inventory and source/version records;
- browser, native mobile, and sensor-library choices for the complete camera/AR feature set;
- the managed hosting, domain, AI service, data/catalog access, and any account/storage services;
- privacy, consent, retention, support, and monthly operations responsibilities.

The V1 scope is the full capability set above. The public catalog must contain only definitions that have completed their own research and release gates; the platform must never fill gaps with invented or unreviewed calculations.
