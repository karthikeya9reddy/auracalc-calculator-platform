import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { AREA, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

const LENGTH = BASE_DIMENSIONS.length;
export const circleAreaCircumference = Object.freeze({
  id: 'circle-area-circumference', version: '1.0.0', title: 'Circle area and circumference',
  discipline: 'Mathematics, physics, and design basics',
  fields: Object.freeze(['Mathematics and arithmetic', 'Education, assessment, and learning', 'Civil engineering', 'Construction estimating and quantity surveying', 'Architecture and building design', 'Physics, astronomy, astrophysics, and cosmology']),
  category: 'Geometry', description: 'Calculate a circle’s area and circumference from its radius.',
  keywords: Object.freeze(['circle radius', 'pi', 'round area', 'circumference']),
  purpose: 'Calculate standard circle measures for learning and basic layout estimates.', intendedAudience: ['Learners', 'Early estimates'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Circumference C = 2πr. Area A = πr².' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The shape is an exact circle and the entered value is its radius.']),
  exclusions: Object.freeze(['Does not assess structural capacity, irregular boundaries, construction tolerances, or material waste.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['A measured or built circle may not be geometrically exact.']),
  references: Object.freeze([reference('openstax-geometry-formulas', 'OpenStax, Prealgebra 1e, §12.3 Geometric Formulas; circumference C = 2πr and area A = πr².', 'https://math.libretexts.org/Bookshelves/PreAlgebra/Prealgebra_1e_%28OpenStax%29/12%3A_Appendix/12.03%3A_Geometric_Formulas')]),
  verificationCases: Object.freeze(['Radius 1 m gives circumference 2π m and area π m²; doubling radius doubles circumference and quadruples area; zero radius is rejected.']),
  release: r0Release('circle-area-openstax-cases-v1'),
  inputs: Object.freeze([physicalInput('radius', 'Radius', LENGTH, 'm', ['m', 'cm', 'mm', 'ft', 'in'], { min: 0, allowMagnitudeWords: true })]),
  outputs: Object.freeze([
    physicalOutput('circumference', 'Circumference', LENGTH, 'm', ['m', 'cm', 'ft', 'in']),
    physicalOutput('area', 'Area', AREA, 'm2', ['m2', 'ft2']),
  ]),
  calculate(inputs) {
    const radius = inputs.radius.value;
    if (radius <= 0) throw new CalculationError('POSITIVE_RADIUS_REQUIRED', 'Radius must be greater than zero.', { fieldId: 'radius' });
    const circumference = 2 * Math.PI * radius;
    const squared = radius ** 2;
    const area = Math.PI * squared;
    return { outputs: {
      circumference: { value: circumference, unit: 'm' },
      area: { value: area, unit: 'm2' },
    }, intermediates: { formula: 'C = 2πr; A = πr²', steps: [
      `Normalize the radius: r = ${stepNumber(radius)} m; r² = ${stepNumber(squared)} m².`,
      `Circumference: C = 2πr = 2 × π × ${stepNumber(radius)} = ${stepNumber(circumference)} m.`,
      `Area: A = πr² = π × ${stepNumber(squared)} = ${stepNumber(area)} m².`,
    ] }, warnings: [] };
  },
});
