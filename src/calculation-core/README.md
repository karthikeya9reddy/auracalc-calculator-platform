# Calculation core foundation

This dependency-free ES-module core is shared by the AuraCalc website and its test suite. It currently provides:

- Base-dimension vectors and dimension algebra
- A curated SI/common-unit registry with versioned linear and affine conversions
- Separate absolute-temperature and temperature-difference semantics
- Locale-aware finite-number parsing
- Dimension-aware quantity addition, subtraction, multiplication, division, and integer powers
- Calculator definition validation, immutable registry snapshots, release gates, and structured result provenance
- Published-calculator execution that normalizes and validates inputs and outputs
- Typed workflow handoffs that check dimensions, unit temperature roles, publication state, formula version, and optional source allowlists

The current product uses four R0 definitions in `catalog/public/`. They do not make this core suitable for field-specific decisions by themselves. Definitions must still meet the source, verification, and risk requirements in `calculation-assurance-policy.md`.

The core does **not** implement financial decimal arithmetic, rational arithmetic, complex numbers, symbolic algebra, vectors/matrices/tensors, numerical solvers, uncertainty propagation, or selectable high-precision backends. Precision and rounding policies are carried as metadata; a domain-specific formatter or numeric-policy engine is not yet implemented. Unit and locale coverage is intentionally incomplete.

Run the contract and catalog checks from the project root with `npm test`. Test-only fixtures stay under `test-fixtures/` and require explicit test mode.
