import { D, ENERGY, equation, positive, qin, qout, stepNumber } from './equation-definition.mjs';

export const foodEnergyFromLabel = equation({
  id: 'food-energy-from-label',
  title: 'Food calories from a nutrition label',
  discipline: 'Everyday food and nutrition',
  fields: ['Everyday conversions, cooking, and household projects', 'Education, assessment, and learning'],
  category: 'Food and cooking',
  description: 'Estimate the food Calories in a portion using the serving mass and calories shown on its nutrition label.',
  keywords: ['grams to calories', 'grams to kcal', 'food calories', 'nutrition label', 'serving size', 'calories per 100 grams', 'food energy'],
  formula: 'Food energy = portion mass ÷ label serving mass × label Calories per serving.',
  citation: 'U.S. Food and Drug Administration, Serving Size on the Nutrition Facts Label: calories on the label are based on the stated serving; multiply by the number of servings eaten.',
  sourceUrl: 'https://www.fda.gov/food/nutrition-facts-label/serving-size-nutrition-facts-label',
  assumptions: ['The portion is the same food as the label and has the same composition.', 'The label Calories are food Calories, equivalent to kilocalories (kcal).'],
  exclusions: ['Does not determine individual dietary needs, treatment, or the energy content of an unknown food.'],
  limitations: ['Label values can be rounded and food composition varies. Mass alone cannot determine calories; the product-specific label value is required.'],
  warnings: ['This is an estimate from the values entered, not personalized nutrition advice.'],
  verificationCases: ['FDA example: a 55 g serving has 230 kcal, so 110 g has 460 kcal.'],
  visualization: { kind: 'balance', title: 'Portion compared with a label serving', description: 'The food energy is scaled by the ratio of your portion mass to the label serving mass.' },
  inputs: [
    qin('portion-mass', 'Mass of your portion', D.mass, 'g', ['g', 'kg', 'oz', 'lbm']),
    qin('serving-mass', 'Serving mass on the label', D.mass, 'g', ['g', 'kg', 'oz', 'lbm']),
    qin('serving-energy', 'Calories per label serving', ENERGY, 'kcal', ['kcal', 'kJ', 'J']),
  ],
  outputs: [qout('energy', 'Estimated food energy', ENERGY, 'kcal', ['kcal', 'kJ', 'J'])],
  solve(v) {
    positive(v['serving-mass'], 'serving-mass', 'Serving mass');
    const servings = v['portion-mass'] / v['serving-mass'];
    const energy = servings * v['serving-energy'];
    return { outputs: { energy: [energy, 'kcal'] }, steps: [`Divide your portion by the label serving: ${stepNumber(v['portion-mass'])} g ÷ ${stepNumber(v['serving-mass'])} g = ${stepNumber(servings)} servings.`, `Multiply by label energy: ${stepNumber(servings)} × ${stepNumber(v['serving-energy'])} kcal = ${stepNumber(energy)} kcal.`] };
  },
});
