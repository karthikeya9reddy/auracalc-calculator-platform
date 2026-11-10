import {
  BASE_DIMENSIONS,
  multiplyDimensions,
  multiplyQuantities,
  quantityAsUnitValue,
} from '../../src/calculation-core/index.mjs';
import { stepNumber } from './science-helpers.mjs';

const LENGTH = BASE_DIMENSIONS.length;
const AREA = multiplyDimensions(LENGTH, LENGTH);

export const rectangularPrismVolume = Object.freeze({
  id: 'rectangular-prism-volume',
  version: '1.0.0',
  title: 'Rectangular prism volume',
  discipline: 'Mathematics, home, and construction basics',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Civil engineering', 'Construction estimating and quantity surveying', 'Architecture and building design', 'Skilled trades', 'Everyday conversions, cooking, and household projects']),
  category: 'Geometry',
  description: 'Calculate the volume of a rectangular solid from its base area and depth.',
  keywords: Object.freeze(['box', 'capacity', 'solid', 'cubic feet', 'cubic metres', 'container', 'fill volume']),
  purpose: 'Calculate a basic three-dimensional rectangular volume or continue from a rectangle-area result.',
  intendedAudience: ['Everyday use', 'Learners', 'Early estimates'],
  riskClass: 'R0',
  visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Volume = base area × depth.' }),
  precision: Object.freeze({ numericModel: 'IEEE-754 binary64', note: 'For general geometry and learning; measured dimensions remain subject to measurement uncertainty.' }),
  rounding: Object.freeze({ policy: 'Keep full internal result; round displayed values to a maximum of 6 fractional digits.' }),
  assumptions: Object.freeze(['The solid is a rectangular prism.', 'The depth is perpendicular to the rectangular base.']),
  exclusions: Object.freeze(['Does not calculate structural adequacy, fill compaction, material waste, or irregular solids.']),
  warnings: Object.freeze([]),
  limitations: Object.freeze(['Use a qualified design method and professional review for structural or code decisions.']),
  references: Object.freeze([{
    id: 'openstax-geometry-formulas',
    citation: 'OpenStax, Prealgebra 1e, §12.3 Geometric Formulas; rectangular solid volume V = lwh.',
    url: 'https://math.libretexts.org/Bookshelves/PreAlgebra/Prealgebra_1e_%28OpenStax%29/12%3A_Appendix/12.03%3A_Geometric_Formulas',
  }]),
  verificationCases: Object.freeze(['A 6 m² base with 2 m depth gives 12 m³; negative dimensions are rejected by the range gate.']),
  release: Object.freeze({ status: 'published', reviewers: Object.freeze([{ id: 'author-self-review', qualification: 'Developer self-review against the cited educational method and executable reference cases; no independent domain review recorded', independent: false }]), evidenceIds: Object.freeze(['rectangular-prism-volume-reference-cases-v1']) }),
  inputs: Object.freeze([
    Object.freeze({ id: 'base-area', type: 'quantity', label: 'Base area', required: true, allowMagnitudeWords: true, dimension: AREA, canonicalUnit: 'm2', acceptedUnits: Object.freeze(['m2', 'ft2']), range: Object.freeze({ min: 0, unit: 'm2' }), workflowFrom: Object.freeze(['rectangle-area.area']) }),
    Object.freeze({ id: 'depth', type: 'quantity', label: 'Depth', required: true, allowMagnitudeWords: true, dimension: LENGTH, canonicalUnit: 'm', acceptedUnits: Object.freeze(['m', 'cm', 'ft']), range: Object.freeze({ min: 0, unit: 'm' }), workflowFrom: Object.freeze([]) }),
  ]),
  outputs: Object.freeze([
    Object.freeze({ id: 'volume', type: 'quantity', label: 'Volume', dimension: multiplyDimensions(AREA, LENGTH), canonicalUnit: 'm3', acceptedUnits: Object.freeze(['m3', 'L']) }),
  ]),
  calculate(inputs) {
    const volume = multiplyQuantities(inputs['base-area'], inputs.depth);
    return {
      outputs: { volume: { value: quantityAsUnitValue(volume, 'm3'), unit: 'm3' } },
      intermediates: { baseAreaSquareMetres: inputs['base-area'].value, depthMetres: inputs.depth.value, formula: 'volume = base area × depth', steps: [
        `Normalize base area and perpendicular depth: A = ${stepNumber(inputs['base-area'].value)} m²; d = ${stepNumber(inputs.depth.value)} m.`,
        `Multiply: V = A × d = ${stepNumber(inputs['base-area'].value)} × ${stepNumber(inputs.depth.value)} = ${stepNumber(quantityAsUnitValue(volume, 'm3'))} m³.`,
      ] },
      warnings: [],
    };
  },
});
