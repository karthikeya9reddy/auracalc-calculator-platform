import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCalculation } from '../../src/calculation-core/index.mjs';
import { publicDefinitions, publicRegistry } from '../../catalog/public/index.mjs';
import { compatibleNextSteps, recommendNextSteps } from '../../web/next-step-engine.mjs';
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

test('flow result prioritizes authored engineering continuations and keeps every carry checked', () => {
  const source = publicRegistry.get('volumetric-flow-rate');
  const result = executeCalculation(source, {
    'cross-sectional-area': { value: 0.01, unit: 'm2' },
    'mean-velocity': { value: 2, unit: 'm/s' },
  });
  const suggestions = recommendNextSteps(source, result, publicDefinitions);
  assert.deepEqual(suggestions.slice(0, 2).map(item => item.targetDefinition.id), ['mass-flow-rate', 'hydraulic-pump-input-power']);
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

test('suggestions avoid treating a money amount as a percentage and feature each calculator once', () => {
  const source = publicRegistry.get('percentage-of-amount');
  const result = executeCalculation(source, {
    'base-amount': { value: 3000, unit: '1' },
    percentage: { value: 34, unit: '1' },
  });
  const routes = compatibleNextSteps(source, result, publicDefinitions);
  assert.ok(routes.every(route => route.inputField.id !== 'percentage' && route.inputField.id !== 'tax-percent'));
  const suggestions = recommendNextSteps(source, result, publicDefinitions, routes);
  assert.equal(new Set(suggestions.map(route => route.targetDefinition.id)).size, suggestions.length);
});

test('future calculator visuals can declare a reusable, accessible visual type', () => {
  const definition = publicRegistry.get('projectile-motion-level-ground');
  assert.deepEqual(visualizationProfile(definition), definition.visualization);
  assert.equal(typeof visualizationProfile(publicRegistry.get('tip-calculator')).kind, 'string');
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

test('gear visualization reflects the entered tooth counts and speed', () => {
  class FakeNode {
    constructor(tag) { this.tagName = tag; this.attributes = {}; this.children = []; this.textContent = ''; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    append(...children) { this.children.push(...children); }
  }
  const oldDocument = globalThis.document;
  globalThis.document = {
    createElement: tag => new FakeNode(tag),
    createElementNS: (_namespace, tag) => new FakeNode(tag),
  };
  try {
    const definition = publicRegistry.get('gear-pair-output-speed');
    const render = (driver, driven) => {
      const result = executeCalculation(definition, {
        'input-speed': { value: 1200, unit: 'rpm' },
        'driver-teeth': { value: driver, unit: '1' },
        'driven-teeth': { value: driven, unit: '1' },
      });
      return renderCalculationVisual(definition, result);
    };
    const first = render(20, 60);
    const second = render(12, 24);
    const firstGear = first.children[1].children.find(child => child.attributes.class?.includes('visual-gear-driver'));
    const secondGear = second.children[1].children.find(child => child.attributes.class?.includes('visual-gear-driver'));
    assert.equal(firstGear.attributes['data-tooth-count'], '20');
    assert.equal(secondGear.attributes['data-tooth-count'], '12');
    assert.notEqual(firstGear.children[0].attributes.d, secondGear.children[0].attributes.d);
    assert.equal(firstGear.children[0].attributes.class, 'visual-gear-depth');
    assert.equal(firstGear.children[2].attributes.class, 'visual-gear-hub-depth');
    assert.match(first.children[1].attributes['aria-label'], /tooth counts/);
  } finally {
    globalThis.document = oldDocument;
  }
});

test('3D geometry visuals change their proportions when calculation inputs change', () => {
  class FakeNode {
    constructor(tag) { this.tagName = tag; this.attributes = {}; this.children = []; this.textContent = ''; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    append(...children) { this.children.push(...children); }
  }
  const oldDocument = globalThis.document;
  globalThis.document = {
    createElement: tag => new FakeNode(tag),
    createElementNS: (_namespace, tag) => new FakeNode(tag),
  };
  try {
    const definition = publicRegistry.get('sphere-volume');
    const render = radius => renderCalculationVisual(definition, executeCalculation(definition, { radius: { value: radius, unit: 'm' } }));
    const smallSphere = render(1);
    const largeSphere = render(10);
    const small = smallSphere.children[1].children.find(child => child.attributes.class === 'visual-3d-sphere');
    const large = largeSphere.children[1].children.find(child => child.attributes.class === 'visual-3d-sphere');
    assert.ok(Number(large.attributes.r) > Number(small.attributes.r));
    assert.match(largeSphere.children[1].attributes['aria-label'], /entered radius/);
  } finally {
    globalThis.document = oldDocument;
  }
});

test('motion diagrams respond to entered trajectory and pendulum dimensions', () => {
  class FakeNode {
    constructor(tag) { this.tagName = tag; this.attributes = {}; this.children = []; this.textContent = ''; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    append(...children) { this.children.push(...children); }
  }
  const oldDocument = globalThis.document;
  globalThis.document = {
    createElement: tag => new FakeNode(tag),
    createElementNS: (_namespace, tag) => new FakeNode(tag),
  };
  try {
    const projectile = publicRegistry.get('projectile-motion-level-ground');
    const renderProjectile = (speed, angle) => renderCalculationVisual(projectile, executeCalculation(projectile, {
      'launch-speed': { value: speed, unit: 'm/s' },
      'launch-angle': { value: angle, unit: 'deg' },
      gravity: { value: 9.80665, unit: 'm/s2' },
    }));
    const lowerArc = renderProjectile(20, 20);
    const higherArc = renderProjectile(20, 60);
    const path = visual => visual.children[1].children.find(child => child.attributes.class?.includes('visual-trajectory'));
    assert.notEqual(path(lowerArc).attributes.d, path(higherArc).attributes.d);

    const pendulum = publicRegistry.get('simple-pendulum-period');
    const renderPendulum = length => renderCalculationVisual(pendulum, executeCalculation(pendulum, { length: { value: length, unit: 'm' } }));
    const shortString = renderPendulum(.25);
    const longString = renderPendulum(5);
    const bobs = visual => visual.children[1].children.filter(child => child.attributes.class === 'visual-node');
    assert.notEqual(bobs(shortString)[0].attributes.cx, bobs(longString)[0].attributes.cx);
    assert.notEqual(bobs(shortString)[0].attributes.cy, bobs(longString)[0].attributes.cy);
  } finally {
    globalThis.document = oldDocument;
  }
});
