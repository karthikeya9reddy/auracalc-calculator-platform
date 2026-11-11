import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFormula, evaluateFormula } from '../../web/builder-core.mjs';

test('personal formulas respect arithmetic precedence and use named inputs', () => {
  const formula = parseFormula('length * width + 2^3^2');
  assert.deepEqual(formula.variables, ['length', 'width']);
  assert.equal(evaluateFormula(formula.tree, { length: 5, width: 2 }), 522);
  assert.equal(evaluateFormula(parseFormula('-2^2').tree, {}), -4);
  assert.equal(evaluateFormula(parseFormula('2^-2').tree, {}), .25);
});

test('personal formulas reject code execution, division by zero and non-finite outputs', () => {
  for (const value of ['window.alert(1)', 'a;alert(1)', 'Math.random()', '1 +', 'x'.repeat(401)]) assert.throws(() => parseFormula(value));
  assert.throws(() => evaluateFormula(parseFormula('1 / n').tree, { n: 0 }));
  assert.throws(() => evaluateFormula(parseFormula('n^2').tree, { n: Infinity }));
  assert.throws(() => evaluateFormula(parseFormula('0^0').tree, {}));
});
