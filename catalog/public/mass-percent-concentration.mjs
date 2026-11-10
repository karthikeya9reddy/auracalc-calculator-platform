import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { physicalInput, reference, r0Release, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const massPercentConcentration = Object.freeze({
  id: 'mass-percent-concentration', version: '1.0.0', title: 'Mass percent concentration',
  discipline: 'Chemistry education', fields: Object.freeze(['Chemistry', 'Biology and laboratory science', 'Education, assessment, and learning']),
  category: 'Solutions', description: 'Calculate solute mass as a percentage of the total solution mass.',
  keywords: Object.freeze(['mass percent', 'percent composition', 'solute concentration', 'w/w']),
  purpose: 'Calculate mass percent for a chemistry classroom exercise.', intendedAudience: ['Learners', 'Classroom use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Mass percent = (solute mass ÷ total solution mass) × 100%.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The entered solution mass includes the solute and all other solution components.', 'Both masses use the same unit.']),
  exclusions: Object.freeze(['Does not convert mass percent to volume percent or molarity, identify the substance, or provide preparation instructions.']),
  warnings: Object.freeze(['For educational calculation only; chemical handling requires qualified procedures and safety information.']), limitations: Object.freeze(['Measurement uncertainty and solution chemistry are outside this calculation.']),
  references: Object.freeze([reference('openstax-mass-percent', 'OpenStax, Chemistry 2e, §3 Key Terms, mass percentage is solute mass divided by solution mass expressed as a percent.', 'https://openstax.org/books/chemistry-2e/pages/3-key-terms')]),
  verificationCases: Object.freeze(['5 g solute in 100 g solution gives 5%; equal solute and solution mass gives 100%; solute mass above total solution mass is rejected.']),
  release: r0Release('mass-percent-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('solute-mass', 'Solute mass', BASE_DIMENSIONS.mass, 'g', ['g', 'kg', 'lbm'], { min: 0 }),
    physicalInput('solution-mass', 'Total solution mass', BASE_DIMENSIONS.mass, 'g', ['g', 'kg', 'lbm'], { min: 0 }),
  ]),
  outputs: Object.freeze([scalarOutput('mass-percent', 'Mass percent', 'percent')]),
  calculate(inputs) {
    const solute = inputs['solute-mass'].value;
    const solution = inputs['solution-mass'].value;
    if (solution <= 0) throw new CalculationError('POSITIVE_SOLUTION_MASS_REQUIRED', 'Total solution mass must be greater than zero.', { fieldId: 'solution-mass' });
    if (solute > solution) throw new CalculationError('SOLUTE_EXCEEDS_SOLUTION', 'Solute mass cannot exceed total solution mass.', { fieldId: 'solute-mass' });
    const ratio = solute / solution;
    const percent = ratio * 100;
    return { outputs: { 'mass-percent': { value: ratio, unit: '1' } }, intermediates: { formula: '% m/m = (solute mass / solution mass) × 100', steps: [
      `Use the normalized inputs in grams: solute mass = ${stepNumber(solute)} g; total solution mass = ${stepNumber(solution)} g.`,
      `Find the mass fraction: ${stepNumber(solute)} / ${stepNumber(solution)} = ${stepNumber(ratio)}.`,
      `Convert the fraction to a percentage: ${stepNumber(ratio)} × 100 = ${stepNumber(percent)}%.`,
    ] }, warnings: [] };
  },
});
