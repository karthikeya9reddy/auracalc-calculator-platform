import { scalarInput, scalarOutput, percentBasicsReference, everydayPrecision, everydayRounding, everydayRelease } from './everyday-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const percentageOfAmount = Object.freeze({
  id: 'percentage-of-amount',
  version: '1.0.0',
  title: 'Percentage of an amount',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Personal and corporate finance', 'Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax', 'Everyday conversions, cooking, and household projects']),
  category: 'Everyday money',
  description: 'Find a percentage of a number or amount, such as 15% of 80.',
  keywords: Object.freeze(['percent of', 'percentage of', 'portion', 'share', 'rate', 'amount']),
  purpose: 'Calculate a stated percentage of a base amount.',
  intendedAudience: ['Everyday use', 'Learners'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Result = base amount × percentage ÷ 100.' }),
  precision: everydayPrecision,
  rounding: everydayRounding,
  assumptions: Object.freeze(['The entered percentage is between 0% and 100%.', 'The result uses the same scale or currency as the base amount.']),
  exclusions: Object.freeze(['Does not apply taxes, exchange rates, or financial advice.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Enter the base amount in any scale or currency; this calculator does not identify or convert it.']),
  references: Object.freeze([percentBasicsReference]),
  verificationCases: Object.freeze(['15% of 80 gives 12; 0% of 80 gives 0; 100% of 80 gives 80.']),
  release: everydayRelease('percentage-of-amount-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('base-amount', 'Base amount', { min: 0, unitLabel: 'same scale/currency', allowMagnitudeWords: true }),
    scalarInput('percentage', 'Percentage', { min: 0, max: 100, unitLabel: '%' }),
  ]),
  outputs: Object.freeze([scalarOutput('amount', 'Percentage amount')]),
  calculate(inputs) {
    const rate = inputs.percentage.value / 100;
    const amount = inputs['base-amount'].value * rate;
    return {
      outputs: { amount: { value: amount, unit: '1' } },
      intermediates: { rate, formula: 'base amount × percentage / 100', steps: [
        `Convert the entered percentage to a ratio: ${stepNumber(inputs.percentage.value)} / 100 = ${stepNumber(rate)}.`,
        `Multiply the base amount by the ratio: ${stepNumber(inputs['base-amount'].value)} × ${stepNumber(rate)} = ${stepNumber(amount)}.`,
      ] },
      warnings: [],
    };
  },
});
