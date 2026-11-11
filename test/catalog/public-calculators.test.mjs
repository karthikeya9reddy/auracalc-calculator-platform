import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkflowHandoff, executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicDefinitions, publicRegistry } from '../../catalog/public/index.mjs';
import { next100Calculators } from '../../catalog/public/next-100-expansion.mjs';

const calculator = id => publicRegistry.get(id);

test('public catalog contains only source-backed R0 definitions with release evidence', () => {
  assert.equal(publicDefinitions.length, 299);
  assert.equal(new Set(publicDefinitions.map(definition => definition.id)).size, publicDefinitions.length);
  assert.equal(publicRegistry.listPublished().length, publicDefinitions.length);
  assert.ok(publicDefinitions.every(definition => definition.catalogKind === 'calculator'));
  const ids = new Set(publicDefinitions.map(definition => definition.id));
  for (const id of ['percentage-change', 'lawn-seed-mass', 'gear-pair-output-speed']) assert.ok(ids.has(id), id);
  assert.equal([...ids].filter(id => id.startsWith('convert-')).length, 0);
  assert.equal(next100Calculators.length, 100);
  for (const definition of publicDefinitions) {
    assert.equal(definition.riskClass, 'R0');
    assert.ok(definition.references.length > 0, definition.id);
    assert.ok(definition.verificationCases.length > 0, definition.id);
    assert.ok(definition.release.evidenceIds.length > 0, definition.id);
    assert.ok(definition.release.reviewers.length > 0, definition.id);
    assert.equal(definition.release.reviewers.some(reviewer => reviewer.independent === true), false, definition.id);
    assert.match(definition.release.reviewers[0].qualification, /no independent domain review recorded/i, definition.id);
  }
});

test('sales-tax estimate applies only the user-provided rate', () => {
  const result = executeCalculation(calculator('sales-tax-estimate'), { subtotal: 100, 'tax-percent': 8 });
  assert.equal(result.outputs['tax-amount'].value, 8);
  assert.equal(result.outputs.total.value, 108);
  assert.throws(() => executeCalculation(calculator('sales-tax-estimate'), { subtotal: 100, 'tax-percent': 100.1 }), { code: 'INPUT_ABOVE_MAXIMUM' });
});

test('markup price applies a user-selected percentage to cost', () => {
  const result = executeCalculation(calculator('markup-price'), { cost: 80, 'markup-percent': 25 });
  assert.equal(result.outputs['markup-amount'].value, 20);
  assert.equal(result.outputs['selling-price'].value, 100);
  assert.equal(executeCalculation(calculator('markup-price'), { cost: 80, 'markup-percent': 0 }).outputs['selling-price'].value, 80);
});

test('tip calculator returns the chosen tip and total without suggesting a rate', () => {
  const result = executeCalculation(calculator('tip-calculator'), { 'bill-amount': 80, 'tip-percent': 15 });
  assert.equal(result.outputs['tip-amount'].value, 12);
  assert.equal(result.outputs.total.value, 92);
});

test('price per unit rejects zero quantity and preserves ratio when scaled', () => {
  const definition = calculator('price-per-unit');
  assert.equal(executeCalculation(definition, { 'package-price': 6, quantity: 3 }).outputs['unit-price'].value, 2);
  assert.equal(executeCalculation(definition, { 'package-price': 12, quantity: 6 }).outputs['unit-price'].value, 2);
  assert.throws(() => executeCalculation(definition, { 'package-price': 6, quantity: 0 }), { code: 'POSITIVE_QUANTITY_REQUIRED' });
});

test('percentage-of-amount handles common rates and boundaries', () => {
  const definition = calculator('percentage-of-amount');
  assert.equal(executeCalculation(definition, { 'base-amount': 80, percentage: 15 }).outputs.amount.value, 12);
  assert.equal(executeCalculation(definition, { 'base-amount': 80, percentage: 0 }).outputs.amount.value, 0);
  assert.equal(executeCalculation(definition, { 'base-amount': 80, percentage: 100 }).outputs.amount.value, 80);
  assert.throws(() => executeCalculation(definition, { 'base-amount': 80, percentage: 100.1 }), { code: 'INPUT_ABOVE_MAXIMUM' });
});

test('discount-price returns savings and final price without cash-rounding assumptions', () => {
  const definition = calculator('discount-price');
  const result = executeCalculation(definition, { 'original-price': 50, 'discount-percent': 20 });
  assert.equal(result.outputs.savings.value, 10);
  assert.equal(result.outputs['final-price'].value, 40);
  assert.equal(executeCalculation(definition, { 'original-price': 50, 'discount-percent': 100 }).outputs['final-price'].value, 0);
  assert.throws(() => executeCalculation(definition, { 'original-price': 50, 'discount-percent': 101 }), { code: 'INPUT_ABOVE_MAXIMUM' });
});

test('shared-bill-split calculates equal shares and requires whole people', () => {
  const definition = calculator('shared-bill-split');
  const result = executeCalculation(definition, { 'bill-amount': 80, 'tip-percent': 10, people: 4 });
  assert.equal(result.outputs['tip-amount'].value, 8);
  assert.equal(result.outputs.total.value, 88);
  assert.equal(result.outputs['per-person'].value, 22);
  assert.throws(() => executeCalculation(definition, { 'bill-amount': 80, 'tip-percent': 10, people: 2.5 }), { code: 'WHOLE_NUMBER_REQUIRED' });
  assert.throws(() => executeCalculation(definition, { 'bill-amount': 80, 'tip-percent': 101, people: 4 }), { code: 'INPUT_ABOVE_MAXIMUM' });
});

test('percentage change returns signed change and rejects a zero baseline', () => {
  const definition = calculator('percentage-change');
  const increase = executeCalculation(definition, { original: 200, new: 250 });
  const decrease = executeCalculation(definition, { original: 100, new: 70 });
  assert.equal(increase.outputs.difference.value, 50);
  assert.equal(increase.outputs['change-percent'].value, 0.25);
  assert.equal(decrease.outputs['change-percent'].value, -0.3);
  assert.throws(() => executeCalculation(definition, { original: 0, new: 50 }), { code: 'ZERO_BASELINE' });
});

test('rectangle area and perimeter normalize mixed units before calculation', () => {
  const result = executeCalculation(calculator('rectangle-area'), {
    length: { value: 12, unit: 'in' },
    width: { value: 1, unit: 'ft' },
  });
  assert.ok(Math.abs(result.outputs.area.value - 0.09290304) < 1e-12);
  assert.ok(Math.abs(result.outputs.perimeter.value - 1.2192) < 1e-12);
  assert.equal(result.provenance.references[0].id, 'openstax-geometry-formulas');
});

test('rectangular prism volume calculates with area and depth quantities', () => {
  const result = executeCalculation(calculator('rectangular-prism-volume'), {
    'base-area': { value: 6, unit: 'm2' },
    depth: { value: 2, unit: 'm' },
  });
  assert.equal(result.outputs.volume.value, 12);
  assert.equal(result.outputs.volume.unit, 'm3');
});

test('average speed distinguishes positive elapsed time and returns SI speed', () => {
  const definition = calculator('average-speed');
  const result = executeCalculation(definition, {
    distance: { value: 60, unit: 'km' },
    'elapsed-time': { value: 1, unit: 'h' },
  });
  assert.ok(Math.abs(result.outputs.speed.value - (50 / 3)) < 1e-12);
  assert.throws(() => executeCalculation(definition, {
    distance: { value: 10, unit: 'm' },
    'elapsed-time': { value: 0, unit: 's' },
  }), { code: 'NON_POSITIVE_TIME' });
});

test('workflow handoff carries normalized values and blocks incompatible dimensions', () => {
  const sourceDefinition = calculator('rectangle-area');
  const sourceResult = executeCalculation(sourceDefinition, {
    length: { value: 2, unit: 'm' },
    width: { value: 3, unit: 'm' },
  });
  const targetDefinition = calculator('rectangular-prism-volume');
  const handoff = createWorkflowHandoff({
    sourceDefinition,
    sourceResult,
    outputId: 'area',
    targetDefinition,
    inputId: 'base-area',
  });
  assert.equal(handoff.value, 6);
  assert.equal(handoff.unit, 'm2');
  assert.equal(handoff.source.methodVersion, sourceDefinition.version);
  assert.throws(() => createWorkflowHandoff({
    sourceDefinition: calculator('average-speed'),
    sourceResult: executeCalculation(calculator('average-speed'), {
      distance: { value: 60, unit: 'km' }, 'elapsed-time': { value: 1, unit: 'h' },
    }),
    outputId: 'speed',
    targetDefinition,
    inputId: 'base-area',
  }), { code: 'WORKFLOW_DIMENSION_MISMATCH' });
  assert.throws(() => createWorkflowHandoff({
    sourceDefinition,
    sourceResult,
    outputId: 'perimeter',
    targetDefinition,
    inputId: 'depth',
  }), { code: 'WORKFLOW_LINK_NOT_ALLOWED' });
});
