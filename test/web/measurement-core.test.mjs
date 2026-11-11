import test from 'node:test';
import assert from 'node:assert/strict';
import { pixelDistance, polygonPixelArea, scaleFromReference, scaledArea, scaledDistance } from '../../web/measurement-core.mjs';
import { convertValue, getUnit } from '../../src/calculation-core/index.mjs';

test('pixel distance uses Euclidean distance and rejects invalid coordinates', () => {
  assert.equal(pixelDistance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  assert.throws(() => pixelDistance({ x: 'bad', y: 0 }, { x: 3, y: 4 }), /finite pixel coordinates/);
});

test('known reference creates a consistent metric scale and transfers to supported units', () => {
  const metresPerPixel = scaleFromReference(100, 20, 'cm');
  const result = scaledDistance({ x: 0, y: 0 }, { x: 150, y: 0 }, metresPerPixel, 'm');
  assert.equal(result.value, 0.3);
  assert.ok(Math.abs(convertValue(result.metres, 'm', 'ft') - 0.984251968503937) < 1e-12);
  assert.ok(getUnit('m'));
});

test('scale rejects missing or unsupported calibration values', () => {
  assert.throws(() => scaleFromReference(0, 2, 'm'), /greater than zero/);
  assert.throws(() => scaleFromReference(10, -2, 'cm'), /greater than zero/);
  assert.throws(() => scaleFromReference(10, 2, 'yd'), /Choose mm, cm, m/);
});

test('polygon area and calibrated area agree with a known rectangle', () => {
  const corners = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }];
  assert.equal(polygonPixelArea(corners), 5000);
  const metresPerPixel = scaleFromReference(100, 1, 'm');
  const result = scaledArea(corners, metresPerPixel, 'm');
  assert.equal(result.value, 0.5);
  assert.ok(Math.abs(convertValue(result.squareMetres, 'm2', 'ft2') - 5.381955208354861) < 1e-12);
});

test('area requires at least three points and rejects degenerate calibration scale', () => {
  assert.throws(() => polygonPixelArea([{ x: 0, y: 0 }, { x: 1, y: 1 }]), /at least three/);
  assert.throws(() => scaledArea([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }], 0, 'm'), /greater than zero/);
});
