import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_DIMENSIONS,
  DIMENSIONLESS,
  dimensionLabel,
  dimensionsEqual,
  divideDimensions,
  makeDimension,
  multiplyDimensions,
  powerDimension,
} from '../../src/calculation-core/index.mjs';

test('dimension algebra creates area, velocity, and dimensionless ratios', () => {
  const area = multiplyDimensions(BASE_DIMENSIONS.length, BASE_DIMENSIONS.length);
  const velocity = divideDimensions(BASE_DIMENSIONS.length, BASE_DIMENSIONS.time);
  const ratio = divideDimensions(BASE_DIMENSIONS.length, BASE_DIMENSIONS.length);

  assert.equal(area.length, 2);
  assert.equal(velocity.length, 1);
  assert.equal(velocity.time, -1);
  assert.ok(dimensionsEqual(ratio, DIMENSIONLESS));
  assert.equal(dimensionLabel(DIMENSIONLESS), 'dimensionless');
  assert.deepEqual(powerDimension(BASE_DIMENSIONS.time, -2), makeDimension({ time: -2 }));
});

test('dimension constructors reject unsupported keys and non-integer exponents', () => {
  assert.throws(() => makeDimension({ currency: 1 }), { code: 'UNKNOWN_DIMENSION' });
  assert.throws(() => makeDimension({ length: 0.5 }), { code: 'INVALID_DIMENSION_EXPONENT' });
  assert.throws(() => powerDimension(BASE_DIMENSIONS.length, 0.5), { code: 'INVALID_DIMENSION_EXPONENT' });
});
