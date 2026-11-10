import {
  BASE_DIMENSIONS,
  DIMENSIONLESS,
  divideDimensions,
  multiplyDimensions,
  powerDimension,
} from '../../src/calculation-core/index.mjs';

export const VELOCITY = divideDimensions(BASE_DIMENSIONS.length, BASE_DIMENSIONS.time);
export const ACCELERATION = divideDimensions(VELOCITY, BASE_DIMENSIONS.time);
export const AREA = powerDimension(BASE_DIMENSIONS.length, 2);
export const VOLUME = powerDimension(BASE_DIMENSIONS.length, 3);
export const FORCE = multiplyDimensions(BASE_DIMENSIONS.mass, ACCELERATION);
export const ENERGY = multiplyDimensions(FORCE, BASE_DIMENSIONS.length);
export const POWER = divideDimensions(ENERGY, BASE_DIMENSIONS.time);
export const PRESSURE = divideDimensions(FORCE, AREA);
export const DENSITY = divideDimensions(BASE_DIMENSIONS.mass, VOLUME);
export const CONCENTRATION = divideDimensions(BASE_DIMENSIONS.amount, VOLUME);
export const MOLAR_MASS = divideDimensions(BASE_DIMENSIONS.mass, BASE_DIMENSIONS.amount);
const CHARGE = multiplyDimensions(BASE_DIMENSIONS.electricCurrent, BASE_DIMENSIONS.time);
export const VOLTAGE = divideDimensions(ENERGY, CHARGE);
export const RESISTANCE = divideDimensions(VOLTAGE, BASE_DIMENSIONS.electricCurrent);

export function physicalInput(id, label, dimension, canonicalUnit, acceptedUnits, options = {}) {
  const field = { id, type: 'quantity', label, required: options.required !== false, dimension, canonicalUnit, acceptedUnits: Object.freeze([...acceptedUnits]) };
  if (options.required === false) field.required = false;
  if (options.min !== undefined || options.max !== undefined) {
    field.range = Object.freeze({ ...(options.min === undefined ? {} : { min: options.min }), ...(options.max === undefined ? {} : { max: options.max }), unit: canonicalUnit });
  }
  if (options.integer) field.integer = true;
  if (options.allowMagnitudeWords) field.allowMagnitudeWords = true;
  if (options.unitLabel) field.unitLabel = options.unitLabel;
  return Object.freeze(field);
}

export function scalarInput(id, label, unitLabel, options = {}) {
  const field = physicalInput(id, label, DIMENSIONLESS, '1', ['1'], options);
  if (!unitLabel) return field;
  return Object.freeze({ ...field, unitLabel });
}

export function physicalOutput(id, label, dimension, canonicalUnit, acceptedUnits = [canonicalUnit]) {
  return Object.freeze({ id, type: 'quantity', label, dimension, canonicalUnit, acceptedUnits: Object.freeze([...acceptedUnits]) });
}

export function scalarOutput(id, label, format = 'scalar') {
  return Object.freeze({
    id,
    type: 'quantity',
    label,
    dimension: DIMENSIONLESS,
    canonicalUnit: '1',
    acceptedUnits: Object.freeze(['1']),
    display: Object.freeze({ format }),
  });
}

export function r0Release(evidenceId) {
  return Object.freeze({
    status: 'published',
    reviewers: Object.freeze([Object.freeze({
      id: 'author-self-review',
      qualification: 'Developer self-review against the cited educational method and independent reference cases; no independent domain review recorded',
      independent: false,
    })]),
    evidenceIds: Object.freeze([evidenceId]),
  });
}

export const sciencePrecision = Object.freeze({
  numericModel: 'IEEE-754 binary64',
  note: 'Values are computed at full available precision and rounded only for display; measurement uncertainty is not included.',
});

export const scienceRounding = Object.freeze({
  policy: 'Keep full internal result; round displayed values to a maximum of 6 fractional digits.',
});

export function stepNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  return Number(value.toPrecision(8)).toString();
}

export function reference(id, citation, url) {
  return Object.freeze({ id, citation, url });
}
