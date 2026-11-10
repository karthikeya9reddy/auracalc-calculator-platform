import test from 'node:test';
import assert from 'node:assert/strict';
import { numberToEnglishWords } from '../../web/number-words.mjs';
import { listPublicCalculators } from '../../catalog/public/index.mjs';
import { executeCalculation } from '../../src/calculation-core/index.mjs';

test('spells common integer calculator results in English', () => {
  assert.equal(numberToEnglishWords(0), 'zero');
  assert.equal(numberToEnglishWords(1020), 'one thousand twenty');
  assert.equal(numberToEnglishWords(1234567), 'one million two hundred thirty-four thousand five hundred sixty-seven');
});

test('the percentage-of-an-amount example spells its actual calculator result', () => {
  const definition = listPublicCalculators().find(item => item.id === 'percentage-of-amount');
  const result = executeCalculation(definition, { 'base-amount': 3000, percentage: 34 });
  assert.ok(Math.abs(result.outputs.amount.value - 1020) < 1e-9);
  assert.equal(numberToEnglishWords(result.outputs.amount.value), 'one thousand twenty');
});

test('spells decimals and negative results to the displayed precision', () => {
  assert.equal(numberToEnglishWords(0.125), 'zero point one two five');
  assert.equal(numberToEnglishWords(-1234), 'minus one thousand two hundred thirty-four');
});

test('marks integers beyond JavaScript exact-integer precision as approximate', () => {
  assert.match(numberToEnglishWords(Number.MAX_SAFE_INTEGER + 1), /^approximately /);
});

test('returns no word rendering for non-finite or unsupported magnitudes', () => {
  assert.equal(numberToEnglishWords(Number.NaN), null);
  assert.equal(numberToEnglishWords(1e72), null);
});
