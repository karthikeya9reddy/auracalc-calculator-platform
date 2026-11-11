import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation, convertValue } from '../../src/calculation-core/index.mjs';
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
    .map(field => {
      // Match the browser's payload, including blank optional quantity objects.
      const value = field.id === omittedInput ? '' : overrides[field.id] ?? representativeValue(field);
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

test('all accepted input units preserve representative formula answers', () => {
  const failures=[];
  for(const definition of publicDefinitions){
    const omitted=definition.inputs.find(field=>field.required===false)?.id ?? null;
    const inputs=makeInputs(definition,omitted);
    const baseline=executeCalculation(definition,inputs);
    for(const field of definition.inputs){
      if(field.id===omitted)continue;
      const canonical=typeof inputs[field.id]==='object'?inputs[field.id].value:inputs[field.id];
      for(const unit of field.acceptedUnits){
        if(unit===field.canonicalUnit)continue;
        try{
          const converted=convertValue(canonical,field.canonicalUnit,unit);
          const actual=executeCalculation(definition,{...inputs,[field.id]:{value:converted,unit}});
          for(const [id,expected]of Object.entries(baseline.outputs)){
            assert.ok(Math.abs(actual.outputs[id].value-expected.value)<=1e-9*Math.max(1,Math.abs(expected.value)),`${id}: ${actual.outputs[id].value} vs ${expected.value}`);
          }
        }catch(error){failures.push(`${definition.id}/${field.id}/${unit}: ${error.message}`);}
      }
    }
  }
  assert.deepEqual(failures,[]);
});
