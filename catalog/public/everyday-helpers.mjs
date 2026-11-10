import { DIMENSIONLESS } from '../../src/calculation-core/index.mjs';

export function scalarInput(id, label, { min, max, unitLabel, integer = false, allowMagnitudeWords = false } = {}) {
  const field = {
    id,
    type: 'quantity',
    label,
    required: true,
    dimension: DIMENSIONLESS,
    canonicalUnit: '1',
    acceptedUnits: Object.freeze(['1']),
  };
  if (min !== undefined || max !== undefined) {
    field.range = Object.freeze({ ...(min === undefined ? {} : { min }), ...(max === undefined ? {} : { max }), unit: '1' });
  }
  if (unitLabel) field.unitLabel = unitLabel;
  if (integer) field.integer = true;
  if (allowMagnitudeWords) field.allowMagnitudeWords = true;
  return Object.freeze(field);
}

export function scalarOutput(id, label) {
  return Object.freeze({
    id,
    type: 'quantity',
    label,
    dimension: DIMENSIONLESS,
    canonicalUnit: '1',
    acceptedUnits: Object.freeze(['1']),
    display: Object.freeze({ format: 'scalar' }),
  });
}

export const percentBasicsReference = Object.freeze({
  id: 'openstax-prealgebra-percent-basics',
  citation: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent.',
  url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent',
});

export const unitRateReference = Object.freeze({
  id: 'openstax-prealgebra-ratios-and-rate',
  citation: 'OpenStax, Prealgebra 2e, §5.6 Ratios and Rate.',
  url: 'https://openstax.org/books/prealgebra-2e/pages/5-6-ratios-and-rate',
});

export const everydayPrecision = Object.freeze({
  numericModel: 'IEEE-754 binary64',
  note: 'Suitable for general arithmetic estimates. Currency is user supplied and is not converted or rounded to a cash denomination.',
});

export const everydayRounding = Object.freeze({
  policy: 'Keep the full internal result; round displayed values to a maximum of 6 fractional digits.',
});

export function everydayRelease(evidenceId) {
  return Object.freeze({
    status: 'published',
    reviewers: Object.freeze([Object.freeze({
      id: 'author-self-review',
      qualification: 'Developer self-review against the cited educational arithmetic method and executable reference cases; no independent domain review recorded',
      independent: false,
    })]),
    evidenceIds: Object.freeze([evidenceId]),
  });
}
