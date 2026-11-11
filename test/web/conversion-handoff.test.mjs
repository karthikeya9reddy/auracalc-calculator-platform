import test from 'node:test';
import assert from 'node:assert/strict';
import { compatibleOutputUnits, outputConversionPayload } from '../../web/conversion-handoff.mjs';

test('result handoff offers compatible units and refuses dimensionless results', () => {
  const speed = compatibleOutputUnits('m/s').map(unit => unit.id);
  assert.ok(speed.includes('km/h'));
  assert.ok(!speed.includes('m'));
  assert.deepEqual(compatibleOutputUnits('1'), []);
  assert.equal(outputConversionPayload({ value: NaN, unit: 'm' }, 'Example', 'Length'), null);
  assert.deepEqual(outputConversionPayload({ value: 0, unit: 'm/s' }, 'Speed', 'Average speed'), { value: 0, unit: 'm/s', title: 'Speed', label: 'Average speed' });
});

test('absolute temperatures do not mix with temperature differences', () => {
  const units = compatibleOutputUnits('degC').map(unit => unit.id);
  assert.ok(units.includes('degF'));
  assert.ok(!units.includes('deltaC'));
});
