# Field-by-field calculation research catalog

**Purpose:** Map why people in the platform’s 48 field groups calculate, what calculation families recur, and what could make a shared platform more useful than a bare input/output form. This is an opportunity and research catalog, not a selection of thousands of calculators.

For the expanded field/subfield inventory, definition-counting rules, dynamic calculation architecture, and linked workflow examples, see [Field calculator inventory and dynamic catalog design](field-calculator-inventory.md).

**Research snapshot:** 10 November 2026. Evidence is uneven. Public handbooks and institutional tools document real work and methods, but rarely measure how often every profession uses a calculator. Unless a row cites measured usage, “recurring need” means the work itself is quantitative, not a quantified use-frequency claim.

## Findings that should shape the project

People reach for calculations to **make or check a decision**, **convert between units or conventions**, **estimate quantities/cost/time**, **compare scenarios**, **monitor outcomes**, **meet a standard**, or **explain a result to someone else**. Different fields need more than formula evaluation: they need named methods, reference data, standards editions, uncertainty, constraints, and sometimes multi-step workflows.

The strongest unique platform proposition should be a **traceable calculation workspace**: explainable steps; explicit units and assumptions; source and method versions; scenario comparison; reusable/shareable result sheets that do not expose entered values by default; and region/language-aware conventions. For professional domains add modes tailored to task context (field, classroom, lab, office); for consumer domains emphasize simple language, privacy, and choices between scenarios. Never use a generic “AI answer” as a substitute for validated calculation logic.

## Evidence labels

- **Documented:** An authoritative manual, public tool, or research source directly shows calculation methods/tasks in the field.
- **Strong task basis:** Calculations are clearly intrinsic to the work and supported by institutional or professional material, but frequency is not measured.
- **Discovery hypothesis:** The task family is plausible and should be checked with practitioner interviews, query research, and source review.
- **High consequence:** A wrong answer can harm people, infrastructure, finances, rights, or the environment; stricter governance applies.

## 48 field groups

| # | Field | Why people calculate | Recurrent calculation families (not individual product decisions) | Platform touch / evidence |
|---:|---|---|---|---|
| 1 | Mathematics and arithmetic | Solve, check, compare, and learn quantitative relationships. | Arithmetic, fractions, ratios, percentages, powers, roots, equation solving, geometry, graphing. | Show steps and equivalent forms; offer learn/check modes. **Documented** in education and calculator use sources in the field report. |
| 2 | Statistics and data analysis | Summarize observations and quantify variability or evidence. | Descriptive statistics, distributions, confidence intervals, sample size, correlation, regression, probability, error. | State assumptions, sample definitions, units, missing-data handling, and uncertainty; avoid implying causation. **Strong task basis.** |
| 3 | Physics across all branches, including astronomy, astrophysics, and cosmology | Relate measured quantities, model physical behavior, test theories, analyze experiments, and interpret the sky at a stated place and time. | Classical/mathematical; mechanics, solids/fluids, thermal/statistical, electromagnetism, optics/acoustics, relativity, quantum/AMO, nuclear/particle, condensed matter/materials, plasma/fusion, geophysics/climate, interdisciplinary, experimental/instrumentation, computational/numerical, astronomy/cosmology. | Show dimensions, conventions, constants/data version, uncertainty, boundary conditions, frame/time context, and model limits. Camera sky identification needs orientation and catalog validation. See the [24-branch physics calculation taxonomy](physics-calculation-taxonomy.md) and [camera/sensor research](camera-sensor-calculator-research.md). |
| 4 | Chemistry | Convert quantities and predict composition or reaction outcomes. | Moles, molarity, dilution, stoichiometry, gas laws, pH, concentration, yield. | Preserve chemical species, concentration basis, temperature/pressure assumptions, and significant figures. **Strong task basis.** |
| 5 | Biology and laboratory science | Prepare samples, interpret observations, and normalize measurements. | Dilutions, concentrations, molar solutions, growth rates, ratios, standard curves, assay normalization. | Record protocol/source, units, sample context, and uncertainty; distinguish teaching examples from lab SOPs. **Strong task basis.** |
| 6 | Education, assessment, and learning | Learn methods, check work, grade, and translate among representations. | Fractions, algebra, calculus, statistics, GPA/grades, scientific and unit conversions. | Offer hints/derivation and misconception checks, not just answer reveal; age/accessibility options. Calculator use has direct assessment and survey evidence in [ERIC](https://eric.ed.gov/?id=EJ1380706) and the [Irish ERC report](https://www.erc.ie/wp-content/uploads/2025/12/calculator_final_report_phase2.pdf). |
| 7 | Clinical medicine | Apply evidence-based scores or routine quantitative measures during care. | Clinical scores, risk estimates, body measures, lab conversions, fluid/electrolyte summaries, date estimates. | Identify intended population, study/guideline version, contraindications, provenance, and limits; clinician-facing only where appropriate. **High consequence.** FDA lists examples of routine clinical calculations and discusses software scope in its [CDS FAQ](https://www.fda.gov/medical-devices/software-medical-device-samd/clinical-decision-support-software-frequently-asked-questions-faqs). |
| 8 | Public health and epidemiology | Compare disease/event burden across populations and time. | Incidence, prevalence, rates, risk, age adjustment, confidence intervals, surveillance denominators. | Make numerator, denominator, at-risk population, time interval, and standardization visible. **Documented; high consequence for interpretation.** [CDC Field Epi Manual](https://www.cdc.gov/field-epi-manual/php/chapters/describing-epi-data.html). |
| 9 | Pharmacy and medication sciences | Check doses, quantities, concentrations, days supply, and preparation. | Weight/area-based dose arithmetic, concentration, infusion rates, quantity, days supply, dilution. | Strictly qualified review, independent-check design, hard limits, no consumer prescribing advice; source label/version required. **High consequence.** Medication errors and dosing complexity documented by [AHRQ PSNet](https://psnet.ahrq.gov/primer/medication-administration-errors) and [CMS](https://www.cms.gov/sites/default/files/repo-new/47/Pharmacy%20Self-Auditing%20JobAid%20OralProducts.pdf). |
| 10 | Dentistry and oral health | Plan measurements, material quantities, and clinical indices. | Dental indices, local anesthetic dose support, dimensions, imaging geometry, material mixing. | Separate educational, lab, and patient-care intents; clinician review and jurisdictional practice limits. **High consequence / discovery hypothesis.** |
| 11 | Veterinary medicine and animal care | Adapt measurements to species, weight, age, and treatment context. | Body measures, feed/nutrition, population rates, clinical dosing support, breeding/gestation dates. | Species-specific standards and qualified veterinary review; never transfer human assumptions. **High consequence.** Research evidence includes species-specific bodyweight methods [PLOS study](https://pmc.ncbi.nlm.nih.gov/articles/PMC11825090/). |
| 12 | Civil engineering | Size and check infrastructure under loads, flows, geometry, and codes. | Loads, quantities, earthwork, beams, drainage, pavement, retaining systems, unit conversions. | Code/jurisdiction edition, load combinations, assumptions, traceable work sheet, peer-review status. **Documented.** |
| 13 | Structural engineering | Check member forces, deformation, stability, and serviceability. | Section properties, stress/strain, bending/shear, deflection, buckling, load combinations. | Distinguish preliminary checks from design approval; show governing cases and units. **High consequence; documented by engineering manuals.** |
| 14 | Geotechnical engineering | Estimate soil/rock behavior supporting structures and slopes. | Soil classification properties, bearing, settlement, slope stability, earth pressure, pile/foundation estimates. | Geology, groundwater, investigation quality, model selection, and jurisdiction must be explicit. **High consequence.** [ODOT manual](https://www.transportation.ohio.gov/business/publications/gdm) documents scope. |
| 15 | Transportation and traffic engineering | Design and operate movement systems safely and efficiently. | Traffic flow/capacity, stopping distance, signal timing, trip generation, pavement, route/time. | State roadway context, design vehicle, units, peak periods, and standards edition. **High consequence / documented.** |
| 16 | Water resources and hydraulic engineering | Move, store, treat, and control water. | Flow, head loss, channels, runoff, storage, pumps, pipes, water balance. | Distinguish steady/transient assumptions, roughness, boundary conditions, and return period. **Strong task basis.** |
| 17 | Environmental engineering and science | Measure impacts, compliance, treatment, and resource use. | Emissions, concentrations, mass balances, treatment loads, contaminant dilution, carbon/energy totals. | Cite factors/data vintage, boundaries, units, and uncertainty; prevent misleading “net zero” claims. **Strong task basis.** |
| 18 | Mechanical engineering | Size and analyze machines, motion, loads, energy, and fluids. | Kinematics, stress, torque/power, heat transfer, fluids, thermodynamics, vibration, tolerances. | Symbol dictionary, unit-aware equation chain, validity assumptions, tolerance propagation. **Documented** in engineering equation collections [University at Buffalo](https://research.lib.buffalo.edu/engineering/equations). |
| 19 | HVAC and building services | Meet comfort, ventilation, heating/cooling, and equipment requirements. | Heating/cooling loads, airflow, duct pressure, ventilation, equipment efficiency, psychrometrics. | Climate/location, occupancy, envelope assumptions, code context, and safety margins. **Documented** in engineering collections. |
| 20 | Electrical engineering and power systems | Size, protect, and operate circuits and grids. | Ohm/AC circuit values, impedance, power, voltage drop, conductor sizing, fault/current, energy. | Phase/system type, frequency, conductor/material, temperature, code edition, and hazard labels. **High consequence.** Engineering references include [electrical and power equation collections](https://research.lib.buffalo.edu/engineering/equations). |
| 21 | Electronics and embedded hardware | Select components and verify signal, power, timing, and heat constraints. | Resistor networks, filters, ADC resolution, timing, battery life, power/thermal, interface levels. | Datasheet part/revision, tolerance, derating, ambient conditions, and units. **Strong task basis.** |
| 22 | Chemical and process engineering | Balance materials/energy and size process conditions. | Material/energy balances, stoichiometry, pressure drop, reaction yield, flow, phase/equilibrium, heat exchange. | Composition basis, thermodynamic model, operating envelope, source/version, and iterative convergence. **Documented** in [NMSU course outline](https://chme.nmsu.edu/academics/courses/chme-101.html). |
| 23 | Mining and extractive industries | Plan production and manage geotechnical, ventilation, processing, and safety constraints. | Ventilation quantities, haul cycles, dilution/recovery, blasting parameters, slope/pillar checks, reserve/economics scenarios. | Site-specific model, jurisdiction, equipment, measured conditions, and qualified sign-off. Never present a simple calculator as a mine safety design. **High consequence.** [NIOSH ventilation guidance](https://www.cdc.gov/niosh/engcontrols/ecd/detail63.html) shows airflow is safety-relevant. |
| 24 | Geology, surveying, and geospatial work | Turn field observations and coordinates into location, area, and resource estimates. | Coordinate transforms, bearings, traverse closure, area/volume, grade interpolation, slope, map scales. | Datum/projection, coordinate reference, instrument precision, survey method, and uncertainty. **Strong task basis.** |
| 25 | Construction estimating and quantity surveying | Convert drawings/site measures into materials, labor, equipment, and bid cost. | Quantity takeoff, cut/fill, concrete/aggregate, waste, labor-hours, unit cost, overhead/tax/contingency. | Work backward from task; editable local prices; auditable quantity-to-cost breakdown; estimate class/confidence. **Documented** in [Idaho cost estimating guide](https://apps.itd.idaho.gov/apps/manuals/Const-Cost-Estimating-Guide.pdf). |
| 26 | Architecture and building design | Fit program, dimensions, performance, and regulations into a built space. | Area, occupancy, egress capacity, daylight, envelope/energy, stair/ramp geometry, material quantities. | Jurisdiction, occupancy/use, measurement convention, accessible alternatives, and design-stage caveat. **Strong task basis.** |
| 27 | Manufacturing and industrial engineering | Set process parameters and improve throughput, quality, and capacity. | Cycle time, takt, OEE, yield/scrap, capability, line balance, production capacity, material usage. | Define denominator/time window, process boundaries, uncertainty, and benchmark basis. **Strong task basis.** |
| 28 | Materials science and metallurgy | Predict material behavior and select/process/test materials. | Composition, mixture proportions, density, heat treatment, fatigue, hardness, corrosion, phase fractions. | Material standard/grade, test conditions, temperature, processing history, and reference data edition. **Documented** in engineering collections. |
| 29 | Energy systems and utilities | Forecast supply/demand, efficiency, storage, and operating costs. | Load, energy consumption, conversion efficiency, capacity factor, storage, demand, tariff cost. | Tariff/date/region, time intervals, losses, and difference between energy and power. **Strong task basis.** |
| 30 | Renewable energy and energy storage | Estimate generation, site yield, storage, and economics. | Solar yield, wind energy, battery capacity/runtime, degradation, round-trip efficiency, payback. | Weather/resource dataset, orientation, losses, degradation, tariff, and financing assumptions. **Strong task basis.** |
| 31 | Agriculture and crop science | Plan planting, inputs, irrigation, yields, and nutrient needs. | Seeding rates, fertilizer concentration/rates, irrigation, yield, acreage, feed and moisture. | Crop/soil/region/season, label rates, unit basis, and environmental restrictions. **Strong task basis.** |
| 32 | Forestry, fisheries, and natural resources | Inventory stocks, growth, harvest, catch, and sustainable use. | Volume/biomass, growth, stocking density, catch per effort, yield, population rates. | Sampling method, species, season, measurement protocol, uncertainty, and regulatory limits. **Discovery hypothesis.** |
| 33 | Software development and programming | Estimate resource behavior, transform data, and reason about algorithms. | Runtime/complexity, memory, data sizes, encoding, throughput, date/time, numerical error. | Explain assumptions (input size, hardware, implementation), show complexity separately from measured runtime. **Strong task basis.** |
| 34 | Data engineering and databases | Plan storage, ingest, query, retention, and pipeline throughput. | Data volume, compression, row/column storage, transfer time, partitioning, retention, cost. | Schema, data types, compression ratio, growth, redundancy, and workload assumptions. **Strong task basis.** |
| 35 | Networking and telecommunications | Size links and reason about latency, throughput, addressing, and signals. | Subnet/CIDR, bandwidth, transfer time, latency, link budget, capacity, unit conversion. | Include protocol overhead, duplex, units (bit/byte), topology, and signal/environment assumptions. **Strong task basis.** |
| 36 | Cloud computing and DevOps | Plan workload resources and estimate cost across service configurations. | Monthly cloud cost, compute sizing, storage/egress, scaling, availability, backup, logs. | Region, current price-list timestamp, utilization, discounts/tax caveat, workload scenario comparison. **Documented** by [AWS](https://docs.aws.amazon.com/pricing-calculator/latest/userguide/getting-started.html) and [Google Cloud](https://docs.cloud.google.com/billing/docs/how-to/estimate-costs). |
| 37 | Cybersecurity configuration and capacity planning | Configure secure systems and quantify risk/control coverage. | Key/certificate expiry, entropy, storage/retention, capacity, risk scoring, patch/SLA windows. | Avoid false precision in risk scores; expose framework version and subjective inputs. Never label a system “secure” from a score alone. **Discovery hypothesis.** |
| 38 | Artificial intelligence and machine learning | Estimate model performance, data needs, inference resources, and cost. | Precision/recall/F1, confusion matrix, throughput/latency, GPU memory, tokens, inference cost, dataset split. | Task and class balance, threshold, provider/model/version, hardware, context, and live pricing. **Documented** by [Google ML metrics guidance](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall). |
| 39 | Business operations, pricing, and unit economics | Decide viability, pricing, margin, staffing, and operating levels. | Break-even, contribution margin, markup, gross margin, cash flow, inventory turns, scenario forecast. | Separate inputs from assumptions; sensitivity analysis and plain-language interpretation. **Documented** in the [US SBA break-even tool](https://bec.www.sba.gov/). |
| 40 | Accounting, bookkeeping, and tax | Reconcile records, calculate liabilities, and plan cash/payment timing. | Sales tax/VAT, payroll withholding, depreciation, margins, ledger reconciliation, estimated liability. | Jurisdiction, tax year, accounting basis, source updates, and boundaries between estimates and advice. **High consequence.** IRS tools are explicitly scoped to taxpayer situations [IRS estimator FAQ](https://www.irs.gov/individuals/tax-withholding-estimator-faqs). |
| 41 | Personal and corporate finance | Compare borrowing, saving, investing, and risk scenarios. | Loan payments, APR/interest, savings goals, compound growth, retirement, cash-flow scenarios. | Scenario ranges and inflation/fees/tax assumptions; no guaranteed returns or personalized recommendations. **High consequence.** [Investor.gov tools](https://www.investor.gov/free-financial-planning-tools). |
| 42 | Logistics and supply chain | Coordinate stock, transport, demand, and fulfillment. | Reorder points, safety stock, lead time, load/cube utilization, route cost, landed cost. | Lead-time distributions, service level, units, fuel/currency dates, and uncertainty. **Strong task basis.** |
| 43 | Project management and operations research | Allocate time/resources and choose among constrained plans. | Critical path, utilization, capacity, queueing, forecast variance, resource leveling, optimization. | Make objective function and constraints inspectable; scenario compare and explain tradeoffs. **Strong task basis.** |
| 44 | Real estate, mortgage, and property planning | Evaluate affordability, transaction cost, rent, cash flow, and property dimensions. | Mortgage payment, closing costs, rent-vs-buy, yield, area, tax/fee, renovation estimates. | Local fees/tax/rates, appreciation assumptions, maintenance, vacancy, and financing caveats. **High consequence;** CFPB provides consumer mortgage guidance [toolkit](https://www.consumerfinance.gov/documents/5982/cfpb_your-home-loan-toolkit.pdf). |
| 45 | Skilled trades (plumbing, electrical, fabrication) | Estimate job quantities, choose parts, verify fit, and quote work. | Pipe flow/pressure, wire/conduit sizing, material takeoff, angles, cut lists, labor/time, quote totals. | Mobile-first, glove-friendly controls; local code and product specification; safe preliminary-vs-approved distinction. **Strong task basis.** |
| 46 | Everyday conversions, cooking, and household projects | Adapt quantities and units to recipes, servings, products, or room dimensions. | Recipe scaling, volume/mass conversion, serving yield, area/volume, paint/material quantities, temperature. | Ingredient-specific densities; convert units with traceable exact/approximate factors. [NIST](https://www.nist.gov/pml/owm/metric-si/metric-kitchen/metric-kitchen-cooking-measurement-equivalencies) and [USDA Food Buying Guide](https://foodbuyingguide.fns.usda.gov/Home/About) document these tasks. |
| 47 | Travel, time, fitness, and sports calculations | Plan schedules, journeys, training, and performance comparisons. | Time-zone/date arithmetic, pace/speed, fuel cost, trip budget, score/rate, training zones. | Locale/time-zone databases, disclose personal estimation limits, separate general fitness estimates from clinical advice. **Mixed evidence / discovery hypothesis.** |
| 48 | VFX, CGI, animation, and motion design | Coordinate shot timing, motion, frame/timecode conventions, cameras, simulations, and render resources across creative tools and teams. | Frame/timecode conversions, retiming, motion paths/curves, shutter and blur timing, simulation scale/timestep, render time/storage/cost. | DCC-aware semantics, visual previews, exact fractional FPS, shot-level workflows, provenance/export. Keep artistic intent distinct from physics. **Documented task basis; demand size needs research.** See [VFX/CGI motion research](vfx-cgi-motion-research.md). |

## Cross-field reasons and product opportunities

| User reason | What a calculator typically needs | Differentiation opportunity |
|---|---|---|
| “I need a quick answer” | Few clear inputs, instant result, no account | Fast load, accessible input, smart defaults shown explicitly, result copy/share. |
| “I don’t know which formula applies” | Task/context prompts, method choice, units | Guided question flow that explains why it asks each question and exposes method selection. |
| “I need to avoid a mistake” | Validation, limits, units, independent check | Dimensional checks, range warnings, boundary examples, result sanity checks. |
| “I need to justify this result” | Sources, assumptions, derivation, version | Exportable calculation record with provenance, date, inputs, method and reviewer status. |
| “I need to compare options” | Common inputs and multiple scenarios | Side-by-side scenarios, sensitivity range, changed assumptions highlighted. |
| “My local context differs” | Jurisdiction, locale, units, language, pricing/data | Region-aware but user-confirmed settings; local aliases; explicit data timestamp. |
| “I repeat this task” | Reusable template or history | Private local presets, anonymous by default, editable/erasable history; no forced account. |
| “I need to learn” | Method steps and conceptual context | Progressive explanation: answer first, then steps, definitions, worked-example structure. |

## Multi-calculator tasks and complete workflows

Many real tasks do not end at the first numeric result. The user may need to transform inputs, run a sequence of calculations, compare alternatives, and communicate the final estimate. The product should recognize **task completion** as the user goal and make a chain of reviewed calculations work as one coherent workspace.

Examples of workflow patterns to research (illustrative patterns, not selected calculator products):

- **Measure → convert → estimate quantity → account for waste → compare material cost** (home projects, construction, agriculture).
- **Collect dimensions/conditions → calculate intermediate physical values → compare against a cited limit → generate a reviewable worksheet** (engineering and trades; high consequence where design decisions follow).
- **Define workload → estimate compute/storage/network use → apply region and pricing version → compare scenarios** (software, cloud, AI).
- **Enter costs/revenue assumptions → calculate margin and break-even → vary price/volume → export a planning summary** (small business).
- **Record observations and denominators → normalize units/population/time → calculate a descriptive measure → compare cohorts** (research and public health).
- **Enter servings and ingredient amounts → scale batch → convert units using ingredient-specific reference data → create a shopping quantity list** (cooking/food service).
- **Enter earnings and expenses → summarize cash flow → model a savings target or affordability scenario** (consumer finance; sensitive data, jurisdictional limits).

Workflow research should identify: the user's trigger and end goal; the actual step sequence and decision branches; information reused across steps; current spreadsheet/app handoffs; where users make unit, copy/paste, or assumption errors; which steps need separate sources/review; the acceptable interruption points; and what output must be saved/shared. Validate with observed task walkthroughs, not only a list of formula ideas.

The distinctive platform experience can include a task-oriented workflow map; typed value handoff with visible conversions; reusable private inputs; upstream/downstream dependency view; branch/scenario comparison; a “what changed” explanation; and one traceable report covering every step. Each step should remain independently usable, editable, skippable where safe, and reversible. Recommend a next step because it advances the user's task, and assess success using completion, correctness, return intent, and trust rather than time-on-page alone.

## What “thousands of calculators” should mean

Thousands of possible pages are plausible because one calculation family can vary by discipline, jurisdiction, units, scenario, and audience. Do not create thousands of near-duplicate formulas. Prefer a **smaller number of reviewed calculation primitives and composable workflows**, with localized interfaces and task-specific explanations. Catalog entries should be added only when they represent a distinct user task, a justified variant, or a meaningful jurisdiction/method difference. Group aliases and SEO landing pages around genuine user intent; do not mass-generate thin pages.

Count separately:

- **Calculation definitions:** distinct reviewed methods/formulas;
- **Workflows:** multi-step task paths composed from definitions;
- **Localized variants:** same method, translated or region-configured;
- **Content pages:** explanatory material and navigation.

This prevents a catalog number inflated by translation or superficial input-label changes.

## Differentiation blueprint

1. **Traceable by design:** show formula/method name, source section, version/date, assumptions, and test status with every professional result.
2. **Units that prevent mistakes:** auto-detect only when unambiguous; keep units visible; dimension-check; support locale-aware aliases; show conversions.
3. **Teach and do:** compact answer mode and expandable explanation mode; understandable to a novice without slowing experts.
4. **Scenario comparison:** let users compare two or more inputs and see which assumptions drive the change.
5. **Context-aware validation:** detect impossible/missing combinations and explain the issue without silently changing user values.
6. **Task-guided AI:** help users find an approved workflow, understand inputs, and interpret structured results with cited source records; require confirmation of parsed inputs and keep final numeric computation deterministic.
7. **Visual understanding:** show diagrams, curves, timelines, or 3D previews only where they clarify the actual problem; pair each visual with accessible text/data and explicit assumptions.
8. **Photo and live-camera measurements:** guide capture, use supported AR depth/plane tracking where available, let users confirm editable points/regions, and carry dimensions into a downstream workflow. Require a known scale or suitable calibration and show uncertainty; one arbitrary photo does not establish physical scale or depth. See [photo measurement research](photo-measurement-research.md).
9. **Workflow demonstrations:** short, captioned, transcribed demos for complex tasks, accompanied by written steps and accessible static alternatives.
10. **Privacy-first:** calculate locally where feasible; avoid collecting raw input values; allow reports to include provenance without embedding sensitive inputs in URLs.
11. **Source freshness:** date/version data such as rates, prices, guidelines, codes, and equipment specifications; expire or retire stale tools.
12. **Accessible anywhere:** keyboard/mobile/assistive support, printable reports, low-bandwidth behavior, and translation workflow.
13. **Honest uncertainty:** distinguish exact conversions, mathematical results, model estimates, and user-supplied assumptions; show ranges when warranted.
14. **Human governance:** every high-consequence module has a named qualified reviewer, review date, correction route, and public change record.

## How to research this at “thousands” scale

Do not attempt unstructured browsing for thousands of possible pages. Use a staged evidence pipeline:

1. **Field/task inventory:** start from the 48 groups and occupational task maps; create task statements in user language (“I need to estimate…”, “I need to check…”).
2. **Cluster into calculation families:** unify synonymous queries and avoid counting spelling, unit, or translation variants as separate calculator concepts unless the method or user job actually differs.
3. **Source discovery:** identify authoritative standards, textbooks, public agencies, professional bodies, reference datasets, and qualified reviewers for each family.
4. **Demand measurement:** measure query volume/trend and geography by task cluster; inspect actual results and competitor quality; interview users to verify pain and repeat frequency.
5. **Risk and feasibility gate:** assess consequence, regulation, data freshness, formula traceability, independent test cases, reviewer access, and monthly upkeep.
6. **Opportunity scoring:** demand, unmet need, repeat use, defensibility, monetization fit, and maintenance each scored with evidence/confidence. Safety/source/reviewer gates are mandatory and cannot be averaged away.
7. **Prototype validation:** test workflow comprehension and completion with real users before implementing the formula; independently verify math before publication.
8. **Portfolio planning:** select a small mix of high-demand accessible tasks and strategically valuable specialist fields; expand only within review and upkeep capacity.

The research ledger should record: field, task phrase, user segment, geography/language, calculation family, method/source, alternatives, demand metrics and date, competitor findings, risk class, reviewer, update burden, differentiation hypothesis, confidence, and decision status.

## Initial source set

- [University at Buffalo engineering equations and handbooks](https://research.lib.buffalo.edu/engineering/equations)
- [Missouri engineering calculation and spreadsheet good practices](https://engineering.missouri.edu/tech-toolbox/calculations-and-spreadsheets/)
- [FDA clinical decision-support software FAQ](https://www.fda.gov/medical-devices/software-medical-device-samd/clinical-decision-support-software-frequently-asked-questions-faqs)
- [CDC Field Epidemiology Manual](https://www.cdc.gov/field-epi-manual/php/chapters/describing-epi-data.html)
- [AHRQ PSNet medication administration errors](https://psnet.ahrq.gov/primer/medication-administration-errors)
- [NIOSH mine ventilation and dust control](https://www.cdc.gov/niosh/engcontrols/ecd/detail63.html)
- [Idaho Transportation Department construction cost estimating guide](https://apps.itd.idaho.gov/apps/manuals/Const-Cost-Estimating-Guide.pdf)
- [NIST metric cooking measurement equivalencies](https://www.nist.gov/pml/owm/metric-si/metric-kitchen/metric-kitchen-cooking-measurement-equivalencies)
- [USDA Food Buying Guide](https://foodbuyingguide.fns.usda.gov/Home/About)
- [Google Cloud cost estimation guidance](https://docs.cloud.google.com/billing/docs/how-to/estimate-costs)
- [Google ML classification metrics](https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall)
- [US Small Business Administration business planning and break-even](https://cdn.www.sba.gov/counseling/plan-your-business/)
- [IRS withholding estimator FAQs](https://www.irs.gov/individuals/tax-withholding-estimator-faqs)
- [Investor.gov planning tools](https://www.investor.gov/free-financial-planning-tools)
- [CFPB home loan toolkit](https://www.consumerfinance.gov/documents/5982/cfpb_your-home-loan-toolkit.pdf)

## Limits and next research stage

This catalog is broad but is not yet an exhaustive literature review for each field. It identifies why calculation work exists and the task families to investigate, not the most searched calculation in every specialty. The next stage should select research clusters—not calculators—and gather field-specific search, competitor, workflow, and source evidence. High-consequence areas need professional review before any calculator is specified.
