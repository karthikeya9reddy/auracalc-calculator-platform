import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addQuantities,
  createQuantity,
  divideQuantities,
  multiplyQuantities,
  powerQuantity,
  quantityAsUnitValue,
  subtractQuantities,
} from '../../src/calculation-core/index.mjs';

test('quantity addition converts compatible units before adding', () => {
  const sum = addQuantities(createQuantity(2, 'm'), createQuantity(3, 'ft'));
  assert.ok(Math.abs(sum.value - 2.9144) < 1e-12);
  assert.equal(sum.unit, 'm');
});

test('multiplication and division propagate dimensions and use base magnitudes', () => {
  const area = multiplyQuantities(createQuantity(2, 'm'), createQuantity(3, 'm'));
  assert.ok(Math.abs(quantityAsUnitValue(area, 'm2') - 6) < 1e-12);

  const velocity = divideQuantities(createQuantity(1000, 'm'), createQuantity(100, 's'));
  assert.ok(Math.abs(quantityAsUnitValue(velocity, 'm/s') - 10) < 1e-12);

  const squareRootUnsupported = () => powerQuantity(createQuantity(4, 'm'), 0.5);
  assert.throws(squareRootUnsupported, { code: 'INVALID_DIMENSION_EXPONENT' });
});

test('absolute temperatures and temperature differences use distinct arithmetic rules', () => {
  const absolute = createQuantity(20, 'degC');
  const delta = createQuantity(18, 'deltaF');
  const warmed = addQuantities(absolute, delta);
  assert.ok(Math.abs(quantityAsUnitValue(warmed, 'degC') - 30) < 1e-12);

  const difference = subtractQuantities(createQuantity(20, 'degC'), createQuantity(10, 'degC'));
  assert.ok(Math.abs(quantityAsUnitValue(difference, 'deltaC') - 10) < 1e-12);
  assert.throws(() => addQuantities(absolute, createQuantity(10, 'degC')), { code: 'INVALID_ABSOLUTE_TEMPERATURE_ADDITION' });
  assert.throws(() => subtractQuantities(delta, absolute), { code: 'INVALID_TEMPERATURE_SUBTRACTION' });
});

test('quantity arithmetic rejects incompatible dimensions and division by zero', () => {
  assert.throws(() => addQuantities(createQuantity(1, 'm'), createQuantity(1, 's')), { code: 'DIMENSION_MISMATCH' });
  assert.throws(() => divideQuantities(createQuantity(1, 'm'), createQuantity(0, 's')), { code: 'DIVISION_BY_ZERO' });
  assert.throws(() => multiplyQuantities(createQuantity(Number.MAX_VALUE, 'm'), createQuantity(2, 'm')), { code: 'NON_FINITE_RESULT' });
});

test('base quantities can be chained through addition and subtraction', () => {
  const first = multiplyQuantities(createQuantity(2, 'm'), createQuantity(3, 'm'));
  const second = multiplyQuantities(createQuantity(4, 'm'), createQuantity(5, 'm'));
  const total = addQuantities(first, second);
  assert.equal(quantityAsUnitValue(total, 'm2'), 26);
});
