import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { ENERGY, VELOCITY, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const kineticEnergy = Object.freeze({
  id: 'kinetic-energy', version: '1.0.0', title: 'Translational kinetic energy',
  discipline: 'Physics and mechanical fundamentals',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning', 'Mechanical engineering']),
  category: 'Energy', description: 'Calculate the translational kinetic energy of an object from its mass and speed.',
  keywords: Object.freeze(['energy of motion', 'joules', 'kinetic energy', 'moving object']),
  purpose: 'Calculate classical translational kinetic energy for a non-relativistic learning problem.', intendedAudience: ['Learners', 'General physics use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Kinetic energy KE = ½ × mass × speed².' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The object is treated as a single body with translational motion.', 'The speed is much less than the speed of light.']),
  exclusions: Object.freeze(['Does not calculate rotational energy, deformation, impact effects, or collision safety.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['This classical equation is not suitable for relativistic speeds.']),
  references: Object.freeze([reference('openstax-kinetic-energy', 'OpenStax, College Physics 2e, §7.2, translational kinetic energy KE = ½mv².', 'https://openstax.org/books/college-physics-2e/pages/7-2-kinetic-energy-and-the-work-energy-theorem')]),
  verificationCases: Object.freeze(['30 kg at 0.5 m/s gives 3.75 J; doubling speed quadruples energy; zero speed gives zero energy.']),
  release: r0Release('kinetic-energy-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('mass', 'Mass', BASE_DIMENSIONS.mass, 'kg', ['kg', 'g', 'lbm'], { min: 0, allowMagnitudeWords: true }),
    physicalInput('speed', 'Speed', VELOCITY, 'm/s', ['m/s', 'km/h', 'mph'], { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([physicalOutput('kinetic-energy', 'Kinetic energy', ENERGY, 'J', ['J', 'kJ', 'Wh', 'kWh'])]),
  calculate(inputs) {
    const mass = inputs.mass.value;
    const speed = inputs.speed.value;
    if (mass <= 0) throw new CalculationError('POSITIVE_MASS_REQUIRED', 'Mass must be greater than zero.', { fieldId: 'mass' });
    const square = speed ** 2;
    const energy = 0.5 * mass * square;
    return { outputs: { 'kinetic-energy': { value: energy, unit: 'J' } }, intermediates: { formula: 'KE = 1/2 mv^2', steps: [
      `Normalize inputs: m = ${stepNumber(mass)} kg and v = ${stepNumber(speed)} m/s.`,
      `Square the speed: v² = (${stepNumber(speed)} m/s)² = ${stepNumber(square)} m²/s².`,
      `Substitute: KE = ½mv² = 0.5 × ${stepNumber(mass)} × ${stepNumber(square)} = ${stepNumber(energy)} J.`,
    ] }, warnings: [] };
  },
});
