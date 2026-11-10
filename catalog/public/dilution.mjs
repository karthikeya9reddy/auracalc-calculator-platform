import { CalculationError } from '../../src/calculation-core/index.mjs';
import { CONCENTRATION, VOLUME, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const dilution = Object.freeze({
  id: 'dilution', version: '1.0.0', title: 'Solution dilution calculator',
  discipline: 'Chemistry education', fields: Object.freeze(['Chemistry', 'Biology and laboratory science', 'Education, assessment, and learning']),
  category: 'Solutions', description: 'Calculate the resulting concentration and added solvent volume for a simple dilution.',
  keywords: Object.freeze(['C1V1', 'C2V2', 'dilution equation', 'stock solution']),
  purpose: 'Rearrange the dilution equation for a classroom calculation.', intendedAudience: ['Learners', 'Classroom use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'C₁V₁ = C₂V₂; therefore final concentration C₂ = C₁V₁ ÷ V₂.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The same solute is present before and after dilution.', 'No solute is added, removed, or lost.', 'Final volume is at least the stock-solution volume.']),
  exclusions: Object.freeze(['Does not choose a target concentration, check chemical compatibility, or provide laboratory preparation or safety instructions.']),
  warnings: Object.freeze(['For educational calculation only; real solution preparation requires qualified procedures and appropriate safety controls.']), limitations: Object.freeze(['The equation assumes the solute amount is conserved during dilution.']),
  references: Object.freeze([reference('openstax-dilution-equation', 'OpenStax, Chemistry 2e, §3.3, conservation of solute gives C₁V₁ = C₂V₂.', 'https://openstax.org/books/chemistry-2e/pages/3-3-molarity')]),
  verificationCases: Object.freeze(['5 mol/L × 0.85 L diluted to 1.8 L gives about 2.3611 mol/L; equal initial and final volumes preserve concentration; final volume below initial is rejected.']),
  release: r0Release('dilution-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('stock-concentration', 'Stock concentration', CONCENTRATION, 'mol/L', ['mol/L', 'mmol/L'], { min: 0 }),
    physicalInput('stock-volume', 'Stock solution volume', VOLUME, 'L', ['L', 'mL', 'm3'], { min: 0 }),
    physicalInput('final-volume', 'Final solution volume', VOLUME, 'L', ['L', 'mL', 'm3'], { min: 0 }),
  ]),
  outputs: Object.freeze([
    physicalOutput('final-concentration', 'Final concentration', CONCENTRATION, 'mol/L', ['mol/L', 'mmol/L']),
  ]),
  calculate(inputs) {
    const concentration = inputs['stock-concentration'].value;
    const stockVolume = inputs['stock-volume'].value;
    const finalVolume = inputs['final-volume'].value;
    if (stockVolume <= 0) throw new CalculationError('POSITIVE_VOLUME_REQUIRED', 'Stock solution volume must be greater than zero.', { fieldId: 'stock-volume' });
    if (finalVolume < stockVolume) throw new CalculationError('FINAL_VOLUME_BELOW_STOCK', 'Final volume must be at least the stock solution volume for a dilution.', { fieldId: 'final-volume' });
    const soluteAmount = concentration * stockVolume;
    const finalConcentration = soluteAmount / finalVolume;
    return { outputs: {
      'final-concentration': { value: finalConcentration, unit: 'mol/L' },
    }, intermediates: { formula: 'C1 V1 = C2 V2', steps: [
      `Normalize inputs: C₁ = ${stepNumber(concentration)} mol/L; V₁ = ${stepNumber(stockVolume)} L; V₂ = ${stepNumber(finalVolume)} L.`,
      `Conserve solute amount: C₁V₁ = ${stepNumber(concentration)} × ${stepNumber(stockVolume)} = ${stepNumber(soluteAmount)} mol.`,
      `Solve for final concentration: C₂ = C₁V₁/V₂ = ${stepNumber(soluteAmount)}/${stepNumber(finalVolume)} = ${stepNumber(finalConcentration)} mol/L.`,
    ] }, warnings: [] };
  },
});
