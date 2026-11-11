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
