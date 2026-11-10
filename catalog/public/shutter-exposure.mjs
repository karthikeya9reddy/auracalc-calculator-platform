import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { physicalOutput, reference, r0Release, scalarInput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const shutterExposure = Object.freeze({
  id: 'shutter-exposure', version: '1.0.0', title: 'Shutter angle to exposure time',
  discipline: 'VFX, cinematography, and motion design',
  fields: Object.freeze(['VFX, CGI, animation, and motion design', 'Education, assessment, and learning']),
  category: 'Camera motion', description: 'Estimate exposure duration from a rotary shutter angle and frame rate.',
  keywords: Object.freeze(['shutter angle', 'exposure time', 'frame rate', 'motion blur']),
  purpose: 'Translate a shutter-angle setting into an exposure time under a constant-frame-rate rotary-shutter model.', intendedAudience: ['Filmmakers', 'Animators', 'Learners'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Exposure time = (shutter angle ÷ 360°) ÷ frame rate.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Shutter angle represents the fraction of each frame period for which the sensor is exposed.', 'Frame rate and shutter angle remain constant.']),
  exclusions: Object.freeze(['Does not model rolling shutter, sensor readout, flash sync, exposure compensation, or a camera-specific shutter mechanism.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['Electronic cameras may implement shutter settings differently from the ideal rotary-shutter model.']),
  references: Object.freeze([reference('smpte-shutter-time-and-angle', 'SMPTE RDD 18:2010, digital camera metadata includes shutter speed angle and shutter speed time; this calculation applies the rotary-shutter fraction of one frame period.', 'https://pub.smpte.org/doc/rdd18/20100314-pub/rdd18-2010.pdf')]),
  verificationCases: Object.freeze(['180° at 24 fps gives 1/48 s; 360° at 30 fps gives 1/30 s; zero fps is rejected.']),
  release: r0Release('shutter-exposure-smpte-cases-v1'),
  inputs: Object.freeze([
    scalarInput('shutter-angle', 'Shutter angle', 'degrees', { min: 0, max: 360 }),
    scalarInput('frame-rate', 'Frame rate', 'frames per second (fps)', { min: 0 }),
  ]),
  outputs: Object.freeze([physicalOutput('exposure-time', 'Exposure time', BASE_DIMENSIONS.time, 's', ['s', 'ms'])]),
  calculate(inputs) {
    const angle = inputs['shutter-angle'].value;
    const fps = inputs['frame-rate'].value;
    if (angle <= 0 || angle > 360) throw new CalculationError('SHUTTER_ANGLE_OUT_OF_RANGE', 'Shutter angle must be greater than 0° and no more than 360°.', { fieldId: 'shutter-angle' });
    if (fps <= 0) throw new CalculationError('POSITIVE_FRAME_RATE_REQUIRED', 'Frame rate must be greater than zero.', { fieldId: 'frame-rate' });
    const framePeriod = 1 / fps;
    const fraction = angle / 360;
    const exposure = fraction * framePeriod;
    return { outputs: { 'exposure-time': { value: exposure, unit: 's' } }, intermediates: { formula: 't = (θ / 360°) / fps', steps: [
      `Calculate the frame period: 1/fps = 1/${stepNumber(fps)} = ${stepNumber(framePeriod)} s/frame.`,
      `Find the exposed fraction of a frame: θ/360° = ${stepNumber(angle)}/360 = ${stepNumber(fraction)}.`,
      `Multiply frame period by exposed fraction: ${stepNumber(framePeriod)} × ${stepNumber(fraction)} = ${stepNumber(exposure)} s.`,
    ] }, warnings: [] };
  },
});
