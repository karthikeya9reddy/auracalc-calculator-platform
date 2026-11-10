import { CalculationError } from './errors.mjs';

export const DIMENSION_KEYS = Object.freeze([
  'length',
  'mass',
  'time',
  'electricCurrent',
  'temperature',
  'amount',
  'luminousIntensity',
  'planeAngle',
]);

export function makeDimension(exponents = {}) {
  if (!exponents || typeof exponents !== 'object' || Array.isArray(exponents)) {
    throw new CalculationError('INVALID_DIMENSION', 'A dimension must be an exponent map.');
  }

  for (const key of Object.keys(exponents)) {
    if (!DIMENSION_KEYS.includes(key)) {
      throw new CalculationError('UNKNOWN_DIMENSION', 'The dimension contains an unsupported base dimension.', { key });
    }
  }

  const dimension = {};
  for (const key of DIMENSION_KEYS) {
    const exponent = exponents[key] ?? 0;
    if (!Number.isInteger(exponent)) {
      throw new CalculationError('INVALID_DIMENSION_EXPONENT', 'Dimension exponents must be integers.', { key });
    }
    dimension[key] = exponent;
  }
  return Object.freeze(dimension);
}

export const DIMENSIONLESS = makeDimension();

export const BASE_DIMENSIONS = Object.freeze({
  length: makeDimension({ length: 1 }),
  mass: makeDimension({ mass: 1 }),
  time: makeDimension({ time: 1 }),
  electricCurrent: makeDimension({ electricCurrent: 1 }),
  temperature: makeDimension({ temperature: 1 }),
  amount: makeDimension({ amount: 1 }),
  luminousIntensity: makeDimension({ luminousIntensity: 1 }),
  planeAngle: makeDimension({ planeAngle: 1 }),
});

export function dimensionsEqual(left, right) {
  if (!left || !right || Object.keys(left).length !== DIMENSION_KEYS.length || Object.keys(right).length !== DIMENSION_KEYS.length) return false;
  if (!DIMENSION_KEYS.every(key => Number.isInteger(left[key]) && Number.isInteger(right[key]))) return false;
  return DIMENSION_KEYS.every(key => left[key] === right[key]);
}

export function multiplyDimensions(left, right) {
  const result = {};
  for (const key of DIMENSION_KEYS) result[key] = left[key] + right[key];
  return makeDimension(result);
}

export function divideDimensions(left, right) {
  const result = {};
  for (const key of DIMENSION_KEYS) result[key] = left[key] - right[key];
  return makeDimension(result);
}

export function powerDimension(dimension, exponent) {
  if (!Number.isInteger(exponent)) {
    throw new CalculationError('INVALID_DIMENSION_EXPONENT', 'Dimension powers must be integers.');
  }
  const result = {};
  for (const key of DIMENSION_KEYS) {
    const value = dimension[key] * exponent;
    result[key] = Object.is(value, -0) ? 0 : value;
  }
  return makeDimension(result);
}

export function dimensionLabel(dimension) {
  const parts = DIMENSION_KEYS
    .filter(key => dimension[key] !== 0)
    .map(key => `${key}^${dimension[key]}`);
  return parts.length ? parts.join('·') : 'dimensionless';
}
