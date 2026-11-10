import { CalculationError } from '../../src/calculation-core/index.mjs';
import { AREA, FORCE, PRESSURE, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const pressureFromForceArea = Object.freeze({
  id: 'pressure-from-force-area', version: '1.0.0', title: 'Average pressure from force and area',
  discipline: 'Physics and mechanical fundamentals',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning', 'Mechanical engineering']),
  category: 'Mechanics', description: 'Calculate average pressure by dividing a perpendicular force by its contact area.',
  keywords: Object.freeze(['force per area', 'surface pressure', 'pascal', 'load area']),
  purpose: 'Apply the pressure definition to a simple educational or general physics example.', intendedAudience: ['Learners', 'General physics use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Average pressure p = perpendicular force magnitude ÷ area.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The force is perpendicular to and uniformly distributed over the entered area.', 'The result is an average over that area.']),
  exclusions: Object.freeze(['Not a stress distribution, structural capacity, foundation, contact safety, or component sizing calculation.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['Real surfaces may have nonuniform loads and local peak pressures.']),
  references: Object.freeze([reference('openstax-pressure-force-area', 'OpenStax, University Physics Volume 1, §14.1, pressure is force per unit area and 1 Pa = 1 N/m².', 'https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure')]),
  verificationCases: Object.freeze(['10 N over 2 m² gives 5 Pa; the same force over half the area doubles pressure; zero area is rejected.']),
  release: r0Release('pressure-force-area-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('force', 'Perpendicular force magnitude', FORCE, 'N', ['N', 'kN', 'lbf'], { min: 0, allowMagnitudeWords: true }),
    physicalInput('area', 'Contact area', AREA, 'm2', ['m2', 'ft2'], { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([physicalOutput('pressure', 'Average pressure', PRESSURE, 'Pa', ['Pa', 'kPa', 'MPa', 'bar', 'psi'])]),
  calculate(inputs) {
    const force = inputs.force.value;
    const area = inputs.area.value;
    if (area <= 0) throw new CalculationError('POSITIVE_AREA_REQUIRED', 'Contact area must be greater than zero.', { fieldId: 'area' });
    const pressure = force / area;
    return { outputs: { pressure: { value: pressure, unit: 'Pa' } }, intermediates: { formula: 'p = F / A', steps: [
      `Normalize inputs: F = ${stepNumber(force)} N; A = ${stepNumber(area)} m².`,
      `Divide force by area: p = F / A = ${stepNumber(force)} / ${stepNumber(area)} = ${stepNumber(pressure)} N/m².`,
      `Use 1 Pa = 1 N/m², so the result is ${stepNumber(pressure)} Pa.`,
    ] }, warnings: [] };
  },
});
