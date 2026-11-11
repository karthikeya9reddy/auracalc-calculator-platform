import { convertValue, dimensionsEqual, getUnit } from '../../src/calculation-core/index.mjs';
import { educationalDefinition, calculated } from './educational-definition.mjs';
import { physicalInput, physicalOutput } from './science-helpers.mjs';

const groups = [
  { category: 'Length and distance conversions', discipline: 'Mathematics, surveying, and engineering', fields: ['Mathematics and arithmetic', 'Geology, surveying, and geospatial work'], units: ['m|meters', 'km|kilometers', 'cm|centimeters', 'mm|millimeters', 'um|micrometers', 'nm|nanometers', 'pm|picometers', 'angstrom|angstroms', 'in|inches', 'ft|feet', 'ft_us|US survey feet', 'yd|yards', 'mi|miles', 'mi_us|US survey miles', 'nmi|nautical miles', 'fathom|fathoms', 'rod|rods', 'chain|chains', 'furlong|furlongs', 'link|links', 'AU|astronomical units', 'ly|light-years', 'pc|parsecs'] },
  { category: 'Area conversions', discipline: 'Mathematics, construction, and land measurement', fields: ['Mathematics and arithmetic', 'Civil engineering', 'Construction estimating and quantity surveying'], units: ['m2|square meters', 'km2|square kilometers', 'cm2|square centimeters', 'mm2|square millimeters', 'ft2|square feet', 'ft_us2|square US survey feet', 'in2|square inches', 'yd2|square yards', 'mi2|square miles', 'acre|acres', 'hectare|hectares', 'are|ares', 'barn|barns'] },
  { category: 'Volume and capacity conversions', discipline: 'Mathematics, science, and everyday measurement', fields: ['Mathematics and arithmetic', 'Chemistry', 'Everyday conversions, cooking, and household projects'], units: ['m3|cubic meters', 'km3|cubic kilometers', 'mm3|cubic millimeters', 'L|liters', 'dL|deciliters', 'cL|centiliters', 'mL|milliliters', 'uL|microliters', 'cm3|cubic centimeters', 'in3|cubic inches', 'ft3|cubic feet', 'yd3|cubic yards', 'USgal|US gallons', 'USqt|US quarts', 'USpt|US pints', 'UScup|US cups', 'USfloz|US fluid ounces', 'UStbsp|US tablespoons', 'UStsp|US teaspoons', 'UKgal|Imperial gallons', 'UKpt|Imperial pints', 'UKfloz|Imperial fluid ounces', 'acre_ft|acre-feet'] },
  { category: 'Mass and weight conversions', discipline: 'Mathematics, science, and trade measurement', fields: ['Mathematics and arithmetic', 'Physics, astronomy, astrophysics, and cosmology', 'Skilled trades'], units: ['kg|kilograms', 'g|grams', 'mg|milligrams', 'ug|micrograms', 'ng|nanograms', 'oz|ounces', 'lbm|pounds', 'stone|stones', 'short_ton|US short tons', 'long_ton|long tons', 'grain|grains', 'carat|carats', 'slug|slugs', 'quintal|quintals', 'tonne|metric tonnes'] },
  { category: 'Time conversions', discipline: 'Mathematics, computing, and everyday measurement', fields: ['Mathematics and arithmetic', 'Software development and programming', 'Travel, time, fitness, and sports calculations'], units: ['s|seconds', 'ms|milliseconds', 'us|microseconds', 'ns|nanoseconds', 'min|minutes', 'h|hours', 'day|days', 'week|weeks', 'fortnight|fortnights', 'year_julian|Julian years'] },
  { category: 'Absolute temperature conversions', discipline: 'Physics and thermodynamics', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Mechanical engineering'], units: ['K|kelvins', 'degC|degrees Celsius', 'degF|degrees Fahrenheit', 'degR|degrees Rankine', 'degRe|degrees Réaumur'] },
  { category: 'Temperature interval conversions', discipline: 'Physics and thermodynamics', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Mechanical engineering'], units: ['deltaK|kelvin intervals', 'deltaC|Celsius intervals', 'deltaF|Fahrenheit intervals', 'deltaR|Rankine intervals', 'deltaRe|Réaumur intervals'] },
  { category: 'Angle conversions', discipline: 'Mathematics, surveying, and science', fields: ['Mathematics and arithmetic', 'Geology, surveying, and geospatial work'], units: ['rad|radians', 'deg|degrees', 'arcmin|arcminutes', 'arcsec|arcseconds', 'grad|gradians', 'turn|turns'] },
  { category: 'Linear speed conversions', discipline: 'Physics, transport, and mechanical engineering', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Transportation and traffic engineering'], units: ['m/s|meters per second', 'km/h|kilometers per hour', 'mph|miles per hour', 'ft/s|feet per second', 'knot|knots', 'ft/min|feet per minute', 'ft/h|feet per hour', 'in/s|inches per second', 'cm/s|centimeters per second', 'km/s|kilometers per second'] },
  { category: 'Angular speed conversions', discipline: 'Physics and mechanical engineering', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Mechanical engineering'], units: ['rad/s|radians per second', 'rpm|revolutions per minute', 'deg/s|degrees per second', 'deg/min|degrees per minute'] },
  { category: 'Force conversions', discipline: 'Physics and engineering', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Civil engineering', 'Mechanical engineering'], units: ['N|newtons', 'kN|kilonewtons', 'lbf|pounds-force', 'dyn|dynes', 'kgf|kilogram-force', 'kip|kips', 'pdl|poundals', 'tf|tonne-force'] },
  { category: 'Pressure conversions', discipline: 'Physics, mining, and process engineering', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Mining and extractive industries', 'Chemical and process engineering'], units: ['Pa|pascals', 'kPa|kilopascals', 'MPa|megapascals', 'bar|bar', 'psi|pounds per square inch', 'atm|standard atmospheres', 'torr|torr', 'mmHg|millimeters of mercury', 'inHg|inches of mercury', 'mmH2O|millimeters of water', 'cmH2O|centimeters of water', 'inH2O|inches of water', 'mbar|millibars', 'hPa|hectopascals', 'kgf_cm2|kilogram-force per square centimeter'] },
  { category: 'Energy conversions', discipline: 'Physics, electrical, and energy engineering', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Electrical engineering and power systems', 'Energy systems and utilities'], units: ['J|joules', 'mJ|millijoules', 'kJ|kilojoules', 'GJ|gigajoules', 'Wh|watt-hours', 'kWh|kilowatt-hours', 'MWh|megawatt-hours', 'cal|calories', 'kcal|kilocalories', 'Btu|British thermal units', 'ft_lbf|foot-pounds force', 'erg|ergs', 'eV|electronvolts', 'therm|US therms', 'Nm|newton-meters'] },
  { category: 'Power conversions', discipline: 'Physics, electrical, and mechanical engineering', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Electrical engineering and power systems', 'Mechanical engineering'], units: ['W|watts', 'kW|kilowatts', 'MW|megawatts', 'GW|gigawatts', 'hp|mechanical horsepower', 'PS|metric horsepower', 'Btu_h|British thermal units per hour', 'ft_lbf_s|foot-pounds force per second', 'kcal_h|kilocalories per hour', 'ton_ref|tons of refrigeration'] },
  { category: 'Volumetric flow conversions', discipline: 'Fluid mechanics and water engineering', fields: ['Water resources and hydraulic engineering', 'Mechanical engineering'], units: ['L/s|liters per second', 'm3/s|cubic meters per second', 'L_min|liters per minute', 'm3_h|cubic meters per hour', 'ft3_s|cubic feet per second', 'cfm|cubic feet per minute', 'gpm|US gallons per minute', 'gph|US gallons per hour'] },
  { category: 'Mass flow conversions', discipline: 'Process and mechanical engineering', fields: ['Chemical and process engineering', 'Mechanical engineering'], units: ['kg/s|kilograms per second', 'kg_min|kilograms per minute', 'g_s|grams per second', 'tonne_h|metric tonnes per hour', 'lbm_h|pounds per hour'] },
  { category: 'Density conversions', discipline: 'Materials, mining, and engineering', fields: ['Materials science and metallurgy', 'Mining and extractive industries', 'Civil engineering'], units: ['kg/m3|kilograms per cubic meter', 'g/cm3|grams per cubic centimeter', 'g/mL|grams per milliliter', 'tonne/m3|metric tonnes per cubic meter', 'kg/L|kilograms per liter', 'g/L|grams per liter', 'lb_ft3|pounds per cubic foot', 'lb_USgal|pounds per US gallon', 'lb_yd3|pounds per cubic yard'] },
  { category: 'Surface mass application conversions', discipline: 'Agriculture and materials estimation', fields: ['Agriculture and crop science', 'Construction estimating and quantity surveying'], units: ['kg/m2|kilograms per square meter', 'kg_ha|kilograms per hectare', 'g_m2|grams per square meter', 'lb_acre|pounds per acre', 'oz_yd2|ounces per square yard'] },
  { category: 'Molar concentration conversions', discipline: 'Chemistry and laboratory science', fields: ['Chemistry', 'Chemical and process engineering', 'Biology and laboratory science'], units: ['mol/L|moles per liter', 'mmol/L|millimoles per liter', 'mol_m3|moles per cubic meter', 'umol_L|micromoles per liter', 'nmol_L|nanomoles per liter', 'kmol_m3|kilomoles per cubic meter', 'mol_cm3|moles per cubic centimeter'] },
  { category: 'Molar mass conversions', discipline: 'Chemistry and materials science', fields: ['Chemistry', 'Chemical and process engineering', 'Materials science and metallurgy'], units: ['g/mol|grams per mole', 'kg/mol|kilograms per mole', 'mg_mol|milligrams per mole', 'kg_kmol|kilograms per kilomole', 'g_mmol|grams per millimole', 'lb_mol|pounds per mole', 'lb_kmol|pounds per kilomole'] },
  { category: 'Voltage conversions', discipline: 'Electrical engineering and electronics', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], units: ['V|volts', 'mV|millivolts', 'uV|microvolts', 'kV|kilovolts', 'MV|megavolts'] },
  { category: 'Electrical resistance conversions', discipline: 'Electrical engineering and electronics', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], units: ['ohm|ohms', 'mohm|milliohms', 'kohm|kilohms', 'Mohm|megaohms', 'Gohm|gigaohms'] },
  { category: 'Electric charge conversions', discipline: 'Electrical engineering and electronics', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], units: ['C|coulombs', 'mC|millicoulombs', 'uC|microcoulombs', 'nC|nanocoulombs', 'kC|kilocoulombs', 'Ah|ampere-hours', 'mAh|milliampere-hours'] },
  { category: 'Capacitance conversions', discipline: 'Electrical engineering and electronics', fields: ['Electrical engineering and power systems', 'Electronics and embedded hardware'], units: ['F|farads', 'mF|millifarads', 'uF|microfarads', 'nF|nanofarads', 'pF|picofarads', 'kF|kilofarads'] },
  { category: 'Momentum conversions', discipline: 'Physics and mechanical engineering', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Mechanical engineering'], units: ['kgm/s|kilogram-meters per second', 'Ns|newton-seconds', 'lbf_s|pound-force seconds', 'lbm_ft_s|pound-feet per second', 'kip_s|kip-seconds'] },
  { category: 'Moment of inertia conversions', discipline: 'Mechanical engineering and physics', fields: ['Mechanical engineering', 'Physics, astronomy, astrophysics, and cosmology'], units: ['kgm2|kilogram-square meters', 'lbm_ft2|pound-square feet', 'slug_ft2|slug-square feet', 'oz_in2|ounce-square inches'] },
  { category: 'Spring stiffness conversions', discipline: 'Mechanical engineering', fields: ['Mechanical engineering', 'Civil engineering'], units: ['N/m|newtons per meter', 'N/mm|newtons per millimeter', 'kN/m|kilonewtons per meter', 'lbf_in|pounds-force per inch', 'lbf_ft|pounds-force per foot'] },
  { category: 'Specific heat capacity conversions', discipline: 'Thermal and chemical engineering', fields: ['Mechanical engineering', 'Chemical and process engineering'], units: ['J/kgK|joules per kilogram-kelvin', 'kJ_kgK|kilojoules per kilogram-kelvin', 'cal_gK|calories per gram-kelvin', 'Btu_lbmF|British thermal units per pound-Fahrenheit', 'J_gK|joules per gram-kelvin'] },
  { category: 'Dynamic viscosity conversions', discipline: 'Fluid mechanics and process engineering', fields: ['Mechanical engineering', 'Chemical and process engineering', 'Water resources and hydraulic engineering'], units: ['Pa_s|pascal-seconds', 'P|poise', 'cP|centipoise', 'uP|micropoise', 'lbm_ft_s_visc|pounds per foot-second'] },
  { category: 'Thermal conductivity conversions', discipline: 'Thermal and building engineering', fields: ['Mechanical engineering', 'HVAC and building services', 'Civil engineering'], units: ['W/mK|watts per meter-kelvin', 'W_cmK|watts per centimeter-kelvin', 'Btu_h_ftF|British thermal units per hour-foot-Fahrenheit', 'kcal_h_mK|kilocalories per hour-meter-kelvin'] },
  { category: 'Irradiance conversions', discipline: 'Physics and energy systems', fields: ['Physics, astronomy, astrophysics, and cosmology', 'Renewable energy and energy storage'], units: ['W/m2|watts per square meter', 'kW/m2|kilowatts per square meter', 'W/cm2|watts per square centimeter', 'mW_cm2|milliwatts per square centimeter', 'Btu_h_ft2|British thermal units per hour-square foot'] },
  { category: 'Heat transfer coefficient conversions', discipline: 'Thermal and building engineering', fields: ['Mechanical engineering', 'HVAC and building services', 'Civil engineering'], units: ['W/m2K|watts per square meter-kelvin', 'kW_m2K|kilowatts per square meter-kelvin', 'Btu_h_ft2F|British thermal units per hour-square foot-Fahrenheit', 'kcal_h_m2C|kilocalories per hour-square meter-Celsius'] },
  { category: 'Thermal resistance conversions', discipline: 'Thermal and building engineering', fields: ['Mechanical engineering', 'HVAC and building services', 'Civil engineering'], units: ['K/W|kelvins per watt', 'Fh_Btu|Fahrenheit-hours per British thermal unit', 'C_s_W|Celsius-seconds per watt'] },
  { category: 'Thermal diffusivity conversions', discipline: 'Thermal and materials engineering', fields: ['Mechanical engineering', 'Materials science and metallurgy'], units: ['m2/s|square meters per second', 'cm2_s|square centimeters per second', 'mm2_s|square millimeters per second', 'ft2_s|square feet per second', 'ft2_h|square feet per hour'] },
  { category: 'Digital storage conversions', discipline: 'Computing and digital systems', fields: ['Software development and programming', 'Data engineering and databases', 'Networking and telecommunications'], units: ['B|bytes', 'kB|kilobytes (decimal)', 'MB|megabytes (decimal)', 'GB|gigabytes (decimal)', 'TB|terabytes (decimal)', 'KiB|kibibytes', 'MiB|mebibytes', 'GiB|gibibytes', 'TiB|tebibytes', 'bit|bits', 'kbit|kilobits (decimal)', 'Mbit|megabits (decimal)', 'Gbit|gigabits (decimal)', 'Tbit|terabits (decimal)', 'Kibit|kibibits', 'Mibit|mebibits', 'Gibit|gibibits', 'Tibit|tebibits'] },
];

const UNIT_NAMES = new Map(groups.flatMap(group => group.units.map(entry => {
  const [id, name] = entry.split('|');
  return [id, name];
})));

function slugPart(value) {
  return value.toLowerCase().replaceAll('µ', 'u').replaceAll('²', '2').replaceAll('³', '3').replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '');
}

function createConversion(group, fromId, toId) {
  const from = getUnit(fromId);
  const to = getUnit(toId);
  if (!dimensionsEqual(from.dimension, to.dimension) || from.temperatureKind !== to.temperatureKind) return null;
  const fromName = UNIT_NAMES.get(fromId) || from.symbol;
  const toName = UNIT_NAMES.get(toId) || to.symbol;
  const title = `${fromName[0].toUpperCase()}${fromName.slice(1)} to ${toName} converter`;
  const id = `convert-${slugPart(fromName)}-to-${slugPart(toName)}`;
  const absoluteTemperature = from.temperatureKind === 'absolute';
  const equation = absoluteTemperature
    ? `T(${to.symbol}) = convertValue(T(${from.symbol}), ${from.symbol}, ${to.symbol}); absolute-zero checks apply.`
    : `value(${to.symbol}) = convertValue(value(${from.symbol}), ${from.symbol}, ${to.symbol}).`;
  return educationalDefinition({
    id,
    catalogKind: 'converter',
    title,
    discipline: group.discipline,
    fields: group.fields,
    category: group.category,
    description: `Convert a value from ${fromName} (${from.symbol}) to ${toName} (${to.symbol}) using the NIST SI conversion convention.`,
    keywords: [title.toLowerCase(), `${from.symbol} to ${to.symbol}`, `${fromName} ${toName}`, 'unit converter', 'measurement conversion', group.category.toLowerCase()],
    formula: equation,
    assumptions: ['The entered quantity is already expressed in the selected source unit.', 'The conversion preserves the physical quantity and uses the stated source and target units.'],
    exclusions: ['This conversion does not validate an instrument, product specification, code requirement, or engineering design.'],
    limitations: absoluteTemperature ? ['Absolute temperatures below zero kelvin are rejected. Temperature intervals use the separate interval converters.'] : ['Unit conversion does not add measurement precision or uncertainty.'],
    citation: 'NIST Guide to the SI, Special Publication 811, Appendix B conversion factors and temperature conventions.',
    sourceUrl: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors',
    verificationCases: [`1 ${from.symbol} converts to ${convertValue(1, fromId, toId)} ${to.symbol}; reverse conversion is checked in the conversion expansion test suite.`],
    visualization: { kind: 'diagram', title: `${from.symbol} → ${to.symbol}`, description: `A unit-scale bridge from ${fromName} to ${toName}. The numeric conversion is exact to the factors available in the unit registry; it is not a measurement-uncertainty model.` },
    inputs: [physicalInput('value', `Value in ${fromName}`, from.dimension, fromId, [fromId], { min: undefined, allowMagnitudeWords: false })],
    outputs: [physicalOutput('converted', `Value in ${toName}`, to.dimension, toId, [toId])],
    calculate(raw) {
      const sourceValue = raw.value.value;
      const converted = convertValue(sourceValue, fromId, toId);
      return calculated(
        { converted: { value: converted, unit: toId } },
        equation,
        [
          `Start with ${sourceValue} ${from.symbol}.`,
          absoluteTemperature
            ? `Convert the absolute temperature using the NIST temperature relation, including its scale offset.`
            : `Normalize through the SI base unit: ${sourceValue} ${from.symbol} × ${from.scale} = ${sourceValue * from.scale} SI units.`,
          `Express the same quantity in ${to.symbol}: ${converted} ${to.symbol}.`,
        ],
      );
    },
    intendedAudience: ['Education, reference, and general measurement conversion'],
  });
}

export const unitConversionCalculators = Object.freeze(groups.flatMap(group => {
  const ids = group.units.map(entry => entry.split('|')[0]);
  return ids.flatMap(fromId => ids.map(toId => fromId === toId ? null : createConversion(group, fromId, toId)).filter(Boolean));
}));

export const unitConversionGroups = Object.freeze(groups.map(group => Object.freeze({ category: group.category, units: group.units.length })));
