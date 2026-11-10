import { CalculationError } from '../../src/calculation-core/index.mjs';
import { reference, r0Release, scalarInput, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const batteryRuntime = Object.freeze({
  id: 'battery-runtime', version: '1.0.0', title: 'Ideal battery runtime estimate',
  discipline: 'Hardware, electronics, and energy basics',
  fields: Object.freeze(['Electronics and embedded hardware', 'Energy systems and utilities', 'Renewable energy and energy storage', 'Education, assessment, and learning']),
  category: 'Energy estimates', description: 'Estimate runtime from usable battery energy and a constant average load.',
  keywords: Object.freeze(['battery hours', 'watt hours', 'power draw', 'runtime']),
  purpose: 'Calculate an ideal energy-over-power runtime estimate for learning or rough comparison.', intendedAudience: ['Learners', 'General users'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Ideal runtime in hours = usable battery energy in watt-hours ÷ average load in watts.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Battery energy is usable energy at the system output.', 'The load is constant at the entered average power.']),
  exclusions: Object.freeze(['Does not model voltage, current, discharge curves, inverter or conversion losses, cutoff limits, temperature, aging, or peak loads.']),
  warnings: Object.freeze(['Actual runtime is often shorter; do not use this estimate for life-safety, medical, or critical-power planning.']), limitations: Object.freeze(['Nameplate capacity may differ from usable energy at the output.']),
  references: Object.freeze([reference('nist-watt-unit', 'NIST, SI Units—Watt (W), a unit of power equal to one joule per second; Wh is energy (power × time).', 'https://www.nist.gov/glossary-term/34606')]),
  verificationCases: Object.freeze(['100 Wh usable energy at 20 W gives 5 h; doubling load halves ideal runtime; zero load is rejected.']),
  release: r0Release('battery-runtime-nist-cases-v1'),
  inputs: Object.freeze([
    scalarInput('usable-energy', 'Usable battery energy', 'watt-hours (Wh)', { min: 0, allowMagnitudeWords: true }),
    scalarInput('average-load', 'Average load', 'watts (W)', { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([
    scalarOutput('runtime-hours', 'Ideal runtime (hours)'),
    scalarOutput('runtime-minutes', 'Ideal runtime (minutes)'),
  ]),
  calculate(inputs) {
    const energy = inputs['usable-energy'].value;
    const load = inputs['average-load'].value;
    if (energy <= 0) throw new CalculationError('POSITIVE_ENERGY_REQUIRED', 'Usable battery energy must be greater than zero.', { fieldId: 'usable-energy' });
    if (load <= 0) throw new CalculationError('POSITIVE_LOAD_REQUIRED', 'Average load must be greater than zero.', { fieldId: 'average-load' });
    const hours = energy / load;
    const minutes = hours * 60;
    return { outputs: {
      'runtime-hours': { value: hours, unit: '1' },
      'runtime-minutes': { value: minutes, unit: '1' },
    }, intermediates: { formula: 'runtime = energy / power', steps: [
      `Normalize values: usable energy E = ${stepNumber(energy)} Wh; average load P = ${stepNumber(load)} W.`,
      `Divide energy by power: t = E/P = ${stepNumber(energy)}/${stepNumber(load)} = ${stepNumber(hours)} Wh/W.`,
      `Because Wh/W = hours, ideal runtime is ${stepNumber(hours)} h = ${stepNumber(minutes)} min.`,
    ] }, warnings: [] };
  },
});
