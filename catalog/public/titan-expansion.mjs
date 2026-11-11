import { CalculationError, getUnit } from '../../src/calculation-core/index.mjs';
import { educationalDefinition, calculated } from './educational-definition.mjs';
import { qin, qout, sin, sout } from './equation-definition.mjs';

const SOURCES = {
  math: ['OpenStax Precalculus 2e, vectors, sequences, and geometric relationships; NIST SI for unit conventions.', 'https://openstax.org/books/precalculus-2e/pages/8-key-concepts'],
  statistics: ['OpenStax Introductory Statistics, descriptive statistics and probability; NIST SI for unit conventions.', 'https://openstax.org/details/books/introductory-statistics'],
  finance: ['OpenStax Principles of Finance 2e, annuities and time value of money. Results are arithmetic scenarios, not financial advice.', 'https://openstax.org/books/principles-finance-2e/pages/8-2-annuities'],
  engineering: ['MIT OpenCourseWare, Mechanics of Materials and beam theory; this educational calculation is not a code-compliant design check.', 'https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/'],
  mechanical: ['OpenStax University Physics Volume 1, rotational motion, mechanics, and energy; NIST SI for unit conventions.', 'https://openstax.org/books/university-physics-volume-1/pages/10-introduction'],
  physics: ['OpenStax University Physics Volume 1, kinematics and gravitation; results use the explicitly stated idealized model.', 'https://openstax.org/books/university-physics-volume-1/pages/3-5-free-fall'],
  modernPhysics: ['OpenStax University Physics Volume 3, relativistic energy and photon relationships.', 'https://openstax.org/books/university-physics-volume-3/pages/5-9-relativistic-energy'],
  electric: ['OpenStax University Physics Volume 2, RC and RL circuits and electrical energy and power.', 'https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits'],
  chemistry: ['OpenStax Chemistry 2e, radioactive decay and first-order kinetics; decay results are not radiation-safety assessments.', 'https://openstax.org/books/chemistry-2e/pages/21-3-radioactive-decay'],
  software: ['NIST SI guidance supports the stated time and data-size units. The displayed capacity arithmetic is an ideal estimate based on user-supplied workloads and measured rates.', 'https://www.nist.gov/pml/special-publication-811'],
  parallel: ['Amdahl, “Validity of the single processor approach to achieving large scale computing capabilities,” establishes the parallel speedup relationship; the model assumes a fixed parallel fraction and no overhead.', 'https://doi.org/10.1145/1465482.1465560'],
  base64: ['RFC 4648 specifies Base64 encoding in four-character output groups for each three input octets, including padding of a final partial group.', 'https://www.rfc-editor.org/rfc/rfc4648'],
  networking: ['IPv4 prefix lengths and power-of-two address block sizes follow RFC 4632. This estimate excludes reserved addresses and deployment policy beyond the explicit host convention.', 'https://www.rfc-editor.org/rfc/rfc4632'],
  business: ['Scenario arithmetic uses explicitly stated customer, pricing, and time-period assumptions; results are not forecasts or financial advice.', 'https://chartmogul.com/saas-metrics/ltv/'],
  accounting: ['OpenStax Principles of Managerial Accounting, contribution margin per unit and contribution margin ratio.', 'https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin'],
  inventory: ['OpenStax Principles of Finance 2e, inventory management and economic order quantity as an inventory-planning model.', 'https://openstax.org/books/principles-finance-2e/pages/19-5-inventory-management'],
  saas: ['ChartMogul SaaS metric definitions for LTV, ARR run-rate, churn, and recurring-revenue scenarios. Definitions vary by business model and accounting policy.', 'https://chartmogul.com/saas-metrics/ltv/'],
  chemistrySolutions: ['OpenStax Chemistry 2e, solution concentration, molarity, dilution, and concentration units. Chemical compatibility, activities, and laboratory procedures are not evaluated.', 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity'],
  materials: ['NIST SI unit conventions and direct mass-balance or geometry relationships. Mining and construction outputs are planning estimates; material behavior, codes, and site conditions are not inferred.', 'https://www.nist.gov/pml/special-publication-811'],
  agriculture: ['NIST SI unit conventions; area-yield and label-percentage calculations use the user-entered values. Product instructions, agronomy, and site conditions are not inferred.', 'https://www.nist.gov/pml/special-publication-811'],
};

const specifications = [
  {
    id: 'vector-magnitude-3d', title: 'Three-dimensional vector magnitude', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Vectors', formula: '|v| = √(x² + y² + z²)', source: 'math', visualization: 'diagram',
    inputs: [['x', 'x component', '1', { min: undefined }], ['y', 'y component', '1', { min: undefined }], ['z', 'z component', '1', { min: undefined }]], outputs: [['magnitude', 'Vector magnitude', '1']], solve: v => Math.hypot(v.x, v.y, v.z), example: { inputs: { x: 2, y: 3, z: 6 }, expected: 7 },
  },
  {
    id: 'vector-dot-product-3d', title: 'Three-dimensional vector dot product', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Vectors', formula: 'a · b = ax bx + ay by + az bz', source: 'math', visualization: 'diagram',
    inputs: [['ax', 'Vector A · x component', '1', { min: undefined }], ['ay', 'Vector A · y component', '1', { min: undefined }], ['az', 'Vector A · z component', '1', { min: undefined }], ['bx', 'Vector B · x component', '1', { min: undefined }], ['by', 'Vector B · y component', '1', { min: undefined }], ['bz', 'Vector B · z component', '1', { min: undefined }]], outputs: [['dot-product', 'Dot product', '1']], solve: v => v.ax * v.bx + v.ay * v.by + v.az * v.bz, example: { inputs: { ax: 1, ay: 2, az: 3, bx: 4, by: -1, bz: 2 }, expected: 8 },
  },
  {
    id: 'vector-cross-product-magnitude-3d', title: 'Three-dimensional cross-product magnitude', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Vectors', formula: '|a × b| = √((ay bz − az by)² + (az bx − ax bz)² + (ax by − ay bx)²)', source: 'math', visualization: 'diagram',
    inputs: [['ax', 'Vector A · x component', '1', { min: undefined }], ['ay', 'Vector A · y component', '1', { min: undefined }], ['az', 'Vector A · z component', '1', { min: undefined }], ['bx', 'Vector B · x component', '1', { min: undefined }], ['by', 'Vector B · y component', '1', { min: undefined }], ['bz', 'Vector B · z component', '1', { min: undefined }]], outputs: [['cross-magnitude', 'Cross-product magnitude', '1']], solve: v => Math.hypot(v.ay * v.bz - v.az * v.by, v.az * v.bx - v.ax * v.bz, v.ax * v.by - v.ay * v.bx), example: { inputs: { ax: 1, ay: 0, az: 0, bx: 0, by: 1, bz: 0 }, expected: 1 },
  },
  {
    id: 'angle-between-vectors-2d', title: 'Angle between two 2D vectors', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Vectors', formula: 'θ = arccos((a · b) ÷ (|a||b|))', source: 'math', visualization: 'diagram',
    inputs: [['ax', 'Vector A · x component', '1', { min: undefined }], ['ay', 'Vector A · y component', '1', { min: undefined }], ['bx', 'Vector B · x component', '1', { min: undefined }], ['by', 'Vector B · y component', '1', { min: undefined }]], outputs: [['angle', 'Smaller angle between vectors', 'rad']], solve: v => { const ma = Math.hypot(v.ax, v.ay), mb = Math.hypot(v.bx, v.by); if (!ma || !mb) throw new CalculationError('ZERO_VECTOR', 'Both vectors must have non-zero magnitude.'); return Math.acos(Math.max(-1, Math.min(1, (v.ax * v.bx + v.ay * v.by) / (ma * mb)))); }, example: { inputs: { ax: 1, ay: 0, bx: 0, by: 1 }, expected: Math.PI / 2 },
  },
  {
    id: 'triangle-angle-cosine-rule', title: 'Triangle angle from three sides', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Civil engineering', 'Geology, surveying, and geospatial work'], category: 'Triangle geometry', formula: 'A = arccos((b² + c² − a²) ÷ (2bc))', source: 'math', visualization: 'geometry',
    inputs: [['opposite-side', 'Side opposite the angle', 'm'], ['adjacent-side-1', 'First adjacent side', 'm'], ['adjacent-side-2', 'Second adjacent side', 'm']], outputs: [['angle', 'Included angle', 'rad']], solve: v => { const { 'opposite-side': a, 'adjacent-side-1': b, 'adjacent-side-2': c } = v; if (a >= b + c || b >= a + c || c >= a + b) throw new CalculationError('INVALID_TRIANGLE', 'The three side lengths must satisfy the triangle inequality.'); return Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))); }, example: { inputs: { 'opposite-side': 5, 'adjacent-side-1': 3, 'adjacent-side-2': 4 }, expected: Math.PI / 2 },
  },
  {
    id: 'triangle-area-heron', title: 'Triangle area from three sides', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Civil engineering', 'Geology, surveying, and geospatial work'], category: 'Triangle geometry', formula: 'A = √(s(s−a)(s−b)(s−c)), where s = (a+b+c) ÷ 2', source: 'math', visualization: 'geometry',
    inputs: [['side-a', 'First side length', 'm'], ['side-b', 'Second side length', 'm'], ['side-c', 'Third side length', 'm']], outputs: [['area', 'Triangle area', 'm2']], solve: v => { const s = (v['side-a'] + v['side-b'] + v['side-c']) / 2; if (s <= Math.max(v['side-a'], v['side-b'], v['side-c'])) throw new CalculationError('INVALID_TRIANGLE', 'The side lengths must form a non-degenerate triangle.'); return Math.sqrt(s * (s - v['side-a']) * (s - v['side-b']) * (s - v['side-c'])); }, example: { inputs: { 'side-a': 3, 'side-b': 4, 'side-c': 5 }, expected: 6 },
  },
  {
    id: 'arithmetic-sequence-nth-term', title: 'Arithmetic sequence nth term', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Education, assessment, and learning'], category: 'Sequences', formula: 'aₙ = a₁ + (n − 1)d', source: 'math', visualization: 'trend',
    inputs: [['first-term', 'First term', '1', { min: undefined }], ['common-difference', 'Common difference', '1', { min: undefined }], ['term-number', 'Term number n', '1', { min: 1, integer: true }]], outputs: [['term', 'Nth term', '1']], solve: v => v['first-term'] + (v['term-number'] - 1) * v['common-difference'], example: { inputs: { 'first-term': 5, 'common-difference': 3, 'term-number': 8 }, expected: 26 },
  },
  {
    id: 'arithmetic-sequence-finite-sum', title: 'Finite arithmetic sequence sum', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Education, assessment, and learning'], category: 'Sequences', formula: 'Sₙ = n(a₁ + aₙ) ÷ 2', source: 'math', visualization: 'trend',
    inputs: [['first-term', 'First term', '1', { min: undefined }], ['common-difference', 'Common difference', '1', { min: undefined }], ['term-count', 'Number of terms', '1', { min: 1, integer: true }]], outputs: [['sum', 'Finite sequence sum', '1']], solve: v => v['term-count'] * (2 * v['first-term'] + (v['term-count'] - 1) * v['common-difference']) / 2, example: { inputs: { 'first-term': 2, 'common-difference': 3, 'term-count': 5 }, expected: 40 },
  },
  {
    id: 'geometric-sequence-nth-term', title: 'Geometric sequence nth term', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Education, assessment, and learning'], category: 'Sequences', formula: 'aₙ = a₁ r^(n−1)', source: 'math', visualization: 'trend',
    inputs: [['first-term', 'First term', '1', { min: undefined }], ['common-ratio', 'Common ratio', '1', { min: undefined }], ['term-number', 'Term number n', '1', { min: 1, integer: true, max: 1000 }]], outputs: [['term', 'Nth term', '1']], solve: v => v['first-term'] * v['common-ratio'] ** (v['term-number'] - 1), example: { inputs: { 'first-term': 3, 'common-ratio': 2, 'term-number': 6 }, expected: 96 },
  },
  {
    id: 'geometric-sequence-finite-sum', title: 'Finite geometric sequence sum', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Education, assessment, and learning'], category: 'Sequences', formula: 'Sₙ = a₁(1 − rⁿ) ÷ (1 − r); if r = 1, Sₙ = na₁', source: 'math', visualization: 'trend',
    inputs: [['first-term', 'First term', '1', { min: undefined }], ['common-ratio', 'Common ratio', '1', { min: undefined }], ['term-count', 'Number of terms', '1', { min: 1, integer: true, max: 1000 }]], outputs: [['sum', 'Finite sequence sum', '1']], solve: v => v['common-ratio'] === 1 ? v['term-count'] * v['first-term'] : v['first-term'] * (1 - v['common-ratio'] ** v['term-count']) / (1 - v['common-ratio']), example: { inputs: { 'first-term': 2, 'common-ratio': 3, 'term-count': 4 }, expected: 80 },
  },
  {
    id: 'harmonic-mean-two-values', title: 'Harmonic mean of two values', discipline: 'Mathematics', fields: ['Mathematics and arithmetic', 'Statistics and data analysis'], category: 'Averages', formula: 'H = 2 ÷ (1/x₁ + 1/x₂)', source: 'statistics', visualization: 'balance',
    inputs: [['value-1', 'First positive value', '1', { min: Number.MIN_VALUE }], ['value-2', 'Second positive value', '1', { min: Number.MIN_VALUE }]], outputs: [['mean', 'Harmonic mean', '1']], solve: v => 2 / (1 / v['value-1'] + 1 / v['value-2']), example: { inputs: { 'value-1': 3, 'value-2': 6 }, expected: 4 },
  },
  {
    id: 'population-variance-three-values', title: 'Population variance of three values', discipline: 'Statistics', fields: ['Statistics and data analysis', 'Mathematics and arithmetic'], category: 'Descriptive statistics', formula: 'σ² = Σ(xᵢ − μ)² ÷ N', source: 'statistics', visualization: 'trend',
    inputs: [['value-1', 'Value 1', '1', { min: undefined }], ['value-2', 'Value 2', '1', { min: undefined }], ['value-3', 'Value 3', '1', { min: undefined }]], outputs: [['variance', 'Population variance', '1']], solve: v => { const a = [v['value-1'], v['value-2'], v['value-3']]; const mean = a.reduce((s, x) => s + x, 0) / a.length; return a.reduce((s, x) => s + (x - mean) ** 2, 0) / a.length; }, example: { inputs: { 'value-1': 2, 'value-2': 4, 'value-3': 6 }, expected: 8 / 3 },
  },
  {
    id: 'population-standard-deviation-three-values', title: 'Population standard deviation of three values', discipline: 'Statistics', fields: ['Statistics and data analysis', 'Mathematics and arithmetic'], category: 'Descriptive statistics', formula: 'σ = √(Σ(xᵢ − μ)² ÷ N)', source: 'statistics', visualization: 'trend',
    inputs: [['value-1', 'Value 1', '1', { min: undefined }], ['value-2', 'Value 2', '1', { min: undefined }], ['value-3', 'Value 3', '1', { min: undefined }]], outputs: [['standard-deviation', 'Population standard deviation', '1']], solve: v => { const a = [v['value-1'], v['value-2'], v['value-3']]; const mean = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - mean) ** 2, 0) / a.length); }, example: { inputs: { 'value-1': 2, 'value-2': 4, 'value-3': 6 }, expected: Math.sqrt(8 / 3) },
  },
  {
    id: 'coefficient-of-variation-three-values', title: 'Coefficient of variation for three values', discipline: 'Statistics', fields: ['Statistics and data analysis', 'Mathematics and arithmetic'], category: 'Descriptive statistics', formula: 'CV = σ ÷ |μ| × 100%', source: 'statistics', visualization: 'trend', outputFormat: 'percent',
    inputs: [['value-1', 'Value 1', '1', { min: undefined }], ['value-2', 'Value 2', '1', { min: undefined }], ['value-3', 'Value 3', '1', { min: undefined }]], outputs: [['coefficient', 'Population coefficient of variation', '1']], solve: v => { const a = [v['value-1'], v['value-2'], v['value-3']]; const mean = a.reduce((s, x) => s + x, 0) / a.length; if (mean === 0) throw new CalculationError('DIVISION_BY_ZERO', 'The mean must not be zero for a coefficient of variation.'); const sd = Math.sqrt(a.reduce((s, x) => s + (x - mean) ** 2, 0) / a.length); return sd / Math.abs(mean); }, example: { inputs: { 'value-1': 2, 'value-2': 4, 'value-3': 6 }, expected: Math.sqrt(8 / 3) / 4 },
  },
  {
    id: 'binomial-exact-probability', title: 'Binomial probability of exactly k successes', discipline: 'Statistics', fields: ['Statistics and data analysis', 'Mathematics and arithmetic'], category: 'Probability', formula: 'P(X=k) = C(n,k) pᵏ(1−p)ⁿ⁻ᵏ', source: 'statistics', visualization: 'trend', outputFormat: 'percent',
    inputs: [['trial-count', 'Independent trial count n', '1', { min: 1, integer: true, max: 170 }], ['success-count', 'Success count k', '1', { min: 0, integer: true }], ['success-probability', 'Success probability p (0 to 1)', '1', { min: 0, max: 1 }]], outputs: [['probability', 'Probability of exactly k successes', '1']], solve: v => { const n = v['trial-count'], k = v['success-count'], p = v['success-probability']; if (k > n) throw new CalculationError('SUCCESS_COUNT_EXCEEDS_TRIALS', 'The success count cannot exceed the trial count.'); let combination = 1; for (let i = 1; i <= k; i++) combination *= (n - k + i) / i; return combination * p ** k * (1 - p) ** (n - k); }, example: { inputs: { 'trial-count': 4, 'success-count': 2, 'success-probability': 0.5 }, expected: 0.375 },
  },
  {
    id: 'ordinary-annuity-future-value', title: 'Future value of regular deposits', discipline: 'Finance', fields: ['Personal and corporate finance', 'Business operations, pricing, and unit economics'], category: 'Annuities', formula: 'FV = PMT × ((1+r)ⁿ − 1) ÷ r; if r = 0, FV = PMT × n', source: 'finance', visualization: 'trend',
    inputs: [['deposit', 'Deposit each period (same currency)', '1'], ['periodic-rate', 'Rate per period as a fraction (5% = 0.05)', '1', { min: undefined }], ['period-count', 'Number of deposits', '1', { min: 1, integer: true, max: 10000 }]], outputs: [['future-value', 'Future value of deposits (same currency)', '1']], solve: v => { if (v['periodic-rate'] <= -1) throw new CalculationError('RATE_OUT_OF_RANGE', 'The rate per period must be greater than −100%.'); return v.deposit * (v['periodic-rate'] === 0 ? v['period-count'] : ((1 + v['periodic-rate']) ** v['period-count'] - 1) / v['periodic-rate']); }, example: { inputs: { deposit: 100, 'periodic-rate': 0.1, 'period-count': 2 }, expected: 210 },
  },
  {
    id: 'ordinary-annuity-present-value', title: 'Present value of regular payments', discipline: 'Finance', fields: ['Personal and corporate finance', 'Business operations, pricing, and unit economics'], category: 'Annuities', formula: 'PV = PMT × (1 − (1+r)⁻ⁿ) ÷ r; if r = 0, PV = PMT × n', source: 'finance', visualization: 'trend',
    inputs: [['payment', 'Payment each period (same currency)', '1'], ['periodic-rate', 'Rate per period as a fraction (5% = 0.05)', '1', { min: undefined }], ['period-count', 'Number of payments', '1', { min: 1, integer: true, max: 10000 }]], outputs: [['present-value', 'Present value of payments (same currency)', '1']], solve: v => { if (v['periodic-rate'] <= -1) throw new CalculationError('RATE_OUT_OF_RANGE', 'The rate per period must be greater than −100%.'); return v.payment * (v['periodic-rate'] === 0 ? v['period-count'] : (1 - (1 + v['periodic-rate']) ** -v['period-count']) / v['periodic-rate']); }, example: { inputs: { payment: 100, 'periodic-rate': 0.1, 'period-count': 2 }, expected: 100 * (1 - 1 / 1.21) / 0.1 },
  },
  {
    id: 'loan-balance-after-payments', title: 'Loan balance after a number of payments', discipline: 'Finance', fields: ['Personal and corporate finance', 'Real estate, mortgage, and property planning'], category: 'Loan planning', formula: 'Bₖ = P(1+r)ᵏ − PMT × ((1+r)ᵏ − 1) ÷ r; if r = 0, Bₖ = P − k·PMT', source: 'finance', visualization: 'trend',
    inputs: [['principal', 'Starting loan principal (same currency)', '1'], ['payment', 'Payment each period (same currency)', '1'], ['periodic-rate', 'Rate per period as a fraction (5% = 0.05)', '1', { min: 0 }], ['payments-made', 'Payments already made', '1', { min: 0, integer: true, max: 10000 }]], outputs: [['balance', 'Calculated balance after payments (same currency)', '1']], solve: v => { const r = v['periodic-rate'], k = v['payments-made']; return r === 0 ? v.principal - k * v.payment : v.principal * (1 + r) ** k - v.payment * (((1 + r) ** k - 1) / r); }, example: { inputs: { principal: 1000, payment: 100, 'periodic-rate': 0.1, 'payments-made': 2 }, expected: 1000 * 1.21 - 100 * 2.1 },
  },
  {
    id: 'annualized-growth-rate', title: 'Annualized growth rate from start and end values', discipline: 'Finance', fields: ['Personal and corporate finance', 'Business operations, pricing, and unit economics'], category: 'Growth analysis', formula: 'g = ((ending ÷ starting)^(1/years) − 1) × 100%', source: 'finance', visualization: 'trend', outputFormat: 'percent',
    inputs: [['starting-value', 'Starting value', '1'], ['ending-value', 'Ending value', '1'], ['elapsed-years', 'Elapsed years', 'year_julian', { min: Number.MIN_VALUE }]], outputs: [['annualized-growth', 'Annualized growth rate', '1']], solve: v => { if (!(v['starting-value'] > 0 && v['ending-value'] > 0)) throw new CalculationError('POSITIVE_VALUE_REQUIRED', 'Starting and ending values must both be greater than zero.'); return (v['ending-value'] / v['starting-value']) ** (1 / v['elapsed-years']) - 1; }, example: { inputs: { 'starting-value': 100, 'ending-value': 121, 'elapsed-years': 2 }, expected: 0.1 },
  },
  {
    id: 'real-return-from-inflation', title: 'Inflation-adjusted real return', discipline: 'Finance', fields: ['Personal and corporate finance', 'Business operations, pricing, and unit economics'], category: 'Return analysis', formula: 'rreal = (1 + rnominal) ÷ (1 + inflation) − 1', source: 'finance', visualization: 'trend', outputFormat: 'percent',
    inputs: [['nominal-return', 'Nominal return per period as a fraction', '1', { min: undefined }], ['inflation-rate', 'Inflation per period as a fraction', '1', { min: undefined }]], outputs: [['real-return', 'Real return per period', '1']], solve: v => { if (v['nominal-return'] <= -1) throw new CalculationError('RATE_OUT_OF_RANGE', 'Nominal return must be greater than −100%.'); if (v['inflation-rate'] <= -1) throw new CalculationError('RATE_OUT_OF_RANGE', 'Inflation must be greater than −100% for this relationship.'); return (1 + v['nominal-return']) / (1 + v['inflation-rate']) - 1; }, example: { inputs: { 'nominal-return': 0.08, 'inflation-rate': 0.03 }, expected: 1.08 / 1.03 - 1 },
  },
  {
    id: 'paving-material-mass-estimate', title: 'Paving material mass estimate', discipline: 'Civil engineering', fields: ['Civil engineering', 'Construction estimating and quantity surveying'], category: 'Materials takeoff', formula: 'm = A × t × ρ', source: 'engineering', visualization: 'geometry',
    inputs: [['paved-area', 'Paved plan area', 'm2'], ['layer-thickness', 'Compacted layer thickness', 'm'], ['bulk-density', 'Material bulk density', 'kg/m3']], outputs: [['mass', 'Estimated material mass', 'kg']], solve: v => v['paved-area'] * v['layer-thickness'] * v['bulk-density'], example: { inputs: { 'paved-area': 10, 'layer-thickness': 0.05, 'bulk-density': 2400 }, expected: 1200 },
  },
  {
    id: 'circular-pipe-internal-volume', title: 'Circular pipe internal volume', discipline: 'Civil engineering', fields: ['Civil engineering', 'Water resources and hydraulic engineering', 'Construction estimating and quantity surveying'], category: 'Pipe geometry', formula: 'V = πD²L ÷ 4', source: 'engineering', visualization: 'geometry',
    inputs: [['internal-diameter', 'Pipe internal diameter', 'm'], ['pipe-length', 'Pipe length', 'm']], outputs: [['volume', 'Internal volume', 'm3']], solve: v => Math.PI * v['internal-diameter'] ** 2 * v['pipe-length'] / 4, example: { inputs: { 'internal-diameter': 0.2, 'pipe-length': 10 }, expected: Math.PI * 0.2 ** 2 * 10 / 4 },
  },
  {
    id: 'annular-cross-section-area', title: 'Annular cross-section area', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Civil engineering', 'Manufacturing and industrial engineering'], category: 'Section geometry', formula: 'A = π(Dₒ² − Dᵢ²) ÷ 4', source: 'engineering', visualization: 'geometry',
    inputs: [['outer-diameter', 'Outer diameter', 'm'], ['inner-diameter', 'Inner diameter', 'm']], outputs: [['area', 'Annular area', 'm2']], solve: v => { if (v['inner-diameter'] >= v['outer-diameter']) throw new CalculationError('INVALID_DIAMETERS', 'Outer diameter must be greater than inner diameter.'); return Math.PI * (v['outer-diameter'] ** 2 - v['inner-diameter'] ** 2) / 4; }, example: { inputs: { 'outer-diameter': 0.2, 'inner-diameter': 0.1 }, expected: Math.PI * (0.2 ** 2 - 0.1 ** 2) / 4 },
  },
  {
    id: 'trapezoidal-trench-volume', title: 'Trapezoidal trench excavation volume', discipline: 'Civil engineering', fields: ['Civil engineering', 'Geotechnical engineering', 'Construction estimating and quantity surveying'], category: 'Earthworks', formula: 'V = L × d × (b + t) ÷ 2', source: 'engineering', visualization: 'geometry',
    inputs: [['trench-length', 'Trench length', 'm'], ['depth', 'Trench depth', 'm'], ['bottom-width', 'Trench bottom width', 'm'], ['top-width', 'Trench top width', 'm']], outputs: [['volume', 'In-place excavation volume', 'm3']], solve: v => { if (v['top-width'] < v['bottom-width']) throw new CalculationError('INVALID_TRENCH_WIDTH', 'Top width must be at least the bottom width for this trapezoid model.'); return v['trench-length'] * v.depth * (v['bottom-width'] + v['top-width']) / 2; }, example: { inputs: { 'trench-length': 10, depth: 2, 'bottom-width': 0.5, 'top-width': 1 }, expected: 15 },
  },
  {
    id: 'earthwork-bulking-volume', title: 'Loose earth volume after bulking', discipline: 'Civil engineering', fields: ['Civil engineering', 'Geotechnical engineering', 'Construction estimating and quantity surveying'], category: 'Earthworks', formula: 'Vloose = Vbank × (1 + bulking fraction)', source: 'engineering', visualization: 'geometry',
    inputs: [['bank-volume', 'In-place bank volume', 'm3'], ['bulking-fraction', 'Bulking fraction (20% = 0.20)', '1', { max: 5 }]], outputs: [['loose-volume', 'Estimated loose volume', 'm3']], solve: v => v['bank-volume'] * (1 + v['bulking-fraction']), example: { inputs: { 'bank-volume': 100, 'bulking-fraction': 0.25 }, expected: 125 },
  },
  {
    id: 'compacted-fill-dry-mass', title: 'Compacted fill dry mass estimate', discipline: 'Civil engineering', fields: ['Civil engineering', 'Geotechnical engineering', 'Construction estimating and quantity surveying'], category: 'Earthworks', formula: 'mdry = Vcompacted × ρdry', source: 'engineering', visualization: 'geometry',
    inputs: [['compacted-volume', 'Compacted fill volume', 'm3'], ['dry-density', 'Specified dry density', 'kg/m3']], outputs: [['dry-mass', 'Dry solids mass estimate', 'kg']], solve: v => v['compacted-volume'] * v['dry-density'], example: { inputs: { 'compacted-volume': 2, 'dry-density': 1800 }, expected: 3600 },
  },
  {
    id: 'wall-heat-transfer-rate', title: 'Heat transfer through a wall', discipline: 'Building physics', fields: ['HVAC and building services', 'Energy systems and utilities', 'Architecture and building design'], category: 'Building heat flow', formula: 'Q̇ = U × A × ΔT', source: 'engineering', visualization: 'thermal',
    inputs: [['u-value', 'Overall heat transfer coefficient', 'W/m2K'], ['wall-area', 'Wall area', 'm2'], ['temperature-difference', 'Indoor–outdoor temperature difference', 'deltaK']], outputs: [['heat-rate', 'Heat transfer rate', 'W']], solve: v => v['u-value'] * v['wall-area'] * v['temperature-difference'], example: { inputs: { 'u-value': 2, 'wall-area': 10, 'temperature-difference': 20 }, expected: 400 },
  },
  {
    id: 'ventilation-flow-from-air-changes', title: 'Ventilation flow from air changes per hour', discipline: 'Building services', fields: ['HVAC and building services', 'Architecture and building design'], category: 'Ventilation', formula: 'Q = ACH × room volume ÷ 3600', source: 'engineering', visualization: 'flow',
    inputs: [['room-volume', 'Room volume', 'm3'], ['air-changes', 'Air changes per hour (1/h)', '1']], outputs: [['flow-rate', 'Required idealized airflow', 'm3/s']], solve: v => v['room-volume'] * v['air-changes'] / 3600, example: { inputs: { 'room-volume': 90, 'air-changes': 2 }, expected: 0.05 },
  },
  {
    id: 'pitched-roof-area-from-plan', title: 'Single-slope roof area from plan area', discipline: 'Architecture', fields: ['Architecture and building design', 'Construction estimating and quantity surveying'], category: 'Roof geometry', formula: 'Aroof = Aplan × √(1 + (rise ÷ run)²)', source: 'engineering', visualization: 'geometry',
    inputs: [['plan-area', 'Horizontal plan area', 'm2'], ['rise', 'Rise over the stated run', 'm'], ['run', 'Horizontal run', 'm']], outputs: [['roof-area', 'Sloped roof surface area', 'm2']], solve: v => v['plan-area'] * Math.hypot(1, v.rise / v.run), example: { inputs: { 'plan-area': 20, rise: 3, run: 4 }, expected: 25 },
  },
  {
    id: 'rain-runoff-volume-with-coefficient', title: 'Rain runoff volume with a runoff coefficient', discipline: 'Water resources', fields: ['Water resources and hydraulic engineering', 'Environmental engineering and science', 'Agriculture and crop science'], category: 'Stormwater estimate', formula: 'Vrunoff = C × A × rainfall depth', source: 'engineering', visualization: 'flow',
    inputs: [['catchment-area', 'Catchment area', 'm2'], ['rainfall-depth', 'Rainfall depth', 'm'], ['runoff-coefficient', 'Runoff coefficient (0 to 1)', '1', { max: 1 }]], outputs: [['runoff-volume', 'Estimated runoff volume', 'm3']], solve: v => v['catchment-area'] * v['rainfall-depth'] * v['runoff-coefficient'], example: { inputs: { 'catchment-area': 1000, 'rainfall-depth': 0.01, 'runoff-coefficient': 0.8 }, expected: 8 },
  },
  {
    id: 'axial-normal-stress', title: 'Axial normal stress from force and area', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering', 'Mechanical engineering'], category: 'Mechanics of materials', formula: 'σ = F ÷ A', source: 'engineering', visualization: 'diagram',
    inputs: [['axial-force', 'Axial force magnitude', 'N'], ['cross-section-area', 'Cross-section area', 'm2']], outputs: [['stress', 'Average axial stress', 'Pa']], solve: v => v['axial-force'] / v['cross-section-area'], example: { inputs: { 'axial-force': 1000, 'cross-section-area': 0.01 }, expected: 100000 },
  },
  {
    id: 'engineering-normal-strain', title: 'Engineering normal strain', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering', 'Mechanical engineering'], category: 'Mechanics of materials', formula: 'ε = ΔL ÷ L₀', source: 'engineering', visualization: 'motion',
    inputs: [['extension', 'Change in length', 'm'], ['original-length', 'Original length', 'm']], outputs: [['strain', 'Engineering normal strain', '1']], solve: v => v.extension / v['original-length'], example: { inputs: { extension: 0.002, 'original-length': 2 }, expected: 0.001 },
  },
  {
    id: 'young-modulus-from-stress-strain', title: 'Young’s modulus from stress and strain', discipline: 'Materials engineering', fields: ['Materials science and metallurgy', 'Structural engineering', 'Mechanical engineering'], category: 'Mechanics of materials', formula: 'E = σ ÷ ε', source: 'engineering', visualization: 'trend',
    inputs: [['normal-stress', 'Normal stress in the linear-elastic range', 'Pa'], ['normal-strain', 'Normal strain (dimensionless)', '1', { min: Number.MIN_VALUE }]], outputs: [['young-modulus', 'Young’s modulus estimate', 'Pa']], solve: v => v['normal-stress'] / v['normal-strain'], example: { inputs: { 'normal-stress': 100_000_000, 'normal-strain': 0.0005 }, expected: 200_000_000_000 },
  },
  {
    id: 'elastic-bar-axial-elongation', title: 'Elastic axial elongation of a uniform bar', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering', 'Mechanical engineering'], category: 'Mechanics of materials', formula: 'δ = FL ÷ (AE)', source: 'engineering', visualization: 'motion',
    inputs: [['axial-force', 'Axial force magnitude', 'N'], ['bar-length', 'Bar length', 'm'], ['cross-section-area', 'Cross-section area', 'm2'], ['young-modulus', 'Young’s modulus', 'Pa']], outputs: [['elongation', 'Ideal elastic elongation', 'm']], solve: v => v['axial-force'] * v['bar-length'] / (v['cross-section-area'] * v['young-modulus']), example: { inputs: { 'axial-force': 10_000, 'bar-length': 2, 'cross-section-area': 0.01, 'young-modulus': 200_000_000_000 }, expected: 0.00001 },
  },
  {
    id: 'cantilever-end-load-moment', title: 'Cantilever end-load bending moment', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering'], category: 'Beam statics', formula: 'Mfixed = F × L', source: 'engineering', visualization: 'diagram',
    inputs: [['end-load', 'Transverse end load magnitude', 'N'], ['cantilever-length', 'Cantilever length', 'm']], outputs: [['moment', 'Fixed-end bending moment magnitude', 'Nm']], solve: v => v['end-load'] * v['cantilever-length'], example: { inputs: { 'end-load': 500, 'cantilever-length': 2 }, expected: 1000 },
  },
  {
    id: 'elastic-beam-bending-stress', title: 'Elastic beam bending stress at a section point', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering', 'Mechanical engineering'], category: 'Mechanics of materials', formula: 'σ = Mc ÷ I', source: 'engineering', visualization: 'diagram',
    inputs: [['bending-moment', 'Bending moment magnitude', 'Nm'], ['neutral-axis-distance', 'Distance from neutral axis', 'm'], ['second-moment-area', 'Second moment of area', 'm4']], outputs: [['bending-stress', 'Elastic bending stress magnitude', 'Pa']], solve: v => v['bending-moment'] * v['neutral-axis-distance'] / v['second-moment-area'], example: { inputs: { 'bending-moment': 1000, 'neutral-axis-distance': 0.05, 'second-moment-area': 0.00001 }, expected: 5_000_000 },
  },
  {
    id: 'simply-supported-point-load-reaction', title: 'Support reaction for an off-center point load', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering'], category: 'Beam statics', formula: 'RA = F(L − x) ÷ L', source: 'engineering', visualization: 'diagram',
    inputs: [['point-load', 'Point load magnitude', 'N'], ['span-length', 'Support-to-support span', 'm'], ['load-distance-from-left', 'Load distance from left support', 'm']], outputs: [['left-reaction', 'Left support reaction magnitude', 'N']], solve: v => { if (v['load-distance-from-left'] > v['span-length']) throw new CalculationError('LOAD_OUTSIDE_SPAN', 'The load location must lie within the support span.'); return v['point-load'] * (v['span-length'] - v['load-distance-from-left']) / v['span-length']; }, example: { inputs: { 'point-load': 1000, 'span-length': 4, 'load-distance-from-left': 1 }, expected: 750 },
  },
  {
    id: 'simply-supported-center-load-moment', title: 'Maximum moment for a centered point load', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering'], category: 'Beam statics', formula: 'Mmax = FL ÷ 4', source: 'engineering', visualization: 'diagram',
    inputs: [['center-load', 'Centered point load magnitude', 'N'], ['span-length', 'Support-to-support span', 'm']], outputs: [['maximum-moment', 'Maximum bending moment magnitude', 'Nm']], solve: v => v['center-load'] * v['span-length'] / 4, example: { inputs: { 'center-load': 4000, 'span-length': 6 }, expected: 6000 },
  },
  {
    id: 'simply-supported-uniform-load-moment', title: 'Maximum moment under a uniform beam load', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering'], category: 'Beam statics', formula: 'Mmax = wL² ÷ 8', source: 'engineering', visualization: 'diagram',
    inputs: [['uniform-load', 'Uniformly distributed load', 'N/m'], ['span-length', 'Support-to-support span', 'm']], outputs: [['maximum-moment', 'Maximum bending moment magnitude', 'Nm']], solve: v => v['uniform-load'] * v['span-length'] ** 2 / 8, example: { inputs: { 'uniform-load': 2000, 'span-length': 4 }, expected: 4000 },
  },
  {
    id: 'euler-column-critical-load-ideal', title: 'Ideal Euler column critical load', discipline: 'Structural engineering', fields: ['Structural engineering', 'Civil engineering', 'Mechanical engineering'], category: 'Elastic stability study', formula: 'Pcr = π²EI ÷ (KL)²', source: 'engineering', visualization: 'diagram',
    inputs: [['young-modulus', 'Young’s modulus', 'Pa'], ['second-moment-area', 'Second moment of area about the buckling axis', 'm4'], ['effective-length-factor', 'Ideal effective-length factor K', '1', { min: Number.MIN_VALUE }], ['unsupported-length', 'Unsupported column length', 'm']], outputs: [['critical-load', 'Ideal elastic critical load', 'N']], solve: v => Math.PI ** 2 * v['young-modulus'] * v['second-moment-area'] / (v['effective-length-factor'] * v['unsupported-length']) ** 2, example: { inputs: { 'young-modulus': 200_000_000_000, 'second-moment-area': 0.000001, 'effective-length-factor': 1, 'unsupported-length': 2 }, expected: Math.PI ** 2 * 200_000 },
  },
  {
    id: 'wheel-tractive-force-from-torque', title: 'Ideal wheel tractive force from torque', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Transportation and traffic engineering'], category: 'Vehicle mechanics', formula: 'F = T ÷ r', source: 'mechanical', visualization: 'motion',
    inputs: [['wheel-torque', 'Applied wheel torque', 'Nm'], ['effective-radius', 'Effective wheel radius', 'm']], outputs: [['tractive-force', 'Ideal tangential tractive force', 'N']], solve: v => v['wheel-torque'] / v['effective-radius'], example: { inputs: { 'wheel-torque': 300, 'effective-radius': 0.3 }, expected: 1000 },
  },
  {
    id: 'roller-surface-speed-from-rpm', title: 'Roller surface speed from diameter and rpm', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Manufacturing and industrial engineering'], category: 'Rotating machinery', formula: 'v = πDn ÷ 60', source: 'mechanical', visualization: 'motion',
    inputs: [['roller-diameter', 'Roller diameter', 'm'], ['rotational-speed', 'Rotational speed', 'rpm']], outputs: [['surface-speed', 'Surface speed', 'm/s']], solve: v => Math.PI * v['roller-diameter'] * v['rotational-speed'] / 60, example: { inputs: { 'roller-diameter': 0.5, 'rotational-speed': 60 }, expected: Math.PI / 2 },
  },
  {
    id: 'motor-shaft-torque-from-power', title: 'Motor shaft torque from power and rpm', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Manufacturing and industrial engineering'], category: 'Rotating machinery', formula: 'T = P ÷ ω, with ω = 2πn ÷ 60', source: 'mechanical', visualization: 'motion',
    inputs: [['shaft-power', 'Shaft power', 'W'], ['rotational-speed', 'Rotational speed', 'rpm']], outputs: [['torque', 'Ideal shaft torque', 'Nm']], solve: v => v['shaft-power'] / (2 * Math.PI * v['rotational-speed'] / 60), example: { inputs: { 'shaft-power': 1000, 'rotational-speed': 60 }, expected: 1000 / (2 * Math.PI) },
  },
  {
    id: 'rotational-period-from-rpm', title: 'Rotation period from rpm', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Rotating motion', formula: 'T = 60 ÷ n', source: 'mechanical', visualization: 'motion',
    inputs: [['rotational-speed', 'Rotational speed', 'rpm']], outputs: [['period', 'Time per revolution', 's']], solve: v => 60 / v['rotational-speed'], example: { inputs: { 'rotational-speed': 120 }, expected: 0.5 },
  },
  {
    id: 'ideal-jet-thrust-from-mass-flow', title: 'Ideal jet thrust from mass flow and velocity', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Transportation and traffic engineering'], category: 'Momentum flow', formula: 'F ≈ ṁv, for a one-dimensional jet with negligible inlet momentum and pressure thrust', source: 'mechanical', visualization: 'flow',
    inputs: [['mass-flow', 'Jet mass flow rate', 'kg/s'], ['exit-velocity', 'Jet exit velocity', 'm/s']], outputs: [['thrust', 'Ideal momentum thrust', 'N']], solve: v => v['mass-flow'] * v['exit-velocity'], example: { inputs: { 'mass-flow': 2, 'exit-velocity': 100 }, expected: 200 },
  },
  {
    id: 'hydraulic-cylinder-speed-from-flow', title: 'Hydraulic cylinder speed from flow rate', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Water resources and hydraulic engineering'], category: 'Hydraulic actuators', formula: 'v = Q ÷ A', source: 'mechanical', visualization: 'flow',
    inputs: [['flow-rate', 'Volumetric flow rate', 'm3/s'], ['piston-area', 'Effective piston area', 'm2']], outputs: [['cylinder-speed', 'Ideal extension speed', 'm/s']], solve: v => v['flow-rate'] / v['piston-area'], example: { inputs: { 'flow-rate': 0.001, 'piston-area': 0.01 }, expected: 0.1 },
  },
  {
    id: 'actuator-stroke-time', title: 'Actuator stroke time at constant speed', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Manufacturing and industrial engineering'], category: 'Actuator planning', formula: 't = stroke ÷ speed', source: 'mechanical', visualization: 'motion',
    inputs: [['stroke-length', 'Required stroke length', 'm'], ['actuator-speed', 'Constant actuator speed', 'm/s']], outputs: [['stroke-time', 'Ideal stroke time', 's']], solve: v => v['stroke-length'] / v['actuator-speed'], example: { inputs: { 'stroke-length': 0.5, 'actuator-speed': 0.1 }, expected: 5 },
  },
  {
    id: 'ideal-gear-output-torque', title: 'Ideal gear output torque from tooth counts', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Manufacturing and industrial engineering'], category: 'Gears', formula: 'Tout = Tin × Ndriven ÷ Ndriver', source: 'mechanical', visualization: 'diagram',
    inputs: [['input-torque', 'Input torque', 'Nm'], ['driver-teeth', 'Driver gear tooth count', '1', { min: 1, integer: true }], ['driven-teeth', 'Driven gear tooth count', '1', { min: 1, integer: true }]], outputs: [['output-torque', 'Ideal output torque', 'Nm']], solve: v => v['input-torque'] * v['driven-teeth'] / v['driver-teeth'], example: { inputs: { 'input-torque': 10, 'driver-teeth': 20, 'driven-teeth': 60 }, expected: 30 },
  },
  {
    id: 'inclined-plane-ideal-mechanical-advantage', title: 'Ideal inclined-plane mechanical advantage', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Simple machines', formula: 'IMA = ramp length ÷ vertical rise', source: 'mechanical', visualization: 'geometry',
    inputs: [['ramp-length', 'Ramp surface length', 'm'], ['vertical-rise', 'Vertical rise', 'm']], outputs: [['advantage', 'Ideal mechanical advantage', '1']], solve: v => { if (v['vertical-rise'] > v['ramp-length']) throw new CalculationError('INVALID_RAMP_GEOMETRY', 'Vertical rise cannot exceed the ramp length.'); return v['ramp-length'] / v['vertical-rise']; }, example: { inputs: { 'ramp-length': 5, 'vertical-rise': 1 }, expected: 5 },
  },
  {
    id: 'mach-number-from-speed', title: 'Mach number from speed and sound speed', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Compressible flow basics', formula: 'M = v ÷ a', source: 'mechanical', visualization: 'flow',
    inputs: [['object-speed', 'Object or flow speed', 'm/s'], ['local-sound-speed', 'Local speed of sound', 'm/s']], outputs: [['mach-number', 'Mach number', '1']], solve: v => v['object-speed'] / v['local-sound-speed'], example: { inputs: { 'object-speed': 340, 'local-sound-speed': 340 }, expected: 1 },
  },
  {
    id: 'mechanical-power-from-work-rate', title: 'Mechanical power from work and elapsed time', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Work and power', formula: 'P = W ÷ t', source: 'mechanical', visualization: 'motion',
    inputs: [['work', 'Work transferred', 'J'], ['elapsed-time', 'Elapsed time', 's']], outputs: [['power', 'Average power', 'W']], solve: v => v.work / v['elapsed-time'], example: { inputs: { work: 600, 'elapsed-time': 10 }, expected: 60 },
  },
  {
    id: 'mechanical-work-from-force-distance', title: 'Work from aligned force and distance', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Work and power', formula: 'W = F × d, when force is parallel to displacement', source: 'mechanical', visualization: 'motion',
    inputs: [['force', 'Constant force magnitude', 'N'], ['displacement', 'Displacement along the force direction', 'm']], outputs: [['work', 'Work transferred', 'J']], solve: v => v.force * v.displacement, example: { inputs: { force: 50, displacement: 3 }, expected: 150 },
  },
  {
    id: 'free-fall-time-from-height', title: 'Free-fall time from height at rest', discipline: 'Physics', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning'], category: 'Kinematics', formula: 't = √(2h/g), g = 9.80665 m/s²', source: 'physics', visualization: 'motion',
    inputs: [['drop-height', 'Vertical drop height', 'm']], outputs: [['fall-time', 'Idealized fall time', 's']], solve: v => Math.sqrt(2 * v['drop-height'] / 9.80665), example: { inputs: { 'drop-height': 19.6133 }, expected: 2 },
  },
  {
    id: 'vertical-launch-maximum-height', title: 'Maximum height from vertical launch speed', discipline: 'Physics', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning'], category: 'Kinematics', formula: 'hmax = v₀² ÷ (2g), g = 9.80665 m/s²', source: 'physics', visualization: 'motion',
    inputs: [['initial-speed', 'Initial upward speed', 'm/s']], outputs: [['maximum-height', 'Ideal maximum rise above launch point', 'm']], solve: v => v['initial-speed'] ** 2 / (2 * 9.80665), example: { inputs: { 'initial-speed': Math.sqrt(2 * 9.80665 * 5) }, expected: 5 },
  },
  {
    id: 'angular-frequency-from-hertz', title: 'Angular frequency from frequency', discipline: 'Physics', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Electrical engineering and power systems'], category: 'Oscillations and signals', formula: 'ω = 2πf, with f in Hz and ω in rad/s', source: 'physics', visualization: 'motion',
    inputs: [['frequency', 'Frequency', 'Hz']], outputs: [['angular-frequency', 'Angular frequency', 'rad/s']], solve: v => 2 * Math.PI * v.frequency, example: { inputs: { frequency: 5 }, expected: 10 * Math.PI },
  },
  {
    id: 'photon-wavelength-from-frequency', title: 'Photon wavelength from frequency', discipline: 'Physics', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Chemistry'], category: 'Light and photons', formula: 'λ = c ÷ f, c = 299792458 m/s', source: 'modernPhysics', visualization: 'diagram',
    inputs: [['frequency', 'Electromagnetic frequency', 'Hz']], outputs: [['wavelength', 'Wavelength in vacuum', 'm']], solve: v => 299_792_458 / v.frequency, example: { inputs: { frequency: 299_792_458 }, expected: 1 },
  },
  {
    id: 'photon-energy-from-wavelength', title: 'Photon energy from wavelength', discipline: 'Physics', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Chemistry'], category: 'Light and photons', formula: 'E = hc ÷ λ, h = 6.62607015×10⁻³⁴ J·s, c = 299792458 m/s', source: 'modernPhysics', visualization: 'diagram',
    inputs: [['wavelength', 'Wavelength in vacuum', 'm']], outputs: [['energy', 'Photon energy', 'J']], solve: v => 6.62607015e-34 * 299_792_458 / v.wavelength, example: { inputs: { wavelength: 6.62607015e-34 * 299_792_458 }, expected: 1 },
  },
  {
    id: 'circular-orbital-speed-from-mass-radius', title: 'Circular orbital speed from central mass and radius', discipline: 'Astrophysics', fields: ['Physics, astronomy, astrophysics, and cosmology'], category: 'Orbital mechanics', formula: 'v = √(GM ÷ r), G = 6.67430×10⁻¹¹ m³·kg⁻¹·s⁻²', source: 'physics', visualization: 'motion',
    inputs: [['central-mass', 'Central body mass', 'kg'], ['orbital-radius', 'Orbital radius from body center', 'm']], outputs: [['orbital-speed', 'Ideal circular orbital speed', 'm/s']], solve: v => Math.sqrt(6.67430e-11 * v['central-mass'] / v['orbital-radius']), example: { inputs: { 'central-mass': 5.9722e24, 'orbital-radius': 6.371e6 }, expected: Math.sqrt(6.67430e-11 * 5.9722e24 / 6.371e6) },
  },
  {
    id: 'escape-speed-from-mass-radius', title: 'Escape speed from central mass and radius', discipline: 'Astrophysics', fields: ['Physics, astronomy, astrophysics, and cosmology'], category: 'Orbital mechanics', formula: 'vesc = √(2GM ÷ r), G = 6.67430×10⁻¹¹ m³·kg⁻¹·s⁻²', source: 'physics', visualization: 'motion',
    inputs: [['central-mass', 'Central body mass', 'kg'], ['surface-radius', 'Distance from body center', 'm']], outputs: [['escape-speed', 'Ideal escape speed', 'm/s']], solve: v => Math.sqrt(2 * 6.67430e-11 * v['central-mass'] / v['surface-radius']), example: { inputs: { 'central-mass': 5.9722e24, 'surface-radius': 6.371e6 }, expected: Math.sqrt(2 * 6.67430e-11 * 5.9722e24 / 6.371e6) },
  },
  {
    id: 'lorentz-factor-from-speed', title: 'Lorentz factor from speed', discipline: 'Physics', fields: ['Physics, astronomy, astrophysics, and cosmology'], category: 'Special relativity', formula: 'γ = 1 ÷ √(1 − v²/c²)', source: 'modernPhysics', visualization: 'trend',
    inputs: [['speed', 'Object speed relative to observer', 'm/s']], outputs: [['lorentz-factor', 'Lorentz factor γ', '1']], solve: v => { const ratio = v.speed / 299_792_458; if (ratio >= 1) throw new CalculationError('SPEED_REACHES_LIGHT', 'The input speed must be below the speed of light in vacuum.'); return 1 / Math.sqrt(1 - ratio ** 2); }, example: { inputs: { speed: 0 }, expected: 1 },
  },
  {
    id: 'relativistic-kinetic-energy', title: 'Relativistic kinetic energy from mass and speed', discipline: 'Physics', fields: ['Physics, astronomy, astrophysics, and cosmology'], category: 'Special relativity', formula: 'K = (γ − 1)mc², γ = 1 ÷ √(1 − v²/c²)', source: 'modernPhysics', visualization: 'trend',
    inputs: [['rest-mass', 'Rest mass', 'kg'], ['speed', 'Object speed relative to observer', 'm/s']], outputs: [['kinetic-energy', 'Relativistic kinetic energy', 'J']], solve: v => { const ratio = v.speed / 299_792_458; if (ratio >= 1) throw new CalculationError('SPEED_REACHES_LIGHT', 'The input speed must be below the speed of light in vacuum.'); const gamma = 1 / Math.sqrt(1 - ratio ** 2); return (gamma - 1) * v['rest-mass'] * 299_792_458 ** 2; }, example: { inputs: { 'rest-mass': 1, speed: 0 }, expected: 0 },
  },
  {
    id: 'radioactive-half-life-from-decay-constant', title: 'Radioactive half-life from decay constant', discipline: 'Chemistry', fields: ['Chemistry', 'Physics, astronomy, astrophysics, and cosmology'], category: 'Radioactive decay', formula: 't½ = ln(2) ÷ λ', source: 'chemistry', visualization: 'trend',
    inputs: [['decay-constant', 'First-order decay constant', 'Hz']], outputs: [['half-life', 'Half-life', 's']], solve: v => Math.LN2 / v['decay-constant'], example: { inputs: { 'decay-constant': Math.LN2 }, expected: 1 },
  },
  {
    id: 'rc-circuit-time-constant', title: 'RC circuit time constant', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Circuit transients', formula: 'τ = RC', source: 'electric', visualization: 'circuit',
    inputs: [['resistance', 'Series resistance', 'ohm'], ['capacitance', 'Capacitance', 'F']], outputs: [['time-constant', 'RC time constant', 's']], solve: v => v.resistance * v.capacitance, example: { inputs: { resistance: 1000, capacitance: 0.000001 }, expected: 0.001 },
  },
  {
    id: 'rl-circuit-time-constant', title: 'RL circuit time constant', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Circuit transients', formula: 'τ = L ÷ R', source: 'electric', visualization: 'circuit',
    inputs: [['inductance', 'Inductance', 'H'], ['resistance', 'Series resistance', 'ohm']], outputs: [['time-constant', 'RL time constant', 's']], solve: v => v.inductance / v.resistance, example: { inputs: { inductance: 0.5, resistance: 10 }, expected: 0.05 },
  },
  {
    id: 'rc-capacitor-charging-voltage', title: 'RC capacitor charging voltage at elapsed time', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Circuit transients', formula: 'Vc(t) = Vs(1 − e^(−t/RC))', source: 'electric', visualization: 'circuit',
    inputs: [['supply-voltage', 'Ideal step supply voltage', 'V'], ['resistance', 'Series resistance', 'ohm'], ['capacitance', 'Capacitance', 'F'], ['elapsed-time', 'Elapsed time after the step', 's']], outputs: [['capacitor-voltage', 'Capacitor voltage', 'V']], solve: v => v['supply-voltage'] * (1 - Math.exp(-v['elapsed-time'] / (v.resistance * v.capacitance))), example: { inputs: { 'supply-voltage': 10, resistance: 1000, capacitance: 0.001, 'elapsed-time': 1 }, expected: 10 * (1 - Math.exp(-1)) },
  },
  {
    id: 'rc-capacitor-discharge-voltage', title: 'RC capacitor discharge voltage at elapsed time', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Circuit transients', formula: 'V(t) = V₀e^(−t/RC)', source: 'electric', visualization: 'circuit',
    inputs: [['initial-voltage', 'Initial capacitor voltage', 'V'], ['resistance', 'Discharge resistance', 'ohm'], ['capacitance', 'Capacitance', 'F'], ['elapsed-time', 'Elapsed time after discharge begins', 's']], outputs: [['remaining-voltage', 'Remaining capacitor voltage', 'V']], solve: v => v['initial-voltage'] * Math.exp(-v['elapsed-time'] / (v.resistance * v.capacitance)), example: { inputs: { 'initial-voltage': 10, resistance: 1000, capacitance: 0.001, 'elapsed-time': 1 }, expected: 10 * Math.exp(-1) },
  },
  {
    id: 'inductor-stored-energy', title: 'Energy stored in an inductor', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Magnetic energy', formula: 'E = ½LI²', source: 'electric', visualization: 'circuit',
    inputs: [['inductance', 'Inductance', 'H'], ['current', 'Inductor current', 'A']], outputs: [['energy', 'Stored magnetic energy', 'J']], solve: v => 0.5 * v.inductance * v.current ** 2, example: { inputs: { inductance: 2, current: 3 }, expected: 9 },
  },
  {
    id: 'joule-heating-energy', title: 'Resistive heating energy from current and time', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Electrical energy', formula: 'E = I²Rt', source: 'electric', visualization: 'thermal',
    inputs: [['current', 'Current through the resistor', 'A'], ['resistance', 'Resistance', 'ohm'], ['elapsed-time', 'Elapsed time', 's']], outputs: [['energy', 'Electrical energy dissipated as heat', 'J']], solve: v => v.current ** 2 * v.resistance * v['elapsed-time'], example: { inputs: { current: 2, resistance: 5, 'elapsed-time': 3 }, expected: 60 },
  },
  {
    id: 'electric-current-density', title: 'Electric current density', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Current and conductors', formula: 'J = I ÷ A', source: 'electric', visualization: 'circuit',
    inputs: [['current', 'Current through the cross section', 'A'], ['cross-section-area', 'Conductor cross-section area', 'm2']], outputs: [['current-density', 'Average current density', 'A/m2']], solve: v => v.current / v['cross-section-area'], example: { inputs: { current: 5, 'cross-section-area': 0.00001 }, expected: 500_000 },
  },
  {
    id: 'power-factor-from-real-power', title: 'Power factor from real power and RMS values', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'AC power', formula: 'PF = P ÷ (Vrms Irms)', source: 'electric', visualization: 'circuit', outputFormat: 'percent',
    inputs: [['real-power', 'Real power', 'W'], ['rms-voltage', 'RMS voltage', 'V'], ['rms-current', 'RMS current', 'A']], outputs: [['power-factor', 'Power factor magnitude', '1']], solve: v => { const apparent = v['rms-voltage'] * v['rms-current']; if (v['real-power'] > apparent) throw new CalculationError('REAL_POWER_EXCEEDS_APPARENT', 'Real power cannot exceed apparent power in this single-phase magnitude estimate.'); return v['real-power'] / apparent; }, example: { inputs: { 'real-power': 800, 'rms-voltage': 200, 'rms-current': 5 }, expected: 0.8 },
  },
  {
    id: 'balanced-three-phase-apparent-power', title: 'Balanced three-phase apparent power', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems'], category: 'Three-phase power', formula: 'S = √3 Vline Iline', source: 'electric', visualization: 'circuit',
    inputs: [['line-voltage', 'Line-to-line RMS voltage', 'V'], ['line-current', 'Line RMS current', 'A']], outputs: [['apparent-power', 'Apparent power', 'VA']], solve: v => Math.sqrt(3) * v['line-voltage'] * v['line-current'], example: { inputs: { 'line-voltage': 400, 'line-current': 10 }, expected: Math.sqrt(3) * 4000 },
  },
  {
    id: 'voltage-regulation-percent', title: 'Voltage regulation from no-load and loaded voltage', discipline: 'Electrical engineering', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], category: 'Power supply performance', formula: 'Regulation = (Vno-load − Vloaded) ÷ Vloaded × 100%', source: 'electric', visualization: 'trend', outputFormat: 'percent',
    inputs: [['no-load-voltage', 'No-load output voltage', 'V'], ['loaded-voltage', 'Loaded output voltage', 'V']], outputs: [['regulation', 'Voltage regulation', '1']], solve: v => (v['no-load-voltage'] - v['loaded-voltage']) / v['loaded-voltage'], example: { inputs: { 'no-load-voltage': 12.6, 'loaded-voltage': 12 }, expected: 0.05 },
  },
  {
    id: 'amdahl-law-speedup', title: 'Amdahl’s law parallel speedup', discipline: 'Software engineering', fields: ['Software development and programming', 'Cloud computing and DevOps', 'Artificial intelligence and machine learning'], category: 'Parallel performance', formula: 'S = 1 ÷ ((1 − P) + P ÷ N)', source: 'parallel', visualization: 'trend',
    inputs: [['parallel-fraction', 'Fraction of work that can run in parallel (0 to 1)', '1', { min: 0, max: 1 }], ['worker-count', 'Parallel workers', '1', { min: 1, integer: true, max: 1_000_000 }]], outputs: [['speedup', 'Ideal speedup factor', '1']], solve: v => 1 / ((1 - v['parallel-fraction']) + v['parallel-fraction'] / v['worker-count']), example: { inputs: { 'parallel-fraction': 0.9, 'worker-count': 10 }, expected: 5.263157894736842 },
  },
  {
    id: 'parallel-computing-efficiency', title: 'Parallel computing efficiency', discipline: 'Software engineering', fields: ['Software development and programming', 'Cloud computing and DevOps', 'Artificial intelligence and machine learning'], category: 'Parallel performance', formula: 'E = S ÷ N', source: 'parallel', visualization: 'trend', outputFormat: 'percent',
    inputs: [['speedup', 'Measured or estimated speedup factor', '1', { min: 0 }], ['worker-count', 'Parallel workers', '1', { min: 1, integer: true, max: 1_000_000 }]], outputs: [['efficiency', 'Parallel efficiency', '1']], solve: v => v.speedup / v['worker-count'], example: { inputs: { speedup: 8, 'worker-count': 10 }, expected: 0.8 },
  },
  {
    id: 'ideal-compute-time-from-operations', title: 'Ideal compute time from operation count and throughput', discipline: 'AI infrastructure', fields: ['Artificial intelligence and machine learning', 'Software development and programming', 'Cloud computing and DevOps'], category: 'Compute planning', formula: 't = operation count ÷ sustained operation throughput', source: 'software', visualization: 'flow',
    inputs: [['operation-count', 'Operation count (for example, FLOPs)', '1', { min: 0 }], ['throughput', 'Sustained operation throughput (operations/s)', 'Hz', { min: Number.MIN_VALUE }]], outputs: [['compute-time', 'Ideal compute time', 's']], solve: v => v['operation-count'] / v.throughput, example: { inputs: { 'operation-count': 1e12, throughput: 1e12 }, expected: 1 },
  },
  {
    id: 'tensor-activation-memory', title: 'Tensor activation memory estimate', discipline: 'AI infrastructure', fields: ['Artificial intelligence and machine learning', 'Electronics and embedded hardware', 'Cloud computing and DevOps'], category: 'Model memory planning', formula: 'M = batch × sequence length × hidden width × bytes per value', source: 'software', visualization: 'flow',
    inputs: [['batch-size', 'Batch size', '1', { min: 1, integer: true, max: 1_000_000 }], ['sequence-length', 'Sequence length', '1', { min: 1, integer: true, max: 10_000_000 }], ['hidden-width', 'Tensor width', '1', { min: 1, integer: true, max: 10_000_000 }], ['bytes-per-value', 'Bytes per stored value', 'B', { min: Number.MIN_VALUE, max: 64 }]], outputs: [['activation-memory', 'One tensor activation storage estimate', 'B']], solve: v => v['batch-size'] * v['sequence-length'] * v['hidden-width'] * v['bytes-per-value'], example: { inputs: { 'batch-size': 2, 'sequence-length': 128, 'hidden-width': 64, 'bytes-per-value': 2 }, expected: 32768 },
  },
  {
    id: 'base64-encoded-length', title: 'Padded Base64 encoded length', discipline: 'Software engineering', fields: ['Software development and programming', 'Data engineering and databases', 'Cybersecurity configuration and capacity planning'], category: 'Data sizing', formula: 'L = 4 × ceil(n ÷ 3) characters', source: 'base64', visualization: 'flow',
    inputs: [['input-bytes', 'Input data length (bytes)', 'B', { min: 0, integer: true, max: Number.MAX_SAFE_INTEGER }]], outputs: [['encoded-characters', 'Padded Base64 character count', '1']], solve: v => 4 * Math.ceil(v['input-bytes'] / 3), example: { inputs: { 'input-bytes': 4 }, expected: 8 },
  },
  {
    id: 'database-storage-with-overhead', title: 'Database storage with stated overhead', discipline: 'Data engineering', fields: ['Data engineering and databases', 'Cloud computing and DevOps', 'Business operations, pricing, and unit economics'], category: 'Storage planning', formula: 'Storage = row count × average record bytes × (1 + overhead fraction)', source: 'software', visualization: 'flow',
    inputs: [['row-count', 'Number of records', '1', { min: 0, integer: true, max: Number.MAX_SAFE_INTEGER }], ['record-bytes', 'Average stored record size (bytes)', 'B', { min: 0 }], ['overhead-fraction', 'Additional index and storage overhead fraction', '1', { min: 0, max: 1000 }]], outputs: [['storage-bytes', 'Estimated storage bytes', 'B']], solve: v => v['row-count'] * v['record-bytes'] * (1 + v['overhead-fraction']), example: { inputs: { 'row-count': 1000, 'record-bytes': 200, 'overhead-fraction': 0.25 }, expected: 250000 },
  },
  {
    id: 'ipv4-usable-host-count', title: 'IPv4 usable host count from prefix length', discipline: 'Networking', fields: ['Networking and telecommunications', 'Cybersecurity configuration and capacity planning', 'Cloud computing and DevOps'], category: 'IPv4 capacity', formula: 'Usable hosts = 2^(32 − prefix length) − 2 (for prefixes /0 through /30)', source: 'networking', visualization: 'flow',
    inputs: [['prefix-length', 'IPv4 prefix length (0 to 30)', '1', { min: 0, max: 30, integer: true }]], outputs: [['usable-hosts', 'Conventional usable host addresses', '1']], solve: v => 2 ** (32 - v['prefix-length']) - 2, example: { inputs: { 'prefix-length': 24 }, expected: 254 },
  },
  {
    id: 'cost-per-million-tokens', title: 'Cost per million tokens from observed usage', discipline: 'AI infrastructure', fields: ['Artificial intelligence and machine learning', 'Business operations, pricing, and unit economics', 'Cloud computing and DevOps'], category: 'AI operating costs', formula: 'Cost per million tokens = observed cost × 1,000,000 ÷ observed tokens', source: 'business', visualization: 'trend',
    inputs: [['observed-cost', 'Observed cost (in one consistent currency)', '1', { min: 0 }], ['observed-tokens', 'Observed token count', '1', { min: Number.MIN_VALUE }]], outputs: [['cost-per-million', 'Scenario cost per million tokens (same currency)', '1']], solve: v => v['observed-cost'] * 1_000_000 / v['observed-tokens'], example: { inputs: { 'observed-cost': 2, 'observed-tokens': 500_000 }, expected: 4 },
  },
  {
    id: 'compute-replica-count', title: 'Compute replica count for target concurrency', discipline: 'Cloud infrastructure', fields: ['Cloud computing and DevOps', 'Software development and programming', 'Networking and telecommunications'], category: 'Capacity planning', formula: 'Replicas = ceil(target concurrency ÷ tested concurrency per replica)', source: 'software', visualization: 'flow',
    inputs: [['target-concurrency', 'Target simultaneous workload', '1', { min: 0, integer: true, max: Number.MAX_SAFE_INTEGER }], ['tested-capacity', 'Tested capacity per replica', '1', { min: 1 }]], outputs: [['replicas', 'Minimum whole replicas by this capacity estimate', '1']], solve: v => Math.ceil(v['target-concurrency'] / v['tested-capacity']), example: { inputs: { 'target-concurrency': 101, 'tested-capacity': 25 }, expected: 5 },
  },
  {
    id: 'steady-state-customer-lifetime-value', title: 'Steady-state customer lifetime value scenario', discipline: 'Business analytics', fields: ['Business operations, pricing, and unit economics', 'Personal and corporate finance'], category: 'Unit economics', formula: 'LTV = monthly revenue per customer × gross margin ÷ monthly customer churn fraction', source: 'saas', visualization: 'trend',
    inputs: [['monthly-revenue', 'Monthly revenue per customer (one currency)', '1', { min: 0 }], ['gross-margin', 'Gross margin fraction (0 to 1)', '1', { min: 0, max: 1 }], ['monthly-churn', 'Monthly customer churn fraction (> 0 to 1)', '1', { min: Number.MIN_VALUE, max: 1 }]], outputs: [['lifetime-value', 'Steady-state contribution LTV scenario (same currency)', '1']], solve: v => v['monthly-revenue'] * v['gross-margin'] / v['monthly-churn'], example: { inputs: { 'monthly-revenue': 100, 'gross-margin': 0.8, 'monthly-churn': 0.05 }, expected: 1600 },
  },
  {
    id: 'customer-acquisition-payback-period', title: 'Customer acquisition cost payback period', discipline: 'Business analytics', fields: ['Business operations, pricing, and unit economics', 'Personal and corporate finance'], category: 'Unit economics', formula: 'Payback months = acquisition cost ÷ (monthly revenue per customer × gross margin)', source: 'saas', visualization: 'trend',
    inputs: [['acquisition-cost', 'Acquisition cost per customer (one currency)', '1', { min: 0 }], ['monthly-revenue', 'Monthly revenue per customer (same currency)', '1', { min: 0 }], ['gross-margin', 'Gross margin fraction (0 to 1)', '1', { min: 0, max: 1 }]], outputs: [['payback-months', 'Estimated payback period in months', '1']], solve: v => { const contribution = v['monthly-revenue'] * v['gross-margin']; if (!(contribution > 0)) throw new CalculationError('ZERO_MONTHLY_CONTRIBUTION', 'Monthly contribution must be greater than zero to calculate payback.'); return v['acquisition-cost'] / contribution; }, example: { inputs: { 'acquisition-cost': 240, 'monthly-revenue': 100, 'gross-margin': 0.8 }, expected: 3 },
  },
  {
    id: 'annual-recurring-revenue-from-mrr', title: 'Annual recurring revenue from monthly recurring revenue', discipline: 'Business analytics', fields: ['Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax'], category: 'Revenue scenarios', formula: 'ARR run-rate = MRR × 12', source: 'saas', visualization: 'trend',
    inputs: [['monthly-recurring-revenue', 'Monthly recurring revenue (one currency)', '1', { min: 0 }]], outputs: [['annual-recurring-revenue', 'Annual recurring revenue run-rate (same currency)', '1']], solve: v => v['monthly-recurring-revenue'] * 12, example: { inputs: { 'monthly-recurring-revenue': 12500 }, expected: 150000 },
  },
  {
    id: 'retained-customer-cohort-estimate', title: 'Retained customer cohort estimate', discipline: 'Business analytics', fields: ['Business operations, pricing, and unit economics', 'Statistics and data analysis'], category: 'Retention scenarios', formula: 'N(t) = N₀ × (1 − monthly churn)^months', source: 'saas', visualization: 'trend',
    inputs: [['starting-customers', 'Starting customer count', '1', { min: 0 }], ['monthly-churn', 'Monthly churn fraction (0 to 1)', '1', { min: 0, max: 1 }], ['elapsed-months', 'Elapsed months', '1', { min: 0, integer: true, max: 100_000 }]], outputs: [['retained-customers', 'Expected retained cohort size', '1']], solve: v => v['starting-customers'] * (1 - v['monthly-churn']) ** v['elapsed-months'], example: { inputs: { 'starting-customers': 1000, 'monthly-churn': 0.02, 'elapsed-months': 12 }, expected: 1000 * 0.98 ** 12 },
  },
  {
    id: 'contribution-margin-ratio', title: 'Contribution margin ratio', discipline: 'Business analytics', fields: ['Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax'], category: 'Unit economics', formula: 'Contribution margin ratio = (selling price − variable cost) ÷ selling price', source: 'accounting', visualization: 'trend', outputFormat: 'percent',
    inputs: [['selling-price', 'Selling price per unit (one currency)', '1', { min: Number.MIN_VALUE }], ['variable-cost', 'Variable cost per unit (same currency)', '1', { min: 0 }]], outputs: [['contribution-margin-ratio', 'Contribution margin ratio', '1']], solve: v => { if (v['variable-cost'] > v['selling-price']) throw new CalculationError('VARIABLE_COST_EXCEEDS_PRICE', 'Variable cost cannot exceed selling price for this contribution-margin ratio.'); return (v['selling-price'] - v['variable-cost']) / v['selling-price']; }, example: { inputs: { 'selling-price': 50, 'variable-cost': 30 }, expected: 0.4 },
  },
  {
    id: 'economic-order-quantity', title: 'Economic order quantity scenario', discipline: 'Operations research', fields: ['Logistics and supply chain', 'Project management and operations research', 'Business operations, pricing, and unit economics'], category: 'Inventory planning', formula: 'EOQ = √(2 × annual demand × order cost ÷ annual holding cost per unit)', source: 'inventory', visualization: 'trend',
    inputs: [['annual-demand', 'Annual demand (units/year)', '1', { min: Number.MIN_VALUE }], ['order-cost', 'Cost per order (one currency)', '1', { min: Number.MIN_VALUE }], ['annual-holding-cost', 'Annual holding cost per unit (same currency/unit/year)', '1', { min: Number.MIN_VALUE }]], outputs: [['order-quantity', 'Economic order quantity scenario (units/order)', '1']], solve: v => Math.sqrt(2 * v['annual-demand'] * v['order-cost'] / v['annual-holding-cost']), example: { inputs: { 'annual-demand': 1000, 'order-cost': 25, 'annual-holding-cost': 2 }, expected: Math.sqrt(25000) },
  },
  {
    id: 'solute-mass-concentration', title: 'Solute mass concentration from mass and solution volume', discipline: 'Chemistry', fields: ['Chemistry', 'Chemical and process engineering', 'Environmental engineering and science'], category: 'Solution concentration', formula: 'Mass concentration = solute mass ÷ final solution volume', source: 'chemistrySolutions', visualization: 'flow',
    inputs: [['solute-mass', 'Solute mass', 'kg'], ['solution-volume', 'Final solution volume', 'm3', { min: Number.MIN_VALUE }]], outputs: [['mass-concentration', 'Solute mass concentration', 'kg/m3']], solve: v => v['solute-mass'] / v['solution-volume'], example: { inputs: { 'solute-mass': 0.01, 'solution-volume': 0.002 }, expected: 5 },
  },
  {
    id: 'molarity-from-solute-mass', title: 'Molarity from solute mass and final volume', discipline: 'Chemistry', fields: ['Chemistry', 'Chemical and process engineering', 'Biology and laboratory science'], category: 'Solution concentration', formula: 'c = (solute mass ÷ molar mass) ÷ final solution volume', source: 'chemistrySolutions', visualization: 'flow',
    inputs: [['solute-mass', 'Solute mass', 'kg'], ['molar-mass', 'Molar mass', 'kg/mol', { min: Number.MIN_VALUE }], ['solution-volume', 'Final solution volume', 'L', { min: Number.MIN_VALUE }]], outputs: [['molarity', 'Molar concentration', 'mol/L']], solve: v => v['solute-mass'] / v['molar-mass'] / v['solution-volume'], example: { inputs: { 'solute-mass': 0.05844, 'molar-mass': 0.05844, 'solution-volume': 1 }, expected: 1 },
  },
  {
    id: 'mixed-solution-concentration', title: 'Mixed solution concentration with additive volumes', discipline: 'Chemistry', fields: ['Chemistry', 'Chemical and process engineering', 'Biology and laboratory science'], category: 'Solution concentration', formula: 'cfinal = (c₁V₁ + c₂V₂) ÷ (V₁ + V₂)', source: 'chemistrySolutions', visualization: 'flow',
    inputs: [['concentration-1', 'First solution concentration', 'mol/L'], ['volume-1', 'First solution volume', 'L'], ['concentration-2', 'Second solution concentration', 'mol/L'], ['volume-2', 'Second solution volume', 'L']], outputs: [['final-concentration', 'Final concentration', 'mol/L']], solve: v => { const totalVolume = v['volume-1'] + v['volume-2']; if (!(totalVolume > 0)) throw new CalculationError('ZERO_MIXED_VOLUME', 'At least one solution volume must be greater than zero.'); return (v['concentration-1'] * v['volume-1'] + v['concentration-2'] * v['volume-2']) / totalVolume; }, example: { inputs: { 'concentration-1': 1, 'volume-1': 1, 'concentration-2': 3, 'volume-2': 1 }, expected: 2 },
  },
  {
    id: 'poh-from-hydroxide-concentration', title: 'pOH from hydroxide concentration', discipline: 'Chemistry', fields: ['Chemistry', 'Chemical and process engineering', 'Biology and laboratory science'], category: 'Acid-base chemistry', formula: 'pOH = −log₁₀([OH⁻] in mol/L)', source: 'chemistrySolutions', visualization: 'trend',
    inputs: [['hydroxide-concentration', 'Hydroxide concentration (mol/L)', '1', { min: Number.MIN_VALUE }]], outputs: [['poh', 'Concentration-based pOH estimate', '1']], solve: v => -Math.log10(v['hydroxide-concentration']), example: { inputs: { 'hydroxide-concentration': 0.001 }, expected: 3 },
  },
  {
    id: 'mineral-slurry-solids-mass-fraction', title: 'Mineral slurry solids mass fraction', discipline: 'Mining engineering', fields: ['Mining and extractive industries', 'Chemical and process engineering', 'Materials science and metallurgy'], category: 'Slurry balance', formula: 'Solids fraction = dry solids mass ÷ (dry solids mass + water mass)', source: 'materials', visualization: 'flow', outputFormat: 'percent',
    inputs: [['dry-solids-mass', 'Dry mineral solids mass', 'kg', { min: Number.MIN_VALUE }], ['water-mass', 'Water mass', 'kg']], outputs: [['solids-fraction', 'Dry solids mass fraction', '1']], solve: v => v['dry-solids-mass'] / (v['dry-solids-mass'] + v['water-mass']), example: { inputs: { 'dry-solids-mass': 30, 'water-mass': 70 }, expected: 0.3 },
  },
  {
    id: 'water-to-ore-mass-ratio', title: 'Water-to-ore mass ratio', discipline: 'Mining engineering', fields: ['Mining and extractive industries', 'Chemical and process engineering', 'Environmental engineering and science'], category: 'Process ratios', formula: 'Water-to-ore ratio = water mass ÷ dry ore mass', source: 'materials', visualization: 'flow',
    inputs: [['water-mass', 'Water mass', 'kg'], ['dry-ore-mass', 'Dry ore mass', 'kg', { min: Number.MIN_VALUE }]], outputs: [['water-to-ore-ratio', 'Water-to-ore mass ratio', '1']], solve: v => v['water-mass'] / v['dry-ore-mass'], example: { inputs: { 'water-mass': 150, 'dry-ore-mass': 300 }, expected: 0.5 },
  },
  {
    id: 'mine-material-throughput', title: 'Mine material throughput from mass and elapsed time', discipline: 'Mining engineering', fields: ['Mining and extractive industries', 'Logistics and supply chain', 'Manufacturing and industrial engineering'], category: 'Production throughput', formula: 'Mass throughput = processed mass ÷ elapsed time', source: 'materials', visualization: 'flow',
    inputs: [['processed-mass', 'Processed material mass', 'kg'], ['elapsed-time', 'Elapsed operating time', 's', { min: Number.MIN_VALUE }]], outputs: [['mass-throughput', 'Average material throughput', 'kg/s']], solve: v => v['processed-mass'] / v['elapsed-time'], example: { inputs: { 'processed-mass': 36000, 'elapsed-time': 3600 }, expected: 10 },
  },
  {
    id: 'haul-truck-fleet-throughput', title: 'Haul truck fleet nominal throughput', discipline: 'Mining engineering', fields: ['Mining and extractive industries', 'Logistics and supply chain', 'Project management and operations research'], category: 'Fleet capacity', formula: 'Throughput = payload × trips per hour × truck count ÷ 3,600', source: 'materials', visualization: 'flow',
    inputs: [['payload', 'Payload per trip (kg)', 'kg'], ['trips-per-hour', 'Trips per truck per hour', '1', { min: 0 }], ['truck-count', 'Number of trucks', '1', { min: 1, integer: true, max: 1_000_000 }]], outputs: [['fleet-throughput', 'Nominal mass throughput', 'kg/s']], solve: v => v.payload * v['trips-per-hour'] * v['truck-count'] / 3600, example: { inputs: { payload: 30000, 'trips-per-hour': 2, 'truck-count': 4 }, expected: 66.66666666666667 },
  },
  {
    id: 'fertilizer-nutrient-mass', title: 'Fertilizer nutrient mass from product label fraction', discipline: 'Agriculture', fields: ['Agriculture and crop science', 'Forestry, fisheries, and natural resources', 'Environmental engineering and science'], category: 'Nutrient estimates', formula: 'Nutrient mass = product mass × nutrient label percentage ÷ 100', source: 'agriculture', visualization: 'flow',
    inputs: [['product-mass', 'Fertilizer product mass', 'kg'], ['nutrient-percent', 'Nutrient fraction shown on product label (%)', '1', { min: 0, max: 100 }]], outputs: [['nutrient-mass', 'Estimated nutrient mass', 'kg']], solve: v => v['product-mass'] * v['nutrient-percent'] / 100, example: { inputs: { 'product-mass': 25, 'nutrient-percent': 12 }, expected: 3 },
  },
  {
    id: 'paint-material-cost-estimate', title: 'Paint material cost from area, coats, and coverage', discipline: 'Construction estimating', fields: ['Construction estimating and quantity surveying', 'Architecture and building design', 'Everyday conversions, cooking, and household projects'], category: 'Surface finishing estimates', formula: 'Cost = area × coats ÷ product coverage × price per volume', source: 'materials', visualization: 'geometry',
    inputs: [['surface-area', 'Painted surface area', 'm2'], ['coat-count', 'Number of coats', '1', { min: 1, integer: true, max: 100 }], ['coverage', 'Product coverage (m² per liter)', '1', { min: Number.MIN_VALUE }], ['price-per-liter', 'Price per liter (one currency)', '1', { min: 0 }]], outputs: [['paint-cost', 'Material cost estimate (same currency)', '1']], solve: v => v['surface-area'] * v['coat-count'] / v.coverage * v['price-per-liter'], example: { inputs: { 'surface-area': 40, 'coat-count': 2, coverage: 10, 'price-per-liter': 8 }, expected: 64 },
  },
  {
    id: 'crop-harvest-mass-estimate', title: 'Crop harvest mass from area and yield rate', discipline: 'Agriculture', fields: ['Agriculture and crop science', 'Forestry, fisheries, and natural resources', 'Business operations, pricing, and unit economics'], category: 'Yield estimates', formula: 'Harvest mass = cultivated area × measured yield per area', source: 'agriculture', visualization: 'geometry',
    inputs: [['cultivated-area', 'Cultivated area', 'm2'], ['yield-rate', 'Yield rate (kg per square meter)', 'kg/m2']], outputs: [['harvest-mass', 'Estimated harvest mass', 'kg']], solve: v => v['cultivated-area'] * v['yield-rate'], example: { inputs: { 'cultivated-area': 1000, 'yield-rate': 0.6 }, expected: 600 },
  },
  {
    id: 'screen-pixel-density', title: 'Display pixel density from resolution and diagonal', discipline: 'Hardware engineering', fields: ['Electronics and embedded hardware', 'Software development and programming', 'VFX, CGI, animation, and motion design'], category: 'Display geometry', formula: 'PPI = √(horizontal pixels² + vertical pixels²) ÷ diagonal inches', source: 'software', visualization: 'geometry',
    inputs: [['horizontal-pixels', 'Horizontal pixel resolution', '1', { min: 1, integer: true, max: 1_000_000 }], ['vertical-pixels', 'Vertical pixel resolution', '1', { min: 1, integer: true, max: 1_000_000 }], ['diagonal-inches', 'Display diagonal (inches)', 'in', { min: Number.MIN_VALUE }]], outputs: [['pixel-density', 'Pixel density (pixels per inch)', '1']], solve: v => Math.hypot(v['horizontal-pixels'], v['vertical-pixels']) / v['diagonal-inches'], example: { inputs: { 'horizontal-pixels': 1920, 'vertical-pixels': 1080, 'diagonal-inches': 24 }, expected: Math.hypot(1920, 1080) / 24 },
  },
  {
    id: 'construction-waste-adjusted-volume', title: 'Construction material volume with waste allowance', discipline: 'Construction estimating', fields: ['Construction estimating and quantity surveying', 'Civil engineering', 'Architecture and building design'], category: 'Materials takeoff', formula: 'Order volume = net design volume × (1 + waste fraction)', source: 'materials', visualization: 'geometry',
    inputs: [['net-volume', 'Net design volume', 'm3'], ['waste-fraction', 'Waste allowance fraction (for example, 0.05 = 5%)', '1', { min: 0, max: 10 }]], outputs: [['order-volume', 'Planning order volume', 'm3']], solve: v => v['net-volume'] * (1 + v['waste-fraction']), example: { inputs: { 'net-volume': 12, 'waste-fraction': 0.05 }, expected: 12.6 },
  },
];

const SPECIFIC_ASSUMPTIONS = Object.freeze({
  'amdahl-law-speedup': ['Treats the workload as a fixed serial fraction plus a perfectly parallelizable fraction; communication, synchronization, memory, and scheduling overhead are omitted.'],
  'parallel-computing-efficiency': ['Uses the supplied speedup and worker count; efficiency can exceed 100% when measured speedup is superlinear.'],
  'ideal-compute-time-from-operations': ['This is a throughput-only lower-bound estimate; memory bandwidth, utilization variation, launch overhead, batching, and non-compute work are excluded.'],
  'tensor-activation-memory': ['Counts one dense tensor at the stated element width only; gradients, optimizer state, temporary buffers, padding, allocator overhead, and other layers are excluded.'],
  'base64-encoded-length': ['Assumes standard padded Base64 with no line wrapping or application-specific envelope.'],
  'database-storage-with-overhead': ['The overhead fraction is a user-selected allowance; actual indexes, replicas, compression, logs, and free-space policy depend on the database and workload.'],
  'ipv4-usable-host-count': ['Assumes conventional network and broadcast address reservations for prefix lengths /0 through /30; /31 point-to-point and /32 host routes are intentionally excluded.'],
  'compute-replica-count': ['Uses a tested per-replica capacity as a fixed planning limit; startup time, failover headroom, autoscaling lag, skew, and availability targets are excluded.'],
  'steady-state-customer-lifetime-value': ['Assumes monthly revenue, gross margin, and customer churn remain constant indefinitely; this simplified steady-state LTV is not a cohort forecast.'],
  'customer-acquisition-payback-period': ['Assumes monthly revenue and gross margin remain constant; discounts, retention changes, expansion, refunds, and acquisition timing are excluded.'],
  'annual-recurring-revenue-from-mrr': ['Annualizes one monthly recurring-revenue value as a run-rate; it is not recognized revenue, a forecast, or an accounting conclusion.'],
  'retained-customer-cohort-estimate': ['Assumes the same independent churn fraction each month; the fractional result is an expected cohort size, not a count of observed customers.'],
  'economic-order-quantity': ['Classical EOQ assumptions: steady demand, fixed ordering cost, fixed annual holding cost, and no quantity discounts, stockouts, lead-time uncertainty, or perishability.'],
  'mixed-solution-concentration': ['Assumes both solutions contain the same solute, no reaction or loss occurs, and the entered final volume is the sum of component volumes.'],
  'poh-from-hydroxide-concentration': ['Uses concentration as an idealized proxy for hydroxide activity; real pOH depends on solution activity and temperature.'],
  'haul-truck-fleet-throughput': ['Assumes every truck maintains the entered average trips per hour and payload with no downtime, queuing, haul-road, loading, or safety constraint.'],
  'fertilizer-nutrient-mass': ['Interprets the entered label percentage as a mass fraction of the fertilizer product and does not recommend an application rate.'],
  'paint-material-cost-estimate': ['Assumes the quoted coverage is achieved on the entered surface for every coat; surface texture, losses, primer, tax, and labor are excluded.'],
  'crop-harvest-mass-estimate': ['Assumes the entered yield rate applies uniformly to the entire cultivated area; moisture basis and harvest losses are not inferred.'],
  'construction-waste-adjusted-volume': ['Applies the waste fraction to net volume as a planning allowance; actual purchasing units, compaction, settlement, and supplier tolerances are excluded.'],
});

function makeCalculator(spec) {
  const inputs = spec.inputs.map(([id, label, unit, options = {}]) => {
    const normalizedOptions = { allowMagnitudeWords: true, ...options };
    if (unit === '1') return sin(id, label, '', normalizedOptions);
    return qin(id, label, getUnit(unit).dimension, unit, [unit], normalizedOptions);
  });
  const outputs = spec.outputs.map(([id, label, unit]) => unit === '1' ? sout(id, label, spec.outputFormat || 'scalar') : qout(id, label, getUnit(unit).dimension, unit));
  const reference = SOURCES[spec.source];
  return educationalDefinition({
    id: spec.id,
    title: spec.title,
    discipline: spec.discipline,
    fields: spec.fields,
    category: spec.category,
    description: `Calculate ${spec.outputs.map(([, label]) => label.toLowerCase()).join(' and ')} using the displayed relationship and entered values.`,
    keywords: [spec.title.toLowerCase(), spec.category.toLowerCase(), spec.discipline.toLowerCase(), ...spec.inputs.map(([, label]) => label.toLowerCase()), ...spec.outputs.map(([, label]) => label.toLowerCase())],
    formula: spec.formula,
    assumptions: ['The displayed equation is applied to the entered values in the declared units.', 'Any financial rate is interpreted per the period stated in its input label; no jurisdiction-specific fees, taxes, or product terms are inferred.', ...(SPECIFIC_ASSUMPTIONS[spec.id] || [])],
    exclusions: ['Does not add unentered variables, uncertainty, product terms, policy rules, or professional design checks.'],
    warnings: [
      ...(spec.source === 'engineering' ? ['Educational mechanics estimate only: excludes applicable design-code load combinations, safety factors, buckling modes, material variability, connections, fabrication tolerances, and professional review. Do not use as a final capacity or safety check.'] : []),
      ...(spec.source === 'electric' ? ['Idealized circuit relationship only: does not validate wiring, insulation, component ratings, protective devices, installation, or electrical-code compliance.'] : []),
      ...(spec.source === 'chemistrySolutions' ? ['Concentration calculations use idealized solution arithmetic and do not assess chemical compatibility, non-ideal activity, purity, handling, or laboratory procedure.'] : []),
      ...(spec.source === 'materials' ? ['Planning estimate only: does not establish site conditions, material behavior, equipment capacity, occupational safety, regulatory compliance, or construction-code compliance.'] : []),
      ...(spec.source === 'agriculture' ? ['Estimate uses user-entered area, yield, and label values; follow the product label and obtain local agronomic guidance for real application decisions.'] : []),
      ...(spec.source === 'business' || spec.source === 'accounting' || spec.source === 'inventory' || spec.source === 'saas' ? ['Scenario estimate only: does not establish recognized revenue, tax treatment, investment suitability, cash flow, or future business performance.'] : []),
    ],
    limitations: ['Review the equation, input units, assumptions, and method steps before using the result. This tool is not professional advice.'],
    citation: `${reference[0]} Formula used: ${spec.formula}`,
    sourceUrl: reference[1],
    verificationCases: [`Known-answer regression case: ${JSON.stringify(spec.example.inputs)} → ${JSON.stringify(spec.example.expected)}; see the Titan expansion regression suite.`],
    visualization: { kind: spec.visualization, title: `${spec.title} · result view`, description: `A schematic visual for the entered values and calculated ${spec.outputs[0][1].toLowerCase()}; the displayed equation and result remain authoritative.` },
    inputs,
    outputs,
    calculate(raw) {
      const values = Object.fromEntries(Object.entries(raw).map(([id, quantity]) => [id, quantity.value]));
      const value = spec.solve(values);
      if (!Number.isFinite(value)) throw new CalculationError('NON_FINITE_RESULT', 'The equation did not produce a finite result. Check the inputs and supported range.');
      const [outputId, outputLabel, outputUnit] = spec.outputs[0];
      const substitutions = spec.inputs.map(([id, label]) => `${label} = ${values[id]}`).join('; ');
      return calculated({ [outputId]: { value, unit: outputUnit } }, spec.formula, [`Read inputs in their displayed units: ${substitutions}.`, `Substitute those values into the stated relationship: ${spec.formula}.`, `Evaluate the relationship using full numeric precision before display rounding.`, `Calculated ${outputLabel} = ${value} ${spec.outputFormat === 'percent' ? '%' : getUnit(outputUnit).symbol}.`]);
    },
  });
}

export const titanCalculators = Object.freeze(specifications.map(makeCalculator));
export const titanCalculatorReferenceCases = Object.freeze(specifications.map(spec => Object.freeze({ id: spec.id, inputs: Object.freeze({ ...spec.example.inputs }), outputId: spec.outputs[0][0], expected: spec.example.expected })));
