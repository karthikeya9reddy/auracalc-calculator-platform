import { CalculationError } from './errors.mjs';
import {
  BASE_DIMENSIONS,
  DIMENSIONLESS,
  divideDimensions,
  multiplyDimensions,
  powerDimension,
} from './dimensions.mjs';

export const UNIT_REGISTRY_VERSION = 'si-core-3';

const units = new Map();

function addUnit(id, symbol, dimension, scale = 1, offset = 0, temperatureKind = 'linear') {
  if (!Number.isFinite(scale) || scale <= 0 || !Number.isFinite(offset)) {
    throw new CalculationError('INVALID_UNIT_DEFINITION', 'Unit scale and offset must be finite; scale must be positive.', { id });
  }
  if (units.has(id)) throw new CalculationError('DUPLICATE_UNIT', 'Unit identifiers must be unique.', { id });
  units.set(id, Object.freeze({ id, symbol, dimension, scale, offset, temperatureKind }));
}

const L = BASE_DIMENSIONS.length;
const M = BASE_DIMENSIONS.mass;
const T = BASE_DIMENSIONS.time;
const I = BASE_DIMENSIONS.electricCurrent;
const TH = BASE_DIMENSIONS.temperature;
const N = BASE_DIMENSIONS.amount;
const J = BASE_DIMENSIONS.luminousIntensity;
const A = BASE_DIMENSIONS.planeAngle;
const AREA = powerDimension(L, 2);
const VOLUME = powerDimension(L, 3);
const VELOCITY = divideDimensions(L, T);
const ACCELERATION = divideDimensions(VELOCITY, T);
const FORCE = multiplyDimensions(M, ACCELERATION);
const PRESSURE = divideDimensions(FORCE, AREA);
const ENERGY = multiplyDimensions(FORCE, L);
const POWER = divideDimensions(ENERGY, T);
const FREQUENCY = powerDimension(T, -1);
const FLOW = divideDimensions(VOLUME, T);
const DENSITY = divideDimensions(M, VOLUME);
const CONCENTRATION = divideDimensions(N, VOLUME);
const MOLAR_MASS = divideDimensions(M, N);
const CHARGE = multiplyDimensions(I, T);
const VOLTAGE = divideDimensions(ENERGY, CHARGE);
const RESISTANCE = divideDimensions(VOLTAGE, I);
// In SI, the radian is dimensionless; keep angular rate dimensionally s^-1.
const ANGULAR_VELOCITY = FREQUENCY;
const ANGULAR_ACCELERATION = divideDimensions(ANGULAR_VELOCITY, T);
const MOMENTUM = multiplyDimensions(M, VELOCITY);
const MOMENT_OF_INERTIA = multiplyDimensions(M, AREA);
const STIFFNESS = divideDimensions(FORCE, L);
const SPECIFIC_HEAT = divideDimensions(divideDimensions(ENERGY, M), TH);
const INVERSE_TEMPERATURE = powerDimension(TH, -1);
const MASS_FLOW = divideDimensions(M, T);
const DYNAMIC_VISCOSITY = multiplyDimensions(PRESSURE, T);
const CAPACITANCE = divideDimensions(CHARGE, VOLTAGE);
const THERMAL_CONDUCTIVITY = divideDimensions(POWER, multiplyDimensions(L, TH));

addUnit('1', '1', DIMENSIONLESS);

addUnit('m', 'm', L);
addUnit('km', 'km', L, 1000);
addUnit('cm', 'cm', L, 0.01);
addUnit('mm', 'mm', L, 0.001);
addUnit('in', 'in', L, 0.0254);
addUnit('ft', 'ft', L, 0.3048);
addUnit('yd', 'yd', L, 0.9144);
addUnit('mi', 'mi', L, 1609.344);
addUnit('m2', 'm²', AREA);
addUnit('ft2', 'ft²', AREA, 0.3048 ** 2);
addUnit('m3', 'm³', VOLUME);
addUnit('L', 'L', VOLUME, 0.001);
addUnit('mL', 'mL', VOLUME, 0.000001);
addUnit('cm3', 'cm³', VOLUME, 0.000001);

addUnit('kg', 'kg', M);
addUnit('g', 'g', M, 0.001);
addUnit('mg', 'mg', M, 0.000001);
addUnit('lbm', 'lb', M, 0.45359237);
addUnit('tonne', 't', M, 1000);

addUnit('s', 's', T);
addUnit('ms', 'ms', T, 0.001);
addUnit('min', 'min', T, 60);
addUnit('h', 'h', T, 3600);

addUnit('K', 'K', TH, 1, 0, 'absolute');
addUnit('degC', '°C', TH, 1, 273.15, 'absolute');
addUnit('degF', '°F', TH, 5 / 9, (459.67 * 5) / 9, 'absolute');
addUnit('deltaK', 'ΔK', TH, 1, 0, 'difference');
addUnit('deltaC', 'Δ°C', TH, 1, 0, 'difference');
addUnit('deltaF', 'Δ°F', TH, 5 / 9, 0, 'difference');

addUnit('A', 'A', I);
addUnit('mA', 'mA', I, 0.001);
addUnit('mol', 'mol', N);
addUnit('mmol', 'mmol', N, 0.001);
addUnit('cd', 'cd', J);
addUnit('rad', 'rad', A);
addUnit('deg', '°', A, Math.PI / 180);
addUnit('rad/s', 'rad/s', ANGULAR_VELOCITY);
addUnit('rad/s2', 'rad/s²', ANGULAR_ACCELERATION);
addUnit('rpm', 'rpm', ANGULAR_VELOCITY, (2 * Math.PI) / 60);

addUnit('m/s', 'm/s', VELOCITY);
addUnit('km/h', 'km/h', VELOCITY, 1000 / 3600);
addUnit('mph', 'mph', VELOCITY, 1609.344 / 3600);
addUnit('ft/s', 'ft/s', VELOCITY, 0.3048);
addUnit('m/s2', 'm/s²', ACCELERATION);
addUnit('Hz', 'Hz', FREQUENCY);

addUnit('N', 'N', FORCE);
addUnit('kN', 'kN', FORCE, 1000);
addUnit('lbf', 'lbf', FORCE, 4.4482216152605);
addUnit('Pa', 'Pa', PRESSURE);
addUnit('kPa', 'kPa', PRESSURE, 1000);
addUnit('MPa', 'MPa', PRESSURE, 1_000_000);
addUnit('bar', 'bar', PRESSURE, 100_000);
addUnit('psi', 'psi', PRESSURE, 6894.757293168361);
addUnit('J', 'J', ENERGY);
addUnit('mJ', 'mJ', ENERGY, 0.001);
addUnit('kJ', 'kJ', ENERGY, 1000);
addUnit('Wh', 'Wh', ENERGY, 3600);
addUnit('kWh', 'kWh', ENERGY, 3_600_000);
addUnit('W', 'W', POWER);
addUnit('kW', 'kW', POWER, 1000);
addUnit('MW', 'MW', POWER, 1_000_000);
addUnit('L/s', 'L/s', FLOW, 0.001);
addUnit('m3/s', 'm³/s', FLOW);
addUnit('kg/s', 'kg/s', MASS_FLOW);
addUnit('kgm/s', 'kg·m/s', MOMENTUM);
addUnit('Ns', 'N·s', MOMENTUM);
addUnit('kgm2', 'kg·m²', MOMENT_OF_INERTIA);
addUnit('Nm', 'N·m', ENERGY);
addUnit('N/m', 'N/m', STIFFNESS);
addUnit('J/kgK', 'J/(kg·K)', SPECIFIC_HEAT);
addUnit('1/K', '1/K', INVERSE_TEMPERATURE);
addUnit('Pa_s', 'Pa·s', DYNAMIC_VISCOSITY);
addUnit('W/mK', 'W/(m·K)', THERMAL_CONDUCTIVITY);
addUnit('kg/m3', 'kg/m³', DENSITY);
addUnit('g/cm3', 'g/cm³', DENSITY, 1000);
addUnit('g/mL', 'g/mL', DENSITY, 1000);
addUnit('tonne/m3', 't/m³', DENSITY, 1000);
addUnit('mol/L', 'mol/L', CONCENTRATION, 1000);
addUnit('mmol/L', 'mmol/L', CONCENTRATION, 1);
addUnit('g/mol', 'g/mol', MOLAR_MASS, 0.001);
addUnit('kg/mol', 'kg/mol', MOLAR_MASS);
addUnit('V', 'V', VOLTAGE);
addUnit('mV', 'mV', VOLTAGE, 0.001);
addUnit('kV', 'kV', VOLTAGE, 1000);
addUnit('ohm', 'Ω', RESISTANCE);
addUnit('kohm', 'kΩ', RESISTANCE, 1000);
addUnit('Mohm', 'MΩ', RESISTANCE, 1_000_000);
addUnit('C', 'C', CHARGE);
addUnit('mC', 'mC', CHARGE, 0.001);
addUnit('F', 'F', CAPACITANCE);
addUnit('mF', 'mF', CAPACITANCE, 0.001);
addUnit('uF', 'µF', CAPACITANCE, 0.000001);
addUnit('nF', 'nF', CAPACITANCE, 0.000000001);

// Data-size units share a dimension because the core's SI dimensions do not
// model information as a physical base dimension. These factors follow the
// decimal (kB/MB/GB) and binary (KiB/MiB/GiB/TiB) conventions respectively.
addUnit('B', 'B', DIMENSIONLESS);
addUnit('kB', 'kB', DIMENSIONLESS, 1000);
addUnit('MB', 'MB', DIMENSIONLESS, 1_000_000);
addUnit('GB', 'GB', DIMENSIONLESS, 1_000_000_000);
addUnit('TB', 'TB', DIMENSIONLESS, 1_000_000_000_000);
addUnit('KiB', 'KiB', DIMENSIONLESS, 2 ** 10);
addUnit('MiB', 'MiB', DIMENSIONLESS, 2 ** 20);
addUnit('GiB', 'GiB', DIMENSIONLESS, 2 ** 30);
addUnit('TiB', 'TiB', DIMENSIONLESS, 2 ** 40);

export function getUnit(unitId) {
  const unit = units.get(unitId);
  if (!unit) throw new CalculationError('UNKNOWN_UNIT', 'The selected unit is not supported.', { unitId });
  return unit;
}

export function listUnits() {
  return [...units.values()];
}

export function convertValue(value, fromUnitId, toUnitId) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CalculationError('NON_FINITE_VALUE', 'Unit conversion requires a finite numeric value.');
  }
  const from = getUnit(fromUnitId);
  const to = getUnit(toUnitId);
  if (!sameDimension(from.dimension, to.dimension)) {
    throw new CalculationError('DIMENSION_MISMATCH', 'These units measure different dimensions.', { fromUnitId, toUnitId });
  }
  if (from.temperatureKind !== to.temperatureKind) {
    throw new CalculationError('TEMPERATURE_KIND_MISMATCH', 'Absolute temperatures and temperature differences cannot be converted into each other.', { fromUnitId, toUnitId });
  }
  const baseValue = value * from.scale + from.offset;
  const converted = (baseValue - to.offset) / to.scale;
  if (!Number.isFinite(converted)) {
    throw new CalculationError('NON_FINITE_RESULT', 'Unit conversion produced a non-finite result.', { fromUnitId, toUnitId });
  }
  return converted;
}

export function sameDimension(left, right) {
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => left[key] === right[key]);
}

export function assertUnitDimension(unitId, expectedDimension) {
  const unit = getUnit(unitId);
  if (!sameDimension(unit.dimension, expectedDimension)) {
    throw new CalculationError('DIMENSION_MISMATCH', 'The selected unit does not match the required dimension.', { unitId });
  }
  return unit;
}
