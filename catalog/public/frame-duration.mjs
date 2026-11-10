import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { physicalInput, physicalOutput, reference, r0Release, scalarInput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const frameDuration = Object.freeze({
  id: 'frame-duration', version: '1.0.0', title: 'Frame count to duration',
  discipline: 'VFX, animation, and video production',
  fields: Object.freeze(['VFX, CGI, animation, and motion design', 'Software development and programming', 'Education, assessment, and learning']),
  category: 'Time and motion', description: 'Convert a frame count and playback frame rate into a duration.',
  keywords: Object.freeze(['frames to seconds', 'animation length', 'fps duration', 'video frames']),
  purpose: 'Estimate clip duration from a frame count at a constant frame rate.', intendedAudience: ['Animators', 'Editors', 'Learners'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Duration in seconds = frame count ÷ frames per second.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Frame rate is constant over the entire sequence.', 'The frame count represents the intended playback frames.']),
  exclusions: Object.freeze(['Does not interpret timecode, drop-frame conventions, variable frame rate, audio sync, or edit handles.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['Timecode duration may differ from a simple frame-count division when specialized conventions are used.']),
  references: Object.freeze([reference('smpte-time-and-control-code', 'SMPTE ST 12-1, Time and Control Code; frame-based media time is represented relative to a frame rate.', 'https://www.smpte.org/standards/st12-1')]),
  verificationCases: Object.freeze(['240 frames at 24 fps gives 10 s; doubling frame count doubles duration; zero fps is rejected.']),
  release: r0Release('frame-duration-smpte-cases-v1'),
  inputs: Object.freeze([
    scalarInput('frame-count', 'Frame count', 'frames', { min: 0, integer: true, allowMagnitudeWords: true }),
    scalarInput('frame-rate', 'Playback frame rate', 'frames per second (fps)', { min: 0 }),
  ]),
  outputs: Object.freeze([
    physicalOutput('duration', 'Duration', BASE_DIMENSIONS.time, 's', ['s', 'min', 'h']),
  ]),
  calculate(inputs) {
    const frames = inputs['frame-count'].value;
    const fps = inputs['frame-rate'].value;
    if (!Number.isInteger(frames)) throw new CalculationError('WHOLE_FRAME_COUNT_REQUIRED', 'Frame count must be a whole number.', { fieldId: 'frame-count' });
    if (fps <= 0) throw new CalculationError('POSITIVE_FRAME_RATE_REQUIRED', 'Frame rate must be greater than zero.', { fieldId: 'frame-rate' });
    const duration = frames / fps;
    return { outputs: { duration: { value: duration, unit: 's' } }, intermediates: { formula: 'duration = frames / fps', steps: [
      `Frame count N = ${stepNumber(frames)} frames; frame rate f = ${stepNumber(fps)} frames/s.`,
      `Divide frames by frames per second: t = N/f = ${stepNumber(frames)}/${stepNumber(fps)} = ${stepNumber(duration)} s.`,
    ] }, warnings: [] };
  },
});
