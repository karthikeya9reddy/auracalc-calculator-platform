import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicDefinitions, publicRegistry } from '../../catalog/public/index.mjs';
import { recommendNextSteps } from '../../web/next-step-engine.mjs';
import { registerVisualizationRenderer, renderCalculationVisual, visualizationProfile } from '../../web/visual-system.mjs';

test('metadata-driven next-step suggestions carry only dimensionally compatible outputs', () => {
  const source = publicRegistry.get('rectangle-area');
  const result = executeCalculation(source, { length: { value: 3, unit: 'm' }, width: { value: 2, unit: 'm' } });
  const [suggestion] = recommendNextSteps(source, result, publicDefinitions);
  assert.equal(suggestion.targetDefinition.id, 'rectangular-prism-volume');
  assert.equal(suggestion.inputField.id, 'base-area');
  assert.equal(suggestion.handoff.value, 6);
  assert.equal(suggestion.handoff.unit, 'm2');
});

test('flow result predicts two relevant engineering continuations with checked handoffs', () => {
  const source = publicRegistry.get('volumetric-flow-rate');
  const result = executeCalculation(source, {
    'cross-sectional-area': { value: 0.01, unit: 'm2' },
    'mean-velocity': { value: 2, unit: 'm/s' },
  });
  const suggestions = recommendNextSteps(source, result, publicDefinitions);
  assert.deepEqual(suggestions.map(item => item.targetDefinition.id), ['mass-flow-rate', 'hydraulic-pump-input-power']);
  assert.ok(suggestions.every(item => item.handoff.value === 0.02 && item.handoff.unit === 'm3/s'));
  assert.ok(suggestions.every(item => item.reason.length > 15));
});

test('new metadata continues workflows and is validated by the same unit-safe handoff', () => {
  const source = publicRegistry.get('dc-electric-power');
  const result = executeCalculation(source, { voltage: { value: 12, unit: 'V' }, current: { value: 2, unit: 'A' } });
  const suggestions = recommendNextSteps(source, result, publicDefinitions);
  assert.equal(suggestions[0].targetDefinition.id, 'electrical-energy-power-time');
  assert.equal(suggestions[0].handoff.value, 24);
  assert.equal(suggestions[0].handoff.unit, 'W');
});

test('future calculator visuals can declare a reusable, accessible visual type', () => {
  const definition = publicRegistry.get('projectile-motion-level-ground');
  assert.deepEqual(visualizationProfile(definition), definition.visualization);
  assert.equal(visualizationProfile(publicRegistry.get('tip-calculator')), null);
  const future = { ...publicRegistry.get('tip-calculator'), visualization: { kind: 'balance', title: 'Input/output comparison', description: 'Schematic comparison for this future tool.' } };
  assert.equal(visualizationProfile(future).kind, 'balance');
});

test('future heavy-field calculators can plug in a custom SVG renderer without changing the shared engine', () => {
  class FakeNode {
    constructor(tag) { this.tagName = tag; this.attributes = {}; this.children = []; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    append(...children) { this.children.push(...children); }
  }
  const oldDocument = globalThis.document;
  globalThis.document = {
    createElement: tag => new FakeNode(tag),
    createElementNS: (_namespace, tag) => new FakeNode(tag),
  };
  const future = {
    ...publicRegistry.get('tip-calculator'),
    visualization: { kind: 'diagram', title: 'Custom process diagram', description: 'An accessible, schematic process visual.' },
  };
  let rendered = false;
  const unregister = registerVisualizationRenderer(future.id, (svg, api) => {
    rendered = true;
    svg.append(api.element('circle', { cx: 50, cy: 50, r: 10 }));
  });
  try {
    const figure = renderCalculationVisual(future, { inputs: {}, outputs: {} });
    const svg = figure.children[1];
    assert.equal(rendered, true);
    assert.equal(svg.attributes.role, 'img');
    assert.match(svg.attributes['aria-label'], /accessible, schematic process visual/);
    assert.equal(svg.children.at(-1).tagName, 'circle');
    assert.throws(() => registerVisualizationRenderer(future.id, () => {}), /already registered/);
  } finally {
    unregister();
    globalThis.document = oldDocument;
  }
});
