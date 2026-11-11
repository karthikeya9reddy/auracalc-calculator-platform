import test from 'node:test';
import assert from 'node:assert/strict';
import { deviceSpeed } from '../../web/measure/speed-core.mjs';
import { convertValue } from '../../src/calculation-core/index.mjs';

test('device speed accepts a stationary device and rejects unavailable or invalid readings', () => {
  assert.equal(deviceSpeed(0), 0);
  assert.equal(deviceSpeed(10), 10);
  for (const value of [null, undefined, -1, NaN, Infinity, '10']) assert.equal(deviceSpeed(value), null);
});

test('device speed uses metres per second before converting to display units', () => {
  assert.equal(convertValue(deviceSpeed(10), 'm/s', 'km/h'), 36);
  assert.ok(Math.abs(convertValue(deviceSpeed(10), 'm/s', 'mph') - 22.3693629205) < 1e-9);
});
