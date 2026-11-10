import { scalarInput, scalarOutput, percentBasicsReference, everydayPrecision, everydayRounding, everydayRelease } from './everyday-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const markupPrice = Object.freeze({
  id: 'markup-price',
  version: '1.0.0',
  title: 'Markup and selling price',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax']),
  category: 'Everyday money',
  description: 'Add a chosen percentage markup to a cost amount.',
  keywords: Object.freeze(['markup calculator', 'selling price', 'cost plus', 'retail price', 'margin']),
  purpose: 'Calculate the amount and resulting price after applying a user-entered markup rate to cost.',
  intendedAudience: ['Everyday use', 'Learners', 'Small business estimates'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Markup amount = cost × markup rate ÷ 100. Selling price = cost + markup amount.' }),
  precision: everydayPrecision,
  rounding: everydayRounding,
  assumptions: Object.freeze(['The entered cost is non-negative.', 'The markup rate is non-negative.', 'Cost and resulting price use the same currency and scale.']),
  exclusions: Object.freeze(['Markup is applied to the entered cost only; this does not calculate profit margin, operating costs, taxes, fees, discounts, or a market price.', 'Displayed precision is not a cash-rounding rule.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['This is an arithmetic estimate; check all other costs and applicable business rules before setting a price.']),
  references: Object.freeze([percentBasicsReference]),
  verificationCases: Object.freeze(['A cost of 80 with a 25% markup gives markup of 20 and price of 100; zero markup preserves cost.']),
  release: everydayRelease('markup-price-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('cost', 'Cost', { min: 0, unitLabel: 'currency you enter', allowMagnitudeWords: true }),
    scalarInput('markup-percent', 'Markup', { min: 0, unitLabel: '%' }),
  ]),
  outputs: Object.freeze([
    scalarOutput('markup-amount', 'Markup amount'),
    scalarOutput('selling-price', 'Price after markup'),
  ]),
  calculate(inputs) {
    const markup = inputs.cost.value * inputs['markup-percent'].value / 100;
    return {
      outputs: {
        'markup-amount': { value: markup, unit: '1' },
        'selling-price': { value: inputs.cost.value + markup, unit: '1' },
      },
      intermediates: { formula: 'cost × (1 + markup percentage / 100)', steps: [
        `Convert markup rate to a ratio: ${stepNumber(inputs['markup-percent'].value)} / 100 = ${stepNumber(inputs['markup-percent'].value / 100)}.`,
        `Calculate markup amount: ${stepNumber(inputs.cost.value)} × ${stepNumber(inputs['markup-percent'].value / 100)} = ${stepNumber(markup)}.`,
        `Add markup to cost: ${stepNumber(inputs.cost.value)} + ${stepNumber(markup)} = ${stepNumber(inputs.cost.value + markup)}.`,
      ] },
      warnings: [],
    };
  },
});
