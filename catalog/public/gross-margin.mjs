import { CalculationError } from '../../src/calculation-core/index.mjs';
import { reference, r0Release, scalarInput, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const grossMargin = Object.freeze({
  id: 'gross-margin', version: '1.0.0', title: 'Gross profit and margin',
  discipline: 'Business and managerial accounting',
  fields: Object.freeze(['Business operations, pricing, and unit economics', 'Accounting, bookkeeping, and tax', 'Personal and corporate finance', 'Education, assessment, and learning']),
  category: 'Business metrics', description: 'Calculate gross profit and gross margin from revenue and cost of goods sold.',
  keywords: Object.freeze(['gross profit', 'gross margin percent', 'revenue less cost of goods sold', 'COGS']),
  purpose: 'Show the basic relationship between sales revenue, cost of goods sold, and gross margin.', intendedAudience: ['Learners', 'General business use'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Gross profit = revenue − cost of goods sold. Gross margin = gross profit ÷ revenue × 100%.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Revenue and cost of goods sold cover the same period and use the same currency.', 'The user supplies the revenue and cost amounts.']),
  exclusions: Object.freeze(['Does not calculate net profit, tax, operating expenses, inventory valuation, or financial statement compliance.']),
  warnings: Object.freeze(['This arithmetic metric is not a complete measure of business profitability.']), limitations: Object.freeze(['Revenue must be positive; negative gross profit is allowed and shown as a negative margin.']),
  references: Object.freeze([reference('openstax-gross-margin', 'OpenStax, Principles of Finance, §5.1, gross margin = gross profit / sales; gross profit is sales less cost of goods sold.', 'https://openstax.org/books/principles-finance/pages/5-1-the-income-statement')]),
  verificationCases: Object.freeze(['Revenue 200 and COGS 120 gives gross profit 80 and margin 40%; COGS above revenue gives a negative margin; zero revenue is rejected.']),
  release: r0Release('gross-margin-openstax-cases-v1'),
  inputs: Object.freeze([
    scalarInput('revenue', 'Revenue for the period', 'currency you enter', { min: 0, allowMagnitudeWords: true }),
    scalarInput('cost-of-goods-sold', 'Cost of goods sold', 'same currency', { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([
    scalarOutput('gross-profit', 'Gross profit'),
    scalarOutput('gross-margin', 'Gross margin', 'percent'),
  ]),
  calculate(inputs) {
    const revenue = inputs.revenue.value;
    const cogs = inputs['cost-of-goods-sold'].value;
    if (revenue <= 0) throw new CalculationError('POSITIVE_REVENUE_REQUIRED', 'Revenue must be greater than zero to calculate gross margin.', { fieldId: 'revenue' });
    const profit = revenue - cogs;
    const ratio = profit / revenue;
    const percent = ratio * 100;
    return { outputs: {
      'gross-profit': { value: profit, unit: '1' },
      'gross-margin': { value: ratio, unit: '1' },
    }, intermediates: { formula: 'gross profit = revenue − COGS; gross margin = gross profit / revenue', steps: [
      `Subtract cost of goods sold: ${stepNumber(revenue)} − ${stepNumber(cogs)} = ${stepNumber(profit)} in the entered currency.`,
      `Divide gross profit by revenue: ${stepNumber(profit)} / ${stepNumber(revenue)} = ${stepNumber(ratio)}.`,
      `Convert to percent: ${stepNumber(ratio)} × 100 = ${stepNumber(percent)}%.`,
    ] }, warnings: [] };
  },
});
