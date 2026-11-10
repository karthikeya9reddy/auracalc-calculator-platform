import test from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_DIRECTORY } from '../../catalog/field-directory.mjs';
import { createFieldToolIndex } from '../../catalog/field-tool-index.mjs';
import { fieldRoute, fieldSlug } from '../../catalog/field-route.mjs';
import { publicDefinitions } from '../../catalog/public/index.mjs';
import { mountSponsoredPlacements } from '../../web/ads.mjs';

test('field research map contains 48 unique groups', () => {
  assert.equal(FIELD_DIRECTORY.length, 48);
  assert.equal(new Set(FIELD_DIRECTORY).size, FIELD_DIRECTORY.length);
});

test('every research field has a stable, unique field landing route', () => {
  const routes = FIELD_DIRECTORY.map(fieldRoute);
  assert.equal(new Set(routes).size, FIELD_DIRECTORY.length);
  assert.equal(fieldSlug('VFX, CGI, animation, and motion design'), 'vfx-cgi-animation-and-motion-design');
  assert.equal(fieldRoute('Civil engineering'), '/fields/civil-engineering/');
});

test('every public calculator is indexed under each declared field and unknown fields fail closed', () => {
  const index = createFieldToolIndex(publicDefinitions);
  assert.equal(index.size, FIELD_DIRECTORY.length);
  for (const definition of publicDefinitions) {
    assert.ok(definition.fields.length > 0, definition.id);
    for (const field of definition.fields) assert.ok(index.get(field).includes(definition), `${definition.id} missing from ${field}`);
  }
  assert.throws(() => createFieldToolIndex([{ id: 'unmapped', fields: ['Unknown field'] }]), /unknown research field/);
});

test('future tagged calculators automatically appear in their field list', () => {
  const added = { ...publicDefinitions[0], id: 'future-tool', fields: ['Mining and extractive industries'] };
  const index = createFieldToolIndex([...publicDefinitions, added]);
  assert.deepEqual(index.get('Mining and extractive industries').map(definition => definition.id), [
    'ore-grade', 'blended-mineral-grade', 'mineral-process-recovery', 'diluted-mineral-grade', 'chemistry-percent-yield', 'future-tool',
  ]);
});

test('field pages list the expanded calculators under their matching disciplines', () => {
  const index = createFieldToolIndex(publicDefinitions);
  assert.deepEqual(index.get('Travel, time, fitness, and sports calculations').map(definition => definition.id), ['average-speed', 'trip-fuel-estimate']);
  assert.deepEqual(index.get('Transportation and traffic engineering').map(definition => definition.id), ['slope-grade-percent']);
  assert.deepEqual(index.get('Logistics and supply chain').map(definition => definition.id), ['trip-fuel-estimate']);
  assert.deepEqual(index.get('Civil engineering').map(definition => definition.id), [
    'rectangle-area', 'rectangular-prism-volume', 'circle-area-circumference', 'linear-thermal-expansion',
    'steady-wall-conduction-rate', 'triangle-area', 'trapezoid-area', 'slope-grade-percent',
    'concrete-slab-volume', 'tile-quantity-estimate', 'right-triangle-hypotenuse', 'sphere-volume',
    'cylinder-volume', 'cone-volume',
  ]);
  assert.deepEqual(index.get('Water resources and hydraulic engineering').map(definition => definition.id), [
    'hydrostatic-gauge-pressure', 'buoyant-force', 'volumetric-flow-rate', 'mass-flow-rate',
    'pipe-reynolds-number', 'bernoulli-pressure-change', 'hydraulic-pump-input-power',
  ]);
  assert.deepEqual(index.get('Electrical engineering and power systems').map(definition => definition.id), [
    'ohms-law', 'dc-electric-power', 'electric-charge-from-current', 'series-resistance-two',
    'parallel-resistance-two', 'unloaded-voltage-divider', 'capacitor-stored-energy', 'capacitor-charge',
    'photon-energy-from-frequency', 'electrical-energy-power-time',
  ]);
  assert.deepEqual(index.get('VFX, CGI, animation, and motion design').map(definition => definition.id), [
    'frame-duration', 'shutter-exposure', 'ideal-render-farm-time', 'image-sequence-storage', 'compressed-video-size-estimate',
  ]);
});

test('sponsored placements stay disabled until explicit advertising consent and an adapter exist', async () => {
  let adapterCalls = 0;
  const element = {
    childNodes: [],
    hidden: true,
    classList: { add() {} },
    replaceChildren() { this.childNodes = []; },
  };
  const root = { querySelector: () => element };
  const adapter = { async mount() { adapterCalls += 1; element.childNodes.push({}); } };

  const denied = await mountSponsoredPlacements(root, { NEXORA_ADAPTER: adapter, NEXORA_CONSENT_STATE: { advertising: 'denied' } });
  assert.equal(denied.state, 'disabled-or-unconfigured');
  assert.equal(adapterCalls, 0);

  const allowed = await mountSponsoredPlacements(root, { NEXORA_ADAPTER: adapter, NEXORA_CONSENT_STATE: { advertising: 'allowed' } });
  assert.equal(allowed.mounted, 1);
  assert.equal(adapterCalls, 1);
  assert.equal(element.hidden, false);
});
