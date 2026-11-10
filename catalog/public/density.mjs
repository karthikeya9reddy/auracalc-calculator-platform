import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { DENSITY, VOLUME, physicalInput, physicalOutput, reference, r0Release, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const density = Object.freeze({
  id: 'density', version: '1.0.0', title: 'Density from mass and volume',
  discipline: 'Physics, chemistry, and materials fundamentals',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Chemistry', 'Materials science and metallurgy', 'Education, assessment, and learning']),
  category: 'Material properties', description: 'Calculate average density from a sample’s mass and volume.',
  keywords: Object.freeze(['mass density', 'kg per cubic metre', 'specific gravity', 'sample volume']),
  purpose: 'Find average density for a learning exercise or a measured sample.', intendedAudience: ['Learners', 'General laboratory arithmetic'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Average density ρ = mass ÷ volume.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Mass and volume describe the same sample.', 'The reported density is the sample’s average density.']),
  exclusions: Object.freeze(['Does not identify a material or correct for porosity, moisture, temperature, or measurement uncertainty.']),
  warnings: Object.freeze([]), limitations: Object.freeze(['Do not use a sample average as a specification or design value without a suitable measurement method and review.']),
  references: Object.freeze([reference('openstax-fluid-density', 'OpenStax, University Physics Volume 1, §14.1, density is mass per unit volume.', 'https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure')]),
  verificationCases: Object.freeze(['1 kg in 1 L gives 1000 kg/m³ or 1 g/cm³; doubling mass at fixed volume doubles density; zero volume is rejected.']),
  release: r0Release('density-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('mass', 'Sample mass', BASE_DIMENSIONS.mass, 'kg', ['kg', 'g', 'lbm'], { min: 0, allowMagnitudeWords: true }),
    physicalInput('volume', 'Sample volume', VOLUME, 'm3', ['m3', 'L', 'mL', 'cm3'], { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([physicalOutput('density', 'Average density', DENSITY, 'kg/m3', ['kg/m3', 'g/cm3', 'g/mL', 'tonne/m3'])]),
  calculate(inputs) {
    const mass = inputs.mass.value;
    const volume = inputs.volume.value;
    if (mass <= 0) throw new CalculationError('POSITIVE_MASS_REQUIRED', 'Sample mass must be greater than zero.', { fieldId: 'mass' });
    if (volume <= 0) throw new CalculationError('POSITIVE_VOLUME_REQUIRED', 'Sample volume must be greater than zero.', { fieldId: 'volume' });
    const value = mass / volume;
    return { outputs: { density: { value, unit: 'kg/m3' } }, intermediates: { formula: 'ρ = m / V', steps: [
      `Normalize mass and volume: m = ${stepNumber(mass)} kg; V = ${stepNumber(volume)} m³.`,
      `Divide mass by volume: ρ = m / V = ${stepNumber(mass)} / ${stepNumber(volume)} = ${stepNumber(value)} kg/m³.`,
      `Equivalent display: ${stepNumber(value / 1000)} g/cm³ (the selected output unit can be changed).`,
    ] }, warnings: [] };
  },
});
