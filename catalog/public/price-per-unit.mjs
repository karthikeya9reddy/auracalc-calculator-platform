import { CalculationError } from '../../src/calculation-core/index.mjs';
import { scalarInput, scalarOutput, unitRateReference, everydayPrecision, everydayRounding, everydayRelease } from './everyday-helpers.mjs';
import { stepNumber } from './science-helpers.mjs';

export const pricePerUnit = Object.freeze({
  id: 'price-per-unit',
  version: '1.0.0',
  title: 'Price per unit',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Business operations, pricing, and unit economics', 'Everyday conversions, cooking, and household projects']),
  category: 'Everyday money',
  description: 'Compare value by dividing a package price by its quantity.',
  keywords: Object.freeze(['unit price calculator', 'price per item', 'price per kg', 'price comparison', 'cost per unit']),
  purpose: 'Calculate price per unit from a package price and a positive quantity entered in the same unit the user wants to compare.',
  intendedAudience: ['Everyday use', 'Learners'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Price per unit = package price ÷ package quantity.' }),
  precision: everydayPrecision,
  rounding: everydayRounding,
  assumptions: Object.freeze(['Package price is non-negative.', 'Quantity is greater than zero.', 'Quantities being compared use the same measure and scale; price uses the same currency and scale.']),
  exclusions: Object.freeze(['Does not convert units, compare quality, account for waste, promotions, tax, fees, or package-specific differences.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['For a fair comparison, enter quantities in the same unit (for example, kilograms for both products).']),
  references: Object.freeze([unitRateReference]),
  verificationCases: Object.freeze(['A package price of 6 for 3 units gives 2 per unit; doubling both price and quantity leaves unit price unchanged; zero quantity is rejected.']),
  release: everydayRelease('price-per-unit-reference-cases-v1'),
  inputs: Object.freeze([
    scalarInput('package-price', 'Package price', { min: 0, unitLabel: 'currency you enter', allowMagnitudeWords: true }),
    scalarInput('quantity', 'Package quantity', { min: 0, unitLabel: 'units you enter', allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([scalarOutput('unit-price', 'Price per unit')]),
  calculate(inputs) {
    const quantity = inputs.quantity.value;
    if (quantity <= 0) {
      throw new CalculationError('POSITIVE_QUANTITY_REQUIRED', 'Package quantity must be greater than zero.', { fieldId: 'quantity' });
    }
    const unitPrice = inputs['package-price'].value / quantity;
    return {
      outputs: { 'unit-price': { value: unitPrice, unit: '1' } },
      intermediates: { formula: 'package price / package quantity', steps: [
        `Normalize the package price and quantity: price = ${stepNumber(inputs['package-price'].value)}; quantity = ${stepNumber(quantity)} in the same user-entered unit.`,
        `Divide price by quantity: ${stepNumber(inputs['package-price'].value)} / ${stepNumber(quantity)} = ${stepNumber(inputs['package-price'].value / quantity)} currency per unit.`,
      ] },
      warnings: [],
    };
  },
});
