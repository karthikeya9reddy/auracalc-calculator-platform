import { CalculationError, BASE_DIMENSIONS } from '../../src/calculation-core/index.mjs';
import { physicalInput, physicalOutput, reference, r0Release, RESISTANCE, sciencePrecision, scienceRounding, stepNumber, VOLTAGE } from './science-helpers.mjs';

export const ohmsLaw = Object.freeze({
  id: 'ohms-law', version: '1.0.1', title: 'Ohm’s law: solve one missing value',
  discipline: 'Electrical fundamentals and electronics',
  fields: Object.freeze(['Physics, astronomy, astrophysics, and cosmology', 'Education, assessment, and learning', 'Electrical engineering and power systems', 'Electronics and embedded hardware']),
  category: 'Electrical basics', description: 'Enter exactly two values to solve the third in a simple resistive DC circuit.',
  keywords: Object.freeze(['voltage current resistance', 'V=IR', 'ohms', 'circuit basics']),
  purpose: 'Use Ohm’s law in a classroom example for an ideal ohmic component.', intendedAudience: ['Learners', 'Electronics hobbyists'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Ohm’s law V = I × R; supply any two of voltage, current, and resistance to calculate the third.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['The component is treated as an ideal, ohmic resistor under fixed conditions.', 'Voltage and current are entered as non-negative magnitudes; resistance is positive.']),
  exclusions: Object.freeze(['Not for mains electricity, power systems, wiring, protection, component ratings, temperature-dependent devices, or safety decisions.']),
  warnings: Object.freeze(['Educational low-voltage circuit arithmetic only.']), limitations: Object.freeze(['Many real components are nonlinear or change with temperature and operating point.']),
  references: Object.freeze([reference('openstax-ohms-law', 'OpenStax, University Physics Volume 2, §9.3, Ohm’s law V = IR for an ohmic material.', 'https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance')]),
  verificationCases: Object.freeze(['12 V and 3 Ω give 4 A; 2 A and 3 Ω give 6 V; 12 V and 4 A give 3 Ω; one or three supplied values are rejected.']),
  release: r0Release('ohms-law-openstax-cases-v1'),
  inputs: Object.freeze([
    physicalInput('voltage', 'Voltage', VOLTAGE, 'V', ['V', 'mV', 'kV'], { required: false, min: 0 }),
    physicalInput('current', 'Current', BASE_DIMENSIONS.electricCurrent, 'A', ['A', 'mA'], { required: false, min: 0 }),
    physicalInput('resistance', 'Resistance', RESISTANCE, 'ohm', ['ohm', 'kohm', 'Mohm'], { required: false, min: 0 }),
  ]),
  outputs: Object.freeze([
    physicalOutput('voltage', 'Voltage', VOLTAGE, 'V', ['V', 'mV', 'kV']),
    physicalOutput('current', 'Current', BASE_DIMENSIONS.electricCurrent, 'A', ['A', 'mA']),
    physicalOutput('resistance', 'Resistance', RESISTANCE, 'ohm', ['ohm', 'kohm', 'Mohm']),
  ]),
  calculate(inputs) {
    const known = ['voltage', 'current', 'resistance'].filter(key => inputs[key] !== undefined);
    if (known.length !== 2) throw new CalculationError('OHMS_LAW_REQUIRES_TWO_VALUES', 'Enter exactly two of voltage, current, and resistance.', { inputCount: known.length });
    const missing = ['voltage', 'current', 'resistance'].find(key => !known.includes(key));
    const fieldLabels = { voltage: 'voltage', current: 'current', resistance: 'resistance' };
    let voltage = inputs.voltage?.value;
    let current = inputs.current?.value;
    let resistance = inputs.resistance?.value;
    if (resistance !== undefined && resistance <= 0) throw new CalculationError('POSITIVE_RESISTANCE_REQUIRED', 'Resistance must be greater than zero.', { fieldId: 'resistance' });
    if (voltage !== undefined && current !== undefined) {
      if (current === 0) throw new CalculationError('ZERO_CURRENT_CANNOT_SOLVE_RESISTANCE', 'Current must be greater than zero to solve resistance from voltage and current.', { fieldId: 'current' });
      resistance = voltage / current;
      if (resistance <= 0) throw new CalculationError('POSITIVE_RESISTANCE_REQUIRED', 'These values imply zero resistance, outside this positive-resistance model.', { fieldId: 'voltage' });
    } else if (voltage !== undefined && resistance !== undefined) {
      current = voltage / resistance;
    } else {
      voltage = current * resistance;
    }
    return { outputs: {
      voltage: { value: voltage, unit: 'V' },
      current: { value: current, unit: 'A' },
      resistance: { value: resistance, unit: 'ohm' },
    }, intermediates: { formula: 'V = IR', steps: [
      `Use the supplied values for ${known.map(key => fieldLabels[key]).join(' and ')}: V = ${stepNumber(voltage)} V; I = ${stepNumber(current)} A; R = ${stepNumber(resistance)} Ω.`,
      `Rearrange V = IR to solve for ${missing}: substitute the known values to obtain ${missing === 'voltage' ? `V = I × R = ${stepNumber(current)} × ${stepNumber(resistance)}` : missing === 'current' ? `I = V / R = ${stepNumber(voltage)} / ${stepNumber(resistance)}` : `R = V / I = ${stepNumber(voltage)} / ${stepNumber(current)}`}.`,
      `Check: I × R = ${stepNumber(current)} × ${stepNumber(resistance)} = ${stepNumber(current * resistance)} V, which matches V = ${stepNumber(voltage)} V.`,
    ] }, warnings: [] };
  },
});
