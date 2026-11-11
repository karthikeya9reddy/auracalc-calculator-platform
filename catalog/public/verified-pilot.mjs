import { D, L2, POWER, equation, positive, qin, qout, sin, sout, stepNumber } from './equation-definition.mjs';
import { divideDimensions } from '../../src/calculation-core/index.mjs';
const physics = 'Physics, astronomy, astrophysics, and cosmology';

export const verifiedPilot = [equation({
  id: 'net-radiative-heat-transfer', title: 'Net radiative heat transfer', discipline: 'Thermal physics',
  fields: [physics, 'Mechanical engineering', 'Energy systems and utilities'], category: 'Heat transfer',
  description: 'Estimate outward radiative power from a gray surface to large uniform surroundings.',
  keywords: ['radiation', 'Stefan Boltzmann', 'emissivity', 'heat loss', 'radiative cooling'],
  formula: 'Outward power = ε σ A (T_surface⁴ − T_surroundings⁴), with σ ≈ 5.67 × 10⁻⁸ W/(m² K⁴).',
  citation: 'OpenStax, University Physics Volume 2, section 1.6, Stefan–Boltzmann relation. This tool uses the outward-positive sign convention and the textbook rounded constant.',
  sourceUrl: 'https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer',
  assumptions: ['Uniform surface temperature and gray emissivity; large isothermal surroundings completely enclose the surface.', 'Absolute temperatures are normalized to kelvin. Positive power means net heat leaving the surface.'],
  exclusions: ['Not a furnace, insulation, fire-safety, or thermal equipment design assessment.'],
  limitations: ['No convection, conduction, spectral emissivity or finite-surface view factors. The constant is rounded to three significant figures.'],
  warnings: ['Educational steady-state radiation model; actual heat transfer includes other mechanisms.'],
  verificationCases: ['1 m², emissivity 1, surface 100 K, surroundings 0 K gives 5.67 W; equal temperatures give zero.'],
  visualization: {kind:'thermal', title:'Surface and surrounding temperatures', description:'The result is net radiative power; the schematic is not a thermal simulation.'},
  inputs: [qin('area','Radiating surface area',L2,'m2',['m2','ft2']), sin('emissivity','Surface emissivity','fraction',{max:1}), qin('surface','Surface temperature',D.temperature,'K',['K','degC','degF'],{max:1e6}), qin('surroundings','Surroundings temperature',D.temperature,'K',['K','degC','degF'],{max:1e6})],
  outputs:[qout('power','Net outward radiative power',POWER,'W',['W','kW'])],
  solve(v) {
    // Factoring the fourth-power difference avoids subtraction of nearly equal fourth powers.
    const difference=(v.surface-v.surroundings)*(v.surface+v.surroundings)*(v.surface*v.surface+v.surroundings*v.surroundings);
    const power=5.67e-8*v.emissivity*v.area*difference;
    return {outputs:{power:[power,'W']}, steps:[`Use absolute temperatures ${stepNumber(v.surface)} K and ${stepNumber(v.surroundings)} K.`, `Fourth-power difference = ${stepNumber(difference)} K⁴.`, `Multiply by emissivity ${stepNumber(v.emissivity)}, area ${stepNumber(v.area)} m² and σ ≈ 5.67 × 10⁻⁸: ${stepNumber(power)} W outward.`]};
  },
}), equation({
  id:'sound-intensity-level', title:'Sound intensity level', discipline:'Acoustics', fields:[physics,'Education, assessment, and learning'], category:'Waves and signals',
  description:'Express a positive acoustic intensity in decibels relative to 10⁻¹² W/m².',
  keywords:['sound intensity', 'decibel', 'acoustics', 'logarithmic level'],
  formula:'β = 10 log₁₀(I / I₀), where I₀ = 10⁻¹² W/m².',
  citation:'OpenStax, University Physics Volume 1, section 17.3, equation 17.12 and the sound-intensity reference value.',
  sourceUrl:'https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity',
  assumptions:['The input is a time-averaged sound intensity in power per area.'], exclusions:['Not sound pressure level, dBA, a noise dose or a hearing-safety assessment.'],
  limitations:['Zero intensity has no finite decibel level. Negative levels are valid for intensities below the reference.'],
  verificationCases:['10⁻¹² W/m² gives 0 dB; 10⁻⁴ W/m² gives 80 dB; doubling intensity increases level by approximately 3.0103 dB.'],
  inputs:[qin('intensity','Sound intensity',divideDimensions(POWER,L2),'W/m2',['W/m2','kW/m2'])],
  outputs:[Object.freeze({...sout('level','Sound intensity level (dB re 10⁻¹² W/m²)'),semanticType:'sound-intensity-level'})],
  solve(v) {
    positive(v.intensity,'intensity','Sound intensity');
    const level=10*(Math.log10(v.intensity)+12);
    return {outputs:{level:[level,'1']},steps:[`Use I = ${stepNumber(v.intensity)} W/m² and I₀ = 10⁻¹² W/m².`, `Evaluate 10 × (log₁₀(I) + 12) = ${stepNumber(level)} dB. Logarithms are evaluated separately to avoid ratio overflow.`]};
  },
})];
