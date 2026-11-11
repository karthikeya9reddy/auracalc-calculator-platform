import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFormula, evaluateFormula, evaluateFormulaDetailed, sampleFormula } from '../../web/builder-core.mjs';

test('personal formulas respect arithmetic precedence and use named inputs', () => {
  const formula = parseFormula('length * width + 2^3^2');
  assert.deepEqual(formula.variables, ['length', 'width']);
  assert.equal(evaluateFormula(formula.tree, { length: 5, width: 2 }), 522);
  assert.equal(evaluateFormula(parseFormula('-2^2').tree, {}), -4);
  assert.equal(evaluateFormula(parseFormula('2^-2').tree, {}), .25);
});

test('scientific functions produce traceable results without treating legacy input names as constants',()=>{
  const parsed=parseFormula('sqrt(a^2 + b^2)');
  const r=evaluateFormulaDetailed(parsed.tree,{a:3,b:4});assert.equal(r.value,5);assert.equal(r.steps.at(-1).expression,'sqrt(25)');
  assert.equal(evaluateFormula(parseFormula('pi + e').tree,{pi:3,e:2}),5);
  assert.ok(Math.abs(evaluateFormula(parseFormula('sin(pi()/2) + log(100) + ln(e())').tree,{})-4)<1e-12);
  assert.equal(evaluateFormula(parseFormula('max(abs(-7), min(10, 4))').tree,{}),7);
  for(const f of ['sqrt(-1)','ln(0)','tan(pi()/2)','exp(1000)','1e308 * 10'])assert.throws(()=>evaluateFormula(parseFormula(f).tree,{}));
  for(const f of ['sqrt(1,2)','max(2)','pi(3)','constructor(1)','sqrt('.repeat(26)+'1'+')'.repeat(26)])assert.throws(()=>parseFormula(f));
});

test('scenario sampling marks undefined points and enforces bounds',()=>{
  const r=sampleFormula(parseFormula('1/x').tree,{},'x',-1,1,3);assert.equal(r[0].y,-1);assert.equal(r[1].y,null);assert.equal(r[2].y,1);
  assert.throws(()=>sampleFormula(parseFormula('x').tree,{},'x',2,1));
  assert.throws(()=>sampleFormula(parseFormula('x').tree,{},'x',0,1,100000));
  assert.ok(sampleFormula(parseFormula('x').tree,{},'x',-1e308,1e308,3).every(p=>Number.isFinite(p.y)));
});

test('personal formulas reject code execution, division by zero and non-finite outputs', () => {
  for (const value of ['window.alert(1)', 'a;alert(1)', 'Math.random()', '1 +', 'x'.repeat(401)]) assert.throws(() => parseFormula(value));
  assert.throws(() => evaluateFormula(parseFormula('1 / n').tree, { n: 0 }));
  assert.throws(() => evaluateFormula(parseFormula('n^2').tree, { n: Infinity }));
  assert.throws(() => evaluateFormula(parseFormula('0^0').tree, {}));
});
