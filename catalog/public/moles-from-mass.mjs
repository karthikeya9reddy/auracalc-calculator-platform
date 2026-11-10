import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { MOLAR_MASS, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const molesFromMass = Object.freeze({
  id: 'moles-from-mass', version: '1.0.0', title: 'Amount of substance from mass',
  discipline: 'Chemistry education', fields: Object.freeze(['Chemistry', 'Biology and laboratory science', 'Education, assessment, and learning']),
  category: 'Stoichiometry basics', description: 'Convert a sample mass to amount of substance using a molar mass supplied by the user.',
  keywords: Object.freeze(['mass to moles', 'molar mass', 'amount of substance', 'stoichiometry']),
  purpose: 'Apply n = m ÷ M using a molar mass already determined from a trusted chemical reference.', intendedAudience: ['Learners', 'Classroom use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Amount n = sample mass m ÷ molar mass M.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The supplied molar mass is correct for the stated substance and isotopic composition.', 'Mass and molar mass use compatible units.']),
  exclusions: Object.freeze(['Does not identify a chemical, calculate formula mass, determine reaction stoichiometry, or give dosing or preparation guidance.']),
  warnings: Object.freeze(['Use a verified molar mass from an authoritative chemistry reference.']), limitations: Object.freeze(['Purity, hydration state, isotopic composition, and measurement uncertainty are not assessed.']),
  references: Object.freeze([reference('openstax-molar-mass', 'OpenStax, Chemistry 2e, §3.1, molar mass is mass per mole; amount follows from mass divided by molar mass.', 'https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept')]),
  verificationCases: Object.freeze(['18 g with molar mass 18 g/mol gives 1 mol; 36 g at 18 g/mol gives 2 mol; zero molar mass is rejected.']),
  release: r0Release('moles-from-mass-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('sample-mass', 'Sample mass', BASE_DIMENSIONS.mass, 'g', ['g', 'kg', 'mg'], { min: 0 }),
    physicalInput('molar-mass', 'Molar mass', MOLAR_MASS, 'g/mol', ['g/mol', 'kg/mol'], { min: 0 }),
  ]),
  outputs: Object.freeze([physicalOutput('amount', 'Amount of substance', BASE_DIMENSIONS.amount, 'mol', ['mol', 'mmol'])]),
  calculate(inputs) {
    const mass = inputs['sample-mass'].value;
    const molarMass = inputs['molar-mass'].value;
    if (molarMass <= 0) throw new CalculationError('POSITIVE_MOLAR_MASS_REQUIRED', 'Molar mass must be greater than zero.', { fieldId: 'molar-mass' });
    const amount = mass / molarMass;
    return { outputs: { amount: { value: amount, unit: 'mol' } }, intermediates: { formula: 'n = m / M', steps: [
      `Use the normalized inputs: sample mass m = ${stepNumber(mass)} g; molar mass M = ${stepNumber(molarMass)} g/mol.`,
      `Divide sample mass by molar mass: n = m / M = ${stepNumber(mass)} g / (${stepNumber(molarMass)} g/mol) = ${stepNumber(amount)} mol.`,
    ] }, warnings: [] };
  },
});
