import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { next100Calculators } from '../../catalog/public/next-100-expansion.mjs';
import { publicDefinitions } from '../../catalog/public/index.mjs';
import { recommendNextSteps } from '../../web/next-step-engine.mjs';
import { renderCalculationVisual } from '../../web/visual-system.mjs';

const byId = new Map(next100Calculators.map(definition => [definition.id, definition]));
const run = (id, values) => executeCalculation(byId.get(id), values);
const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);

class FakeNode {
  constructor(tag) { this.tagName = tag; this.attributes = {}; this.children = []; this.textContent = ''; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...children) { this.children.push(...children); }
}

test('the field expansion exposes 100 distinct, traceable calculators with a visual for every tool', () => {
  assert.equal(next100Calculators.length, 100);
  assert.equal(byId.size, 100);
  for (const definition of next100Calculators) {
    assert.ok(definition.references.length, definition.id);
    assert.ok(definition.verificationCases.length, definition.id);
    assert.ok(definition.method.description, definition.id);
    assert.ok(definition.visualization?.description, definition.id);
    assert.ok(definition.inputs.length > 0, definition.id);
    assert.ok(definition.outputs.length > 0, definition.id);
  }
});

test('every new calculator returns a finite result and method steps for representative valid inputs', () => {
  const oldDocument = globalThis.document;
  globalThis.document = {
    createElement: tag => new FakeNode(tag),
    createElementNS: (_namespace, tag) => new FakeNode(tag),
  };
  try {
    for (const definition of next100Calculators) {
      const raw = Object.fromEntries(definition.inputs.map(field => {
        const value = field.range?.min !== undefined && field.range.min >= 1
          ? field.range.min
          : field.range?.max !== undefined
            ? Math.min(field.range.max / 2, 1)
            : 1;
        return [field.id, field.acceptedUnits.length > 1 ? { value, unit: field.canonicalUnit } : value];
      }));
      if (definition.id === 'led-series-resistor') Object.assign(raw, { 'supply-voltage': 5, 'led-voltage': 2, current: 0.02 });

      const result = executeCalculation(definition, raw);
      assert.equal(result.status, 'success', definition.id);
      assert.equal(Object.keys(result.outputs).length, definition.outputs.length, definition.id);
      assert.ok(Object.values(result.outputs).every(output => Number.isFinite(output.value)), definition.id);
      assert.ok(result.intermediates.steps.length >= 3, definition.id);
      const visual = renderCalculationVisual(definition, result);
      assert.equal(visual.tagName, 'figure', definition.id);
      assert.ok(visual.children[1].children.length > 2, definition.id);
    }
  } finally {
    globalThis.document = oldDocument;
  }
});

test('every new calculator result offers safe carry-forward or an honest related-tool suggestion', () => {
  for (const definition of next100Calculators) {
    const raw = Object.fromEntries(definition.inputs.map(field => {
      const value = field.range?.min !== undefined && field.range.min >= 1 ? field.range.min : field.range?.max !== undefined ? Math.min(field.range.max / 2, 1) : 1;
      return [field.id, field.acceptedUnits.length > 1 ? { value, unit: field.canonicalUnit } : value];
    }));
    if (definition.id === 'led-series-resistor') Object.assign(raw, { 'supply-voltage': 5, 'led-voltage': 2, current: 0.02 });
    const result = executeCalculation(definition, raw);
    const suggestions = recommendNextSteps(definition, result, publicDefinitions);
    assert.ok(suggestions.length > 0, definition.id);
    for (const suggestion of suggestions) {
      assert.ok(suggestion.targetDefinition.id !== definition.id, definition.id);
      assert.ok(suggestion.reason.length > 15, definition.id);
      if (suggestion.handoff) assert.ok(Number.isFinite(suggestion.handoff.value), definition.id);
      else assert.match(suggestion.reason, /no result is prefilled/i, definition.id);
    }
  }
});

test('every currently released calculator has at least one next-step suggestion', () => {
  for (const definition of publicDefinitions.filter(item => !item.id.startsWith('convert-'))) {
    const result = {
      status: 'success',
      calculatorId: definition.id,
      methodVersion: definition.version,
      calculatedAt: '2026-01-01T00:00:00.000Z',
      unitRegistryVersion: 'catalog-coverage',
      outputs: Object.fromEntries(definition.outputs.map(output => [output.id, { value: 1, unit: output.canonicalUnit }])),
    };
    assert.ok(recommendNextSteps(definition, result, publicDefinitions).length > 0, definition.id);
  }
});

test('mathematics, finance, geometry, and statistics examples match reference values', () => {
  close(run('percentage-point-difference', { start: 12, end: 19 }).outputs.difference.value, 7);
  close(run('ratio-as-share', { part: 3, whole: 12 }).outputs.share.value, 0.25);
  close(run('arithmetic-mean-two', { 'value-1': -4, 'value-2': 10 }).outputs.mean.value, 3);
  close(run('point-distance-2d', { 'x-1': 1, 'y-1': 2, 'x-2': 4, 'y-2': 6 }).outputs.distance.value, 5);
  close(run('circle-sector-area', { radius: 2, angle: Math.PI / 2 }).outputs.area.value, Math.PI);
  close(run('sample-standard-error', { 'std-dev': 12, 'sample-count': 36 }).outputs['standard-error'].value, 2);
  close(run('simple-interest-return', { principal: 1000, 'annual-rate': 5, years: 2 }).outputs.interest.value, 100);
  close(run('compound-interest-earned', { principal: 1000, 'annual-rate': 5, periods: 2 }).outputs.interest.value, 102.5);
  close(run('loan-to-value-ratio', { loan: 180000, 'asset-value': 240000 }).outputs.ltv.value, 0.75);
  close(run('roof-pitch-percent', { rise: 1.5, run: 10 }).outputs.pitch.value, 0.15);
});

test('civil, mechanical, fluid, thermal, and electrical engineering examples preserve dimensions', () => {
  close(run('excavation-volume', { length: 2, width: 3, depth: 4 }).outputs.volume.value, 24);
  close(run('aggregate-tonnage-estimate', { volume: 2, 'bulk-density': 1500 }).outputs.mass.value, 3000);
  close(run('belt-linear-speed', { diameter: 0.5, rpm: 60 }).outputs.speed.value, Math.PI / 2);
  close(run('point-mass-rotational-inertia', { mass: 2, radius: 3 }).outputs.inertia.value, 18);
  close(run('centrifugal-force-estimate', { mass: 2, speed: 3, radius: 4 }).outputs.force.value, 4.5);
  close(run('ideal-braking-distance', { speed: 20, friction: 0.7 }).outputs.distance.value, 400 / (2 * 0.7 * 9.80665));
  close(run('fluid-head-pressure', { density: 1000, head: 2 }).outputs.pressure.value, 19613.3);
  close(run('hydraulic-power-output', { pressure: 200000, flow: 0.003 }).outputs.power.value, 600);
  close(run('pump-efficiency-estimate', { 'useful-power': 600, 'input-power': 1000 }).outputs.efficiency.value, 0.6);
  close(run('wall-thermal-resistance', { thickness: 0.2, conductivity: 1.5, area: 12 }).outputs.resistance.value, 0.2 / 18);
  close(run('convection-heat-transfer-rate', { coefficient: 10, area: 3, 'temperature-difference': 5 }).outputs['heat-rate'].value, 150);
  close(run('thermal-diffusivity', { conductivity: 0.8, density: 1000, 'heat-capacity': 2000 }).outputs.diffusivity.value, 4e-7);
  close(run('battery-energy-watt-hours', { voltage: 12, capacity: 100 }).outputs.energy.value, 1200);
  close(run('inductor-reactance', { frequency: 50, inductance: 0.1 }).outputs.reactance.value, 10 * Math.PI);
});

test('chemistry, mining, computing, media, and household examples match reference values', () => {
  close(run('moles-from-solution-volume', { concentration: 2, volume: 0.5 }).outputs.amount.value, 1);
  close(run('dilution-stock-volume', { 'stock-concentration': 1, 'final-volume': 0.5, 'target-concentration': 0.2 }).outputs['stock-volume'].value, 0.1);
  close(run('metal-recovered-mass', { 'feed-mass': 100, grade: 0.02, recovery: 0.8 }).outputs['metal-mass'].value, 1.6);
  close(run('blended-ore-grade-two-streams', { 'mass-1': 100, 'grade-1': 0.02, 'mass-2': 300, 'grade-2': 0.01 }).outputs.grade.value, 0.0125);
  close(run('uncompressed-image-size', { pixels: 1920 * 1080, channels: 4, 'bits-per-channel': 8 }).outputs.bytes.value, 8294400);
  close(run('video-size-from-bitrate', { bitrate: 8_000_000, duration: 60 }).outputs.size.value, 60_000_000);
  close(run('concurrent-requests-little-law', { 'request-rate': 10, latency: 0.2 }).outputs.concurrency.value, 2);
  close(run('camera-horizontal-field-of-view', { 'sensor-width': 36, 'focal-length': 50 }).outputs['field-of-view'].value, 2 * Math.atan(36 / 100));
  close(run('light-travel-time', { distance: 299_792_458 }).outputs.time.value, 1);
  close(run('paint-volume-coverage', { area: 20, coverage: 10, coats: 2 }).outputs.volume.value, 4);
  close(run('rainwater-harvest-volume', { 'catchment-area': 100, 'rainfall-depth': 0.02 }).outputs.volume.value, 2);
  close(run('trip-fuel-cost-estimate', { distance: 100, 'fuel-economy': 20, 'fuel-price': 1.5 }).outputs.cost.value, 7.5);
  close(run('daily-solar-energy-estimate', { 'rated-power': 5000, 'sun-hours': 5, 'performance-ratio': 0.8 }).outputs.energy.value, 20000);
  close(run('operational-carbon-estimate', { energy: 100, 'emissions-factor': 0.5 }).outputs.emissions.value, 50);
  close(run('water-use-volume-from-flow', { 'flow-rate': 3, duration: 60 }).outputs.volume.value, 180);
});

test('invalid rates, fractions, physical inputs, and zero denominators fail clearly', () => {
  assert.throws(() => run('ratio-as-share', { part: 1, whole: 0 }), { code: 'DIVISION_BY_ZERO' });
  assert.throws(() => run('compound-interest-earned', { principal: 100, 'annual-rate': -100, periods: 2 }), { code: 'RATE_OUT_OF_RANGE' });
  assert.throws(() => run('pump-efficiency-estimate', { 'useful-power': 110, 'input-power': 100 }), { code: 'EFFICIENCY_OUT_OF_RANGE' });
  assert.throws(() => run('led-series-resistor', { 'supply-voltage': 2, 'led-voltage': 2, current: 0.02 }), { code: 'SUPPLY_VOLTAGE_REQUIRED' });
  assert.throws(() => run('molar-mass-from-sample', { mass: 0.1, amount: 0 }), { code: 'DIVISION_BY_ZERO' });
  assert.throws(() => run('sample-standard-error', { 'std-dev': 12, 'sample-count': 0 }), { code: 'INPUT_BELOW_MINIMUM' });
  assert.throws(() => run('geometric-mean-two', { 'value-1': -1, 'value-2': 4 }), { code: 'INPUT_BELOW_MINIMUM' });
});
