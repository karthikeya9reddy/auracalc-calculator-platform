const UNIT_TO_METRE = Object.freeze({
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
});

function finitePositive(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new RangeError(`${name} must be a finite value greater than zero.`);
  }
  return number;
}

export function pixelDistance(first, second) {
  const values = [first?.x, first?.y, second?.x, second?.y].map(Number);
  if (!values.every(Number.isFinite)) throw new TypeError('Measurement points must have finite pixel coordinates.');
  return Math.hypot(values[2] - values[0], values[3] - values[1]);
}

export function scaleFromReference(referencePixels, referenceLength, unit) {
  const pixels = finitePositive(referencePixels, 'Reference pixel length');
  const length = finitePositive(referenceLength, 'Reference length');
  const metresPerUnit = UNIT_TO_METRE[unit];
  if (!metresPerUnit) throw new RangeError('Choose mm, cm, m, in, or ft as the reference unit.');
  return (length * metresPerUnit) / pixels;
}

export function scaledDistance(first, second, metresPerPixel, outputUnit = 'm') {
  const scale = finitePositive(metresPerPixel, 'Scale');
  const metres = pixelDistance(first, second) * scale;
  const unitFactor = UNIT_TO_METRE[outputUnit];
  if (!unitFactor) throw new RangeError('Choose a supported length unit.');
  return Object.freeze({ value: metres / unitFactor, unit: outputUnit, metres });
}

export function polygonPixelArea(points) {
  if (!Array.isArray(points) || points.length < 3) throw new RangeError('An area needs at least three points.');
  if (points.some(point => !Number.isFinite(Number(point?.x)) || !Number.isFinite(Number(point?.y)))) {
    throw new TypeError('Area points must have finite pixel coordinates.');
  }
  let twiceArea = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    twiceArea += Number(current.x) * Number(next.y) - Number(next.x) * Number(current.y);
  }
  return Math.abs(twiceArea) / 2;
}

export function scaledArea(points, metresPerPixel, outputUnit = 'm') {
  const scale = finitePositive(metresPerPixel, 'Scale');
  const unitFactor = UNIT_TO_METRE[outputUnit];
  if (!unitFactor) throw new RangeError('Choose a supported area unit.');
  const squareMetres = polygonPixelArea(points) * scale ** 2;
  return Object.freeze({ value: squareMetres / unitFactor ** 2, unit: `${outputUnit}²`, squareMetres });
}

export function supportedMeasurementUnits() {
  return Object.freeze(Object.keys(UNIT_TO_METRE));
}
