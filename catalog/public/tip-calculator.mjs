import { scalarInput, scalarOutput, percentBasicsReference, everydayPrecision, everydayRounding, everydayRelease } from './everyday-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const tipCalculator = Object.freeze({
  id: 'tip-calculator',
  version: '1.0.0',
  title: 'Tip amount and total',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Everyday conversions, cooking, and household projects']),
  category: 'Everyday money',
  description: 'Calculate a chosen tip and the resulting bill total.',
  keywords: Object.freeze(['tip calculator', 'gratuity', 'restaurant tip', 'bill total', 'service']),
  purpose: 'Calculate a tip amount and bill total from an entered bill and user-chosen rate.',
  intendedAudience: ['Everyday use', 'Learners'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Tip = bill × tip rate ÷ 100. Total = bill + tip.' }),
  precision: everydayPrecision,
  rounding: everydayRounding,
  assumptions: Object.freeze(['The bill is non-negative.', 'The user-chosen tip rate is from 0% through 100%.', 'Both amounts use the same currency and scale.']),
  exclusions: Object.freeze(['Does not add tax, service charges, fees, split the bill, or convert currency.', 'Does not recommend a tip rate or determine whether tipping is customary or expected.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Enter the bill and rate appropriate to your situation; this is a simple arithmetic estimate.']),
  references: Object.freeze([percentBasicsReference]),
  verificationCases: Object.freeze(['A bill of 80 with a 15% tip gives a tip of 12 and total of 92; zero tip preserves the bill amount.']),
  release: everydayRelease('tip-calculator-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('bill-amount', 'Bill amount', { min: 0, unitLabel: 'currency you enter', allowMagnitudeWords: true }),
    scalarInput('tip-percent', 'Tip percentage', { min: 0, max: 100, unitLabel: '%' }),
  ]),
  outputs: Object.freeze([
    scalarOutput('tip-amount', 'Tip amount'),
    scalarOutput('total', 'Total with tip'),
  ]),
  calculate(inputs) {
    const tip = inputs['bill-amount'].value * inputs['tip-percent'].value / 100;
    return {
      outputs: {
        'tip-amount': { value: tip, unit: '1' },
        total: { value: inputs['bill-amount'].value + tip, unit: '1' },
      },
      intermediates: { formula: 'bill × (1 + tip percentage / 100)', steps: [
        `Convert the chosen tip rate: ${stepNumber(inputs['tip-percent'].value)} / 100 = ${stepNumber(inputs['tip-percent'].value / 100)}.`,
        `Calculate tip: ${stepNumber(inputs['bill-amount'].value)} × ${stepNumber(inputs['tip-percent'].value / 100)} = ${stepNumber(tip)}.`,
        `Add tip to bill: ${stepNumber(inputs['bill-amount'].value)} + ${stepNumber(tip)} = ${stepNumber(inputs['bill-amount'].value + tip)}.`,
      ] },
      warnings: [],
    };
  },
});
