import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogTopics, topicsForTool } from '../../web/catalog-topics.mjs';
import { listPublicCalculators } from '../../catalog/public/index.mjs';

test('every live calculator is browsable and displayed topic totals match the actual filter', () => {
  const tools = listPublicCalculators();
  const topics = catalogTopics(tools);
  for (const tool of tools) assert.ok(topicsForTool(tool).includes(tool.category), tool.id);
  for (const topic of topics.all) assert.equal(topics.counts.get(topic), tools.filter(tool => topicsForTool(tool).includes(topic)).length, topic);
  for (const id of ['percentage-change', 'percentage-of-amount', 'discount-price', 'chemistry-percent-yield', 'slope-grade-percent']) {
    assert.ok(topicsForTool(tools.find(tool => tool.id === id)).includes('Percentages'), id);
  }
  assert.ok(!topicsForTool(tools.find(tool => tool.id === 'average-speed')).includes('Percentages'));
});

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
