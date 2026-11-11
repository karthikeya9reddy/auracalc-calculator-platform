import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicDefinitions } from '../../catalog/public/index.mjs';

function representativeValue(field) {
  const minimum = field.range?.min ?? Number.NEGATIVE_INFINITY;
  const maximum = field.range?.max ?? Number.POSITIVE_INFINITY;
  let value = Math.min(Math.max(1, minimum), maximum);
  if (field.integer) {
    value = Math.ceil(value);
    if (value > maximum) value = Math.floor(maximum);
  }
  return value;
}

const auditOverrides = Object.freeze({
  'break-even-analysis': { 'selling-price': 2, 'variable-cost': 1 },
  'model-weight-memory': { 'bits-per-parameter': 4 },
  'led-series-resistor': { 'supply-voltage': 5, 'led-voltage': 2 },
  'annular-cross-section-area': { 'outer-diameter': 2, 'inner-diameter': 1 },
});

function makeInputs(definition, omittedInput = null) {
  const overrides = auditOverrides[definition.id] || {};
  return Object.fromEntries(definition.inputs
    .filter(field => field.id !== omittedInput)
    .map(field => {
      const value = overrides[field.id] ?? representativeValue(field);
      return [field.id, field.unitLabel ? value : { value, unit: field.canonicalUnit }];
    }));
}

test('every published formula calculator returns finite, unit-bearing results for representative inputs', () => {
  const failures = [];
  for (const definition of publicDefinitions) {
    const optionalInputs = definition.inputs.filter(field => field.required === false);
    const patterns = optionalInputs.length ? optionalInputs.map(field => field.id) : [null];
    for (const omittedInput of patterns) {
      try {
        const result = executeCalculation(definition, makeInputs(definition, omittedInput));
        assert.ok(Object.keys(result.outputs).length > 0, 'no outputs');
        for (const [outputId, output] of Object.entries(result.outputs)) {
          assert.ok(Number.isFinite(output.value), `${outputId} is not finite`);
          assert.ok(definition.outputs.some(field => field.id === outputId), `${outputId} is not declared`);
          assert.ok(output.unit, `${outputId} has no result unit`);
        }
      } catch (error) {
        failures.push(`${definition.id}${omittedInput ? ` (without ${omittedInput})` : ''}: ${error.message}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});
