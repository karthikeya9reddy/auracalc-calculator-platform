# AuraCalc calculator catalog

The current public catalog contains 99 low-risk calculator definitions: the original 34 tools, a 50-calculator expansion, and a 15-calculator advanced mathematics and engineering batch. Newly added topics cover:

- Spring force and energy, momentum, impulse, near-Earth potential energy, circular motion, torque, rotational energy, pendulum period, thermal expansion, and sensible heat
- Hydrostatic pressure, buoyancy, volumetric and mass flow, pipe Reynolds number, idealized Bernoulli pressure change, pump power estimate, and steady one-layer conduction
- Triangle and trapezoid areas, slope grade, slab volume, tile quantity, mineral grade blending, contained-material recovery, and grade dilution
- DC power, charge transfer, series and parallel resistance, an unloaded voltage divider, capacitor charge and energy, ideal-gas pressure, and concentration-based pH
- Confusion-matrix metrics, LLM KV cache and dense inference arithmetic, render-farm time, image-sequence and bitrate-based storage, recipe scaling, compound-growth estimates, electricity cost, trip fuel, and weighted averages
- Right-triangle, sphere, cylinder, and cone geometry; ideal level-ground projectile motion; wave speed and period; photon energy; electrical energy; rotational power; lever advantage; a simple gear pair; thermal efficiency; chemistry percent yield; and ideal-gas density

The shared browser visualization engine renders accessible, responsive SVG schematics from calculation metadata and the verified calculation result. The visual layer never changes a numeric result. Definitions can opt in using `visualization: { kind, title, description }`; supported kinds are `diagram`, `geometry`, `motion`, `circuit`, `flow`, `thermal`, `process`, `capacity`, `trend`, and `balance`. Existing high-visual-value tools have profiles in `web/visual-system.mjs`; new definitions should declare their visual kind and accessible descriptive text. Heavy or specialized domains can register a calculator-specific SVG renderer with `registerVisualizationRenderer(calculatorId, renderer)` while keeping the same responsive, accessible result container. A visual is schematic unless the definition explicitly says otherwise. Inputs, units, method steps, assumptions, and source links remain the authoritative explanation.

The result-follow-up engine uses authored `nextSteps` metadata and a small reviewed set of common calculation chains. Each suggested transfer passes the same output/input dimension and unit checks as the existing workflow system. It does not send user inputs to a model or invent formulas. A hosted generative AI provider is not configured; connecting one requires an authenticated, privacy-reviewed service and a strict structured-output policy.

- `percentage-change` — signed change from a non-zero baseline
- `rectangle-area` — rectangle area and perimeter
- `rectangular-prism-volume` — base area multiplied by perpendicular depth
- `average-speed` — total distance divided by positive elapsed time
- `percentage-of-amount` — a stated percent of a user-entered number or amount
- `discount-price` — discount amount and final price from a user-entered rate
- `shared-bill-split` — equal shares after an optional, user-entered tip rate
- `sales-tax-estimate` — arithmetic estimate from a rate the user supplies; it does not determine applicable tax rules
- `markup-price` — adds a user-chosen markup rate to a cost amount
- `tip-calculator` — calculates a user-chosen tip and bill total
- `price-per-unit` — divides package price by a positive quantity entered in a consistent unit
- `average-acceleration`, `net-force`, `kinetic-energy`, `work-done`, and `mechanical-power` — introductory motion and mechanics
- `density`, `pressure-from-force-area`, `circle-area-circumference`, and `telescope-magnification` — dimensioned science and geometry
- `ohms-law` — solves one missing value from two in an ideal low-voltage resistive example
- `molarity`, `dilution`, `mass-percent-concentration`, and `moles-from-mass` — basic chemistry learning methods
- `break-even-analysis` and `gross-margin` — user-supplied business arithmetic
- `data-transfer-time`, `service-availability`, `model-weight-memory`, and `battery-runtime` — simplified software, AI, and energy estimates
- `ore-grade` — mass fraction for a user-defined sample; not a resource estimate or mine-planning method
- `frame-duration` and `shutter-exposure` — basic VFX and camera timing calculations

Each definition is source-linked, versioned, and covered by formula/reference tests. Each result now includes the formula, normalized input values, and ordered substitution/working steps. They carry R0 status and are intended for general learning or early estimates. Their release records describe developer self-review; no independent domain review is recorded. No medical, tax, structural, mine-safety, or other high-consequence method is published.

Everyday money tools treat price values as plain numbers in a user-supplied, unchanged currency. They do not identify or convert currencies, determine applicable jurisdiction-specific taxes or fees, or apply cash rounding. A whole-number input constraint is available for counts such as people in a split bill. Magnitude words such as “2 thousand,” “1.5 million,” “3 lakh,” and “2 crore” are accepted only on fields explicitly marked for scale input; arbitrary prose remains invalid.

`catalog/field-directory.mjs` is the 48-group research map. A mapped field does not mean it has a finished or verified calculator. The global unit converter is a shared utility backed by the curated, versioned unit registry; it is not a substitute for domain-specific formula review. New calculators increase live coverage for civil, mechanical, hydraulic/water resources, electrical, chemistry, mining, transportation, logistics, AI, statistics, VFX, energy, and household fields; specialized clinical, structural-design, geotechnical, and other higher-consequence gaps remain research scope pending qualified review.

Every public calculator must tag the research fields it genuinely supports in its `fields` metadata. The site builds the field directory from those tags, so selecting a field shows the full currently released set. Empty fields stay visible as research scope and offer a suggestion path; general-purpose tools are labeled as related tools rather than specialist coverage.

The dedicated `/fields/` directory lists and searches all 48 fields. Each field card opens a stable `/fields/<stable-slug>/` page with its current calculator list, a transparent empty state, and direct links back to the directory and home. Calculator detail pages link back to their tagged fields. Only field pages with released calculators enter the generated sitemap; empty research pages use `noindex,follow` until there is enough real coverage. Search ranking still depends on original, useful field content and site quality, not URLs alone.

Field tags are deliberately conservative: general-purpose arithmetic may appear in a related field when useful, but it is labeled as such. The average-speed tool is not classified as a traffic-engineering tool, package unit-price is not classified as a logistics calculator, and bill splitting/tipping are not classified as travel, fitness, or sports calculators.

Before adding a public method, follow `calculation-assurance-policy.md`: define intended use and exclusions, cite an authoritative source and edition, record units and numerical policy, add independently prepared expected cases, assign a risk class, and obtain the review required for that class. Higher-risk methods need qualified independent review. Never copy a test fixture into this catalog.
