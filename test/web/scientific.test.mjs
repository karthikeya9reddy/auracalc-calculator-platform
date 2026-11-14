import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateExpression as calc } from '../../web/scientific/core.mjs';
test('scientific calculator respects precedence, signs, constants and explicit percentage semantics', () => {
  assert.equal(calc('2+3*4'), 14); assert.equal(calc('(2+3)*4'), 20);
  assert.equal(calc('2^3^2'),512); assert.equal(calc('-2^2'),-4);
  assert.equal(calc('(10)/100'),.1); assert.equal(calc('1e3/4'),250);
  assert.equal(calc('ans+M', {answer:12,memory:7}),19);
  assert.ok(Math.abs(calc('sin(30)')-.5)<1e-14);
  assert.ok(Math.abs(calc('sin(pi/2)',{degrees:false})-1)<1e-14);
  assert.equal(calc('sqrt(81)+log(100)'),11);
  assert.ok(Math.abs(calc('asin(0.5)')-30)<1e-12);
  assert.equal(calc('factorial(0)'),1); assert.equal(calc('factorial(5)'),120);
  assert.ok(Math.abs(calc('ncr(52,5)')-2598960)<1e-8);
  assert.equal(calc('npr(10,3)'),720); assert.equal(calc('mod(17,5)'),2);
  assert.throws(()=>calc('tan(pi/2)',{degrees:false}));
  for(const expression of ['factorial(171)','factorial(-1)','ncr(5,6)','npr(2,0.5)','mod(1,0)','asin(2)']) assert.throws(()=>calc(expression));
});
test('scientific calculator rejects invalid domains, poles, overflow and code', () => {
  for(const expression of ['1/0','sqrt(-1)','ln(0)','tan(90)','tan(270)','exp(1000)','process.exit()','globalThis','2+','min(2)','x+1']) assert.throws(()=>calc(expression),undefined,expression);
});
