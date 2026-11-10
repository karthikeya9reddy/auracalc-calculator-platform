import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { physicalInput, reference, r0Release, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const oreGrade = Object.freeze({
  id: 'ore-grade', version: '1.0.0', title: 'Sample grade by mass',
  discipline: 'Mining and geology education',
  fields: Object.freeze(['Mining and extractive industries', 'Geology, surveying, and geospatial work', 'Materials science and metallurgy', 'Education, assessment, and learning']),
  category: 'Sample calculations', description: 'Calculate contained material as a mass percentage of a user-supplied sample mass.',
  keywords: Object.freeze(['ore grade', 'sample concentration', 'contained material', 'mass percent']),
  purpose: 'Calculate a simple sample mass fraction for learning or to summarize a provided assay result.', intendedAudience: ['Learners', 'General geology use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Mass grade = contained material mass ÷ total sample mass × 100%.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Contained material mass and sample mass refer to the same representative sample.', 'Both mass values use compatible units.']),
  exclusions: Object.freeze(['Does not estimate ore tonnage, reserves, recoveries, cut-off grade, economic value, mine design, or occupational safety.']),
  warnings: Object.freeze(['A sample grade is not a resource or reserve estimate; use qualified sampling, assay, and reporting methods.']), limitations: Object.freeze(['Representativeness, sampling bias, assay uncertainty, and mineral processing are not assessed.']),
  references: Object.freeze([reference('usgs-resource-grade-definition', 'U.S. Geological Survey, Scientific Investigations Report 2026–5031, glossary: resource grade is average resource concentration in the ore mass.', 'https://pubs.usgs.gov/publication/sir20265031/full')]),
  verificationCases: Object.freeze(['2 kg contained material in a 100 kg sample gives 2%; contained material above sample mass is rejected; zero sample mass is rejected.']),
  release: r0Release('ore-grade-usgs-cases-v1'),
  inputs: Object.freeze([
    physicalInput('contained-mass', 'Contained material mass', BASE_DIMENSIONS.mass, 'kg', ['kg', 'g', 'tonne'], { min: 0, allowMagnitudeWords: true }),
    physicalInput('sample-mass', 'Total sample mass', BASE_DIMENSIONS.mass, 'kg', ['kg', 'g', 'tonne'], { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([scalarOutput('grade', 'Mass grade', 'percent')]),
  calculate(inputs) {
    const contained = inputs['contained-mass'].value;
    const sample = inputs['sample-mass'].value;
    if (sample <= 0) throw new CalculationError('POSITIVE_SAMPLE_MASS_REQUIRED', 'Total sample mass must be greater than zero.', { fieldId: 'sample-mass' });
    if (contained > sample) throw new CalculationError('CONTAINED_MASS_EXCEEDS_SAMPLE', 'Contained material mass cannot exceed total sample mass.', { fieldId: 'contained-mass' });
    const fraction = contained / sample;
    const percent = fraction * 100;
    return { outputs: { grade: { value: fraction, unit: '1' } }, intermediates: { formula: 'grade = contained mass / sample mass × 100%', steps: [
      `Normalize masses to kilograms: contained mass = ${stepNumber(contained)} kg; sample mass = ${stepNumber(sample)} kg.`,
      `Calculate the mass fraction: ${stepNumber(contained)} / ${stepNumber(sample)} = ${stepNumber(fraction)}.`,
      `Convert to mass percent: ${stepNumber(fraction)} × 100 = ${stepNumber(percent)}%.`,
    ] }, warnings: [] };
  },
});
