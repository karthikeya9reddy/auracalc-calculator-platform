import { CalculationError, BASE_DIMENSIONS, convertValue } from '../../src/calculation-core/index.mjs';
import { ENERGY, FORCE, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const workDone = Object.freeze({
  id: 'work-done', version: '1.0.0', title: 'Work by a constant force',
  discipline: 'Physics and mechanical fundamentals',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning', 'Mechanical engineering']),
  category: 'Energy', description: 'Calculate work by a constant force over a displacement and entered angle.',
  keywords: Object.freeze(['force and distance', 'joules', 'work energy', 'angle between force and motion']),
  purpose: 'Calculate the work component of a constant force along a straight displacement.', intendedAudience: ['Learners', 'General physics use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Work W = force × displacement × cos(angle between force and displacement).'}),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Force magnitude is constant over the displacement.', 'Displacement is straight and the entered angle is between the force and displacement vectors.']),
  exclusions: Object.freeze(['Does not sum changing forces, calculate a path integral, or predict impact or machine performance.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['Work is negative when the force component opposes the displacement.']),
  references: Object.freeze([reference('openstax-work-angle', 'OpenStax, College Physics 2e, §7.1, W = Fd cos θ for a constant force.', 'https://openstax.org/books/college-physics-2e/pages/7-1-work-the-scientific-definition')]),
  verificationCases: Object.freeze(['10 N parallel over 3 m gives 30 J; the same force at 90° gives 0 J; at 180° it gives −30 J.']),
  release: r0Release('work-done-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('force', 'Force magnitude', FORCE, 'N', ['N', 'kN', 'lbf'], { min: 0, allowMagnitudeWords: true }),
    physicalInput('displacement', 'Displacement', BASE_DIMENSIONS.length, 'm', ['m', 'cm', 'ft', 'mi'], { min: 0, allowMagnitudeWords: true }),
    physicalInput('angle', 'Angle between force and displacement', BASE_DIMENSIONS.planeAngle, 'deg', ['deg'], { min: 0, max: 180, unitLabel: 'degrees' }),
  ]),
  outputs: Object.freeze([physicalOutput('work', 'Work', ENERGY, 'J', ['J', 'kJ', 'Wh', 'kWh'])]),
  calculate(inputs) {
    const force = inputs.force.value;
    const distance = inputs.displacement.value;
    const angleDegrees = inputs.angle.value;
    if (distance < 0) throw new CalculationError('NEGATIVE_DISPLACEMENT', 'Displacement magnitude cannot be negative.', { fieldId: 'displacement' });
    const angleRadians = convertValue(angleDegrees, 'deg', 'rad');
    const factor = Math.cos(angleRadians);
    const work = force * distance * factor;
    return { outputs: { work: { value: work, unit: 'J' } }, intermediates: { formula: 'W = Fd cos θ', steps: [
      `Normalize inputs: F = ${stepNumber(force)} N; d = ${stepNumber(distance)} m; θ = ${stepNumber(angleDegrees)}° (${stepNumber(angleRadians)} rad).`,
      `Find the parallel force factor: cos θ = ${stepNumber(factor)}.`,
      `Substitute: W = Fd cos θ = ${stepNumber(force)} × ${stepNumber(distance)} × ${stepNumber(factor)} = ${stepNumber(work)} J.`,
    ] }, warnings: [] };
  },
});
