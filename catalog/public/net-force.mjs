import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { ACCELERATION, FORCE, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const netForce = Object.freeze({
  id: 'net-force', version: '1.0.0', title: 'Net force from mass and acceleration',
  discipline: 'Physics and mechanical fundamentals',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning', 'Mechanical engineering']),
  category: 'Mechanics', description: 'Calculate one-dimensional net force using mass and acceleration.',
  keywords: Object.freeze(['newtons second law', 'force', 'mass', 'acceleration']),
  purpose: 'Apply Newton’s second law to an educational or general physics problem.', intendedAudience: ['Learners', 'General physics use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Net force F = mass × acceleration.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Acceleration is the net acceleration along one axis.', 'The mass is positive and constant.']),
  exclusions: Object.freeze(['Does not calculate forces in a free-body diagram or provide equipment, vehicle, structural, or safety design values.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['The output represents net force, not necessarily one individual applied force.']),
  references: Object.freeze([reference('openstax-newtons-second-law', 'OpenStax, College Physics 2e, §4.3 Newton’s Second Law, Fnet = ma.', 'https://openstax.org/books/college-physics-2e/pages/4-3-newtons-second-law-of-motion-concept-of-a-system')]),
  verificationCases: Object.freeze(['2 kg at 3 m/s² gives 6 N; 1 kg at −9.8 m/s² gives −9.8 N; zero mass is rejected.']),
  release: r0Release('net-force-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('mass', 'Mass', BASE_DIMENSIONS.mass, 'kg', ['kg', 'g', 'lbm'], { min: 0, allowMagnitudeWords: true }),
    physicalInput('acceleration', 'Acceleration', ACCELERATION, 'm/s2', ['m/s2']),
  ]),
  outputs: Object.freeze([physicalOutput('force', 'Net force', FORCE, 'N', ['N', 'kN', 'lbf'])]),
  calculate(inputs) {
    const mass = inputs.mass.value;
    const acceleration = inputs.acceleration.value;
    if (mass <= 0) throw new CalculationError('POSITIVE_MASS_REQUIRED', 'Mass must be greater than zero.', { fieldId: 'mass' });
    const force = mass * acceleration;
    return { outputs: { force: { value: force, unit: 'N' } }, intermediates: { formula: 'F = ma', steps: [
      `Normalize mass to kilograms: m = ${stepNumber(mass)} kg; acceleration a = ${stepNumber(acceleration)} m/s².`,
      `Apply Newton’s second law: F = ma = (${stepNumber(mass)} kg) × (${stepNumber(acceleration)} m/s²) = ${stepNumber(force)} N.`,
    ] }, warnings: [] };
  },
});
