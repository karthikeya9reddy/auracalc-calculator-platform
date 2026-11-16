import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSearchIndex, searchIndex, matchesSearchText } from '../../web/unified-search.mjs';
import { listPublicConverters } from '../../catalog/public/index.mjs';
import { listPublicCalculators } from '../../catalog/public/index.mjs';

test('unified search finds converter pages using everyday terms and abbreviations', () => {
  const index = makeSearchIndex(listPublicConverters());
  assert.ok(searchIndex(index, 'meters to kilometers converter').some(item => item.id === 'convert-meters-to-kilometers'));
  assert.ok(searchIndex(index, 'm to km').some(item => item.id === 'convert-meters-to-kilometers'));
  assert.deepEqual(searchIndex(index, 'converter'), []);
  assert.ok(searchIndex(index, 'kilometres to metres').some(item => item.id === 'convert-kilometers-to-meters'));
  assert.equal(matchesSearchText('Civil engineering and construction', 'construction civil'), true);
});

test('food energy search finds the calculator that asks for label information', () => {
  const index = makeSearchIndex(listPublicCalculators());
  assert.ok(searchIndex(index, 'grams to calories').some(item => item.id === 'food-energy-from-label'));
});

test('search understands natural intent, bounded typos, quantities and strict short unit tokens', () => {
  const calculators = makeSearchIndex(listPublicCalculators()), converters = makeSearchIndex(listPublicConverters());
  assert.equal(searchIndex(calculators,'force over area')[0].id,'pressure-from-force-area');
  assert.equal(searchIndex(calculators,'how much electricity does my computer use')[0].id,'electrical-energy-power-time');
  assert.ok(searchIndex(calculators,'rectangel area').some(x=>x.id==='rectangle-area'));
  assert.ok(searchIndex(converters,'500 N to lbf').some(x=>x.id==='convert-newtons-to-pounds-force'));
  assert.ok(searchIndex(converters,'kg to lbs').some(x=>x.id==='convert-kilograms-to-pounds'));
  assert.equal(matchesSearchText('kilometer','m'),false);
  assert.equal(matchesSearchText('capital','calorie'),false);
});
