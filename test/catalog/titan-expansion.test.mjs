import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicDefinitions, publicConverterDefinitions, publicRegistry } from '../../catalog/public/index.mjs';
import { FIELD_DIRECTORY } from '../../catalog/field-directory.mjs';
import { titanCalculators } from '../../catalog/public/titan-expansion.mjs';

const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);
const run = (id, values) => executeCalculation(publicRegistry.get(id), values);
const referenceCases = [
  ['vector-magnitude-3d', { x: 2, y: 3, z: 6 }, 'magnitude', 7],
  ['vector-dot-product-3d', { ax: 1, ay: 2, az: 3, bx: 4, by: -1, bz: 2 }, 'dot-product', 8],
  ['vector-cross-product-magnitude-3d', { ax: 1, ay: 0, az: 0, bx: 0, by: 1, bz: 0 }, 'cross-magnitude', 1],
  ['angle-between-vectors-2d', { ax: 1, ay: 0, bx: 0, by: 1 }, 'angle', Math.PI / 2],
  ['triangle-angle-cosine-rule', { 'opposite-side': 5, 'adjacent-side-1': 3, 'adjacent-side-2': 4 }, 'angle', Math.PI / 2],
  ['triangle-area-heron', { 'side-a': 3, 'side-b': 4, 'side-c': 5 }, 'area', 6],
  ['arithmetic-sequence-nth-term', { 'first-term': 5, 'common-difference': 3, 'term-number': 8 }, 'term', 26],
  ['arithmetic-sequence-finite-sum', { 'first-term': 2, 'common-difference': 3, 'term-count': 5 }, 'sum', 40],
  ['geometric-sequence-nth-term', { 'first-term': 3, 'common-ratio': 2, 'term-number': 6 }, 'term', 96],
  ['geometric-sequence-finite-sum', { 'first-term': 2, 'common-ratio': 3, 'term-count': 4 }, 'sum', 80],
  ['harmonic-mean-two-values', { 'value-1': 3, 'value-2': 6 }, 'mean', 4],
  ['population-variance-three-values', { 'value-1': 2, 'value-2': 4, 'value-3': 6 }, 'variance', 8 / 3],
  ['population-standard-deviation-three-values', { 'value-1': 2, 'value-2': 4, 'value-3': 6 }, 'standard-deviation', Math.sqrt(8 / 3)],
  ['coefficient-of-variation-three-values', { 'value-1': 2, 'value-2': 4, 'value-3': 6 }, 'coefficient', Math.sqrt(8 / 3) / 4],
  ['binomial-exact-probability', { 'trial-count': 4, 'success-count': 2, 'success-probability': 0.5 }, 'probability', 0.375],
  ['ordinary-annuity-future-value', { deposit: 100, 'periodic-rate': 0.1, 'period-count': 2 }, 'future-value', 210],
  ['ordinary-annuity-present-value', { payment: 100, 'periodic-rate': 0.1, 'period-count': 2 }, 'present-value', 100 * (1 - 1 / 1.21) / 0.1],
  ['loan-balance-after-payments', { principal: 1000, payment: 100, 'periodic-rate': 0.1, 'payments-made': 2 }, 'balance', 1000 * 1.21 - 100 * 2.1],
  ['annualized-growth-rate', { 'starting-value': 100, 'ending-value': 121, 'elapsed-years': 2 }, 'annualized-growth', 0.1],
  ['real-return-from-inflation', { 'nominal-return': 0.08, 'inflation-rate': 0.03 }, 'real-return', 1.08 / 1.03 - 1],
  ['paving-material-mass-estimate', { 'paved-area': 10, 'layer-thickness': 0.05, 'bulk-density': 2400 }, 'mass', 1200],
  ['circular-pipe-internal-volume', { 'internal-diameter': 0.2, 'pipe-length': 10 }, 'volume', Math.PI * 0.2 ** 2 * 10 / 4],
  ['annular-cross-section-area', { 'outer-diameter': 0.2, 'inner-diameter': 0.1 }, 'area', Math.PI * (0.2 ** 2 - 0.1 ** 2) / 4],
  ['trapezoidal-trench-volume', { 'trench-length': 10, depth: 2, 'bottom-width': 0.5, 'top-width': 1 }, 'volume', 15],
  ['earthwork-bulking-volume', { 'bank-volume': 100, 'bulking-fraction': 0.25 }, 'loose-volume', 125],
  ['compacted-fill-dry-mass', { 'compacted-volume': 2, 'dry-density': 1800 }, 'dry-mass', 3600],
  ['wall-heat-transfer-rate', { 'u-value': 2, 'wall-area': 10, 'temperature-difference': 20 }, 'heat-rate', 400],
  ['ventilation-flow-from-air-changes', { 'room-volume': 90, 'air-changes': 2 }, 'flow-rate', 0.05],
  ['pitched-roof-area-from-plan', { 'plan-area': 20, rise: 3, run: 4 }, 'roof-area', 25],
  ['rain-runoff-volume-with-coefficient', { 'catchment-area': 1000, 'rainfall-depth': 0.01, 'runoff-coefficient': 0.8 }, 'runoff-volume', 8],
  ['axial-normal-stress', { 'axial-force': 1000, 'cross-section-area': 0.01 }, 'stress', 100_000],
  ['engineering-normal-strain', { extension: 0.002, 'original-length': 2 }, 'strain', 0.001],
  ['young-modulus-from-stress-strain', { 'normal-stress': 100_000_000, 'normal-strain': 0.0005 }, 'young-modulus', 200_000_000_000],
  ['elastic-bar-axial-elongation', { 'axial-force': 10_000, 'bar-length': 2, 'cross-section-area': 0.01, 'young-modulus': 200_000_000_000 }, 'elongation', 0.00001],
  ['cantilever-end-load-moment', { 'end-load': 500, 'cantilever-length': 2 }, 'moment', 1000],
  ['elastic-beam-bending-stress', { 'bending-moment': 1000, 'neutral-axis-distance': 0.05, 'second-moment-area': 0.00001 }, 'bending-stress', 5_000_000],
  ['simply-supported-point-load-reaction', { 'point-load': 1000, 'span-length': 4, 'load-distance-from-left': 1 }, 'left-reaction', 750],
  ['simply-supported-center-load-moment', { 'center-load': 4000, 'span-length': 6 }, 'maximum-moment', 6000],
  ['simply-supported-uniform-load-moment', { 'uniform-load': 2000, 'span-length': 4 }, 'maximum-moment', 4000],
  ['euler-column-critical-load-ideal', { 'young-modulus': 200_000_000_000, 'second-moment-area': 0.000001, 'effective-length-factor': 1, 'unsupported-length': 2 }, 'critical-load', Math.PI ** 2 * 50_000],
  ['wheel-tractive-force-from-torque', { 'wheel-torque': 300, 'effective-radius': 0.3 }, 'tractive-force', 1000],
  ['roller-surface-speed-from-rpm', { 'roller-diameter': 0.5, 'rotational-speed': 60 }, 'surface-speed', Math.PI / 2],
  ['motor-shaft-torque-from-power', { 'shaft-power': 1000, 'rotational-speed': 60 }, 'torque', 1000 / (2 * Math.PI)],
  ['rotational-period-from-rpm', { 'rotational-speed': 120 }, 'period', 0.5],
  ['ideal-jet-thrust-from-mass-flow', { 'mass-flow': 2, 'exit-velocity': 100 }, 'thrust', 200],
  ['hydraulic-cylinder-speed-from-flow', { 'flow-rate': 0.001, 'piston-area': 0.01 }, 'cylinder-speed', 0.1],
  ['actuator-stroke-time', { 'stroke-length': 0.5, 'actuator-speed': 0.1 }, 'stroke-time', 5],
  ['ideal-gear-output-torque', { 'input-torque': 10, 'driver-teeth': 20, 'driven-teeth': 60 }, 'output-torque', 30],
  ['inclined-plane-ideal-mechanical-advantage', { 'ramp-length': 5, 'vertical-rise': 1 }, 'advantage', 5],
  ['mach-number-from-speed', { 'object-speed': 340, 'local-sound-speed': 340 }, 'mach-number', 1],
  ['mechanical-power-from-work-rate', { work: 600, 'elapsed-time': 10 }, 'power', 60],
  ['mechanical-work-from-force-distance', { force: 50, displacement: 3 }, 'work', 150],
  ['free-fall-time-from-height', { 'drop-height': 19.6133 }, 'fall-time', 2],
  ['vertical-launch-maximum-height', { 'initial-speed': Math.sqrt(2 * 9.80665 * 5) }, 'maximum-height', 5],
  ['angular-frequency-from-hertz', { frequency: 5 }, 'angular-frequency', 10 * Math.PI],
  ['photon-wavelength-from-frequency', { frequency: 299_792_458 }, 'wavelength', 1],
  ['photon-energy-from-wavelength', { wavelength: 6.62607015e-34 * 299_792_458 }, 'energy', 1],
  ['circular-orbital-speed-from-mass-radius', { 'central-mass': 5.9722e24, 'orbital-radius': 6.371e6 }, 'orbital-speed', Math.sqrt(6.67430e-11 * 5.9722e24 / 6.371e6)],
  ['escape-speed-from-mass-radius', { 'central-mass': 5.9722e24, 'surface-radius': 6.371e6 }, 'escape-speed', Math.sqrt(2 * 6.67430e-11 * 5.9722e24 / 6.371e6)],
  ['lorentz-factor-from-speed', { speed: 0 }, 'lorentz-factor', 1],
  ['relativistic-kinetic-energy', { 'rest-mass': 1, speed: 0 }, 'kinetic-energy', 0],
  ['radioactive-half-life-from-decay-constant', { 'decay-constant': Math.LN2 }, 'half-life', 1],
  ['rc-circuit-time-constant', { resistance: 1000, capacitance: 0.000001 }, 'time-constant', 0.001],
  ['rl-circuit-time-constant', { inductance: 0.5, resistance: 10 }, 'time-constant', 0.05],
  ['rc-capacitor-charging-voltage', { 'supply-voltage': 10, resistance: 1000, capacitance: 0.001, 'elapsed-time': 1 }, 'capacitor-voltage', 10 * (1 - Math.exp(-1))],
  ['rc-capacitor-discharge-voltage', { 'initial-voltage': 10, resistance: 1000, capacitance: 0.001, 'elapsed-time': 1 }, 'remaining-voltage', 10 * Math.exp(-1)],
  ['inductor-stored-energy', { inductance: 2, current: 3 }, 'energy', 9],
  ['joule-heating-energy', { current: 2, resistance: 5, 'elapsed-time': 3 }, 'energy', 60],
  ['electric-current-density', { current: 5, 'cross-section-area': 0.00001 }, 'current-density', 500_000],
  ['power-factor-from-real-power', { 'real-power': 800, 'rms-voltage': 200, 'rms-current': 5 }, 'power-factor', 0.8],
  ['balanced-three-phase-apparent-power', { 'line-voltage': 400, 'line-current': 10 }, 'apparent-power', Math.sqrt(3) * 4000],
  ['voltage-regulation-percent', { 'no-load-voltage': 12.6, 'loaded-voltage': 12 }, 'regulation', 0.05],
  ['amdahl-law-speedup', { 'parallel-fraction': 0.9, 'worker-count': 10 }, 'speedup', 1 / (0.1 + 0.9 / 10)],
  ['parallel-computing-efficiency', { speedup: 8, 'worker-count': 10 }, 'efficiency', 0.8],
  ['ideal-compute-time-from-operations', { 'operation-count': 1e12, throughput: 1e12 }, 'compute-time', 1],
  ['tensor-activation-memory', { 'batch-size': 2, 'sequence-length': 128, 'hidden-width': 64, 'bytes-per-value': 2 }, 'activation-memory', 32768],
  ['base64-encoded-length', { 'input-bytes': 4 }, 'encoded-characters', 8],
  ['database-storage-with-overhead', { 'row-count': 1000, 'record-bytes': 200, 'overhead-fraction': 0.25 }, 'storage-bytes', 250000],
  ['ipv4-usable-host-count', { 'prefix-length': 24 }, 'usable-hosts', 254],
  ['cost-per-million-tokens', { 'observed-cost': 2, 'observed-tokens': 500000 }, 'cost-per-million', 4],
  ['compute-replica-count', { 'target-concurrency': 101, 'tested-capacity': 25 }, 'replicas', 5],
  ['steady-state-customer-lifetime-value', { 'monthly-revenue': 100, 'gross-margin': 0.8, 'monthly-churn': 0.05 }, 'lifetime-value', 1600],
  ['customer-acquisition-payback-period', { 'acquisition-cost': 240, 'monthly-revenue': 100, 'gross-margin': 0.8 }, 'payback-months', 3],
  ['annual-recurring-revenue-from-mrr', { 'monthly-recurring-revenue': 12500 }, 'annual-recurring-revenue', 150000],
  ['retained-customer-cohort-estimate', { 'starting-customers': 1000, 'monthly-churn': 0.02, 'elapsed-months': 12 }, 'retained-customers', 1000 * 0.98 ** 12],
  ['contribution-margin-ratio', { 'selling-price': 50, 'variable-cost': 30 }, 'contribution-margin-ratio', 0.4],
  ['economic-order-quantity', { 'annual-demand': 1000, 'order-cost': 25, 'annual-holding-cost': 2 }, 'order-quantity', Math.sqrt(25000)],
  ['solute-mass-concentration', { 'solute-mass': 0.01, 'solution-volume': 0.002 }, 'mass-concentration', 5],
  ['molarity-from-solute-mass', { 'solute-mass': 0.05844, 'molar-mass': 0.05844, 'solution-volume': 1 }, 'molarity', 1],
  ['mixed-solution-concentration', { 'concentration-1': 1, 'volume-1': 1, 'concentration-2': 3, 'volume-2': 1 }, 'final-concentration', 2],
  ['poh-from-hydroxide-concentration', { 'hydroxide-concentration': 0.001 }, 'poh', 3],
  ['mineral-slurry-solids-mass-fraction', { 'dry-solids-mass': 30, 'water-mass': 70 }, 'solids-fraction', 0.3],
  ['water-to-ore-mass-ratio', { 'water-mass': 150, 'dry-ore-mass': 300 }, 'water-to-ore-ratio', 0.5],
  ['mine-material-throughput', { 'processed-mass': 36000, 'elapsed-time': 3600 }, 'mass-throughput', 10],
  ['haul-truck-fleet-throughput', { payload: 30000, 'trips-per-hour': 2, 'truck-count': 4 }, 'fleet-throughput', 30000 * 2 * 4 / 3600],
  ['fertilizer-nutrient-mass', { 'product-mass': 25, 'nutrient-percent': 12 }, 'nutrient-mass', 3],
  ['paint-material-cost-estimate', { 'surface-area': 40, 'coat-count': 2, coverage: 10, 'price-per-liter': 8 }, 'paint-cost', 64],
  ['crop-harvest-mass-estimate', { 'cultivated-area': 1000, 'yield-rate': 0.6 }, 'harvest-mass', 600],
  ['screen-pixel-density', { 'horizontal-pixels': 1920, 'vertical-pixels': 1080, 'diagonal-inches': 24 }, 'pixel-density', Math.hypot(1920, 1080) / 24],
  ['construction-waste-adjusted-volume', { 'net-volume': 12, 'waste-fraction': 0.05 }, 'order-volume', 12.6],
];

test('Titan expansion registers one hundred distinct traceable formula calculators', () => {
  assert.equal(titanCalculators.length, 100);
  assert.equal(referenceCases.length, 100);
  assert.equal(new Set(titanCalculators.map(tool => tool.id)).size, 100);
  assert.equal(publicDefinitions.length, 303);
  assert.equal(publicDefinitions.filter(tool => tool.catalogKind === 'calculator').length, 303);
  assert.equal(publicConverterDefinitions.length, 3038);
  for (const tool of titanCalculators) {
    assert.equal(tool.catalogKind, 'calculator');
    assert.equal(tool.references.length, 1, tool.id);
    assert.match(tool.references[0].url, /^https:\/\//, tool.id);
    assert.ok(tool.method.description.length > 4, tool.id);
    assert.ok(tool.visualization, tool.id);
    assert.ok(tool.inputs.length > 0 && tool.outputs.length > 0, tool.id);
    assert.ok(tool.fields.length > 0, tool.id);
    for (const field of tool.fields) assert.ok(FIELD_DIRECTORY.includes(field), `${tool.id}: unknown field ${field}`);
  }
});

test('all one hundred Titan calculators match independently maintained known-answer regression cases', () => {
  for (const [id, inputs, outputId, expected] of referenceCases) {
    const result = run(id, inputs);
    assert.equal(result.status, 'success', id);
    assert.ok(Number.isFinite(result.outputs[outputId].value), id);
    close(result.outputs[outputId].value, expected);
    assert.ok(result.intermediates.steps.length >= 3, id);
    assert.equal(result.intermediates.formula, publicRegistry.get(id).method.description, id);
  }
});

test('new calculators have no duplicate IDs or titles in the published formula catalog', () => {
  const newIds = new Set(titanCalculators.map(tool => tool.id));
  const existing = publicDefinitions.filter(tool => !newIds.has(tool.id));
  for (const tool of titanCalculators) {
    assert.ok(!existing.some(item => item.title.toLowerCase() === tool.title.toLowerCase()), `duplicate title: ${tool.title}`);
  }
  assert.equal(publicDefinitions.length, 303);
});

test('probability, geometry, vector, and financial boundary conditions fail clearly', () => {
  const invalid = [
    ['angle-between-vectors-2d', { ax: 0, ay: 0, bx: 1, by: 0 }],
    ['triangle-angle-cosine-rule', { 'opposite-side': 10, 'adjacent-side-1': 2, 'adjacent-side-2': 3 }],
    ['triangle-area-heron', { 'side-a': 1, 'side-b': 2, 'side-c': 3 }],
    ['coefficient-of-variation-three-values', { 'value-1': -1, 'value-2': 0, 'value-3': 1 }],
    ['binomial-exact-probability', { 'trial-count': 4, 'success-count': 5, 'success-probability': 0.5 }],
    ['ordinary-annuity-future-value', { deposit: 100, 'periodic-rate': -1, 'period-count': 2 }],
    ['ordinary-annuity-present-value', { payment: 100, 'periodic-rate': -1, 'period-count': 2 }],
    ['real-return-from-inflation', { 'nominal-return': 0.08, 'inflation-rate': -1 }],
  ];
  for (const [id, values] of invalid) assert.throws(() => run(id, values), undefined, id);
});

test('software, business, chemistry, and operations boundaries reject invalid inputs clearly', () => {
  assert.throws(() => run('ipv4-usable-host-count', { 'prefix-length': 31 }), undefined);
  assert.throws(() => run('molarity-from-solute-mass', { 'solute-mass': 1, 'molar-mass': 0, 'solution-volume': 1 }), undefined);
  assert.throws(() => run('mixed-solution-concentration', { 'concentration-1': 1, 'volume-1': 0, 'concentration-2': 1, 'volume-2': 0 }), { code: 'ZERO_MIXED_VOLUME' });
  assert.throws(() => run('contribution-margin-ratio', { 'selling-price': 10, 'variable-cost': 11 }), { code: 'VARIABLE_COST_EXCEEDS_PRICE' });
  assert.throws(() => run('customer-acquisition-payback-period', { 'acquisition-cost': 10, 'monthly-revenue': 10, 'gross-margin': 0 }), { code: 'ZERO_MONTHLY_CONTRIBUTION' });
});
