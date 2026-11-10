import {
  BASE_DIMENSIONS,
  divideDimensions,
  divideQuantities,
  quantityAsUnitValue,
  CalculationError,
} from '../../src/calculation-core/index.mjs';
import { stepNumber } from './science-helpers.mjs';

export const averageSpeed = Object.freeze({
  id: 'average-speed',
  version: '1.0.0',
  title: 'Average speed',
  discipline: 'Physics, travel, and education',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Physics, astronomy, astrophysics, and cosmology', 'Travel, time, fitness, and sports calculations']),
  category: 'Motion',
  description: 'Calculate average speed from total distance travelled and elapsed time.',
  keywords: Object.freeze(['speed', 'travel', 'journey', 'pace', 'distance over time', 'motion']),
  purpose: 'Relate a travelled distance to its elapsed time for an educational or general estimate.',
  intendedAudience: ['Everyday use', 'Learners'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Average speed = total distance travelled ÷ elapsed time.' }),
  precision: Object.freeze({ numericModel: 'IEEE-754 binary64', note: 'This result is an average over the entered interval, not instantaneous speed.' }),
  rounding: Object.freeze({ policy: 'Keep full internal result; round displayed values to a maximum of 6 fractional digits.' }),
  assumptions: Object.freeze(['Distance is a non-negative path length.', 'Elapsed time is positive.', 'The output is average speed, not signed velocity.']),
  exclusions: Object.freeze(['Not an instantaneous vehicle-speed measurement, road-safety instrument, or camera-based speed estimate.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Does not account for motion within the interval or measurement uncertainty in distance and time.']),
  references: Object.freeze([{
    id: 'openstax-college-physics-speed',
    citation: 'OpenStax, College Physics 2e, §2.3 Time, Velocity, and Speed; average speed is distance travelled divided by elapsed time.',
    url: 'https://openstax.org/books/college-physics-2e/pages/2-3-time-velocity-and-speed',
  }]),
  verificationCases: Object.freeze(['150 m in 10 s gives 15 m/s; 60 km in 1 h gives 60 km/h; zero time is rejected.']),
  release: Object.freeze({ status: 'published', reviewers: Object.freeze([{ id: 'author-self-review', qualification: 'Developer self-review against the cited educational method and executable reference cases; no independent domain review recorded', independent: false }]), evidenceIds: Object.freeze(['average-speed-reference-cases-v1']) }),
  inputs: Object.freeze([
    Object.freeze({ id: 'distance', type: 'quantity', label: 'Total distance travelled', required: true, allowMagnitudeWords: true, dimension: BASE_DIMENSIONS.length, canonicalUnit: 'm', acceptedUnits: Object.freeze(['m', 'km', 'mi', 'ft']), range: Object.freeze({ min: 0, unit: 'm' }) }),
    Object.freeze({ id: 'elapsed-time', type: 'quantity', label: 'Elapsed time', required: true, dimension: BASE_DIMENSIONS.time, canonicalUnit: 's', acceptedUnits: Object.freeze(['s', 'min', 'h']), range: Object.freeze({ min: 0, unit: 's' }) }),
  ]),
  outputs: Object.freeze([
    Object.freeze({ id: 'speed', type: 'quantity', label: 'Average speed', dimension: divideDimensions(BASE_DIMENSIONS.length, BASE_DIMENSIONS.time), canonicalUnit: 'm/s', acceptedUnits: Object.freeze(['m/s', 'km/h', 'mph']) }),
  ]),
  calculate(inputs) {
    if (inputs['elapsed-time'].value <= 0) throw new CalculationError('NON_POSITIVE_TIME', 'Elapsed time must be greater than zero.', { fieldId: 'elapsed-time' });
    const speed = divideQuantities(inputs.distance, inputs['elapsed-time']);
    return {
      outputs: { speed: { value: quantityAsUnitValue(speed, 'm/s'), unit: 'm/s' } },
      intermediates: { distanceMetres: inputs.distance.value, elapsedSeconds: inputs['elapsed-time'].value, formula: 'average speed = distance travelled / elapsed time', steps: [
        `Normalize distance and time: d = ${stepNumber(inputs.distance.value)} m; t = ${stepNumber(inputs['elapsed-time'].value)} s.`,
        `Divide total path length by elapsed time: v̄ = d/t = ${stepNumber(inputs.distance.value)}/${stepNumber(inputs['elapsed-time'].value)} = ${stepNumber(quantityAsUnitValue(speed, 'm/s'))} m/s.`,
      ] },
      warnings: [],
    };
  },
});
