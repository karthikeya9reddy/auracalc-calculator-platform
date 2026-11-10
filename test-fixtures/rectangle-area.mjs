import { BASE_DIMENSIONS, multiplyDimensions, multiplyQuantities, quantityAsUnitValue } from '../src/calculation-core/index.mjs';

export const rectangleAreaFixture = Object.freeze({
  id: 'test.rectangle-area',
  version: 'fixture-1',
  title: 'Rectangle area test fixture',
  discipline: 'test-only',
  category: 'geometry-contract',
  description: 'An isolated fixture for exercising the calculation pipeline; not a product calculator.',
  purpose: 'Verify unit normalization, dimensional output validation, and provenance handling.',
  intendedAudience: 'Automated tests only.',
  riskClass: 'R0',
  visibility: 'test-only',
  method: Object.freeze({ type: 'equation', description: 'area = width × height; test fixture only, not approved for product use.' }),
  precision: Object.freeze({ numericModel: 'IEEE-754 binary64', note: 'Test fixture only.' }),
  rounding: Object.freeze({ policy: 'No rounding in the calculation core; formatting is a separate layer.' }),
  assumptions: Object.freeze(['The fixture inputs are side lengths of a rectangle.']),
  exclusions: Object.freeze(['Not a publishable calculator definition.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Not a publishable calculator definition.']),
  references: Object.freeze([]),
  verificationCases: Object.freeze(['Test-only expected case: 2 m × 3 m = 6 m².']),
  release: Object.freeze({ status: 'test-only' }),
  inputs: Object.freeze([
    Object.freeze({
      id: 'width',
      type: 'quantity',
      label: 'Width',
      required: true,
      dimension: BASE_DIMENSIONS.length,
      canonicalUnit: 'm',
      acceptedUnits: Object.freeze(['m', 'cm', 'ft']),
      range: Object.freeze({ min: 0, unit: 'm' }),
    }),
    Object.freeze({
      id: 'height',
      type: 'quantity',
      label: 'Height',
      required: true,
      dimension: BASE_DIMENSIONS.length,
      canonicalUnit: 'm',
      acceptedUnits: Object.freeze(['m', 'cm', 'ft']),
      range: Object.freeze({ min: 0, unit: 'm' }),
    }),
  ]),
  outputs: Object.freeze([
    Object.freeze({
      id: 'area',
      type: 'quantity',
      label: 'Area',
      dimension: multiplyDimensions(BASE_DIMENSIONS.length, BASE_DIMENSIONS.length),
      canonicalUnit: 'm2',
      acceptedUnits: Object.freeze(['m2', 'ft2']),
    }),
  ]),
  calculate(inputs) {
    const area = multiplyQuantities(inputs.width, inputs.height);
    return {
      outputs: {
        area: { value: quantityAsUnitValue(area, 'm2'), unit: 'm2' },
      },
      warnings: [],
    };
  },
});
