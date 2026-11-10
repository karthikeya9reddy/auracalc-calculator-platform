import { CalculationError, DIMENSIONLESS } from '../../src/calculation-core/index.mjs';
import { stepNumber } from './science-helpers.mjs';

const amount = (id, label) => Object.freeze({
  id,
  type: 'quantity',
  label,
  required: true,
  allowMagnitudeWords: true,
  dimension: DIMENSIONLESS,
  canonicalUnit: '1',
  acceptedUnits: Object.freeze(['1']),
});

export const percentageChange = Object.freeze({
  id: 'percentage-change',
  version: '1.0.0',
  title: 'Percentage change calculator',
  discipline: 'Mathematics and everyday calculations',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Personal and corporate finance', 'Business operations, pricing, and unit economics', 'Everyday conversions, cooking, and household projects']),
  category: 'Percentages',
  description: 'Compare an original amount with a new amount and see the signed percentage change.',
  keywords: Object.freeze(['percent', 'percentage', 'increase', 'decrease', 'growth', 'reduction', 'change', 'baseline']),
  purpose: 'Explain how much a non-zero baseline amount increased or decreased.',
  intendedAudience: ['Everyday use', 'Learners'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({
    type: 'equation',
    description: 'Change = new amount − original amount. Percentage change = change ÷ original amount × 100%.',
  }),
  precision: Object.freeze({ numericModel: 'IEEE-754 binary64', note: 'Suitable for general educational percentage arithmetic; not financial ledger arithmetic.' }),
  rounding: Object.freeze({ policy: 'Keep the full binary64 result; round only for display to a maximum of 6 fractional digits.' }),
  assumptions: Object.freeze(['Both entries use the same scale and represent comparable amounts.', 'The original amount is the reference baseline.']),
  exclusions: Object.freeze(['This is not percentage-point change, percent difference, markup, tax, or investment return.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['An original value of zero has no defined percentage change.', 'Negative baselines are calculated algebraically, but conventional percentage interpretation may be unsuitable.']),
  references: Object.freeze([{
    id: 'openstax-prealgebra-percent-change',
    citation: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent.',
    url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent',
  }]),
  verificationCases: Object.freeze(['100 to 125 gives +25%; 100 to 70 gives −30%; zero baseline is rejected.']),
  release: Object.freeze({
    status: 'published',
    reviewers: Object.freeze([{ id: 'author-self-review', qualification: 'Developer self-review against the cited educational method and executable reference cases; no independent domain review recorded', independent: false }]),
    evidenceIds: Object.freeze(['percentage-change-reference-cases-v1']),
  }),
  inputs: Object.freeze([amount('original', 'Original amount'), amount('new', 'New amount')]),
  outputs: Object.freeze([
    Object.freeze({ id: 'change-percent', type: 'quantity', label: 'Percentage change', dimension: DIMENSIONLESS, canonicalUnit: '1', acceptedUnits: Object.freeze(['1']), display: Object.freeze({ format: 'percent' }) }),
    Object.freeze({ id: 'difference', type: 'quantity', label: 'Amount changed by', dimension: DIMENSIONLESS, canonicalUnit: '1', acceptedUnits: Object.freeze(['1']), display: Object.freeze({ format: 'scalar' }) }),
  ]),
  calculate(inputs) {
    if (inputs.original.value === 0) {
      throw new CalculationError('ZERO_BASELINE', 'Percentage change is undefined when the original amount is zero.', { fieldId: 'original' });
    }
    const difference = inputs.new.value - inputs.original.value;
    const ratio = difference / inputs.original.value;
    return {
      outputs: {
        difference: { value: difference, unit: '1' },
        'change-percent': { value: ratio, unit: '1' },
      },
      intermediates: { difference, ratio, formula: '(new − original) / original × 100%', steps: [
        `Find the signed difference: new − original = ${stepNumber(inputs.new.value)} − ${stepNumber(inputs.original.value)} = ${stepNumber(difference)}.`,
        `Divide by the non-zero original value: ${stepNumber(difference)} / ${stepNumber(inputs.original.value)} = ${stepNumber(ratio)}.`,
        `Convert the ratio to a percent: ${stepNumber(ratio)} × 100 = ${stepNumber(ratio * 100)}%.`,
      ] },
      warnings: [],
    };
  },
});
