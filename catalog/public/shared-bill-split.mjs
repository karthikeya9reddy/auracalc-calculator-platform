import { CalculationError } from '../../src/calculation-core/index.mjs';
import { scalarInput, scalarOutput, percentBasicsReference, everydayPrecision, everydayRounding, everydayRelease } from './everyday-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const sharedBillSplit = Object.freeze({
  id: 'shared-bill-split',
  version: '1.0.0',
  title: 'Tip and bill splitter',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Everyday conversions, cooking, and household projects']),
  category: 'Everyday money',
  description: 'Add a user-chosen tip percentage and split the total evenly among a group.',
  keywords: Object.freeze(['tip calculator', 'gratuity', 'split bill', 'share a bill', 'restaurant', 'per person']),
  purpose: 'Estimate an equal per-person share of a bill after adding an optional tip rate.',
  intendedAudience: ['Everyday use'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Tip = bill × tip percentage ÷ 100. Total = bill + tip. Per person = total ÷ number of people.' }),
  precision: everydayPrecision,
  rounding: everydayRounding,
  assumptions: Object.freeze(['The bill amount is non-negative.', 'The tip percentage is between 0% and 100%.', 'The total is divided equally among a whole number of people.', 'All amounts use the same currency and scale.']),
  exclusions: Object.freeze(['Does not apply tax, service charges, uneven shares, or currency conversion.', 'Does not prescribe a culturally or legally appropriate tip amount.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Enter a bill amount and tip percentage appropriate to your situation; this is an arithmetic estimate, not a payment amount.']),
  references: Object.freeze([percentBasicsReference]),
  verificationCases: Object.freeze(['A bill of 80, 10% tip, and 4 people gives a total of 88 and 22 per person; zero tip preserves the bill total; fractional people are rejected.']),
  release: everydayRelease('shared-bill-split-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('bill-amount', 'Bill amount', { min: 0, unitLabel: 'currency you enter', allowMagnitudeWords: true }),
    scalarInput('tip-percent', 'Tip percentage', { min: 0, max: 100, unitLabel: '%' }),
    scalarInput('people', 'Number of people', { min: 1, integer: true, unitLabel: 'people', allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([
    scalarOutput('tip-amount', 'Tip amount'),
    scalarOutput('total', 'Total with tip'),
    scalarOutput('per-person', 'Share per person'),
  ]),
  calculate(inputs) {
    const people = inputs.people.value;
    if (!Number.isInteger(people)) {
      throw new CalculationError('WHOLE_PEOPLE_REQUIRED', 'Enter a whole number of people.', { fieldId: 'people' });
    }
    const tip = inputs['bill-amount'].value * inputs['tip-percent'].value / 100;
    const total = inputs['bill-amount'].value + tip;
    return {
      outputs: {
        'tip-amount': { value: tip, unit: '1' },
        total: { value: total, unit: '1' },
        'per-person': { value: total / people, unit: '1' },
      },
      intermediates: { people, formula: 'per-person share = bill × (1 + tip percentage / 100) / people', steps: [
        `Calculate tip: ${stepNumber(inputs['bill-amount'].value)} × ${stepNumber(inputs['tip-percent'].value / 100)} = ${stepNumber(tip)}.`,
        `Add tip to get total: ${stepNumber(inputs['bill-amount'].value)} + ${stepNumber(tip)} = ${stepNumber(total)}.`,
        `Divide total equally among ${stepNumber(people)} people: ${stepNumber(total)} / ${stepNumber(people)} = ${stepNumber(total / people)} per person.`,
      ] },
      warnings: [],
    };
  },
});
