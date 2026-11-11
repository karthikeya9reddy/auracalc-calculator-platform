import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicRegistry } from '../../catalog/public/index.mjs';

test('food energy scales an FDA label example by portion size', () => {
  const tool = publicRegistry.get('food-energy-from-label');
  const result = executeCalculation(tool, { 'portion-mass': { value: 110, unit: 'g' }, 'serving-mass': { value: 55, unit: 'g' }, 'serving-energy': { value: 230, unit: 'kcal' } });
  assert.equal(result.outputs.energy.value, 460);
  assert.equal(result.outputs.energy.unit, 'kcal');
  const converted = executeCalculation(tool, { 'portion-mass': { value: .11, unit: 'kg' }, 'serving-mass': { value: 55, unit: 'g' }, 'serving-energy': { value: 230, unit: 'kcal' } });
  assert.equal(converted.outputs.energy.value, 460);
  assert.throws(() => executeCalculation(tool, { 'portion-mass': { value: 110, unit: 'g' }, 'serving-mass': { value: 0, unit: 'g' }, 'serving-energy': { value: 230, unit: 'kcal' } }), { code: 'POSITIVE_VALUE_REQUIRED' });
});
