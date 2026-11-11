import test from 'node:test';
import assert from 'node:assert/strict';
import { convertValue, executeCalculation } from '../../src/calculation-core/index.mjs';
import { converterRegistry, listPublicConverters, publicDefinitions, publicRegistry } from '../../catalog/public/index.mjs';
import { unitConversionCalculators } from '../../catalog/public/unit-conversion-expansion.mjs';
import { recommendNextSteps } from '../../web/next-step-engine.mjs';

test('the separate converter catalog provides more than 2,000 real directed unit conversions', () => {
  assert.ok(unitConversionCalculators.length >= 2800);
  assert.equal(publicDefinitions.length, 299);
  assert.equal(publicDefinitions.some(definition => definition.id === 'angular-speed-from-rpm'), false);
  assert.equal(listPublicConverters().length, unitConversionCalculators.length);
  assert.equal([...publicRegistry.listPublished()].some(definition => definition.catalogKind === 'converter'), false);
  assert.equal([...converterRegistry.listPublished()].length, unitConversionCalculators.length);
  assert.equal(new Set(unitConversionCalculators.map(definition => definition.id)).size, unitConversionCalculators.length);
  for (const definition of unitConversionCalculators) {
    assert.equal(definition.visibility, 'public', definition.id);
    assert.equal(definition.catalogKind, 'converter', definition.id);
    assert.equal(definition.release.status, 'published', definition.id);
    assert.equal(definition.inputs.length, 1, definition.id);
    assert.equal(definition.outputs.length, 1, definition.id);
    assert.ok(definition.references[0].url.includes('nist.gov'), definition.id);
    assert.ok(definition.verificationCases.length, definition.id);
    assert.ok(definition.visualization?.title, definition.id);
    assert.ok(converterRegistry.get(definition.id), definition.id);
    assert.notEqual(definition.inputs[0].allowMagnitudeWords, true, definition.id);
  }
});

test('every generated conversion calculates and round-trips through its registered units', () => {
  for (const definition of unitConversionCalculators) {
    const sourceUnit = definition.inputs[0].canonicalUnit;
    const targetUnit = definition.outputs[0].canonicalUnit;
    const result = executeCalculation(definition, { value: '1' });
    const converted = result.outputs.converted.value;
    assert.ok(Number.isFinite(converted), definition.id);
    const roundTrip = convertValue(converted, targetUnit, sourceUnit);
    const tolerance = Math.max(1e-10, Math.abs(roundTrip) * 1e-10);
    assert.ok(Math.abs(roundTrip - 1) <= tolerance, `${definition.id}: round trip was ${roundTrip}`);
  }
});

test('NIST conversion reference examples and temperature semantics remain correct', () => {
  const run = (from, to, value) => executeCalculation(converterRegistry.get(`convert-${from}-to-${to}`), { value }).outputs.converted.value;
  assert.equal(run('meters', 'kilometers', 1250), 1.25);
  assert.ok(Math.abs(run('us-gallons', 'liters', 1) - 3.785411784) < 1e-12);
  assert.equal(run('pounds-per-square-inch', 'pascals', 1), 6894.757293168361);
  assert.ok(Math.abs(run('degrees-fahrenheit', 'degrees-celsius', 32)) < 1e-12);
  assert.ok(Math.abs(run('degrees-rankine', 'kelvins', 540) - 300) < 1e-12);
  assert.throws(() => executeCalculation(converterRegistry.get('convert-degrees-celsius-to-kelvins'), { value: -300 }), { code: 'INPUT_BELOW_ABSOLUTE_ZERO' });
  assert.throws(() => convertValue(1, 'rpm', 'Hz'), { code: 'DIMENSION_MISMATCH' });
});

test('lawn seed mass uses a dimensional sowing rate and accepts common label units', () => {
  const lawn = publicRegistry.get('lawn-seed-mass');
  const rate = lawn.inputs.find(input => input.id === 'sowing-rate');
  assert.deepEqual(rate.acceptedUnits, ['kg/m2', 'kg_ha', 'g_m2', 'lb_acre', 'oz_yd2']);
  const result = executeCalculation(lawn, {
    area: { value: 100, unit: 'm2' },
    'sowing-rate': { value: 30, unit: 'g_m2' },
  });
  assert.ok(Math.abs(result.outputs['seed-mass'].value - 3) < 1e-12);
});

test('each conversion family has usable next-step suggestions', () => {
  const seen = new Set();
  for (const definition of unitConversionCalculators) {
    if (seen.has(definition.category)) continue;
    seen.add(definition.category);
    const result = executeCalculation(definition, { value: 1 });
    assert.ok(recommendNextSteps(definition, result, publicDefinitions).length > 0, definition.category);
  }
  assert.ok(seen.size >= 25);
});
