import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_DIMENSIONS, convertValue, divideDimensions, getUnit, listUnits, multiplyDimensions, powerDimension, UNIT_REGISTRY_VERSION } from '../../src/calculation-core/index.mjs';

test('the unit registry is versioned and exposes immutable definitions', () => {
  assert.equal(UNIT_REGISTRY_VERSION, 'si-core-6');
  assert.ok(listUnits().length >= 40);
  assert.equal(Object.isFrozen(getUnit('m')), true);
});

test('angular speed is dimensionally separate from cyclic frequency', () => {
  assert.ok(Math.abs(convertValue(60, 'rpm', 'rad/s') - 2 * Math.PI) < 1e-12);
  assert.throws(() => convertValue(1, 'rpm', 'Hz'), { code: 'DIMENSION_MISMATCH' });
  assert.ok(Math.abs(convertValue(1, 'Hz', 'Hz') - 1) < 1e-12);
});

test('common length, force, and pressure conversions use explicit factors', () => {
  assert.ok(Math.abs(convertValue(1, 'mi', 'm') - 1609.344) < 1e-10);
  assert.ok(Math.abs(convertValue(12, 'in', 'ft') - 1) < 1e-12);
  assert.ok(Math.abs(convertValue(1, 'psi', 'kPa') - 6.894757293168361) < 1e-10);
  assert.ok(Math.abs(convertValue(1, 'lbf', 'N') - 4.4482216152605) < 1e-12);
});

test('chemistry mass units convert milligrams through grams and kilograms', () => {
  assert.equal(convertValue(1000, 'mg', 'g'), 1);
  assert.equal(convertValue(1_000_000, 'mg', 'kg'), 1);
});

test('engineering and data-size units preserve angular rate, energy, and binary byte conversions', () => {
  assert.ok(Math.abs(convertValue(60, 'rpm', 'rad/s') - 2 * Math.PI) < 1e-12);
  assert.equal(convertValue(1000, 'mJ', 'J'), 1);
  assert.equal(convertValue(1, 'GB', 'B'), 1_000_000_000);
  assert.equal(convertValue(1, 'GiB', 'B'), 2 ** 30);
  assert.ok(Math.abs(convertValue(1, 'TiB', 'GiB') - 1024) < 1e-12);
});

test('the new derived engineering units carry their physical dimensions and conversion factors', () => {
  assert.equal(convertValue(1, 'Ah', 'C'), 3600);
  assert.deepEqual(getUnit('kg/m2').dimension, divideDimensions(getUnit('kg').dimension, powerDimension(BASE_DIMENSIONS.length, 2)));
  assert.deepEqual(getUnit('H').dimension, multiplyDimensions(getUnit('ohm').dimension, BASE_DIMENSIONS.time));
  assert.equal(convertValue(1, 'm2/s', 'm2/s'), 1);
  assert.throws(() => convertValue(1, 'W/m2', 'W/m2K'), { code: 'DIMENSION_MISMATCH' });
});

test('fourth-power beam units, current density, activity, and apparent power keep explicit dimensions', () => {
  assert.equal(convertValue(1, 'cm4', 'm4'), 1e-8);
  assert.equal(convertValue(1, 'mm4', 'm4'), 1e-12);
  assert.ok(Math.abs(convertValue(1, 'in4', 'm4') - 0.0254 ** 4) < 1e-20);
  assert.deepEqual(getUnit('A/m2').dimension, divideDimensions(BASE_DIMENSIONS.electricCurrent, powerDimension(BASE_DIMENSIONS.length, 2)));
  assert.deepEqual(getUnit('Bq').dimension, powerDimension(BASE_DIMENSIONS.time, -1));
  assert.deepEqual(getUnit('VA').dimension, getUnit('W').dimension);
  assert.equal(convertValue(1, 'VA', 'W'), 1);
});

test('absolute temperatures convert with offsets and cannot convert to temperature differences', () => {
  assert.ok(Math.abs(convertValue(32, 'degF', 'degC')) < 1e-12);
  assert.ok(Math.abs(convertValue(212, 'degF', 'degC') - 100) < 1e-12);
  assert.ok(Math.abs(convertValue(0, 'degC', 'K') - 273.15) < 1e-12);
  assert.ok(Math.abs(convertValue(18, 'deltaF', 'deltaC') - 10) < 1e-12);
  assert.throws(() => convertValue(20, 'degC', 'deltaC'), { code: 'TEMPERATURE_KIND_MISMATCH' });
});

test('conversion rejects mismatched dimensions, unknown units, and non-finite values', () => {
  assert.throws(() => convertValue(1, 'm', 'kg'), { code: 'DIMENSION_MISMATCH' });
  assert.throws(() => convertValue(1, 'not-a-unit', 'm'), { code: 'UNKNOWN_UNIT' });
  assert.throws(() => convertValue(Infinity, 'm', 'ft'), { code: 'NON_FINITE_VALUE' });
});
