const UNIT_METRES = Object.freeze({ mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048 });
export function estimatePlanarVideoSpeed({ scalePixels, knownDistance, unit, start, end }) {
  const numbers = [scalePixels, knownDistance, start?.x, start?.y, start?.time, end?.x, end?.y, end?.time];
  if (!numbers.every(Number.isFinite) || !(scalePixels > 0) || !(knownDistance > 0) || !Object.hasOwn(UNIT_METRES, unit)) throw new TypeError('Enter a positive scale and two valid video points.');
  const elapsedSeconds = end.time - start.time;
  if (elapsedSeconds <= 0) throw new RangeError('The end point must be marked at a later video time.');
  const pixelTravel = Math.hypot(end.x - start.x, end.y - start.y);
  if (pixelTravel <= 0) throw new RangeError('The marked object did not move between the selected frames.');
  const metresPerPixel = knownDistance * UNIT_METRES[unit] / scalePixels;
  const speed = pixelTravel * metresPerPixel / elapsedSeconds;
  if (!Number.isFinite(speed)) throw new RangeError('The estimate is outside the supported numeric range.');
  return Object.freeze({ speed, elapsedSeconds, pixelTravel, metresPerPixel, scaleAssumption: 'constant planar scale; fixed camera; manually selected subject centers' });
}
