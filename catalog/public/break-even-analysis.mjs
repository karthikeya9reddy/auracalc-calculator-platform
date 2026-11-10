import { CalculationError } from '../../src/calculation-core/index.mjs';
import { reference, r0Release, scalarInput, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const breakEvenAnalysis = Object.freeze({
  id: 'break-even-analysis', version: '1.0.0', title: 'Break-even point',
  discipline: 'Business and managerial accounting',
  fields: Object.freeze(['Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax', 'Personal and corporate finance', 'Education, assessment, and learning']),
  category: 'Business planning', description: 'Estimate break-even sales units and revenue from fixed costs and per-unit contribution.',
  keywords: Object.freeze(['fixed cost', 'contribution margin', 'break even units', 'break even sales']),
  purpose: 'Calculate a single-product, single-period break-even estimate for learning or initial planning.', intendedAudience: ['Learners', 'Early business estimates'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Contribution per unit = selling price − variable cost. Break-even units = fixed costs ÷ contribution per unit.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['All monetary inputs use the same currency and time period.', 'Selling price and variable cost remain constant per unit.', 'This is a single-product model with fixed costs unchanged across the range.']),
  exclusions: Object.freeze(['Does not account for taxes, discounts, capacity constraints, multiple products, changing prices/costs, or uncertainty.']),
  warnings: Object.freeze(['An estimate only; review assumptions and local accounting treatment before making business decisions.']), limitations: Object.freeze(['A positive contribution margin is required for a finite break-even result.']),
  references: Object.freeze([reference('openstax-break-even-units-and-dollars', 'OpenStax, Principles of Accounting, Volume 2, §3.2, break-even units = fixed costs ÷ contribution margin per unit; sales dollars = units × sales price.', 'https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars')]),
  verificationCases: Object.freeze(['Fixed costs 16800, price 1250, variable cost 850 gives 42 units and 52500 sales; non-positive contribution margin is rejected; fractional units are rounded up for the minimum whole unit count.']),
  release: r0Release('break-even-openstax-cases-v1'),
  inputs: Object.freeze([
    scalarInput('fixed-costs', 'Fixed costs for the period', 'currency you enter', { min: 0, allowMagnitudeWords: true }),
    scalarInput('selling-price', 'Selling price per unit', 'currency per unit', { min: 0, allowMagnitudeWords: true }),
    scalarInput('variable-cost', 'Variable cost per unit', 'same currency per unit', { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([
    scalarOutput('theoretical-break-even-units', 'Theoretical break-even units'),
    scalarOutput('whole-break-even-units', 'Minimum whole units to break even'),
    scalarOutput('break-even-revenue', 'Revenue at minimum whole units'),
  ]),
  calculate(inputs) {
    const fixed = inputs['fixed-costs'].value;
    const price = inputs['selling-price'].value;
    const variable = inputs['variable-cost'].value;
    const contribution = price - variable;
    if (price <= 0) throw new CalculationError('POSITIVE_SELLING_PRICE_REQUIRED', 'Selling price per unit must be greater than zero.', { fieldId: 'selling-price' });
    if (contribution <= 0) throw new CalculationError('NON_POSITIVE_CONTRIBUTION_MARGIN', 'Selling price must exceed variable cost per unit for a finite break-even point.', { fieldId: 'variable-cost' });
    const exactUnits = fixed / contribution;
    // Never round down a value that is even slightly above the break-even point.
    const wholeUnits = Math.ceil(exactUnits);
    const revenue = wholeUnits * price;
    return { outputs: {
      'theoretical-break-even-units': { value: exactUnits, unit: '1' },
      'whole-break-even-units': { value: wholeUnits, unit: '1' },
      'break-even-revenue': { value: revenue, unit: '1' },
    }, intermediates: { formula: 'contribution = price − variable cost; units = fixed costs / contribution', steps: [
      `Calculate contribution per unit: ${stepNumber(price)} − ${stepNumber(variable)} = ${stepNumber(contribution)} currency/unit.`,
      `Divide fixed costs by contribution: ${stepNumber(fixed)} / ${stepNumber(contribution)} = ${stepNumber(exactUnits)} theoretical units.`,
      `Round up to a whole unit: ${stepNumber(exactUnits)} → ${stepNumber(wholeUnits)} units.`,
      `Calculate revenue at that whole-unit count: ${stepNumber(wholeUnits)} × ${stepNumber(price)} = ${stepNumber(revenue)} in the entered currency.`,
    ] }, warnings: [] };
  },
});
