import { BASE_DIMENSIONS, CalculationError } from '../../src/calculation-core/index.mjs';
import { ACCELERATION, VELOCITY, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const averageAcceleration = Object.freeze({
  id: 'average-acceleration', version: '1.0.0', title: 'Average acceleration',
  discipline: 'Physics and motion',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning', 'Mechanical engineering']),
  category: 'Motion', description: 'Find the signed average acceleration from initial velocity, final velocity, and elapsed time.',
  keywords: Object.freeze(['change in velocity', 'deceleration', 'kinematics', 'm/s squared']),
  purpose: 'Calculate one-dimensional average acceleration for learning and general analysis.', intendedAudience: ['Learners', 'General physics use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Average acceleration a = (final velocity − initial velocity) ÷ elapsed time.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Velocities refer to the same one-dimensional coordinate axis and sign convention.', 'Elapsed time is positive.']),
  exclusions: Object.freeze(['Does not calculate instantaneous acceleration, turning motion, or a vehicle safety measurement.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['The result is an interval average; it does not describe changes within the interval.']),
  references: Object.freeze([reference('openstax-college-physics-average-acceleration', 'OpenStax, College Physics 2e, §2.4 Average Acceleration, ā = (vf − v0) / Δt.', 'https://openstax.org/books/college-physics-2e/pages/2-4-acceleration')]),
  verificationCases: Object.freeze(['0 m/s to 15 m/s in 3 s gives +5 m/s²; 20 m/s to 5 m/s in 3 s gives −5 m/s²; zero time is rejected.']),
  release: r0Release('average-acceleration-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('initial-velocity', 'Initial velocity', VELOCITY, 'm/s', ['m/s', 'km/h', 'mph'], { allowMagnitudeWords: true }),
    physicalInput('final-velocity', 'Final velocity', VELOCITY, 'm/s', ['m/s', 'km/h', 'mph'], { allowMagnitudeWords: true }),
    physicalInput('elapsed-time', 'Elapsed time', BASE_DIMENSIONS.time, 's', ['s', 'min', 'h'], { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([physicalOutput('acceleration', 'Average acceleration', ACCELERATION, 'm/s2')]),
  calculate(inputs) {
    if (inputs['elapsed-time'].value <= 0) throw new CalculationError('NON_POSITIVE_TIME', 'Elapsed time must be greater than zero.', { fieldId: 'elapsed-time' });
    const initial = inputs['initial-velocity'].value;
    const final = inputs['final-velocity'].value;
    const duration = inputs['elapsed-time'].value;
    const delta = final - initial;
    const acceleration = delta / duration;
    return { outputs: { acceleration: { value: acceleration, unit: 'm/s2' } }, intermediates: { formula: 'a = (vf − v0) / Δt', steps: [
      `Normalize velocities: v0 = ${stepNumber(initial)} m/s and vf = ${stepNumber(final)} m/s; Δt = ${stepNumber(duration)} s.`,
      `Find the velocity change: Δv = vf − v0 = ${stepNumber(final)} − (${stepNumber(initial)}) = ${stepNumber(delta)} m/s.`,
      `Divide by the elapsed time: a = Δv / Δt = ${stepNumber(delta)} / ${stepNumber(duration)} = ${stepNumber(acceleration)} m/s².`,
    ] }, warnings: [] };
  },
});
