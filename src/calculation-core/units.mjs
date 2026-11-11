import { CalculationError } from './errors.mjs';
import {
  BASE_DIMENSIONS,
  DIMENSIONLESS,
  divideDimensions,
  multiplyDimensions,
  powerDimension,
} from './dimensions.mjs';

export const UNIT_REGISTRY_VERSION = 'si-core-6';

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
const SECOND_MOMENT_OF_AREA = powerDimension(L, 4);
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
// Keep angle/time distinct from cycles/time. Radians are dimensionless in SI,
// but that distinction prevents silently treating rpm as Hz (a factor of 2π).
const ANGULAR_VELOCITY = divideDimensions(A, T);
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
const SURFACE_MASS_DENSITY = divideDimensions(M, AREA);
const CURRENT_DENSITY = divideDimensions(I, AREA);
const IRRADIANCE = divideDimensions(POWER, AREA);
const HEAT_TRANSFER_COEFFICIENT = divideDimensions(POWER, multiplyDimensions(AREA, TH));
const THERMAL_RESISTANCE = divideDimensions(TH, POWER);
const THERMAL_DIFFUSIVITY = divideDimensions(AREA, T);
const INDUCTANCE = multiplyDimensions(RESISTANCE, T);

addUnit('1', '1', DIMENSIONLESS);

addUnit('m', 'm', L);
addUnit('km', 'km', L, 1000);
addUnit('cm', 'cm', L, 0.01);
addUnit('mm', 'mm', L, 0.001);
addUnit('um', 'µm', L, 1e-6);
addUnit('nm', 'nm', L, 1e-9);
addUnit('pm', 'pm', L, 1e-12);
addUnit('angstrom', 'Å', L, 1e-10);
addUnit('in', 'in', L, 0.0254);
addUnit('ft', 'ft', L, 0.3048);
addUnit('ft_us', 'ft (US survey)', L, 1200 / 3937);
addUnit('yd', 'yd', L, 0.9144);
addUnit('mi', 'mi', L, 1609.344);
addUnit('mi_us', 'mi (US survey)', L, 5280 * (1200 / 3937));
addUnit('nmi', 'nmi', L, 1852);
addUnit('fathom', 'fathom', L, 1.8288);
addUnit('rod', 'rod', L, 5.0292);
addUnit('chain', 'chain', L, 20.1168);
addUnit('furlong', 'furlong', L, 201.168);
addUnit('link', 'link', L, 0.201168);
addUnit('AU', 'au', L, 149_597_870_700);
addUnit('ly', 'ly', L, 9_460_730_472_580_800);
addUnit('pc', 'pc', L, 3.085677581491367e16);
addUnit('m2', 'm²', AREA);
addUnit('km2', 'km²', AREA, 1e6);
addUnit('cm2', 'cm²', AREA, 1e-4);
addUnit('mm2', 'mm²', AREA, 1e-6);
addUnit('kg/m2', 'kg/m²', SURFACE_MASS_DENSITY);
addUnit('A/m2', 'A/m²', CURRENT_DENSITY);
addUnit('ft2', 'ft²', AREA, 0.3048 ** 2);
addUnit('ft_us2', 'ft² (US survey)', AREA, (1200 / 3937) ** 2);
addUnit('in2', 'in²', AREA, 0.0254 ** 2);
addUnit('yd2', 'yd²', AREA, 0.9144 ** 2);
addUnit('mi2', 'mi²', AREA, 1609.344 ** 2);
addUnit('acre', 'acre', AREA, 4046.8564224);
addUnit('hectare', 'ha', AREA, 10_000);
addUnit('are', 'a', AREA, 100);
addUnit('barn', 'b', AREA, 1e-28);
// Second moment of area is widely used in beam and section-property equations.
// Keep it distinct from mass moment of inertia through its length⁴ dimension.
addUnit('m4', 'm⁴', SECOND_MOMENT_OF_AREA);
addUnit('cm4', 'cm⁴', SECOND_MOMENT_OF_AREA, 1e-8);
addUnit('mm4', 'mm⁴', SECOND_MOMENT_OF_AREA, 1e-12);
addUnit('in4', 'in⁴', SECOND_MOMENT_OF_AREA, 0.0254 ** 4);
addUnit('ft4', 'ft⁴', SECOND_MOMENT_OF_AREA, 0.3048 ** 4);
addUnit('m3', 'm³', VOLUME);
addUnit('km3', 'km³', VOLUME, 1e9);
addUnit('mm3', 'mm³', VOLUME, 1e-9);
addUnit('L', 'L', VOLUME, 0.001);
addUnit('dL', 'dL', VOLUME, 1e-4);
addUnit('cL', 'cL', VOLUME, 1e-5);
addUnit('uL', 'µL', VOLUME, 1e-9);
addUnit('mL', 'mL', VOLUME, 0.000001);
addUnit('cm3', 'cm³', VOLUME, 0.000001);
addUnit('in3', 'in³', VOLUME, 0.0254 ** 3);
addUnit('ft3', 'ft³', VOLUME, 0.3048 ** 3);
addUnit('yd3', 'yd³', VOLUME, 0.9144 ** 3);
addUnit('USgal', 'US gal', VOLUME, 0.003785411784);
addUnit('USqt', 'US qt', VOLUME, 0.000946352946);
addUnit('USpt', 'US pt', VOLUME, 0.000473176473);
addUnit('UScup', 'US cup', VOLUME, 0.0002365882365);
addUnit('USfloz', 'US fl oz', VOLUME, 2.95735295625e-5);
addUnit('UStbsp', 'US tbsp', VOLUME, 1.478676478125e-5);
addUnit('UStsp', 'US tsp', VOLUME, 4.92892159375e-6);
addUnit('UKgal', 'Imperial gal', VOLUME, 0.00454609);
addUnit('UKpt', 'Imperial pt', VOLUME, 0.00056826125);
addUnit('UKfloz', 'Imperial fl oz', VOLUME, 2.84130625e-5);
addUnit('acre_ft', 'acre-ft', VOLUME, 1233.48183754752);

addUnit('kg', 'kg', M);
addUnit('g', 'g', M, 0.001);
addUnit('mg', 'mg', M, 0.000001);
addUnit('ug', 'µg', M, 1e-9);
addUnit('ng', 'ng', M, 1e-12);
addUnit('oz', 'oz', M, 0.028349523125);
addUnit('lbm', 'lb', M, 0.45359237);
addUnit('stone', 'st', M, 6.35029318);
addUnit('short_ton', 'short ton', M, 907.18474);
addUnit('long_ton', 'long ton', M, 1016.0469088);
addUnit('grain', 'gr', M, 0.00006479891);
addUnit('carat', 'ct', M, 0.0002);
addUnit('slug', 'slug', M, 14.5939029372);
addUnit('quintal', 'q', M, 100);
addUnit('tonne', 't', M, 1000);

addUnit('s', 's', T);
addUnit('ms', 'ms', T, 0.001);
addUnit('min', 'min', T, 60);
addUnit('h', 'h', T, 3600);
addUnit('day', 'd', T, 86400);
addUnit('week', 'wk', T, 604800);
addUnit('fortnight', 'fortnight', T, 1_209_600);
addUnit('year_julian', 'Julian year', T, 31_557_600);
addUnit('us', 'µs', T, 1e-6);
addUnit('ns', 'ns', T, 1e-9);

addUnit('K', 'K', TH, 1, 0, 'absolute');
addUnit('degC', '°C', TH, 1, 273.15, 'absolute');
addUnit('degF', '°F', TH, 5 / 9, (459.67 * 5) / 9, 'absolute');
addUnit('degR', '°R', TH, 5 / 9, 0, 'absolute');
addUnit('degRe', '°Ré', TH, 5 / 4, 273.15, 'absolute');
addUnit('deltaK', 'ΔK', TH, 1, 0, 'difference');
addUnit('deltaC', 'Δ°C', TH, 1, 0, 'difference');
addUnit('deltaF', 'Δ°F', TH, 5 / 9, 0, 'difference');
addUnit('deltaR', 'Δ°R', TH, 5 / 9, 0, 'difference');
addUnit('deltaRe', 'Δ°Ré', TH, 5 / 4, 0, 'difference');

addUnit('A', 'A', I);
addUnit('mA', 'mA', I, 0.001);
addUnit('mol', 'mol', N);
addUnit('mmol', 'mmol', N, 0.001);
addUnit('cd', 'cd', J);
addUnit('rad', 'rad', A);
addUnit('deg', '°', A, Math.PI / 180);
addUnit('arcmin', 'arcmin', A, Math.PI / 10_800);
addUnit('arcsec', 'arcsec', A, Math.PI / 648_000);
addUnit('grad', 'gon', A, Math.PI / 200);
addUnit('turn', 'turn', A, 2 * Math.PI);
addUnit('rad/s', 'rad/s', ANGULAR_VELOCITY);
addUnit('rad/s2', 'rad/s²', ANGULAR_ACCELERATION);
addUnit('rpm', 'rpm', ANGULAR_VELOCITY, (2 * Math.PI) / 60);
addUnit('deg/s', '°/s', ANGULAR_VELOCITY, Math.PI / 180);
addUnit('deg/min', '°/min', ANGULAR_VELOCITY, Math.PI / 1080);

addUnit('m/s', 'm/s', VELOCITY);
addUnit('km/h', 'km/h', VELOCITY, 1000 / 3600);
addUnit('mph', 'mph', VELOCITY, 1609.344 / 3600);
addUnit('ft/s', 'ft/s', VELOCITY, 0.3048);
addUnit('knot', 'kn', VELOCITY, 1852 / 3600);
addUnit('ft/min', 'ft/min', VELOCITY, 0.3048 / 60);
addUnit('ft/h', 'ft/h', VELOCITY, 0.3048 / 3600);
addUnit('in/s', 'in/s', VELOCITY, 0.0254);
addUnit('cm/s', 'cm/s', VELOCITY, 0.01);
addUnit('km/s', 'km/s', VELOCITY, 1000);
addUnit('m/s2', 'm/s²', ACCELERATION);
addUnit('Hz', 'Hz', FREQUENCY);
addUnit('Bq', 'Bq', FREQUENCY);

addUnit('N', 'N', FORCE);
addUnit('kN', 'kN', FORCE, 1000);
addUnit('lbf', 'lbf', FORCE, 4.4482216152605);
addUnit('dyn', 'dyn', FORCE, 1e-5);
addUnit('kgf', 'kgf', FORCE, 9.80665);
addUnit('kip', 'kip', FORCE, 4448.2216152605);
addUnit('pdl', 'pdl', FORCE, 0.138254954376);
addUnit('tf', 'tf', FORCE, 9806.65);
addUnit('Pa', 'Pa', PRESSURE);
addUnit('kPa', 'kPa', PRESSURE, 1000);
addUnit('MPa', 'MPa', PRESSURE, 1_000_000);
addUnit('bar', 'bar', PRESSURE, 100_000);
addUnit('psi', 'psi', PRESSURE, 6894.757293168361);
addUnit('atm', 'atm', PRESSURE, 101325);
addUnit('torr', 'Torr', PRESSURE, 101325 / 760);
addUnit('mmHg', 'mmHg', PRESSURE, 133.322387415);
addUnit('inHg', 'inHg', PRESSURE, 3386.389);
addUnit('mmH2O', 'mmH₂O', PRESSURE, 9.80665);
addUnit('cmH2O', 'cmH₂O', PRESSURE, 98.0665);
addUnit('inH2O', 'inH₂O', PRESSURE, 249.08891);
addUnit('mbar', 'mbar', PRESSURE, 100);
addUnit('hPa', 'hPa', PRESSURE, 100);
addUnit('kgf_cm2', 'kgf/cm²', PRESSURE, 98_066.5);
addUnit('J', 'J', ENERGY);
addUnit('mJ', 'mJ', ENERGY, 0.001);
addUnit('kJ', 'kJ', ENERGY, 1000);
addUnit('Wh', 'Wh', ENERGY, 3600);
addUnit('Ah', 'Ah', CHARGE, 3600);
addUnit('kWh', 'kWh', ENERGY, 3_600_000);
addUnit('GJ', 'GJ', ENERGY, 1e9);
addUnit('cal', 'cal', ENERGY, 4.1868);
addUnit('kcal', 'kcal', ENERGY, 4186.8);
addUnit('Btu', 'Btu (IT)', ENERGY, 1055.05585262);
addUnit('ft_lbf', 'ft·lbf', ENERGY, 1.3558179483314);
addUnit('erg', 'erg', ENERGY, 1e-7);
addUnit('eV', 'eV', ENERGY, 1.602176634e-19);
addUnit('MWh', 'MWh', ENERGY, 3.6e9);
addUnit('therm', 'therm (US)', ENERGY, 105_505_585.262);
addUnit('W', 'W', POWER);
addUnit('VA', 'VA', POWER);
addUnit('kW', 'kW', POWER, 1000);
addUnit('MW', 'MW', POWER, 1_000_000);
addUnit('GW', 'GW', POWER, 1e9);
addUnit('hp', 'hp', POWER, 745.6998715822702);
addUnit('PS', 'PS', POWER, 735.49875);
addUnit('Btu_h', 'Btu/h', POWER, 1055.05585262 / 3600);
addUnit('ft_lbf_s', 'ft·lbf/s', POWER, 1.3558179483314);
addUnit('kcal_h', 'kcal/h', POWER, 4186.8 / 3600);
addUnit('ton_ref', 'ton refrigeration', POWER, 3516.8528420667);
addUnit('L/s', 'L/s', FLOW, 0.001);
addUnit('m3/s', 'm³/s', FLOW);
addUnit('L_min', 'L/min', FLOW, 0.001 / 60);
addUnit('m3_h', 'm³/h', FLOW, 1 / 3600);
addUnit('ft3_s', 'ft³/s', FLOW, 0.3048 ** 3);
addUnit('cfm', 'ft³/min', FLOW, (0.3048 ** 3) / 60);
addUnit('gpm', 'US gal/min', FLOW, 0.003785411784 / 60);
addUnit('gph', 'US gal/h', FLOW, 0.003785411784 / 3600);
addUnit('kg/s', 'kg/s', MASS_FLOW);
addUnit('kg_min', 'kg/min', MASS_FLOW, 1 / 60);
addUnit('g_s', 'g/s', MASS_FLOW, 0.001);
addUnit('tonne_h', 't/h', MASS_FLOW, 1000 / 3600);
addUnit('lbm_h', 'lb/h', MASS_FLOW, 0.45359237 / 3600);
addUnit('kgm/s', 'kg·m/s', MOMENTUM);
addUnit('Ns', 'N·s', MOMENTUM);
addUnit('lbf_s', 'lbf·s', MOMENTUM, 4.4482216152605);
addUnit('lbm_ft_s', 'lb·ft/s', MOMENTUM, 0.45359237 * 0.3048);
addUnit('kip_s', 'kip·s', MOMENTUM, 4448.2216152605);
addUnit('kgm2', 'kg·m²', MOMENT_OF_INERTIA);
addUnit('lbm_ft2', 'lb·ft²', MOMENT_OF_INERTIA, 0.45359237 * 0.3048 ** 2);
addUnit('slug_ft2', 'slug·ft²', MOMENT_OF_INERTIA, 14.5939029372 * 0.3048 ** 2);
addUnit('oz_in2', 'oz·in²', MOMENT_OF_INERTIA, 0.028349523125 * 0.0254 ** 2);
addUnit('Nm', 'N·m', ENERGY);
addUnit('N/m', 'N/m', STIFFNESS);
addUnit('N/mm', 'N/mm', STIFFNESS, 1000);
addUnit('kN/m', 'kN/m', STIFFNESS, 1000);
addUnit('lbf_in', 'lbf/in', STIFFNESS, 4.4482216152605 / 0.0254);
addUnit('lbf_ft', 'lbf/ft', STIFFNESS, 4.4482216152605 / 0.3048);
addUnit('J/kgK', 'J/(kg·K)', SPECIFIC_HEAT);
addUnit('kJ_kgK', 'kJ/(kg·K)', SPECIFIC_HEAT, 1000);
addUnit('cal_gK', 'cal/(g·K)', SPECIFIC_HEAT, 4186.8);
addUnit('Btu_lbmF', 'Btu/(lb·°F)', SPECIFIC_HEAT, 4186.8);
addUnit('J_gK', 'J/(g·K)', SPECIFIC_HEAT, 1000);
addUnit('1/K', '1/K', INVERSE_TEMPERATURE);
addUnit('Pa_s', 'Pa·s', DYNAMIC_VISCOSITY);
addUnit('P', 'P', DYNAMIC_VISCOSITY, 0.1);
addUnit('cP', 'cP', DYNAMIC_VISCOSITY, 0.001);
addUnit('uP', 'µP', DYNAMIC_VISCOSITY, 1e-7);
addUnit('lbm_ft_s_visc', 'lb/(ft·s)', DYNAMIC_VISCOSITY, 0.45359237 / 0.3048);
addUnit('W/mK', 'W/(m·K)', THERMAL_CONDUCTIVITY);
addUnit('W_cmK', 'W/(cm·K)', THERMAL_CONDUCTIVITY, 100);
addUnit('Btu_h_ftF', 'Btu/(h·ft·°F)', THERMAL_CONDUCTIVITY, 1.730735);
addUnit('kcal_h_mK', 'kcal/(h·m·K)', THERMAL_CONDUCTIVITY, 4186.8 / 3600);
addUnit('W/m2', 'W/m²', IRRADIANCE);
addUnit('kW/m2', 'kW/m²', IRRADIANCE, 1000);
addUnit('W/cm2', 'W/cm²', IRRADIANCE, 10_000);
addUnit('mW_cm2', 'mW/cm²', IRRADIANCE, 10);
addUnit('Btu_h_ft2', 'Btu/(h·ft²)', IRRADIANCE, 1055.05585262 / 3600 / (0.3048 ** 2));
addUnit('W/m2K', 'W/(m²·K)', HEAT_TRANSFER_COEFFICIENT);
addUnit('kW_m2K', 'kW/(m²·K)', HEAT_TRANSFER_COEFFICIENT, 1000);
addUnit('Btu_h_ft2F', 'Btu/(h·ft²·°F)', HEAT_TRANSFER_COEFFICIENT, 5.678263341);
addUnit('kcal_h_m2C', 'kcal/(h·m²·°C)', HEAT_TRANSFER_COEFFICIENT, 4186.8 / 3600);
addUnit('K/W', 'K/W', THERMAL_RESISTANCE);
addUnit('Fh_Btu', '°F·h/Btu', THERMAL_RESISTANCE, (5 / 9) * 3600 / 1055.05585262);
addUnit('C_s_W', '°C·s/W', THERMAL_RESISTANCE, 1);
addUnit('m2/s', 'm²/s', THERMAL_DIFFUSIVITY);
addUnit('cm2_s', 'cm²/s', THERMAL_DIFFUSIVITY, 1e-4);
addUnit('mm2_s', 'mm²/s', THERMAL_DIFFUSIVITY, 1e-6);
addUnit('ft2_s', 'ft²/s', THERMAL_DIFFUSIVITY, 0.3048 ** 2);
addUnit('ft2_h', 'ft²/h', THERMAL_DIFFUSIVITY, 0.3048 ** 2 / 3600);
addUnit('kg/m3', 'kg/m³', DENSITY);
addUnit('g/cm3', 'g/cm³', DENSITY, 1000);
addUnit('g/mL', 'g/mL', DENSITY, 1000);
addUnit('tonne/m3', 't/m³', DENSITY, 1000);
addUnit('kg/L', 'kg/L', DENSITY, 1000);
addUnit('g/L', 'g/L', DENSITY, 1);
addUnit('lb_ft3', 'lb/ft³', DENSITY, 0.45359237 / (0.3048 ** 3));
addUnit('lb_USgal', 'lb/US gal', DENSITY, 0.45359237 / 0.003785411784);
addUnit('lb_yd3', 'lb/yd³', DENSITY, 0.45359237 / (0.9144 ** 3));
addUnit('kg_ha', 'kg/ha', SURFACE_MASS_DENSITY, 1e-4);
addUnit('g_m2', 'g/m²', SURFACE_MASS_DENSITY, 0.001);
addUnit('lb_acre', 'lb/acre', SURFACE_MASS_DENSITY, 0.45359237 / 4046.8564224);
addUnit('oz_yd2', 'oz/yd²', SURFACE_MASS_DENSITY, 0.028349523125 / (0.9144 ** 2));
addUnit('mol/L', 'mol/L', CONCENTRATION, 1000);
addUnit('mmol/L', 'mmol/L', CONCENTRATION, 1);
addUnit('mol_m3', 'mol/m³', CONCENTRATION);
addUnit('umol_L', 'µmol/L', CONCENTRATION, 0.001);
addUnit('nmol_L', 'nmol/L', CONCENTRATION, 1e-6);
addUnit('kmol_m3', 'kmol/m³', CONCENTRATION, 1000);
addUnit('mol_cm3', 'mol/cm³', CONCENTRATION, 1e6);
addUnit('g/mol', 'g/mol', MOLAR_MASS, 0.001);
addUnit('kg/mol', 'kg/mol', MOLAR_MASS);
addUnit('mg_mol', 'mg/mol', MOLAR_MASS, 1e-6);
addUnit('kg_kmol', 'kg/kmol', MOLAR_MASS, 0.001);
addUnit('g_mmol', 'g/mmol', MOLAR_MASS, 1);
addUnit('lb_mol', 'lb/mol', MOLAR_MASS, 0.45359237);
addUnit('lb_kmol', 'lb/kmol', MOLAR_MASS, 0.45359237 / 1000);
addUnit('V', 'V', VOLTAGE);
addUnit('mV', 'mV', VOLTAGE, 0.001);
addUnit('uV', 'µV', VOLTAGE, 1e-6);
addUnit('kV', 'kV', VOLTAGE, 1000);
addUnit('MV', 'MV', VOLTAGE, 1e6);
addUnit('ohm', 'Ω', RESISTANCE);
addUnit('H', 'H', INDUCTANCE);
addUnit('kohm', 'kΩ', RESISTANCE, 1000);
addUnit('mohm', 'mΩ', RESISTANCE, 0.001);
addUnit('Mohm', 'MΩ', RESISTANCE, 1_000_000);
addUnit('Gohm', 'GΩ', RESISTANCE, 1e9);
addUnit('C', 'C', CHARGE);
addUnit('mC', 'mC', CHARGE, 0.001);
addUnit('uC', 'µC', CHARGE, 1e-6);
addUnit('nC', 'nC', CHARGE, 1e-9);
addUnit('kC', 'kC', CHARGE, 1000);
addUnit('mAh', 'mAh', CHARGE, 3.6);
addUnit('F', 'F', CAPACITANCE);
addUnit('mF', 'mF', CAPACITANCE, 0.001);
addUnit('uF', 'µF', CAPACITANCE, 0.000001);
addUnit('nF', 'nF', CAPACITANCE, 0.000000001);
addUnit('pF', 'pF', CAPACITANCE, 1e-12);
addUnit('kF', 'kF', CAPACITANCE, 1000);

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
addUnit('bit', 'bit', DIMENSIONLESS, 1 / 8);
addUnit('kbit', 'kbit', DIMENSIONLESS, 1000 / 8);
addUnit('Mbit', 'Mbit', DIMENSIONLESS, 1_000_000 / 8);
addUnit('Gbit', 'Gbit', DIMENSIONLESS, 1_000_000_000 / 8);
addUnit('Tbit', 'Tbit', DIMENSIONLESS, 1_000_000_000_000 / 8);
addUnit('Kibit', 'Kibit', DIMENSIONLESS, 2 ** 10 / 8);
addUnit('Mibit', 'Mibit', DIMENSIONLESS, 2 ** 20 / 8);
addUnit('Gibit', 'Gibit', DIMENSIONLESS, 2 ** 30 / 8);
addUnit('Tibit', 'Tibit', DIMENSIONLESS, 2 ** 40 / 8);

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
