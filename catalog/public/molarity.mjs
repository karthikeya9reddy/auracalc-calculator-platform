import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { CONCENTRATION, VOLUME, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const molarity = Object.freeze({
  id: 'molarity', version: '1.0.0', title: 'Molar concentration (molarity)',
  discipline: 'Chemistry education', fields: Object.freeze(['Chemistry', 'Biology and laboratory science', 'Education, assessment, and learning']),
  category: 'Solutions', description: 'Calculate moles of solute per final solution volume.',
  keywords: Object.freeze(['molar concentration', 'mol per litre', 'solution concentration', 'M']),
  purpose: 'Calculate molarity for a chemistry learning problem from amount and final solution volume.', intendedAudience: ['Learners', 'Classroom use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Molarity M = amount of solute in moles ÷ final solution volume in litres.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Volume is the total final solution volume, not just the solvent volume.', 'The amount and solution volume refer to the same solution.']),
  exclusions: Object.freeze(['Does not identify chemicals, select a concentration, provide preparation instructions, or assess laboratory hazards.']),
  warnings: Object.freeze(['For educational calculation only; follow qualified laboratory procedures and chemical safety information.']), limitations: Object.freeze(['Measurement uncertainty and chemical behavior are not modeled.']),
  references: Object.freeze([reference('openstax-molarity', 'OpenStax, Chemistry 2e, §3.3, molarity is moles of solute per litre of solution.', 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity')]),
  verificationCases: Object.freeze(['0.133 mol in 0.355 L gives about 0.37465 mol/L; 0.01 mol in 0.2 L gives 0.05 mol/L; zero solution volume is rejected.']),
  release: r0Release('molarity-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('solute-amount', 'Amount of solute', BASE_DIMENSIONS.amount, 'mol', ['mol', 'mmol'], { min: 0 }),
    physicalInput('solution-volume', 'Final solution volume', VOLUME, 'L', ['L', 'mL', 'm3'], { min: 0 }),
  ]),
  outputs: Object.freeze([physicalOutput('molarity', 'Molar concentration', CONCENTRATION, 'mol/L', ['mol/L', 'mmol/L'])]),
  calculate(inputs) {
    const amount = inputs['solute-amount'].value;
    const volume = inputs['solution-volume'].value;
    if (volume <= 0) throw new CalculationError('POSITIVE_VOLUME_REQUIRED', 'Final solution volume must be greater than zero.', { fieldId: 'solution-volume' });
    const concentration = amount / volume;
    return { outputs: { molarity: { value: concentration, unit: 'mol/L' } }, intermediates: { formula: 'M = n / V', steps: [
      `Normalize amount and final volume: n = ${stepNumber(amount)} mol; V = ${stepNumber(volume)} L.`,
      `Divide amount by solution volume: M = n / V = ${stepNumber(amount)} / ${stepNumber(volume)} = ${stepNumber(concentration)} mol/L.`,
    ] }, warnings: [] };
  },
});
