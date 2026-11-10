import { scalarInput, scalarOutput, percentBasicsReference, everydayPrecision, everydayRounding, everydayRelease } from './everyday-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const discountPrice = Object.freeze({
  id: 'discount-price',
  version: '1.0.0',
  title: 'Discount and final price',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Personal and corporate finance', 'Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax', 'Everyday conversions, cooking, and household projects']),
  category: 'Everyday money',
  description: 'See the discount amount and price after a stated percentage discount.',
  keywords: Object.freeze(['sale', 'discount', 'reduced price', 'savings', 'markdown', 'shopping']),
  purpose: 'Calculate a simple percentage discount from a user-entered original price.',
  intendedAudience: ['Everyday use', 'Learners'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Discount = original price × discount rate ÷ 100. Final price = original price − discount.' }),
  precision: everydayPrecision,
  rounding: everydayRounding,
  assumptions: Object.freeze(['The discount is from 0% through 100%.', 'Original and final prices use the same currency and scale.']),
  exclusions: Object.freeze(['Does not add tax, fees, stacked offers, or currency conversion.', 'Displayed precision is not a cash-rounding or point-of-sale rule.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Enter the price in any currency; the calculator does not identify the currency or determine whether a promotion applies.']),
  references: Object.freeze([percentBasicsReference]),
  verificationCases: Object.freeze(['20% off 50 gives a discount of 10 and final price of 40; 0% off leaves the price unchanged; 100% off gives zero.']),
  release: everydayRelease('discount-price-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('original-price', 'Original price', { min: 0, unitLabel: 'currency you enter', allowMagnitudeWords: true }),
    scalarInput('discount-percent', 'Discount', { min: 0, max: 100, unitLabel: '%' }),
  ]),
  outputs: Object.freeze([
    scalarOutput('savings', 'Discount amount'),
    scalarOutput('final-price', 'Price after discount'),
  ]),
  calculate(inputs) {
    const rate = inputs['discount-percent'].value / 100;
    const savings = inputs['original-price'].value * rate;
    const finalPrice = inputs['original-price'].value - savings;
    return {
      outputs: {
        savings: { value: savings, unit: '1' },
        'final-price': { value: finalPrice, unit: '1' },
      },
      intermediates: { rate, formula: 'original price × (1 − discount percentage / 100)', steps: [
        `Convert discount to a ratio: ${stepNumber(inputs['discount-percent'].value)} / 100 = ${stepNumber(rate)}.`,
        `Calculate savings: ${stepNumber(inputs['original-price'].value)} × ${stepNumber(rate)} = ${stepNumber(savings)}.`,
        `Subtract savings from original price: ${stepNumber(inputs['original-price'].value)} − ${stepNumber(savings)} = ${stepNumber(finalPrice)}.`,
      ] },
      warnings: [],
    };
  },
});
