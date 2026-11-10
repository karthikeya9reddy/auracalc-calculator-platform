import { CalculationError, BASE_DIMENSIONS, DIMENSIONLESS, divideDimensions, multiplyDimensions, powerDimension } from '../../src/calculation-core/index.mjs';
import { educationalDefinition, calculated } from './educational-definition.mjs';
import { physicalInput, physicalOutput, scalarInput, scalarOutput } from './science-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const D = BASE_DIMENSIONS;
export const L2 = powerDimension(D.length, 2);
export const L3 = powerDimension(D.length, 3);
export const VELOCITY = divideDimensions(D.length, D.time);
export const ACCELERATION = divideDimensions(VELOCITY, D.time);
export const FORCE = multiplyDimensions(D.mass, ACCELERATION);
export const ENERGY = multiplyDimensions(FORCE, D.length);
export const POWER = divideDimensions(ENERGY, D.time);
export const PRESSURE = divideDimensions(FORCE, L2);
export const DENSITY = divideDimensions(D.mass, L3);
export const CONCENTRATION = divideDimensions(D.amount, L3);
export const FLOW = divideDimensions(L3, D.time);
export const MASS_FLOW = divideDimensions(D.mass, D.time);
export const MOMENTUM = multiplyDimensions(D.mass, VELOCITY);
export const MOMENT_OF_INERTIA = multiplyDimensions(D.mass, L2);
export const STIFFNESS = divideDimensions(FORCE, D.length);
export const SPECIFIC_HEAT = divideDimensions(divideDimensions(ENERGY, D.mass), D.temperature);
export const INV_TEMPERATURE = powerDimension(D.temperature, -1);
export const VISCOSITY = multiplyDimensions(PRESSURE, D.time);
export const THERMAL_CONDUCTIVITY = divideDimensions(POWER, multiplyDimensions(D.length, D.temperature));
export const ANGULAR_VELOCITY = powerDimension(D.time, -1);
export const ANGULAR_ACCELERATION = powerDimension(D.time, -2);
export const VOLTAGE = divideDimensions(ENERGY, multiplyDimensions(D.electricCurrent, D.time));
export const RESISTANCE = divideDimensions(VOLTAGE, D.electricCurrent);
export const CHARGE = multiplyDimensions(D.electricCurrent, D.time);
export const CAPACITANCE = divideDimensions(CHARGE, VOLTAGE);

export function qin(id, label, dimension, unit, units = [unit], options = {}) {
  return physicalInput(id, label, dimension, unit, units, { min: 0, allowMagnitudeWords: true, ...options });
}

export function sin(id, label, unitLabel = '', options = {}) {
  return scalarInput(id, label, unitLabel, { min: 0, allowMagnitudeWords: true, ...options });
}

export const qout = (id, label, dimension, unit, units = [unit]) => physicalOutput(id, label, dimension, unit, units);
export const sout = (id, label, format = 'scalar') => scalarOutput(id, label, format);

export function equation(spec) {
  return educationalDefinition({
    ...spec,
    calculate(inputs) {
      const values = Object.fromEntries(Object.entries(inputs).map(([id, quantity]) => [id, quantity.value]));
      const solved = spec.solve(values);
      const outputs = Object.fromEntries(Object.entries(solved.outputs).map(([id, pair]) => [id, { value: pair[0], unit: pair[1] }]));
      return calculated(outputs, spec.formula, solved.steps, solved.warnings || []);
    },
  });
}

export function positive(value, inputId, label) {
  if (!(value > 0)) throw new CalculationError('POSITIVE_VALUE_REQUIRED', `${label} must be greater than zero.`, { fieldId: inputId });
  return value;
}

export function safeWhole(value, inputId, label) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new CalculationError('SAFE_WHOLE_NUMBER_REQUIRED', `${label} must be a positive whole number within the supported numeric range.`, { fieldId: inputId });
  return value;
}

export { stepNumber };
