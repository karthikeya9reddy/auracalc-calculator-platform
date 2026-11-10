import { scalarInput, scalarOutput, percentBasicsReference, everydayPrecision, everydayRounding, everydayRelease } from './everyday-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const salesTaxEstimate = Object.freeze({
  id: 'sales-tax-estimate',
  version: '1.0.0',
  title: 'Sales tax estimate',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax', 'Everyday conversions, cooking, and household projects']),
  category: 'Everyday money',
  description: 'Estimate tax and total using a rate you provide.',
  keywords: Object.freeze(['sales tax calculator', 'tax amount', 'tax rate', 'purchase total', 'add tax']),
  purpose: 'Calculate an arithmetic tax estimate from a subtotal and user-entered rate.',
  intendedAudience: ['Everyday use', 'Learners'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Tax = subtotal × rate ÷ 100. Total = subtotal + tax.' }),
  precision: everydayPrecision,
  rounding: everydayRounding,
  assumptions: Object.freeze(['The subtotal is non-negative.', 'The user supplies a rate from 0% through 100%.', 'The tax estimate applies the same rate to the entire subtotal.', 'Amounts use one unchanged currency and scale.']),
  exclusions: Object.freeze(['Does not identify applicable taxes, determine taxable items, or apply local rules, exemptions, thresholds, fees, or rounding.', 'Does not provide tax advice.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Use only a rate you have independently determined applies to the purchase; this is a simple arithmetic estimate.']),
  references: Object.freeze([percentBasicsReference]),
  verificationCases: Object.freeze(['A subtotal of 100 at 8% gives tax of 8 and total of 108; zero rate leaves the subtotal unchanged; a rate above 100% is rejected.']),
  release: everydayRelease('sales-tax-estimate-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('subtotal', 'Subtotal', { min: 0, unitLabel: 'currency you enter', allowMagnitudeWords: true }),
    scalarInput('tax-percent', 'Tax rate', { min: 0, max: 100, unitLabel: '%' }),
  ]),
  outputs: Object.freeze([
    scalarOutput('tax-amount', 'Estimated tax'),
    scalarOutput('total', 'Estimated total'),
  ]),
  calculate(inputs) {
    const rate = inputs['tax-percent'].value / 100;
    const tax = inputs.subtotal.value * rate;
    return {
      outputs: {
        'tax-amount': { value: tax, unit: '1' },
        total: { value: inputs.subtotal.value + tax, unit: '1' },
      },
      intermediates: { rate, formula: 'subtotal × (1 + tax percentage / 100)', steps: [
        `Convert the user-entered rate: ${stepNumber(inputs['tax-percent'].value)} / 100 = ${stepNumber(rate)}.`,
        `Estimate tax: ${stepNumber(inputs.subtotal.value)} × ${stepNumber(rate)} = ${stepNumber(tax)}.`,
        `Add estimated tax: ${stepNumber(inputs.subtotal.value)} + ${stepNumber(tax)} = ${stepNumber(inputs.subtotal.value + tax)}.`,
      ] },
      warnings: [],
    };
  },
});
