import {
  BASE_DIMENSIONS,
  multiplyDimensions,
  multiplyQuantities,
  quantityAsUnitValue,
  addQuantities,
  createQuantity,
} from '../../src/calculation-core/index.mjs';
import { stepNumber } from './science-helpers.mjs';

const lengthField = (id, label) => Object.freeze({
  id,
  type: 'quantity',
  label,
  required: true,
  allowMagnitudeWords: true,
  dimension: BASE_DIMENSIONS.length,
  canonicalUnit: 'm',
  acceptedUnits: Object.freeze(['m', 'cm', 'ft', 'in']),
  range: Object.freeze({ min: 0, unit: 'm' }),
});

export const rectangleArea = Object.freeze({
  id: 'rectangle-area',
  version: '1.0.0',
  title: 'Rectangle area and perimeter',
  discipline: 'Mathematics, home, and construction basics',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Civil engineering', 'Construction estimating and quantity surveying', 'Architecture and building design', 'Skilled trades', 'Everyday conversions, cooking, and household projects']),
  category: 'Geometry',
  description: 'Find the area and perimeter of a flat rectangle from its length and width.',
  keywords: Object.freeze(['room', 'floor', 'wall', 'square feet', 'square metres', 'geometry', 'home project']),
  purpose: 'Calculate basic two-dimensional rectangular measurements.',
  intendedAudience: ['Everyday use', 'Learners', 'Early estimates'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Area = length × width. Perimeter = 2 × (length + width).' }),
  precision: Object.freeze({ numericModel: 'IEEE-754 binary64', note: 'For general geometry and learning; measured dimensions remain subject to measurement uncertainty.' }),
  rounding: Object.freeze({ policy: 'Keep full internal result; round displayed values to a maximum of 6 fractional digits.' }),
  assumptions: Object.freeze(['The shape is a flat rectangle.', 'Length and width are perpendicular side lengths.']),
  exclusions: Object.freeze(['Does not calculate structural adequacy, material takeoff, waste, or irregular shapes.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Use a qualified design method and professional review for structural or code decisions.']),
  references: Object.freeze([{
    id: 'openstax-geometry-formulas',
    citation: 'OpenStax, Prealgebra 1e, §12.3 Geometric Formulas; rectangle area A = lw and perimeter P = 2l + 2w.',
    url: 'https://math.libretexts.org/Bookshelves/PreAlgebra/Prealgebra_1e_%28OpenStax%29/12%3A_Appendix/12.03%3A_Geometric_Formulas',
  }]),
  verificationCases: Object.freeze(['2 m × 3 m gives area 6 m² and perimeter 10 m; 12 in × 12 in is checked through metric normalization in the unit suite.']),
  release: Object.freeze({ status: 'published', reviewers: Object.freeze([{ id: 'author-self-review', qualification: 'Developer self-review against the cited educational method and executable reference cases; no independent domain review recorded', independent: false }]), evidenceIds: Object.freeze(['rectangle-area-reference-cases-v1']) }),
  inputs: Object.freeze([lengthField('length', 'Length'), lengthField('width', 'Width')]),
  outputs: Object.freeze([
    Object.freeze({ id: 'area', type: 'quantity', label: 'Area', dimension: multiplyDimensions(BASE_DIMENSIONS.length, BASE_DIMENSIONS.length), canonicalUnit: 'm2', acceptedUnits: Object.freeze(['m2', 'ft2']) }),
    Object.freeze({ id: 'perimeter', type: 'quantity', label: 'Perimeter', dimension: BASE_DIMENSIONS.length, canonicalUnit: 'm', acceptedUnits: Object.freeze(['m', 'ft']) }),
  ]),
  calculate(inputs) {
    const area = multiplyQuantities(inputs.length, inputs.width);
    const sideSum = addQuantities(inputs.length, inputs.width);
    const perimeter = multiplyQuantities(sideSum, createQuantity(2, '1'));
    return {
      outputs: {
        area: { value: quantityAsUnitValue(area, 'm2'), unit: 'm2' },
        perimeter: { value: quantityAsUnitValue(perimeter, 'm'), unit: 'm' },
      },
      intermediates: { lengthMetres: inputs.length.value, widthMetres: inputs.width.value, formula: 'area = length × width; perimeter = 2 × (length + width)', steps: [
        `Normalize dimensions: length = ${stepNumber(inputs.length.value)} m; width = ${stepNumber(inputs.width.value)} m.`,
        `Area: A = l × w = ${stepNumber(inputs.length.value)} × ${stepNumber(inputs.width.value)} = ${stepNumber(area.value)} m².`,
        `Perimeter: P = 2(l + w) = 2 × (${stepNumber(inputs.length.value)} + ${stepNumber(inputs.width.value)}) = ${stepNumber(perimeter.value)} m.`,
      ] },
      warnings: [],
    };
  },
});
