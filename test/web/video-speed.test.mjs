import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatePlanarVideoSpeed } from '../../web/measure/video-speed-core.mjs';

test('planar video speed uses calibrated scale and actual elapsed video time', () => {
  const result = estimatePlanarVideoSpeed({ scalePixels: 100, knownDistance: 2, unit: 'm', start: { x: 10, y: 10, time: 1 }, end: { x: 60, y: 10, time: 3 } });
  assert.equal(result.speed, .5); assert.equal(result.pixelTravel, 50); assert.equal(result.elapsedSeconds, 2);
  assert.equal(estimatePlanarVideoSpeed({ scalePixels: 100, knownDistance: 200, unit: 'cm', start: { x: 0, y: 0, time: 2 }, end: { x: 50, y: 0, time: 4 } }).speed, .5);
});
test('video speed rejects missing scale, unknown units, invalid points, and zero or negative time', () => {
  const base = { scalePixels: 100, knownDistance: 1, unit: 'm', start: { x: 0, y: 0, time: 1 }, end: { x: 10, y: 0, time: 2 } };
  for (const change of [{ scalePixels: 0 }, { knownDistance: -1 }, { unit: 'px' }, { start: { x: NaN, y: 0, time: 0 } }, { end: { x: 0, y: 0, time: 1 } }]) assert.throws(() => estimatePlanarVideoSpeed({ ...base, ...change }));
  assert.throws(() => estimatePlanarVideoSpeed({ ...base, end: { ...base.end, time: base.start.time } }), /later video time/);
});
