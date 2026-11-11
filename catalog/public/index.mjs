import { CalculatorRegistry } from '../../src/calculation-core/index.mjs';
import { percentageChange } from './percentage-change.mjs';
import { rectangleArea } from './rectangle-area.mjs';
import { rectangularPrismVolume } from './rectangular-prism-volume.mjs';
import { averageSpeed } from './average-speed.mjs';
import { percentageOfAmount } from './percentage-of-amount.mjs';
import { discountPrice } from './discount-price.mjs';
import { sharedBillSplit } from './shared-bill-split.mjs';
import { salesTaxEstimate } from './sales-tax-estimate.mjs';
import { markupPrice } from './markup-price.mjs';
import { tipCalculator } from './tip-calculator.mjs';
import { pricePerUnit } from './price-per-unit.mjs';
import { averageAcceleration } from './average-acceleration.mjs';
import { netForce } from './net-force.mjs';
import { kineticEnergy } from './kinetic-energy.mjs';
import { density } from './density.mjs';
import { pressureFromForceArea } from './pressure-from-force-area.mjs';
import { workDone } from './work-done.mjs';
import { mechanicalPower } from './mechanical-power.mjs';
import { ohmsLaw } from './ohms-law.mjs';
import { molarity } from './molarity.mjs';
import { dilution } from './dilution.mjs';
import { massPercentConcentration } from './mass-percent-concentration.mjs';
import { molesFromMass } from './moles-from-mass.mjs';
import { breakEvenAnalysis } from './break-even-analysis.mjs';
import { grossMargin } from './gross-margin.mjs';
import { dataTransferTime } from './data-transfer-time.mjs';
import { serviceAvailability } from './service-availability.mjs';
import { circleAreaCircumference } from './circle-area-circumference.mjs';
import { frameDuration } from './frame-duration.mjs';
import { shutterExposure } from './shutter-exposure.mjs';
import { batteryRuntime } from './battery-runtime.mjs';
import { modelWeightMemory } from './model-weight-memory.mjs';
import { oreGrade } from './ore-grade.mjs';
import { telescopeMagnification } from './telescope-magnification.mjs';
import { physicsEngineeringExpansion } from './physics-engineering-expansion.mjs';
import { appliedFieldsExpansion } from './applied-fields-expansion.mjs';
import { digitalEverydayExpansion } from './digital-everyday-expansion.mjs';
import { advancedMathEngineering } from './advanced-math-engineering.mjs';
import { next100Calculators } from './next-100-expansion.mjs';
import { titanCalculators } from './titan-expansion.mjs';
import { unitConversionCalculators } from './unit-conversion-expansion.mjs';
import { foodEnergyFromLabel } from './food-energy-from-label.mjs';
import { verifiedPilot } from './verified-pilot.mjs';
import { studentPlanning } from './student-planning.mjs';

const formulaDefinitions = [
  percentageChange,
  rectangleArea,
  rectangularPrismVolume,
  averageSpeed,
  percentageOfAmount,
  discountPrice,
  sharedBillSplit,
  salesTaxEstimate,
  markupPrice,
  tipCalculator,
  pricePerUnit,
  averageAcceleration,
  netForce,
  kineticEnergy,
  density,
  pressureFromForceArea,
  workDone,
  mechanicalPower,
  ohmsLaw,
  molarity,
  dilution,
  massPercentConcentration,
  molesFromMass,
  breakEvenAnalysis,
  grossMargin,
  dataTransferTime,
  serviceAvailability,
  circleAreaCircumference,
  frameDuration,
  shutterExposure,
  batteryRuntime,
  modelWeightMemory,
  oreGrade,
  telescopeMagnification,
  ...physicsEngineeringExpansion,
  ...appliedFieldsExpansion,
  ...digitalEverydayExpansion,
  ...advancedMathEngineering,
  ...next100Calculators,
  ...titanCalculators,
  foodEnergyFromLabel,
  ...verifiedPilot,
  ...studentPlanning,
];

export const publicDefinitions = Object.freeze(formulaDefinitions.map(definition => Object.freeze({
  ...definition,
  catalogKind: 'calculator',
})));

export const publicFormulaDefinitions = publicDefinitions;
export const publicConverterDefinitions = unitConversionCalculators;

export const publicRegistry = new CalculatorRegistry();
for (const definition of publicDefinitions) publicRegistry.register(definition);

export const converterRegistry = new CalculatorRegistry();
for (const definition of publicConverterDefinitions) converterRegistry.register(definition);

export function listPublicCalculators() {
  return publicRegistry.listPublished();
}

export function listPublicConverters() {
  return converterRegistry.listPublished();
}
