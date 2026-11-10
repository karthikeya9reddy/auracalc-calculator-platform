import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicRegistry } from '../../catalog/public/index.mjs';

const run = (id, inputs) => executeCalculation(publicRegistry.get(id), inputs);
const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);

test('geometry additions match sourced reference cases and dimensional unit conversions', () => {
  assert.equal(run('right-triangle-hypotenuse', { 'leg-a': { value: 3, unit: 'm' }, 'leg-b': { value: 4, unit: 'm' } }).outputs.hypotenuse.value, 5);
  close(run('sphere-volume', { radius: { value: 1, unit: 'm' } }).outputs.volume.value, 4 * Math.PI / 3);
  close(run('cylinder-volume', { radius: { value: 1, unit: 'm' }, height: { value: 2, unit: 'm' } }).outputs.volume.value, 2 * Math.PI);
  close(run('cone-volume', { radius: { value: 1, unit: 'm' }, height: { value: 3, unit: 'm' } }).outputs.volume.value, Math.PI);
  assert.throws(() => run('cylinder-volume', { radius: { value: 0, unit: 'm' }, height: { value: 2, unit: 'm' } }), { code: 'POSITIVE_VALUE_REQUIRED' });
});

test('projectile model converts degrees before solving and covers angle boundaries', () => {
  const result = run('projectile-motion-level-ground', {
    'launch-speed': { value: 20, unit: 'm/s' }, 'launch-angle': { value: 45, unit: 'deg' }, gravity: { value: 9.80665, unit: 'm/s2' },
  });
  close(result.outputs.range.value, 20 ** 2 / 9.80665);
  close(result.outputs['flight-time'].value, 2 * 20 * Math.sin(Math.PI / 4) / 9.80665);
  close(result.outputs['peak-height'].value, 20 ** 2 / 4 / 9.80665);
  assert.equal(run('projectile-motion-level-ground', {
    'launch-speed': { value: 20, unit: 'm/s' }, 'launch-angle': { value: 0, unit: 'rad' }, gravity: { value: 9.80665, unit: 'm/s2' },
  }).outputs['flight-time'].value, 0);
  assert.throws(() => run('projectile-motion-level-ground', {
    'launch-speed': { value: 20, unit: 'm/s' }, 'launch-angle': { value: 91, unit: 'deg' }, gravity: { value: 9.80665, unit: 'm/s2' },
  }), { code: 'INPUT_ABOVE_MAXIMUM' });
});

test('wave, period, photon, and electrical-energy methods use expected SI outputs', () => {
  assert.equal(run('wave-speed-frequency-wavelength', { frequency: { value: 2, unit: 'Hz' }, wavelength: { value: 3, unit: 'm' } }).outputs['wave-speed'].value, 6);
  assert.equal(run('period-from-frequency', { frequency: { value: 50, unit: 'Hz' } }).outputs.period.value, 0.02);
  close(run('photon-energy-from-frequency', { frequency: { value: 1, unit: 'Hz' } }).outputs.energy.value, 6.62607015e-34, 1e-14);
  assert.equal(run('electrical-energy-power-time', { power: { value: 100, unit: 'W' }, duration: { value: 2, unit: 'h' } }).outputs.energy.value / 3_600_000, 0.2);
  assert.throws(() => run('period-from-frequency', { frequency: { value: 0, unit: 'Hz' } }), { code: 'POSITIVE_VALUE_REQUIRED' });
});

test('mechanical and chemistry reference cases are traceable and reject invalid counts', () => {
  assert.equal(run('rotational-power-from-torque-speed', { torque: { value: 10, unit: 'Nm' }, 'angular-speed': { value: 2, unit: 'rad/s' } }).outputs.power.value, 20);
  close(run('ideal-lever-mechanical-advantage', { 'effort-arm': { value: 0.6, unit: 'm' }, 'load-arm': { value: 0.2, unit: 'm' } }).outputs['ideal-mechanical-advantage'].value, 3);
  assert.equal(run('gear-pair-output-speed', { 'input-speed': { value: 1200, unit: 'rpm' }, 'driver-teeth': 20, 'driven-teeth': 60 }).outputs['output-speed'].value, 400);
  assert.equal(run('thermal-efficiency-ratio', { 'useful-output-energy': { value: 750, unit: 'J' }, 'energy-input': { value: 1000, unit: 'J' } }).outputs.efficiency.value, 0.75);
  assert.equal(run('chemistry-percent-yield', { 'actual-yield': { value: 7.73, unit: 'g' }, 'theoretical-yield': { value: 10, unit: 'g' } }).outputs['percent-yield'].value, 0.773);
  assert.throws(() => run('gear-pair-output-speed', { 'input-speed': { value: 1200, unit: 'rpm' }, 'driver-teeth': 20.5, 'driven-teeth': 60 }), { code: 'WHOLE_NUMBER_REQUIRED' });
});

test('ideal-gas density uses absolute pressure, kelvin normalization, and consistent dimensions', () => {
  const result = run('ideal-gas-density', {
    'molar-mass': { value: 0.02897, unit: 'kg/mol' },
    'absolute-pressure': { value: 101.325, unit: 'kPa' },
    'absolute-temperature': { value: 0, unit: 'degC' },
  });
  close(result.outputs.density.value, 101325 * 0.02897 / (8.31446261815324 * 273.15), 1e-10);
  assert.throws(() => run('ideal-gas-density', {
    'molar-mass': { value: 0.02897, unit: 'kg/mol' },
    'absolute-pressure': { value: 101325, unit: 'Pa' },
    'absolute-temperature': { value: -274, unit: 'degC' },
  }), { code: 'INPUT_BELOW_ABSOLUTE_ZERO' });
});

test('new engineering and geometry definitions carry accessible visual metadata', () => {
  for (const id of [
    'right-triangle-hypotenuse', 'sphere-volume', 'cylinder-volume', 'cone-volume',
    'projectile-motion-level-ground', 'wave-speed-frequency-wavelength', 'period-from-frequency',
    'photon-energy-from-frequency', 'electrical-energy-power-time', 'rotational-power-from-torque-speed',
    'ideal-lever-mechanical-advantage', 'gear-pair-output-speed', 'thermal-efficiency-ratio',
    'chemistry-percent-yield', 'ideal-gas-density',
  ]) {
    const definition = publicRegistry.get(id);
    assert.ok(definition.visualization.title, id);
    assert.ok(definition.visualization.description, id);
  }
});
