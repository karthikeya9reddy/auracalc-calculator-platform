import { CalculationError } from '../../src/calculation-core/index.mjs';
import { reference, r0Release, scalarInput, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const telescopeMagnification = Object.freeze({
  id: 'telescope-magnification', version: '1.0.0', title: 'Telescope magnification',
  discipline: 'Astronomy and observational optics',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning']),
  category: 'Astronomy tools', description: 'Estimate angular magnification from telescope objective and eyepiece focal lengths.',
  keywords: Object.freeze(['eyepiece', 'telescope focal length', 'magnifying power', 'astronomy']),
  purpose: 'Calculate the paraxial angular magnification of a simple telescope and eyepiece combination.', intendedAudience: ['Learners', 'Amateur astronomy'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'ratio', description: 'Magnification = telescope objective focal length ÷ eyepiece focal length; both lengths must use the same unit.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The entered focal lengths describe the objective and eyepiece used together.', 'Focal lengths use the same length unit.']),
  exclusions: Object.freeze(['Does not estimate useful maximum magnification, resolution, brightness, field of view, atmospheric seeing, or optical quality.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['Higher magnification does not guarantee a sharper or brighter image.']),
  references: Object.freeze([reference('truman-astronomer-telescope-magnification', 'Truman State University, Master Astronomer Handbook, §4.1: magnification equals telescope focal length divided by eyepiece focal length.', 'https://darksky.truman.edu/files/2024/07/master-astronomer-handbook-2019-hi-res-1.pdf')]),
  verificationCases: Object.freeze(['700 mm objective and 18 mm eyepiece give about 38.89×; doubling both lengths preserves magnification; zero eyepiece focal length is rejected.']),
  release: r0Release('telescope-magnification-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('objective-focal-length', 'Telescope objective focal length', 'same unit as eyepiece', { min: 0, allowMagnitudeWords: true }),
    scalarInput('eyepiece-focal-length', 'Eyepiece focal length', 'same unit as objective', { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([scalarOutput('magnification', 'Angular magnification (×)')]),
  calculate(inputs) {
    const objective = inputs['objective-focal-length'].value;
    const eyepiece = inputs['eyepiece-focal-length'].value;
    if (objective <= 0) throw new CalculationError('POSITIVE_OBJECTIVE_FOCAL_LENGTH_REQUIRED', 'Objective focal length must be greater than zero.', { fieldId: 'objective-focal-length' });
    if (eyepiece <= 0) throw new CalculationError('POSITIVE_EYEPIECE_FOCAL_LENGTH_REQUIRED', 'Eyepiece focal length must be greater than zero.', { fieldId: 'eyepiece-focal-length' });
    const magnification = objective / eyepiece;
    return { outputs: { magnification: { value: magnification, unit: '1' } }, intermediates: { formula: 'M = f objective / f eyepiece', steps: [
      `Confirm both focal lengths are in the same unit: objective = ${stepNumber(objective)}; eyepiece = ${stepNumber(eyepiece)}.`,
      `Divide objective focal length by eyepiece focal length: M = ${stepNumber(objective)} / ${stepNumber(eyepiece)} = ${stepNumber(magnification)}×.`,
    ] }, warnings: [] };
  },
});
