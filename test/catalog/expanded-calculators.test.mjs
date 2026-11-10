import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicDefinitions, publicRegistry } from '../../catalog/public/index.mjs';

const calc = id => publicRegistry.get(id);
// Model the calculator form's default unit selection when a test gives a bare value.
const run = (id, inputs, options = {}) => {
  const definition = calc(id);
  const selectedInputs = Object.fromEntries(Object.entries(inputs).map(([fieldId, raw]) => {
    const field = definition.inputs.find(item => item.id === fieldId);
    if (!field || raw === null || typeof raw === 'object' || field.acceptedUnits.length === 1) return [fieldId, raw];
    return [fieldId, { value: raw, unit: field.canonicalUnit }];
  }));
  return executeCalculation(definition, selectedInputs, options);
};
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);

test('every released calculator returns traceable, ordered worked steps', () => {
  const cases = [
    ['average-speed', { distance: { value: 150, unit: 'm' }, 'elapsed-time': { value: 10, unit: 's' } }],
    ['percentage-change', { original: 100, new: 125 }],
    ['rectangle-area', { length: { value: 3, unit: 'm' }, width: { value: 2, unit: 'm' } }],
    ['rectangular-prism-volume', { 'base-area': { value: 6, unit: 'm2' }, depth: { value: 2, unit: 'm' } }],
    ['percentage-of-amount', { 'base-amount': 80, percentage: 15 }],
    ['discount-price', { 'original-price': 50, 'discount-percent': 20 }],
    ['shared-bill-split', { 'bill-amount': 80, 'tip-percent': 10, people: 4 }],
    ['sales-tax-estimate', { subtotal: 100, 'tax-percent': 8 }],
    ['markup-price', { cost: 80, 'markup-percent': 25 }],
    ['tip-calculator', { 'bill-amount': 80, 'tip-percent': 15 }],
    ['price-per-unit', { 'package-price': 6, quantity: 3 }],
    ['average-acceleration', { 'initial-velocity': 0, 'final-velocity': 15, 'elapsed-time': 3 }],
    ['net-force', { mass: 2, acceleration: 3 }],
    ['kinetic-energy', { mass: 30, speed: 0.5 }],
    ['density', { mass: { value: 1, unit: 'kg' }, volume: { value: 1, unit: 'L' } }],
    ['pressure-from-force-area', { force: 10, area: { value: 2, unit: 'm2' } }],
    ['work-done', { force: 10, displacement: 3, angle: 0 }],
    ['mechanical-power', { work: { value: 600, unit: 'J' }, 'elapsed-time': 2 }],
    ['ohms-law', { voltage: { value: 12, unit: 'V' }, resistance: { value: 3, unit: 'ohm' } }],
    ['molarity', { 'solute-amount': { value: 0.133, unit: 'mol' }, 'solution-volume': { value: 355, unit: 'mL' } }],
    ['dilution', { 'stock-concentration': { value: 5, unit: 'mol/L' }, 'stock-volume': { value: 0.85, unit: 'L' }, 'final-volume': { value: 1.8, unit: 'L' } }],
    ['mass-percent-concentration', { 'solute-mass': { value: 5, unit: 'g' }, 'solution-mass': { value: 100, unit: 'g' } }],
    ['moles-from-mass', { 'sample-mass': { value: 18, unit: 'g' }, 'molar-mass': { value: 18, unit: 'g/mol' } }],
    ['break-even-analysis', { 'fixed-costs': 16800, 'selling-price': 1250, 'variable-cost': 850 }],
    ['gross-margin', { revenue: 200, 'cost-of-goods-sold': 120 }],
    ['data-transfer-time', { 'file-size': 1, 'transfer-rate': 100 }],
    ['service-availability', { 'total-time': 43200, downtime: 43.2 }],
    ['circle-area-circumference', { radius: { value: 1, unit: 'm' } }],
    ['frame-duration', { 'frame-count': 240, 'frame-rate': 24 }],
    ['shutter-exposure', { 'shutter-angle': 180, 'frame-rate': 24 }],
    ['battery-runtime', { 'usable-energy': 100, 'average-load': 20 }],
    ['model-weight-memory', { parameters: '7 billion', 'bits-per-parameter': 4 }],
    ['ore-grade', { 'contained-mass': { value: 2, unit: 'kg' }, 'sample-mass': { value: 100, unit: 'kg' } }],
    ['telescope-magnification', { 'objective-focal-length': 700, 'eyepiece-focal-length': 18 }],
  ];
  assert.equal(cases.length, 34);
  for (const [id, inputs] of cases) {
    const result = run(id, inputs);
    assert.equal(result.status, 'success', id);
    assert.ok(Array.isArray(result.intermediates.steps) && result.intermediates.steps.length >= 2, `${id} has worked steps`);
    assert.ok(result.intermediates.steps.every(step => typeof step === 'string' && step.trim()), `${id} steps are readable strings`);
    assert.ok(result.provenance.references.length > 0, `${id} carries sources`);
  }
});

test('50 newly added cross-field tools produce finite answers and worked traces', () => {
  const cases = [
    ['spring-force-magnitude', { stiffness: 100, displacement: 0.05 }, 'force', 5],
    ['spring-potential-energy', { stiffness: 100, displacement: 0.2 }, 'energy', 2],
    ['linear-momentum', { mass: 2, speed: 3 }, 'momentum', 6],
    ['impulse-from-force-time', { 'average-force': 10, duration: 2 }, 'impulse', 20],
    ['gravitational-potential-energy', { mass: 1, 'height-change': 1 }, 'energy-change', 9.80665],
    ['centripetal-acceleration', { speed: 10, radius: 5 }, 'acceleration', 20],
    ['centripetal-force', { mass: 2, speed: 3, radius: 3 }, 'force', 6],
    ['torque-from-force', { force: 10, 'lever-arm': 0.5, angle: { value: 90, unit: 'deg' } }, 'torque', 5],
    ['rotational-kinetic-energy', { 'moment-of-inertia': 2, 'angular-speed': { value: 60, unit: 'rpm' } }, 'energy', 4 * Math.PI ** 2],
    ['angular-speed-from-rpm', { rpm: { value: 60, unit: 'rpm' } }, 'angular-speed', 2 * Math.PI],
    ['angular-acceleration-from-torque', { 'net-torque': 6, 'moment-of-inertia': 2 }, 'angular-acceleration', 3],
    ['simple-pendulum-period', { length: 1 }, 'period', 2 * Math.PI * Math.sqrt(1 / 9.80665)],
    ['linear-thermal-expansion', { 'initial-length': 1, 'expansion-coefficient': 12e-6, 'temperature-change': 50 }, 'length-change', 0.0006],
    ['specific-heat-transfer', { mass: 1, 'specific-heat': 4184, 'temperature-change': 1 }, 'heat', 4184],
    ['hydrostatic-gauge-pressure', { 'fluid-density': 1000, depth: 1 }, 'gauge-pressure', 9806.65],
    ['buoyant-force', { 'fluid-density': 1000, 'displaced-volume': 0.001 }, 'buoyant-force', 9.80665],
    ['volumetric-flow-rate', { 'cross-sectional-area': 0.01, 'mean-velocity': 2 }, 'flow-rate', 0.02],
    ['mass-flow-rate', { 'fluid-density': 1000, 'flow-rate': 0.01 }, 'mass-flow-rate', 10],
    ['pipe-reynolds-number', { 'fluid-density': 1000, 'mean-velocity': 1, 'pipe-diameter': 0.02, 'dynamic-viscosity': 0.001 }, 'reynolds-number', 20000],
    ['bernoulli-pressure-change', { 'fluid-density': 1000, 'velocity-1': 0, 'velocity-2': 2, 'height-1': 0, 'height-2': 0 }, 'pressure-change', -2000],
    ['hydraulic-pump-input-power', { 'fluid-density': 1000, 'flow-rate': 0.01, head: 10, 'efficiency-percent': 70 }, 'input-power', 1400.95],
    ['steady-wall-conduction-rate', { conductivity: 1, area: 1, 'temperature-difference': 10, thickness: 0.1 }, 'heat-rate', 100],
    ['triangle-area', { base: 6, height: 4 }, 'area', 12],
    ['trapezoid-area', { 'parallel-side-1': 4, 'parallel-side-2': 8, height: 3 }, 'area', 18],
    ['slope-grade-percent', { 'vertical-change': 1, 'horizontal-run': 20 }, 'grade-percent', 0.05],
    ['concrete-slab-volume', { length: 4, width: 3, thickness: 0.1 }, 'volume', 1.2],
    ['tile-quantity-estimate', { 'floor-area': 10, 'tile-length': 0.5, 'tile-width': 0.5, 'waste-percent': 10 }, 'whole-tiles', 44],
    ['blended-mineral-grade', { 'mass-1': 100000, 'grade-1-percent': 1, 'mass-2': 100000, 'grade-2-percent': 3 }, 'blended-grade', 0.02],
    ['mineral-process-recovery', { 'recovered-mass': 80, 'feed-contained-mass': 100 }, 'recovery', 0.8],
    ['diluted-mineral-grade', { 'ore-mass': 100, 'ore-grade-percent': 2, 'dilution-mass': 100 }, 'diluted-grade', 0.01],
    ['dc-electric-power', { voltage: 12, current: 2 }, 'power', 24],
    ['electric-charge-from-current', { current: 2, duration: 3 }, 'charge', 6],
    ['series-resistance-two', { 'resistance-1': 100, 'resistance-2': 220 }, 'equivalent-resistance', 320],
    ['parallel-resistance-two', { 'resistance-1': 100, 'resistance-2': 100 }, 'equivalent-resistance', 50],
    ['unloaded-voltage-divider', { 'input-voltage': 10, 'top-resistance': 1000, 'bottom-resistance': 1000 }, 'output-voltage', 5],
    ['capacitor-stored-energy', { capacitance: { value: 10, unit: 'uF' }, voltage: 10 }, 'energy', 0.0005],
    ['capacitor-charge', { capacitance: { value: 10, unit: 'uF' }, voltage: 5 }, 'charge', 0.00005],
    ['ideal-gas-pressure', { amount: 1, temperature: 273.15, volume: { value: 22.414, unit: 'L' } }, 'pressure', 101324.86232295439],
    ['concentration-based-ph', { 'hydronium-concentration': { value: 1, unit: 'mmol/L' } }, 'ph', 3],
    ['classification-metrics', { 'true-positive': 8, 'false-positive': 2, 'false-negative': 2 }, 'f1', 0.8],
    ['llm-kv-cache-memory', { 'batch-size': 1, 'sequence-length': 4096, layers: 32, 'hidden-size': 4096, 'bytes-per-value': 2 }, 'cache-size', 2_147_483_648],
    ['dense-model-inference-flops', { parameters: '1 billion', tokens: 100 }, 'operations', 200_000_000_000],
    ['ideal-render-farm-time', { 'frame-count': 120, 'seconds-per-frame': 60, workers: 10 }, 'elapsed-time', 720],
    ['image-sequence-storage', { width: 1920, height: 1080, channels: 4, 'bytes-per-channel': 2, frames: 100 }, 'storage', 1_658_880_000],
    ['compressed-video-size-estimate', { bitrate: 10, duration: 60 }, 'size', 75_000_000],
    ['recipe-quantity-scaler', { 'original-quantity': 200, 'original-servings': 4, 'target-servings': 10 }, 'scaled-quantity', 500],
    ['compound-growth-estimate', { principal: 1000, 'annual-rate-percent': 5, years: 1, 'compounds-per-year': 12 }, 'ending-amount', 1051.161897881733],
    ['household-electricity-cost', { 'energy-use': { value: 250, unit: 'kWh' }, 'rate-per-kwh': 0.2 }, 'estimated-cost', 50],
    ['trip-fuel-estimate', { distance: { value: 100, unit: 'km' }, consumption: 8, 'fuel-price': 1.5 }, 'fuel-cost', 12],
    ['weighted-average-two-groups', { 'value-1': 10, 'weight-1': 1, 'value-2': 20, 'weight-2': 3 }, 'weighted-mean', 17.5],
  ];
  assert.equal(cases.length, 50);
  for (const [id, inputs, outputId, expected] of cases) {
    const result = run(id, inputs);
    close(result.outputs[outputId].value, expected, 1e-8);
    assert.ok(result.intermediates.steps.length >= 2, `${id} worked trace`);
    assert.ok(result.provenance.references[0].url.startsWith('https://'), `${id} source link`);
  }
});

test('bulk additions handle unit conversion, word quantities, singularities, and invalid ranges', () => {
  close(run('spring-force-magnitude', { stiffness: 100, displacement: { value: 20, unit: 'mm' } }).outputs.force.value, 2);
  close(run('linear-thermal-expansion', { 'initial-length': 1, 'expansion-coefficient': 12e-6, 'temperature-change': { value: 18, unit: 'deltaF' } }).outputs['length-change'].value, 0.00012);
  close(run('hydrostatic-gauge-pressure', { 'fluid-density': { value: 1, unit: 'g/cm3' }, depth: { value: 100, unit: 'cm' } }).outputs['gauge-pressure'].value, 9806.65);
  close(run('parallel-resistance-two', { 'resistance-1': { value: 1, unit: 'kohm' }, 'resistance-2': { value: 1, unit: 'kohm' } }).outputs['equivalent-resistance'].value, 500);
  close(run('recipe-quantity-scaler', { 'original-quantity': '2 thousand', 'original-servings': 4, 'target-servings': 10 }).outputs['scaled-quantity'].value, 5000);
  close(run('household-electricity-cost', { 'energy-use': { value: 500, unit: 'Wh' }, 'rate-per-kwh': 0.2 }).outputs['estimated-cost'].value, 0.1);
  close(run('trip-fuel-estimate', { distance: { value: 100, unit: 'mi' }, consumption: 8, 'fuel-price': 1.5 }).outputs['fuel-volume'].value, 160.9344 * 0.08);
  assert.throws(() => run('parallel-resistance-two', { 'resistance-1': 0, 'resistance-2': 10 }), { code: 'POSITIVE_VALUE_REQUIRED' });
  assert.throws(() => run('hydraulic-pump-input-power', { 'fluid-density': 1000, 'flow-rate': 0.01, head: 10, 'efficiency-percent': 0 }), { code: 'INPUT_BELOW_MINIMUM' });
  assert.throws(() => run('pipe-reynolds-number', { 'fluid-density': 1000, 'mean-velocity': 1, 'pipe-diameter': 0.02, 'dynamic-viscosity': 0 }), { code: 'POSITIVE_VALUE_REQUIRED' });
  assert.throws(() => run('mineral-process-recovery', { 'recovered-mass': 101, 'feed-contained-mass': 100 }), { code: 'RECOVERED_EXCEEDS_FEED' });
  assert.throws(() => run('concentration-based-ph', { 'hydronium-concentration': 0 }), { code: 'POSITIVE_VALUE_REQUIRED' });
  assert.throws(() => run('classification-metrics', { 'true-positive': 0, 'false-positive': 0, 'false-negative': 0 }), { code: 'UNDEFINED_PRECISION' });
  assert.throws(() => run('llm-kv-cache-memory', { 'batch-size': 9_007_199_254_740_992, 'sequence-length': 1, layers: 1, 'hidden-size': 1, 'bytes-per-value': 2 }), { code: 'SAFE_WHOLE_NUMBER_REQUIRED' });
  assert.throws(() => run('image-sequence-storage', { width: 10, height: 10, channels: 4, 'bytes-per-channel': 3, frames: 1 }), { code: 'UNSUPPORTED_SAMPLE_SIZE' });
  assert.throws(() => run('ideal-render-farm-time', { 'frame-count': 100, 'seconds-per-frame': 10, workers: 0 }), { code: 'SAFE_WHOLE_NUMBER_REQUIRED' });
});

test('motion and mechanics calculations preserve signs, dimensions, and unit conversion', () => {
  close(run('average-acceleration', { 'initial-velocity': { value: 0, unit: 'm/s' }, 'final-velocity': { value: 54, unit: 'km/h' }, 'elapsed-time': { value: 3, unit: 's' } }).outputs.acceleration.value, 5);
  close(run('average-acceleration', { 'initial-velocity': 20, 'final-velocity': 5, 'elapsed-time': 3 }).outputs.acceleration.value, -5);
  assert.throws(() => run('average-acceleration', { 'initial-velocity': 0, 'final-velocity': 1, 'elapsed-time': 0 }), { code: 'NON_POSITIVE_TIME' });

  close(run('net-force', { mass: { value: 2000, unit: 'g' }, acceleration: -9.8 }).outputs.force.value, -19.6);
  assert.throws(() => run('net-force', { mass: 0, acceleration: 9.8 }), { code: 'POSITIVE_MASS_REQUIRED' });

  close(run('kinetic-energy', { mass: 30, speed: { value: 1.8, unit: 'km/h' } }).outputs['kinetic-energy'].value, 3.75);
  close(run('kinetic-energy', { mass: 4, speed: 0 }).outputs['kinetic-energy'].value, 0);
  close(run('kinetic-energy', { mass: 30, speed: 1 }).outputs['kinetic-energy'].value / run('kinetic-energy', { mass: 30, speed: 0.5 }).outputs['kinetic-energy'].value, 4);

  const density = run('density', { mass: { value: 1000, unit: 'g' }, volume: { value: 1, unit: 'L' } });
  close(density.outputs.density.value, 1000);
  close((density.outputs.density.value / 1000), 1);
  assert.throws(() => run('density', { mass: 1, volume: { value: 0, unit: 'mL' } }), { code: 'POSITIVE_VOLUME_REQUIRED' });
  assert.throws(() => run('density', { mass: 0, volume: { value: 1, unit: 'L' } }), { code: 'POSITIVE_MASS_REQUIRED' });

  close(run('pressure-from-force-area', { force: { value: 1, unit: 'kN' }, area: { value: 1, unit: 'm2' } }).outputs.pressure.value, 1000);
  assert.throws(() => run('pressure-from-force-area', { force: 1, area: { value: 0, unit: 'm2' } }), { code: 'POSITIVE_AREA_REQUIRED' });

  close(run('work-done', { force: 10, displacement: 3, angle: 0 }).outputs.work.value, 30);
  close(run('work-done', { force: 10, displacement: 3, angle: 90 }).outputs.work.value, 0, 1e-14);
  close(run('work-done', { force: 10, displacement: 3, angle: 180 }).outputs.work.value, -30);
  assert.throws(() => run('work-done', { force: 10, displacement: 3, angle: 181 }), { code: 'INPUT_ABOVE_MAXIMUM' });

  close(run('mechanical-power', { work: { value: 0.6, unit: 'kJ' }, 'elapsed-time': { value: 2, unit: 's' } }).outputs.power.value, 300);
  assert.throws(() => run('mechanical-power', { work: 1, 'elapsed-time': 0 }), { code: 'NON_POSITIVE_TIME' });
});

test('Ohm’s law requires exactly two consistent positive magnitudes and checks the result', () => {
  close(run('ohms-law', { voltage: { value: 12, unit: 'V' }, resistance: { value: 3, unit: 'ohm' } }).outputs.current.value, 4);
  close(run('ohms-law', { current: { value: 2000, unit: 'mA' }, resistance: { value: 3, unit: 'ohm' } }).outputs.voltage.value, 6);
  close(run('ohms-law', { voltage: { value: 12000, unit: 'mV' }, current: { value: 4, unit: 'A' } }).outputs.resistance.value, 3);
  assert.throws(() => run('ohms-law', { voltage: 12 }), { code: 'OHMS_LAW_REQUIRES_TWO_VALUES' });
  assert.throws(() => run('ohms-law', { voltage: 12, current: 1, resistance: 12 }), { code: 'OHMS_LAW_REQUIRES_TWO_VALUES' });
  assert.throws(() => run('ohms-law', { voltage: 12, current: 0 }), { code: 'ZERO_CURRENT_CANNOT_SOLVE_RESISTANCE' });
  assert.throws(() => run('ohms-law', { voltage: 12, resistance: 0 }), { code: 'POSITIVE_RESISTANCE_REQUIRED' });
});

test('chemistry calculations normalize units and reject impossible solution inputs', () => {
  close(run('molarity', { 'solute-amount': { value: 0.01, unit: 'mol' }, 'solution-volume': { value: 200, unit: 'mL' } }).outputs.molarity.value, 0.05);
  assert.throws(() => run('molarity', { 'solute-amount': 0.1, 'solution-volume': { value: 0, unit: 'L' } }), { code: 'POSITIVE_VOLUME_REQUIRED' });

  const dilution = run('dilution', { 'stock-concentration': { value: 5, unit: 'mol/L' }, 'stock-volume': { value: 850, unit: 'mL' }, 'final-volume': { value: 1800, unit: 'mL' } });
  close(dilution.outputs['final-concentration'].value, 5 * 0.85 / 1.8);
  assert.throws(() => run('dilution', { 'stock-concentration': 5, 'stock-volume': { value: 2, unit: 'L' }, 'final-volume': { value: 1, unit: 'L' } }), { code: 'FINAL_VOLUME_BELOW_STOCK' });
  assert.throws(() => run('dilution', { 'stock-concentration': 5, 'stock-volume': { value: 0, unit: 'L' }, 'final-volume': { value: 1, unit: 'L' } }), { code: 'POSITIVE_VOLUME_REQUIRED' });

  close(run('mass-percent-concentration', { 'solute-mass': { value: 5, unit: 'g' }, 'solution-mass': { value: 100, unit: 'g' } }).outputs['mass-percent'].value, 0.05);
  close(run('mass-percent-concentration', { 'solute-mass': { value: 0.5, unit: 'kg' }, 'solution-mass': { value: 1, unit: 'kg' } }).outputs['mass-percent'].value, 0.5);
  assert.throws(() => run('mass-percent-concentration', { 'solute-mass': 11, 'solution-mass': 10 }), { code: 'SOLUTE_EXCEEDS_SOLUTION' });

  close(run('moles-from-mass', { 'sample-mass': { value: 36, unit: 'g' }, 'molar-mass': { value: 18, unit: 'g/mol' } }).outputs.amount.value, 2);
  close(run('moles-from-mass', { 'sample-mass': { value: 1, unit: 'kg' }, 'molar-mass': { value: 1, unit: 'kg/mol' } }).outputs.amount.value, 1);
  assert.throws(() => run('moles-from-mass', { 'sample-mass': 1, 'molar-mass': 0 }), { code: 'POSITIVE_MOLAR_MASS_REQUIRED' });
});

test('business estimates explain rounding and support losses without hiding them', () => {
  const breakEven = run('break-even-analysis', { 'fixed-costs': 16800, 'selling-price': 1250, 'variable-cost': 850 });
  close(breakEven.outputs['theoretical-break-even-units'].value, 42);
  close(breakEven.outputs['whole-break-even-units'].value, 42);
  close(breakEven.outputs['break-even-revenue'].value, 52500);
  const rounded = run('break-even-analysis', { 'fixed-costs': 101, 'selling-price': 10, 'variable-cost': 3 });
  close(rounded.outputs['whole-break-even-units'].value, 15);
  const justAboveWhole = run('break-even-analysis', { 'fixed-costs': 10.000000000000002, 'selling-price': 2, 'variable-cost': 0 });
  assert.equal(justAboveWhole.outputs['whole-break-even-units'].value, 6);
  assert.throws(() => run('break-even-analysis', { 'fixed-costs': 100, 'selling-price': 8, 'variable-cost': 8 }), { code: 'NON_POSITIVE_CONTRIBUTION_MARGIN' });

  const gross = run('gross-margin', { revenue: 200, 'cost-of-goods-sold': 120 });
  close(gross.outputs['gross-profit'].value, 80);
  close(gross.outputs['gross-margin'].value, 0.4);
  const loss = run('gross-margin', { revenue: 100, 'cost-of-goods-sold': 120 });
  close(loss.outputs['gross-profit'].value, -20);
  close(loss.outputs['gross-margin'].value, -0.2);
  assert.throws(() => run('gross-margin', { revenue: 0, 'cost-of-goods-sold': 1 }), { code: 'POSITIVE_REVENUE_REQUIRED' });
});

test('software and AI sizing tools distinguish units, boundaries, and invalid rates', () => {
  const transfer = run('data-transfer-time', { 'file-size': 1, 'transfer-rate': 100 });
  close(transfer.outputs.seconds.value, 80);
  close(run('data-transfer-time', { 'file-size': '2 thousand', 'transfer-rate': 1000 }).outputs.seconds.value, 16000);
  assert.throws(() => run('data-transfer-time', { 'file-size': 1, 'transfer-rate': 0 }), { code: 'POSITIVE_RATE_REQUIRED' });

  close(run('service-availability', { 'total-time': 43200, downtime: 43.2 }).outputs.availability.value, 0.999);
  close(run('service-availability', { 'total-time': 100, downtime: 100 }).outputs.availability.value, 0);
  assert.throws(() => run('service-availability', { 'total-time': 10, downtime: 11 }), { code: 'DOWNTIME_EXCEEDS_TOTAL' });
  assert.throws(() => run('service-availability', { 'total-time': 0, downtime: 0 }), { code: 'POSITIVE_OBSERVATION_TIME_REQUIRED' });

  const model = run('model-weight-memory', { parameters: '7 billion', 'bits-per-parameter': 4 });
  close(model.outputs['decimal-gigabytes'].value, 3.5);
  close(model.outputs['binary-gibibytes'].value, 3.5e9 / 2 ** 30);
  close(run('model-weight-memory', { parameters: 1000, 'bits-per-parameter': 8 }).outputs['decimal-gigabytes'].value, 0.000001);
  assert.throws(() => run('model-weight-memory', { parameters: 1000, 'bits-per-parameter': 3 }), { code: 'UNSUPPORTED_PARAMETER_PRECISION' });
  assert.throws(() => run('model-weight-memory', { parameters: 9_007_199_254_740_992, 'bits-per-parameter': 8 }), { code: 'POSITIVE_SAFE_PARAMETER_COUNT_REQUIRED' });
});

test('visual, energy, mining sample, and astronomy calculators enforce physical input meaning', () => {
  const circle = run('circle-area-circumference', { radius: { value: 100, unit: 'cm' } });
  close(circle.outputs.circumference.value, 2 * Math.PI);
  close(circle.outputs.area.value, Math.PI);
  const doubleRadius = run('circle-area-circumference', { radius: { value: 2, unit: 'm' } });
  close(doubleRadius.outputs.area.value / circle.outputs.area.value, 4);
  assert.throws(() => run('circle-area-circumference', { radius: { value: 0, unit: 'm' } }), { code: 'POSITIVE_RADIUS_REQUIRED' });

  close(run('frame-duration', { 'frame-count': 240, 'frame-rate': 24 }).outputs.duration.value, 10);
  close(run('frame-duration', { 'frame-count': '2 thousand', 'frame-rate': 50 }).outputs.duration.value, 40);
  assert.throws(() => run('frame-duration', { 'frame-count': 10.5, 'frame-rate': 24 }), { code: 'WHOLE_NUMBER_REQUIRED' });
  assert.throws(() => run('frame-duration', { 'frame-count': 10, 'frame-rate': 0 }), { code: 'POSITIVE_FRAME_RATE_REQUIRED' });

  close(run('shutter-exposure', { 'shutter-angle': 180, 'frame-rate': 24 }).outputs['exposure-time'].value, 1 / 48);
  close(run('shutter-exposure', { 'shutter-angle': 360, 'frame-rate': 30 }).outputs['exposure-time'].value, 1 / 30);
  assert.throws(() => run('shutter-exposure', { 'shutter-angle': 0, 'frame-rate': 24 }), { code: 'SHUTTER_ANGLE_OUT_OF_RANGE' });

  close(run('battery-runtime', { 'usable-energy': 100, 'average-load': 20 }).outputs['runtime-hours'].value, 5);
  close(run('battery-runtime', { 'usable-energy': 100, 'average-load': 20 }).outputs['runtime-minutes'].value, 300);
  assert.throws(() => run('battery-runtime', { 'usable-energy': 100, 'average-load': 0 }), { code: 'POSITIVE_LOAD_REQUIRED' });

  close(run('ore-grade', { 'contained-mass': { value: 2, unit: 'kg' }, 'sample-mass': { value: 100000, unit: 'g' } }).outputs.grade.value, 0.02);
  assert.throws(() => run('ore-grade', { 'contained-mass': 2, 'sample-mass': 1 }), { code: 'CONTAINED_MASS_EXCEEDS_SAMPLE' });
  assert.throws(() => run('ore-grade', { 'contained-mass': 0, 'sample-mass': 0 }), { code: 'POSITIVE_SAMPLE_MASS_REQUIRED' });

  close(run('telescope-magnification', { 'objective-focal-length': 700, 'eyepiece-focal-length': 18 }).outputs.magnification.value, 700 / 18);
  close(run('telescope-magnification', { 'objective-focal-length': 1400, 'eyepiece-focal-length': 36 }).outputs.magnification.value, 700 / 18);
  assert.throws(() => run('telescope-magnification', { 'objective-focal-length': 700, 'eyepiece-focal-length': 0 }), { code: 'POSITIVE_EYEPIECE_FOCAL_LENGTH_REQUIRED' });
});

test('scale-word quantities are opt-in, bounded, and fail closed on ambiguous text', () => {
  close(run('percentage-of-amount', { 'base-amount': '2 crore', percentage: 2.5 }).outputs.amount.value, 500000);
  close(run('shared-bill-split', { 'bill-amount': 100, 'tip-percent': 0, people: '2 thousand' }).outputs['per-person'].value, 0.05);
  close(run('mechanical-power', { work: { value: '2 thousand', unit: 'J' }, 'elapsed-time': { value: 2, unit: 's' } }).outputs.power.value, 1000);
  close(run('kinetic-energy', { mass: { value: '2 thousand', unit: 'g' }, speed: '3' }).outputs['kinetic-energy'].value, 9);
  assert.throws(() => run('molarity', { 'solute-amount': '2 thousand', 'solution-volume': 1 }), { code: 'INVALID_NUMBER_FORMAT' });
  assert.throws(() => run('gross-margin', { revenue: '12 million bananas', 'cost-of-goods-sold': 4 }), { code: 'INVALID_MAGNITUDE_FORMAT' });
  assert.throws(() => run('percentage-change', { original: 'two hundred', new: 300 }), { code: 'INVALID_MAGNITUDE_FORMAT' });
});

test('scale invariants hold across proportional physical and operational inputs', () => {
  const densityA = run('density', { mass: { value: 1, unit: 'kg' }, volume: { value: 1, unit: 'L' } }).outputs.density.value;
  const densityB = run('density', { mass: { value: 2, unit: 'kg' }, volume: { value: 2, unit: 'L' } }).outputs.density.value;
  close(densityA, densityB);

  const work0 = run('work-done', { force: 10, displacement: 5, angle: 0 }).outputs.work.value;
  const work90 = run('work-done', { force: 10, displacement: 5, angle: 90 }).outputs.work.value;
  const work180 = run('work-done', { force: 10, displacement: 5, angle: 180 }).outputs.work.value;
  close(work0, -work180);
  close(work90, 0, 1e-14);

  const runtimeA = run('battery-runtime', { 'usable-energy': 120, 'average-load': 30 }).outputs['runtime-hours'].value;
  const runtimeB = run('battery-runtime', { 'usable-energy': 240, 'average-load': 60 }).outputs['runtime-hours'].value;
  close(runtimeA, runtimeB);

  for (const downtime of [0, 1, 10, 99, 100]) {
    const availability = run('service-availability', { 'total-time': 100, downtime }).outputs.availability.value;
    assert.ok(availability >= 0 && availability <= 1);
    if (downtime > 0) assert.ok(availability < run('service-availability', { 'total-time': 100, downtime: downtime - 1 }).outputs.availability.value);
  }
});

test('the expanded unit registry preserves dimensional conversion and rejects mismatched units', () => {
  close(run('density', { mass: { value: 1, unit: 'kg' }, volume: { value: 1000, unit: 'mL' } }).outputs.density.value, 1000);
  close(run('molarity', { 'solute-amount': { value: 500, unit: 'mmol' }, 'solution-volume': { value: 1, unit: 'L' } }).outputs.molarity.value, 0.5);
  close(run('moles-from-mass', { 'sample-mass': { value: 1, unit: 'kg' }, 'molar-mass': { value: 1000, unit: 'g/mol' } }).outputs.amount.value, 1);
  close(run('ohms-law', { voltage: { value: 1, unit: 'kV' }, resistance: { value: 1, unit: 'kohm' } }).outputs.current.value, 1);
  assert.throws(() => run('density', { mass: { value: 1, unit: 'kg' }, volume: { value: 1, unit: 'N' } }), { code: 'UNIT_NOT_ACCEPTED' });
});

test('calculators fail closed on overflow rather than returning plausible-looking outputs', () => {
  assert.throws(() => run('data-transfer-time', { 'file-size': 1e308, 'transfer-rate': 0.0001 }), { code: 'INVALID_OUTPUT_VALUE' });
  assert.throws(() => run('kinetic-energy', { mass: 1e308, speed: 1e308 }), { code: 'INVALID_OUTPUT_VALUE' });
  assert.throws(() => run('telescope-magnification', { 'objective-focal-length': 1e308, 'eyepiece-focal-length': 1e-308 }), { code: 'INVALID_OUTPUT_VALUE' });
});
