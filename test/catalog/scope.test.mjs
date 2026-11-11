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
  assert.deepEqual(index.get('Mining and extractive industries').filter(definition => !definition.id.startsWith('convert-')).map(definition => definition.id), [
    'ore-grade', 'blended-mineral-grade', 'mineral-process-recovery', 'diluted-mineral-grade', 'chemistry-percent-yield',
    'metal-recovered-mass', 'mine-strip-ratio', 'mine-waste-tonnage', 'blended-ore-grade-two-streams',
    'contained-metal-in-ore', 'mineral-product-recovery', 'mineral-slurry-solids-mass-fraction',
    'water-to-ore-mass-ratio', 'mine-material-throughput', 'haul-truck-fleet-throughput', 'future-tool',
  ]);
});

test('field pages list the expanded calculators under their matching disciplines', () => {
  const index = createFieldToolIndex(publicDefinitions);
  const nonConversionIds = field => index.get(field).filter(definition => !definition.id.startsWith('convert-')).map(definition => definition.id);
  assert.deepEqual(nonConversionIds('Travel, time, fitness, and sports calculations'), ['average-speed', 'trip-fuel-estimate', 'trip-fuel-cost-estimate']);
  assert.deepEqual(nonConversionIds('Transportation and traffic engineering'), [
    'slope-grade-percent', 'ideal-braking-distance', 'wheel-tractive-force-from-torque', 'ideal-jet-thrust-from-mass-flow',
  ]);
  assert.deepEqual(nonConversionIds('Logistics and supply chain'), [
    'trip-fuel-estimate', 'economic-order-quantity', 'mine-material-throughput', 'haul-truck-fleet-throughput',
  ]);
  assert.deepEqual(nonConversionIds('Civil engineering'), [
    'rectangle-area', 'rectangular-prism-volume', 'circle-area-circumference', 'linear-thermal-expansion',
    'steady-wall-conduction-rate', 'triangle-area', 'trapezoid-area', 'slope-grade-percent',
    'concrete-slab-volume', 'tile-quantity-estimate', 'right-triangle-hypotenuse', 'sphere-volume',
    'cylinder-volume', 'cone-volume',
    'excavation-volume', 'floor-screed-volume', 'wall-material-volume', 'roof-pitch-percent', 'roof-rafter-length',
    'aggregate-tonnage-estimate', 'soil-bulk-density', 'cubic-volume-tonnage', 'road-grade-percent', 'concrete-batch-yield',
    'triangle-angle-cosine-rule', 'triangle-area-heron', 'paving-material-mass-estimate', 'circular-pipe-internal-volume',
    'annular-cross-section-area', 'trapezoidal-trench-volume', 'earthwork-bulking-volume', 'compacted-fill-dry-mass',
    'axial-normal-stress', 'engineering-normal-strain', 'elastic-bar-axial-elongation', 'cantilever-end-load-moment',
    'elastic-beam-bending-stress', 'simply-supported-point-load-reaction', 'simply-supported-center-load-moment',
    'simply-supported-uniform-load-moment', 'euler-column-critical-load-ideal', 'construction-waste-adjusted-volume',
  ]);
  assert.deepEqual(nonConversionIds('Water resources and hydraulic engineering'), [
    'hydrostatic-gauge-pressure', 'buoyant-force', 'volumetric-flow-rate', 'mass-flow-rate',
    'pipe-reynolds-number', 'bernoulli-pressure-change', 'hydraulic-pump-input-power', 'fluid-head-pressure',
    'hydraulic-power-output', 'pump-efficiency-estimate', 'rectangular-channel-average-speed', 'wall-thermal-resistance',
    'convection-heat-transfer-rate', 'sensible-cooling-load', 'thermal-diffusivity', 'tank-fill-time', 'pipe-average-flow-speed',
    'circular-pipe-internal-volume', 'rain-runoff-volume-with-coefficient', 'hydraulic-cylinder-speed-from-flow',
  ]);
  assert.deepEqual(nonConversionIds('Electrical engineering and power systems'), [
    'ohms-law', 'dc-electric-power', 'electric-charge-from-current', 'series-resistance-two',
    'parallel-resistance-two', 'unloaded-voltage-divider', 'capacitor-stored-energy', 'capacitor-charge',
    'electrical-energy-power-time', 'battery-energy-watt-hours', 'resistor-power-from-current',
    'capacitor-reactance', 'inductor-reactance', 'transformer-secondary-voltage', 'balanced-three-phase-power',
    'led-series-resistor', 'voltage-divider-output', 'charge-from-current-time', 'capacitor-charge-estimate',
    'angular-frequency-from-hertz', 'rc-circuit-time-constant', 'rl-circuit-time-constant',
    'rc-capacitor-charging-voltage', 'rc-capacitor-discharge-voltage', 'inductor-stored-energy',
    'joule-heating-energy', 'electric-current-density', 'power-factor-from-real-power',
    'balanced-three-phase-apparent-power', 'voltage-regulation-percent',
  ]);
  assert.deepEqual(nonConversionIds('VFX, CGI, animation, and motion design'), [
    'frame-duration', 'shutter-exposure', 'ideal-render-farm-time', 'image-sequence-storage', 'compressed-video-size-estimate',
    'camera-horizontal-field-of-view', 'crop-equivalent-focal-length', 'exposure-value-from-settings',
    'animation-duration-from-frames', 'render-farm-runtime', 'sequence-frame-count', 'digital-image-aspect-ratio',
    'screen-pixel-density',
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
