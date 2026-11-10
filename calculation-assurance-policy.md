# Calculation assurance and release policy

## Purpose

Trust comes from evidence that a specific calculation is correct for a clearly defined use—not from the size of the catalog, a disclaimer, or confidence in the interface. This policy defines the minimum evidence required before any calculation or workflow is published and maintained.

The platform cannot guarantee that a result is correct for every context. It can require traceable methods, independent checks, explicit limits, and a reliable way to pause or correct a tool. A calculator must not be presented as suitable for a decision beyond the evidence and review supporting it.

## Risk classes

Assign each calculation and complete workflow a risk class before implementation. A workflow inherits the highest risk among its steps and any foreseeable use of its final output.

| Class | Example impact if wrong | Minimum release review |
|---|---|---|
| **R0 — Informational** | Inconvenience or learning confusion, readily reversible | Source/method recorded; developer review; reference and boundary cases; clear rounding and limits. |
| **R1 — Practical** | Material/time/cost waste or a noncritical operational error | Qualified domain review; independently derived examples; unit, boundary, and sensitivity checks; explicit uncertainty and assumptions. |
| **R2 — Consequential** | Could affect health, safety, structural integrity, substantial finances, legal/tax position, or regulated operations | Two qualified reviewers, including one independent of implementation; authoritative source/edition and jurisdiction; documented hazard analysis; independent reference implementation or validated reference cases; expanded validation and human-factors review; jurisdictional/regulatory assessment; named owner and change control. |
| **R3 — Critical / unsupported** | Could directly guide time-critical treatment, safety-critical control, or an unacceptably severe hazard without validated safeguards | Do not publish on a general-purpose calculator platform until a dedicated quality system, domain-specific validation, regulatory review where applicable, and qualified operational ownership are established. Exclude if those conditions are not met. |

Risk classes are product governance categories, not legal classifications. The responsible team must check applicable laws, regulations, codes, licensing, and professional practice requirements in each target jurisdiction. A disclaimer cannot lower a risk class or replace required controls.

## Required calculation record

Before coding, create an approved specification containing:

- intended user, task, context, jurisdiction, and intended use;
- explicit non-goals, exclusions, contraindications, and safe operating range;
- authoritative formula/model/data sources with edition, section, date, and applicability evidence;
- equation or algorithm, variable definitions, dimensions, sign conventions, and transformation sequence;
- required inputs, units, accepted ranges, defaults, and behavior for missing, invalid, stale, or contradictory data;
- precision, tolerance, rounding, uncertainty, and significant-digit policy;
- expected errors, warnings, and user actions when checks fail;
- independent reference cases with sourced expected outputs and justified tolerances;
- risk class, reviewer qualifications, named owner, last-review date, and next review trigger;
- version, change history, dependencies, and impact analysis for upstream changes.

No formula, clinical rule, code interpretation, reference value, or citation may be invented by an AI assistant. AI can help locate candidate material, but a domain owner must verify the source and its applicability.

## Verification and validation evidence

Every published calculation needs evidence appropriate to its risk class:

1. **Independent source check:** reviewer confirms the formula and intended operating context from a primary/authoritative source. A matching equation on another calculator site is not independent validation.
2. **Independent expected results:** derive expected values separately from the production implementation. Record the calculation route and units. High-risk cases should use an independent reference tool, hand calculation, experimental data, or validated model as applicable.
3. **Representative test cases:** normal, minimum, maximum, zero/near-zero, invalid, out-of-range, unit conversion, sign/convention, and boundary transitions. Cases must reflect real user contexts.
4. **Dimensional and numerical checks:** dimensional consistency, exact conversions where available, precision loss, overflow/underflow, conditioning, convergence, monotonicity/invariants only where mathematically warranted.
5. **Workflow checks:** verify every handoff, unit change, intermediate value, branch, cached output, and final report against its component definitions.
6. **Human factors review:** confirm inputs are understandable; limitations and warnings are seen before action; users can distinguish an estimate from a verified result; and result wording does not overstate certainty.
7. **Risk-based independent review:** R2 requires two qualified reviewers, at least one independent of the code author. Reviewer identity, credentials/area of competence, comments, and resolution are retained.

Passing a test suite is necessary but not sufficient. A test cannot validate a wrong or inapplicable formula. Conversely, a correct formula can still produce an unsafe product if units, input mapping, displays, defaults, or user workflow are misleading.

## Publish gate

Only a definition in `verified` status that passes all gates for its risk class can be marked `published`. The release record must include:

- approved calculation specification and risk classification;
- completed source and reviewer sign-off;
- verification evidence, expected results, tolerances, and test/build version;
- accessibility and comprehension review for inputs, warnings, result, and export;
- current owner/contact, review date, source freshness policy, and correction plan;
- rollback/disable mechanism and public status route.

Do not publish when source applicability is unclear, expected values cannot be independently checked, reviewer expertise is absent, warnings fail to stop unsafe interpretation, or maintenance capacity cannot support required updates.

## Runtime safeguards

- Fail closed on invalid units, unsupported inputs, non-finite values, failed convergence, stale required data, missing context, or failed internal checks. Show no plausible-looking result on failure.
- Separate blocking errors from warnings; state the action needed to proceed. Do not silently coerce, clamp, substitute defaults, or hide warnings.
- Always show output units and distinguish displayed rounding from internal precision. Label estimates, approximations, ranges, and user-provided assumptions.
- For R2, identify the method/source/version, assumptions, scope, and required independent professional check in the result view and exported record.
- AI may explain reviewed metadata and structured outputs; it cannot decide that a failed gate is safe, modify the numeric output, create a formula, or provide unreviewed professional recommendations.
- Image/AI-derived inputs must show confidence and user-confirmed landmarks/scale. Low-quality measurements cannot silently flow into a higher-risk workflow.
- Camera/sensor-derived values must preserve calibration, capture timebase, device/source, coordinate frame, and uncertainty/quality state. They cannot be treated as verified physical quantities merely because they update live. See [camera and sensor calculator research](camera-sensor-calculator-research.md).

## Ongoing monitoring, updates, and incidents

- Review low-volatility formulas on a scheduled cadence and immediately when a source, standard, law, data set, software dependency, or known defect changes. Set a shorter review interval for volatile inputs.
- Monitor only privacy-minimized operational signals (e.g. failures, outdated sources, anonymous completion/drop-off). Do not log sensitive raw inputs by default.
- Give every result page a clear “report a possible issue” route that captures the calculation ID/version and optional user description without requiring sensitive inputs.
- Triage a credible correctness or safety report promptly. For potential R2/R3 harm, disable the affected definition or workflow while investigating; preserve the version and evidence.
- Record incident scope, affected versions, root cause, impact assessment, correction, reviewer approval, and communications. Notify affected users when a known error could change a consequential result and contact is feasible and lawful.
- A correction requires a new version, refreshed independent expected cases, regression review, and a dated change note. Do not silently overwrite historical result provenance.
- After incident resolution, update the hazard review, tests, documentation, and training. Affected downstream workflows must be re-reviewed before republication.

## Platform-level claims

Never claim “100% accurate,” “safe for any use,” or “code compliant” without a narrowly defined, independently supported basis. Communicate what has been checked, which cases and versions were reviewed, what uncertainty remains, and when a professional or physical verification is required.

For medical functionality, assess the intended use and jurisdiction rather than assuming a simple calculator is unregulated. FDA guidance notes that some software functions remain subject to device oversight and that the applicable analysis depends on the function and intended use ([FDA CDS FAQ](https://www.fda.gov/medical-devices/software-medical-device-samd/clinical-decision-support-software-frequently-asked-questions-faqs)). FDA software validation guidance describes validation evidence as a combination of testing, inspections, analyses, traceability, and intended-use evidence ([FDA software validation guidance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-principles-software-validation)). These are references for governance planning, not a determination of any product's regulatory status.
