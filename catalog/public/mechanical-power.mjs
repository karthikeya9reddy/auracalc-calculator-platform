import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { ENERGY, POWER, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const mechanicalPower = Object.freeze({
  id: 'mechanical-power', version: '1.0.0', title: 'Average mechanical power',
  discipline: 'Physics and mechanical fundamentals',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning', 'Mechanical engineering', 'Energy systems and utilities']),
  category: 'Power', description: 'Calculate average power from transferred work or energy and elapsed time.',
  keywords: Object.freeze(['watts', 'joules per second', 'work rate', 'energy transfer']),
  purpose: 'Calculate the average rate of work or energy transfer in an educational example.', intendedAudience: ['Learners', 'General physics use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Average power P = work or energy transferred ÷ elapsed time.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The input is signed work or energy transferred over the stated interval.', 'Elapsed time is positive.']),
  exclusions: Object.freeze(['Does not account for losses, efficiency, peak power, electrical wiring, or equipment ratings.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['An average does not show short-duration peaks or variation over time.']),
  references: Object.freeze([reference('openstax-work-power', 'OpenStax, College Physics 2e, §7.7, average power is work divided by elapsed time.', 'https://openstax.org/books/college-physics-2e/pages/7-7-power')]),
  verificationCases: Object.freeze(['600 J over 2 s gives 300 W; doubling time halves power; zero elapsed time is rejected.']),
  release: r0Release('mechanical-power-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('work', 'Work or energy transferred', ENERGY, 'J', ['J', 'kJ', 'Wh', 'kWh'], { allowMagnitudeWords: true }),
    physicalInput('elapsed-time', 'Elapsed time', BASE_DIMENSIONS.time, 's', ['s', 'min', 'h'], { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([physicalOutput('power', 'Average power', POWER, 'W', ['W', 'kW'])]),
  calculate(inputs) {
    const work = inputs.work.value;
    const time = inputs['elapsed-time'].value;
    if (time <= 0) throw new CalculationError('NON_POSITIVE_TIME', 'Elapsed time must be greater than zero.', { fieldId: 'elapsed-time' });
    const power = work / time;
    return { outputs: { power: { value: power, unit: 'W' } }, intermediates: { formula: 'P = W / t', steps: [
      `Normalize inputs: work W = ${stepNumber(work)} J; elapsed time t = ${stepNumber(time)} s.`,
      `Divide transferred work by time: P = W / t = ${stepNumber(work)} / ${stepNumber(time)} = ${stepNumber(power)} J/s.`,
      `Since 1 W = 1 J/s, average power is ${stepNumber(power)} W.`,
    ] }, warnings: [] };
  },
});
