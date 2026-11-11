import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogTopics } from '../../web/catalog-topics.mjs';

test('featured topics stay compact and keep an extra selected topic visible', () => {
  const calculators = ['Geometry', 'Motion', 'Rare', 'Z', 'A', 'B', 'C', 'D', 'E'].map(category => ({ category }));
  const result = catalogTopics(calculators, 'Rare');
  assert.equal(result.all.length, 9);
  assert.ok(result.featured.includes('Geometry'));
  assert.ok(result.featured.includes('Rare'));
  assert.ok(result.featured.length <= 8);
  assert.deepEqual(result.all, [...result.all].sort((a, b) => a.localeCompare(b)));
});

test('topic counts omit missing categories and update with the catalog', () => {
  const result = catalogTopics([{ category: 'Motion' }, { category: 'Motion' }, { category: 'Energy' }, {}]);
  assert.equal(result.counts.get('Motion'), 2);
  assert.deepEqual(result.all, ['Energy', 'Motion']);
});
