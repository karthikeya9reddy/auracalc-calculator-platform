import { CalculationError } from './errors.mjs';
import {
  BASE_DIMENSIONS,
  DIMENSIONLESS,
  dimensionsEqual,
  divideDimensions,
  makeDimension,
  multiplyDimensions,
  powerDimension,
} from './dimensions.mjs';
import { convertValue, getUnit } from './units.mjs';

export function createQuantity(value, unitId) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CalculationError('NON_FINITE_VALUE', 'A quantity requires a finite numeric value.');
  }
  const unit = getUnit(unitId);
  return Object.freeze({
    value,
    unit: unitId,
    dimension: unit.dimension,
    temperatureKind: unit.temperatureKind,
    baseValue: false,
  });
}

export function convertQuantity(quantity, targetUnitId) {
  assertQuantity(quantity);
  const target = getUnit(targetUnitId);
  if (!dimensionsEqual(quantity.dimension, target.dimension)) {
    throw new CalculationError('DIMENSION_MISMATCH', 'The target unit measures a different dimension.', { targetUnitId });
  }
  if (quantity.temperatureKind !== target.temperatureKind) {
    throw new CalculationError('TEMPERATURE_KIND_MISMATCH', 'Absolute temperatures and temperature differences cannot be converted into each other.', { targetUnitId });
  }
  const value = quantity.baseValue
    ? (quantity.value - target.offset) / target.scale
    : convertValue(quantity.value, quantity.unit, targetUnitId);
  return createQuantity(value, targetUnitId);
}

export function addQuantities(left, right) {
  assertCompatibleDimensions(left, right);
  if (isTemperature(left.dimension)) {
    const kind = addTemperatureKinds(left.temperatureKind, right.temperatureKind, false);
    const leftBase = toBaseQuantity(left);
    const rightBase = toBaseQuantity(right);
    return baseQuantity(leftBase.value + rightBase.value, left.dimension, kind);
  }
  if (left.baseValue || right.baseValue) {
    const leftBase = toBaseQuantity(left);
    const rightBase = toBaseQuantity(right);
    return baseQuantity(finiteResult(leftBase.value + rightBase.value), left.dimension, 'linear');
  }
  const convertedRight = convertQuantity(right, left.unit);
  return createQuantity(finiteResult(left.value + convertedRight.value), left.unit);
}

export function subtractQuantities(left, right) {
  assertCompatibleDimensions(left, right);
  if (isTemperature(left.dimension)) {
    const kind = addTemperatureKinds(left.temperatureKind, right.temperatureKind, true);
    const leftBase = toBaseQuantity(left);
    const rightBase = toBaseQuantity(right);
    return baseQuantity(finiteResult(leftBase.value - rightBase.value), left.dimension, kind);
  }
  if (left.baseValue || right.baseValue) {
    const leftBase = toBaseQuantity(left);
    const rightBase = toBaseQuantity(right);
    return baseQuantity(finiteResult(leftBase.value - rightBase.value), left.dimension, 'linear');
  }
  const convertedRight = convertQuantity(right, left.unit);
  return createQuantity(finiteResult(left.value - convertedRight.value), left.unit);
}

export function multiplyQuantities(left, right) {
  assertQuantity(left);
  assertQuantity(right);
  const dimension = multiplyDimensions(left.dimension, right.dimension);
  const temperatureKind = productTemperatureKind(left, right, dimension, false);
  const baseLeft = toBaseQuantity(left);
  const baseRight = toBaseQuantity(right);
  return baseQuantity(finiteResult(baseLeft.value * baseRight.value), dimension, temperatureKind);
}

export function divideQuantities(left, right) {
  assertQuantity(left);
  assertQuantity(right);
  if (toBaseQuantity(right).value === 0) throw new CalculationError('DIVISION_BY_ZERO', 'A quantity cannot be divided by zero.');
  const dimension = divideDimensions(left.dimension, right.dimension);
  const temperatureKind = productTemperatureKind(left, right, dimension, true);
  const baseLeft = toBaseQuantity(left);
  const baseRight = toBaseQuantity(right);
  return baseQuantity(finiteResult(baseLeft.value / baseRight.value), dimension, temperatureKind);
}

export function powerQuantity(quantity, exponent) {
  assertQuantity(quantity);
  if (!Number.isInteger(exponent)) {
    throw new CalculationError('INVALID_DIMENSION_EXPONENT', 'Quantity powers must be integers in this foundation.');
  }
  const dimension = powerDimension(quantity.dimension, exponent);
  const temperatureKind = dimensionsEqual(dimension, BASE_DIMENSIONS.temperature) && exponent === 1
    ? quantity.temperatureKind
    : 'linear';
  const base = toBaseQuantity(quantity);
  return baseQuantity(finiteResult(base.value ** exponent), dimension, temperatureKind);
}

export function toBaseQuantity(quantity) {
  assertQuantity(quantity);
  if (quantity.baseValue) return quantity;
  const unit = getUnit(quantity.unit);
  const value = quantity.value * unit.scale + unit.offset;
  return baseQuantity(finiteResult(value), quantity.dimension, quantity.temperatureKind);
}

export function quantityAsUnitValue(quantity, targetUnitId) {
  return convertQuantity(quantity, targetUnitId).value;
}

function baseQuantity(value, dimension, temperatureKind) {
  if (!Number.isFinite(value)) throw new CalculationError('NON_FINITE_RESULT', 'Quantity arithmetic produced a non-finite result.');
  return Object.freeze({ value, unit: null, dimension: makeDimension(dimension), temperatureKind, baseValue: true });
}

function finiteResult(value) {
  if (!Number.isFinite(value)) throw new CalculationError('NON_FINITE_RESULT', 'Quantity arithmetic produced a non-finite result.');
  return value;
}

function assertQuantity(quantity) {
  if (!quantity || typeof quantity !== 'object' || typeof quantity.value !== 'number' || !Number.isFinite(quantity.value) || !quantity.dimension) {
    throw new CalculationError('INVALID_QUANTITY', 'A valid quantity is required.');
  }
  const dimension = makeDimension(quantity.dimension);
  if (!dimensionsEqual(dimension, quantity.dimension)) {
    throw new CalculationError('INVALID_QUANTITY', 'A quantity must have a complete integer dimension vector.');
  }
  if (quantity.baseValue) {
    if (quantity.unit !== null) throw new CalculationError('INVALID_QUANTITY', 'A base quantity cannot claim a display unit.');
    if (isTemperature(dimension) && !['absolute', 'difference', 'linear'].includes(quantity.temperatureKind)) {
      throw new CalculationError('INVALID_QUANTITY', 'A base temperature quantity must declare its semantic role.');
    }
    return;
  }
  if (typeof quantity.unit !== 'string') {
    throw new CalculationError('INVALID_QUANTITY', 'A non-base quantity must include a unit.');
  }
  const unit = getUnit(quantity.unit);
  if (!dimensionsEqual(unit.dimension, dimension) || unit.temperatureKind !== quantity.temperatureKind) {
    throw new CalculationError('DIMENSION_MISMATCH', 'The quantity unit or temperature role does not match its metadata.');
  }
}

function assertCompatibleDimensions(left, right) {
  assertQuantity(left);
  assertQuantity(right);
  if (!dimensionsEqual(left.dimension, right.dimension)) {
    throw new CalculationError('DIMENSION_MISMATCH', 'Addition and subtraction require matching dimensions.');
  }
}

function isTemperature(dimension) {
  return dimensionsEqual(dimension, BASE_DIMENSIONS.temperature);
}

function addTemperatureKinds(leftKind, rightKind, isSubtraction) {
  if (leftKind === 'absolute' && rightKind === 'absolute') {
    if (isSubtraction) return 'difference';
    throw new CalculationError('INVALID_ABSOLUTE_TEMPERATURE_ADDITION', 'Two absolute temperatures cannot be added.');
  }
  if (leftKind === 'difference' && rightKind === 'absolute') {
    if (isSubtraction) throw new CalculationError('INVALID_TEMPERATURE_SUBTRACTION', 'A temperature difference cannot have an absolute temperature subtracted from it.');
    return 'absolute';
  }
  if (leftKind === 'absolute' && rightKind === 'difference') return 'absolute';
  if (leftKind === 'difference' && rightKind === 'difference') return 'difference';
  throw new CalculationError('INVALID_TEMPERATURE_OPERATION', 'Temperature arithmetic requires absolute or difference temperature quantities.');
}

function productTemperatureKind(left, right, resultDimension, isDivision) {
  if (!dimensionsEqual(resultDimension, BASE_DIMENSIONS.temperature)) return 'linear';
  if (isDivision && left.temperatureKind === 'absolute' && dimensionsEqual(right.dimension, DIMENSIONLESS)) return 'absolute';
  if (!isDivision && left.temperatureKind === 'absolute' && dimensionsEqual(right.dimension, DIMENSIONLESS)) return 'absolute';
  if (!isDivision && right.temperatureKind === 'absolute' && dimensionsEqual(left.dimension, DIMENSIONLESS)) return 'absolute';
  if (isDivision && left.temperatureKind === 'difference' && dimensionsEqual(right.dimension, DIMENSIONLESS)) return 'difference';
  if (!isDivision && left.temperatureKind === 'difference' && dimensionsEqual(right.dimension, DIMENSIONLESS)) return 'difference';
  if (!isDivision && right.temperatureKind === 'difference' && dimensionsEqual(left.dimension, DIMENSIONLESS)) return 'difference';
  return 'linear';
}
