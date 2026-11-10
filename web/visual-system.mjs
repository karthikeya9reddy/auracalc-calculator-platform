const NS = 'http://www.w3.org/2000/svg';

const PROFILES = {
  'rectangle-area': ['geometry', 'Rectangle dimensions and area'],
  'rectangular-prism-volume': ['geometry', 'Rectangular prism dimensions and volume'],
  'circle-area-circumference': ['geometry', 'Circle radius, circumference, and area'],
  'right-triangle-hypotenuse': ['geometry', 'Right triangle legs and hypotenuse'],
  'triangle-area': ['geometry', 'Triangle base and perpendicular height'],
  'trapezoid-area': ['geometry', 'Trapezoid parallel sides and height'],
  'slope-grade-percent': ['geometry', 'Vertical change compared with horizontal run'],
  'concrete-slab-volume': ['geometry', 'Concrete slab plan dimensions and thickness'],
  'tile-quantity-estimate': ['geometry', 'Floor area and tile coverage'],
  'sphere-volume': ['geometry', 'Sphere radius and volume'],
  'cylinder-volume': ['geometry', 'Cylinder radius, height, and volume'],
  'cone-volume': ['geometry', 'Cone radius, height, and volume'],
  'average-speed': ['motion', 'Distance and elapsed time'],
  'average-acceleration': ['motion', 'Velocity change over elapsed time'],
  'net-force': ['motion', 'Mass and acceleration relationship'],
  'work-done': ['motion', 'Force and displacement relationship'],
  'spring-force-magnitude': ['motion', 'Spring displacement and force magnitude'],
  'spring-potential-energy': ['motion', 'Spring displacement and stored energy'],
  'centripetal-acceleration': ['motion', 'Circular path speed and radius'],
  'centripetal-force': ['motion', 'Circular motion force relationship'],
  'torque-from-force': ['motion', 'Lever arm and applied force'],
  'simple-pendulum-period': ['motion', 'Pendulum length and oscillation period'],
  'projectile-motion-level-ground': ['motion', 'Idealized projectile path'],
  'wave-speed-frequency-wavelength': ['motion', 'Wavelength and wave propagation'],
  'period-from-frequency': ['motion', 'Frequency and cycle period'],
  'ohms-law': ['circuit', 'Voltage, current, and resistance'],
  'dc-electric-power': ['circuit', 'Electrical voltage and current'],
  'series-resistance-two': ['circuit', 'Two resistors connected in series'],
  'parallel-resistance-two': ['circuit', 'Two resistors connected in parallel'],
  'unloaded-voltage-divider': ['circuit', 'Two-resistor voltage divider'],
  'capacitor-charge': ['circuit', 'Capacitor charge and voltage'],
  'capacitor-stored-energy': ['circuit', 'Capacitor stored energy'],
  'hydrostatic-gauge-pressure': ['flow', 'Fluid depth and hydrostatic pressure'],
  'buoyant-force': ['flow', 'Displaced fluid and buoyant force'],
  'volumetric-flow-rate': ['flow', 'Cross-sectional area and flow speed'],
  'mass-flow-rate': ['flow', 'Volumetric and mass flow relationship'],
  'pipe-reynolds-number': ['flow', 'Pipe flow and Reynolds number'],
  'bernoulli-pressure-change': ['flow', 'Flow speed and pressure relationship'],
  'hydraulic-pump-input-power': ['flow', 'Hydraulic flow and pump power estimate'],
  'steady-wall-conduction-rate': ['thermal', 'Temperature difference across a layer'],
  'linear-thermal-expansion': ['thermal', 'Temperature change and length change'],
  'specific-heat-transfer': ['thermal', 'Temperature change and heat transfer'],
  'blended-mineral-grade': ['balance', 'Mass-weighted mineral grade blend'],
  'mineral-process-recovery': ['balance', 'Recovered material compared with feed'],
  'diluted-mineral-grade': ['balance', 'Ore grade after barren dilution'],
  'ore-grade': ['balance', 'Contained material compared with sample mass'],
  'compound-growth-estimate': ['trend', 'Starting amount and compound-growth outcome'],
  'break-even-analysis': ['trend', 'Fixed costs and contribution per unit'],
  'classification-metrics': ['process', 'Classification metric outputs'],
  'llm-kv-cache-memory': ['capacity', 'Model context and key-value cache memory'],
  'model-weight-memory': ['capacity', 'Model size and numeric storage'],
  'image-sequence-storage': ['capacity', 'Frame dimensions and image sequence storage'],
  'compressed-video-size-estimate': ['capacity', 'Video bitrate and duration'],
  'ideal-render-farm-time': ['process', 'Frame queue and render workers'],
  'data-transfer-time': ['process', 'Data size, transfer rate, and time'],
  'service-availability': ['balance', 'Total service time and downtime'],
  'chemistry-percent-yield': ['balance', 'Actual versus theoretical product yield'],
  'gear-pair-output-speed': ['process', 'Driver and driven gear speed ratio'],
  'ideal-lever-mechanical-advantage': ['process', 'Effort arm and load arm'],
  'electrical-energy-power-time': ['capacity', 'Constant power accumulated over time'],
  'ideal-gas-density': ['capacity', 'Ideal gas pressure, temperature, and density'],
};

const VISUAL_KINDS = new Set(['diagram', 'geometry', 'motion', 'circuit', 'flow', 'thermal', 'process', 'capacity', 'trend', 'balance']);
const CUSTOM_RENDERERS = new Map();

/** Register a domain-specific visual for one calculator; return a disposer for tests or hot reload. */
export function registerVisualizationRenderer(calculatorId, renderer) {
  if (typeof calculatorId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(calculatorId)) {
    throw new TypeError('A visual renderer needs a stable calculator ID.');
  }
  if (typeof renderer !== 'function') throw new TypeError('A visual renderer must be a function.');
  if (CUSTOM_RENDERERS.has(calculatorId)) throw new Error(`A custom visual renderer is already registered for ${calculatorId}.`);
  CUSTOM_RENDERERS.set(calculatorId, renderer);
  return () => {
    if (CUSTOM_RENDERERS.get(calculatorId) === renderer) CUSTOM_RENDERERS.delete(calculatorId);
  };
}

function element(tag, attributes = {}, text = null) {
  const node = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  if (text !== null) node.textContent = String(text);
  return node;
}

function svgRoot(title, description) {
  const svg = element('svg', { viewBox: '0 0 480 190', role: 'img', 'aria-label': `${title}. ${description}` });
  svg.append(element('title', {}, title), element('desc', {}, description));
  svg.append(element('path', { class: 'visual-axis', d: 'M20 164H460M34 22V164' }));
  return svg;
}

function label(svg, x, y, text, className = 'visual-label') {
  svg.append(element('text', { x, y, class: className }, text));
}

function dimText(definition, result, id, locale) {
  const field = definition.inputs.find(item => item.id === id);
  const input = result.inputs[id];
  if (!field || !input) return null;
  const shown = new Intl.NumberFormat(locale || 'en-US', { maximumSignificantDigits: 5 }).format(input.canonicalValue);
  const unit = field.unitLabel || field.canonicalUnit || '';
  return `${field.label}: ${shown} ${unit}`.trim();
}

function outputText(definition, result, id, locale) {
  const field = definition.outputs.find(item => item.id === id);
  const value = result.outputs[id];
  if (!field || !value) return null;
  const isPercent = field.display?.format === 'percent';
  const numeric = isPercent ? value.value * 100 : value.value;
  const number = new Intl.NumberFormat(locale || 'en-US', { maximumSignificantDigits: 5 }).format(numeric);
  const unit = isPercent ? '%' : field.canonicalUnit === '1' ? '' : field.canonicalUnit;
  return `${field.label}: ${number} ${unit}`.trim();
}

function renderGeometry(svg, id, definition, result, locale) {
  const common = { fill: 'rgba(184,255,61,.12)', stroke: '#b8ff3d', 'stroke-width': 2.5 };
  const detail = { stroke: '#70e8ff', 'stroke-width': 1.5, 'stroke-dasharray': '5 5', fill: 'none' };
  if (id === 'circle-area-circumference' || id === 'sphere-volume') {
    svg.append(element('circle', { cx: 128, cy: 92, r: 58, ...common, class: id === 'sphere-volume' ? 'visual-3d-sphere' : 'visual-geometry-face' }));
    if (id === 'sphere-volume') {
      svg.append(element('ellipse', { cx: 111, cy: 70, rx: 18, ry: 10, transform: 'rotate(-32 111 70)', class: 'visual-sphere-highlight' }));
      svg.append(element('ellipse', { cx: 128, cy: 92, rx: 56, ry: 17, class: 'visual-sphere-latitude' }));
    }
    svg.append(element('path', { d: 'M128 92H186', ...detail }));
    label(svg, 140, 86, dimText(definition, result, 'radius', locale) || 'radius');
  } else if (id === 'right-triangle-hypotenuse' || id === 'triangle-area') {
    svg.append(element('path', { d: 'M70 145 L70 46 L250 145 Z', ...common }));
    svg.append(element('path', { d: 'M70 130 H85 V145', ...detail }));
    label(svg, 74, 91, dimText(definition, result, id === 'triangle-area' ? 'height' : 'leg-b', locale) || 'height');
    label(svg, 132, 161, dimText(definition, result, id === 'triangle-area' ? 'base' : 'leg-a', locale) || 'base');
    label(svg, 160, 84, id === 'triangle-area'
      ? (outputText(definition, result, definition.outputs[0]?.id, locale) || 'area')
      : (outputText(definition, result, 'hypotenuse', locale) || 'hypotenuse'));
  } else if (id === 'trapezoid-area') {
    svg.append(element('path', { d: 'M62 145 L110 48 L236 48 L284 145 Z', ...common }));
    svg.append(element('path', { d: 'M110 57V145', ...detail }));
    label(svg, 127, 42, dimText(definition, result, 'parallel-side-1', locale) || 'a');
    label(svg, 148, 163, dimText(definition, result, 'parallel-side-2', locale) || 'b');
    label(svg, 74, 99, dimText(definition, result, 'height', locale) || 'h');
  } else if (id === 'concrete-slab-volume') {
    svg.append(element('polygon', { points: '66,58 236,58 236,135 66,135', class: 'visual-3d-face' }));
    svg.append(element('polygon', { points: '236,58 278,38 278,115 236,135', class: 'visual-3d-side' }));
    svg.append(element('polygon', { points: '66,58 108,38 278,38 236,58', class: 'visual-3d-top' }));
    svg.append(element('path', { d: 'M66 58 V135 H236 V58 M236 58 L278 38 V115 L236 135 M66 58 L108 38 H278', ...common, fill: 'none' }));
    svg.append(element('path', { d: 'M66 135 L108 115 H278', ...detail }));
    label(svg, 123, 154, dimText(definition, result, 'length', locale) || 'slab length');
    label(svg, 288, 82, dimText(definition, result, 'width', locale) || 'slab width');
    label(svg, 244, 127, dimText(definition, result, 'thickness', locale) || 'thickness');
  } else if (id === 'tile-quantity-estimate') {
    svg.append(element('path', { d: 'M66 58 H236 L278 38 H108 Z M236 58 V135 L278 115 V38 M66 58 V135 H236 V58 M66 135 L108 115 H278', ...common }));
    svg.append(element('path', { d: 'M112 58 V135 M158 58 V135 M204 58 V135 M66 84 H236 M66 110 H236', ...detail }));
    label(svg, 92, 48, dimText(definition, result, 'floor-area', locale) || 'floor area');
    label(svg, 284, 82, dimText(definition, result, 'tile-length', locale) || 'tile length');
    label(svg, 240, 151, outputText(definition, result, 'whole-tiles', locale) || 'tiles to plan for');
  } else if (id === 'slope-grade-percent') {
    svg.append(element('path', { d: 'M72 146 L72 58 L282 146 Z', ...common }));
    svg.append(element('path', { d: 'M72 130 H88 V146', ...detail }));
    label(svg, 77, 102, dimText(definition, result, 'vertical-change', locale) || 'rise');
    label(svg, 148, 163, dimText(definition, result, 'horizontal-run', locale) || 'run');
  } else if (id === 'rectangular-prism-volume') {
    svg.append(element('polygon', { points: '70,58 237,58 237,138 70,138', class: 'visual-3d-face' }));
    svg.append(element('polygon', { points: '237,58 277,38 277,118 237,138', class: 'visual-3d-side' }));
    svg.append(element('polygon', { points: '70,58 110,38 277,38 237,58', class: 'visual-3d-top' }));
    svg.append(element('path', { d: 'M70 58 H237 L277 38 V118 L237 138 H70 Z M110 38 H277 M237 58 V138', ...common, fill: 'none' }));
    label(svg, 123, 157, dimText(definition, result, 'depth', locale) || 'depth');
    label(svg, 281, 83, 'base area');
  } else if (id === 'cone-volume') {
    svg.append(element('ellipse', { cx: 157, cy: 143, rx: 89, ry: 25, class: 'visual-3d-base' }));
    svg.append(element('path', { d: 'M157 31 L68 142 Q157 177 246 142 Z', ...common, class: 'visual-3d-cone' }));
    svg.append(element('path', { d: 'M157 31 V144 M157 144 H242', ...detail }));
    label(svg, 166, 86, dimText(definition, result, 'height', locale) || 'height');
    label(svg, 188, 160, dimText(definition, result, 'radius', locale) || 'radius');
  } else if (id === 'cylinder-volume') {
    svg.append(element('path', { d: 'M82 48 C82 36 226 36 226 48 L226 137 C226 165 82 165 82 137 Z', class: 'visual-3d-cylinder' }));
    svg.append(element('ellipse', { cx: 154, cy: 48, rx: 72, ry: 21, ...common, class: 'visual-3d-top' }));
    svg.append(element('path', { d: 'M82 48 V137 M226 48 V137 M82 137 C82 165 226 165 226 137', ...common, fill: 'none' }));
    svg.append(element('path', { d: 'M154 48 V137 M154 137 H224', ...detail }));
    label(svg, 160, 93, dimText(definition, result, 'height', locale) || 'height');
    label(svg, 178, 132, dimText(definition, result, 'radius', locale) || 'radius');
  } else if (id === 'rectangle-area') {
    svg.append(element('polygon', { points: '70,62 250,48 278,132 98,147', class: 'visual-3d-plane' }));
    svg.append(element('path', { d: 'M70 62 L250 48 M98 147 L278 132', ...detail }));
    label(svg, 120, 161, dimText(definition, result, 'length', locale) || 'length');
    label(svg, 264, 91, dimText(definition, result, 'width', locale) || 'width');
  } else {
    svg.append(element('rect', { x: 70, y: 55, width: 190, height: 90, ...common }));
    label(svg, 92, 105, dimText(definition, result, definition.inputs[0]?.id, locale) || definition.inputs[0]?.label || 'dimension');
    label(svg, 276, 105, outputText(definition, result, definition.outputs[0]?.id, locale) || 'result');
  }
  label(svg, 318, 64, outputText(definition, result, definition.outputs[0]?.id, locale) || 'Calculated result', 'visual-result');
}

function renderMotion(svg, id, definition, result, locale) {
  if (id === 'projectile-motion-level-ground') {
    svg.append(element('path', { d: 'M44 150 Q245 18 434 150', class: 'visual-curve' }));
    svg.append(element('circle', { cx: 44, cy: 150, r: 5, class: 'visual-point' }), element('circle', { cx: 434, cy: 150, r: 5, class: 'visual-point' }));
    svg.append(element('path', { d: 'M55 143 L85 131', class: 'visual-arrow' }));
    label(svg, 70, 122, dimText(definition, result, 'launch-speed', locale) || 'launch speed');
    label(svg, 288, 157, outputText(definition, result, 'range', locale) || 'range');
    label(svg, 270, 34, outputText(definition, result, 'peak-height', locale) || 'peak height');
  } else if (id === 'simple-pendulum-period') {
    svg.append(element('path', { d: 'M232 38 L173 134 M232 38 L291 134', class: 'visual-curve' }));
    svg.append(element('circle', { cx: 232, cy: 38, r: 7, class: 'visual-point' }), element('circle', { cx: 173, cy: 134, r: 14, class: 'visual-node' }), element('circle', { cx: 291, cy: 134, r: 14, class: 'visual-node' }));
    label(svg, 232, 162, outputText(definition, result, definition.outputs[0]?.id, locale) || 'period');
    label(svg, 76, 73, dimText(definition, result, 'length', locale) || 'length');
  } else if (id.includes('wave') || id.includes('period-from-frequency')) {
    const path = [];
    for (let i = 0; i <= 32; i += 1) {
      const x = 34 + i * 12.5;
      const y = 94 - 42 * Math.sin(i * Math.PI / 8);
      path.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    svg.append(element('path', { d: path.join(' '), class: 'visual-curve' }));
    label(svg, 64, 154, dimText(definition, result, 'wavelength', locale) || dimText(definition, result, 'frequency', locale) || 'cycle');
    label(svg, 282, 48, outputText(definition, result, definition.outputs[0]?.id, locale) || 'result');
  } else {
    svg.append(element('path', { d: 'M38 124 C112 120 124 70 206 79 S323 137 438 49', class: 'visual-curve' }));
    svg.append(element('path', { d: 'M40 149 H437', class: 'visual-arrow' }));
    label(svg, 42, 42, dimText(definition, result, definition.inputs[0]?.id, locale) || definition.inputs[0]?.label || 'input');
    label(svg, 288, 40, outputText(definition, result, definition.outputs[0]?.id, locale) || 'result');
  }
}

function renderCircuit(svg, definition, result, locale) {
  svg.append(element('path', { d: 'M58 73 H146 M202 73 H286 V133 H58 V73 M286 73 H388', class: 'visual-wire' }));
  svg.append(element('rect', { x: 146, y: 51, width: 56, height: 44, rx: 4, class: 'visual-component' }));
  svg.append(element('rect', { x: 286, y: 51, width: 56, height: 44, rx: 4, class: 'visual-component-alt' }));
  svg.append(element('path', { d: 'M58 66 V80 M48 69 V77 M388 63 V83 M379 67 V79', class: 'visual-wire' }));
  label(svg, 150, 77, 'R₁'); label(svg, 290, 77, 'R₂');
  label(svg, 50, 157, dimText(definition, result, definition.inputs[0]?.id, locale) || 'input');
  label(svg, 258, 157, outputText(definition, result, definition.outputs[0]?.id, locale) || 'result');
}

function renderFlow(svg, definition, result, locale) {
  svg.append(element('path', { d: 'M42 102 H432', class: 'visual-pipe' }));
  svg.append(element('path', { d: 'M42 102 H432', class: 'visual-flow-pulse', 'aria-hidden': 'true' }));
  svg.append(element('path', { d: 'M80 92 L98 102 L80 112 M195 92 L213 102 L195 112 M310 92 L328 102 L310 112', class: 'visual-arrow' }));
  svg.append(element('path', { d: 'M88 65 V139 M390 65 V139', class: 'visual-boundary' }));
  label(svg, 48, 50, dimText(definition, result, definition.inputs[0]?.id, locale) || definition.inputs[0]?.label || 'flow input');
  label(svg, 266, 157, outputText(definition, result, definition.outputs[0]?.id, locale) || 'calculated result');
}

function renderThermal(svg, definition, result, locale) {
  const colors = ['#70e8ff', '#a583ff', '#ff9d5c', '#b8ff3d'];
  for (let i = 0; i < 4; i += 1) svg.append(element('rect', { x: 72 + i * 70, y: 55, width: 70, height: 84, class: 'visual-layer', fill: colors[i] }));
  svg.append(element('path', { d: 'M40 97 H62 M360 97 H434', class: 'visual-arrow' }));
  label(svg, 62, 158, dimText(definition, result, definition.inputs[0]?.id, locale) || definition.inputs[0]?.label || 'material');
  label(svg, 284, 45, outputText(definition, result, definition.outputs[0]?.id, locale) || 'heat transfer result');
}

function renderProcess(svg, definition, result, locale) {
  const labels = definition.inputs.slice(0, 3).map((field, index) => `${index + 1}. ${field.label}`);
  const boxPositions = [[36, 62], [171, 62], [306, 62]];
  for (let i = 0; i < Math.min(labels.length, 3); i += 1) {
    const [x, y] = boxPositions[i];
    svg.append(element('rect', { x, y, width: 116, height: 58, rx: 8, class: i === 2 ? 'visual-node-alt' : 'visual-node' }));
    label(svg, x + 8, y + 22, labels[i].slice(0, 20));
    const value = dimText(definition, result, definition.inputs[i].id, locale);
    label(svg, x + 8, y + 42, value ? value.slice(0, 18) : '', 'visual-small-label');
    if (i < Math.min(labels.length, 3) - 1) svg.append(element('path', { d: `M${x + 117} 91 H${x + 133}`, class: 'visual-arrow' }));
  }
  label(svg, 36, 155, outputText(definition, result, definition.outputs[0]?.id, locale) || 'Calculated result');
}

function renderBars(svg, definition, result, kind, locale) {
  const inputs = definition.inputs.slice(0, 2);
  const output = definition.outputs[0];
  const positions = inputs.length > 1 ? [[30, 46], [30, 112]] : [[30, 78]];
  inputs.forEach((field, index) => {
    const [x, y] = positions[index];
    const record = result.inputs[field.id];
    const text = record ? new Intl.NumberFormat(locale, { maximumSignificantDigits: 5 }).format(record.canonicalValue) : '—';
    svg.append(element('rect', { x, y, width: 145, height: 43, rx: 5, class: 'visual-node' }));
    label(svg, x + 9, y + 16, field.label.slice(0, 22), 'visual-small-label');
    label(svg, x + 9, y + 33, `${text} ${field.canonicalUnit === '1' ? field.unitLabel || '' : field.canonicalUnit}`.trim(), 'visual-label');
  });
  svg.append(element('path', { d: inputs.length > 1 ? 'M178 68 H218 V95 H252 M178 133 H218 V106 H252' : 'M178 100 H252', class: 'visual-arrow' }));
  svg.append(element('rect', { x: 260, y: 65, width: 190, height: 70, rx: 7, class: 'visual-node-alt' }));
  label(svg, 274, 91, output?.label || 'Calculated result', 'visual-small-label');
  label(svg, 274, 115, outputText(definition, result, output?.id, locale) || 'Result available', 'visual-result');
  label(svg, 30, 174, kind === 'trend' ? 'Inputs and outcome summary; no future data is predicted.' : 'Visual summary only; see the method steps for the calculation.', 'visual-footnote');
}

export function visualizationProfile(definition) {
  if (definition.visualization && VISUAL_KINDS.has(definition.visualization.kind)) return definition.visualization;
  const profile = PROFILES[definition.id];
  if (!profile) return null;
  return { kind: profile[0], title: profile[1], description: `${profile[1]}. Schematic only; use the displayed method, units, assumptions, and limitations for interpretation.` };
}

export function renderCalculationVisual(definition, result, locale = 'en-US') {
  const profile = visualizationProfile(definition);
  if (!profile) return null;
  const figure = document.createElement('figure');
  figure.className = 'calculation-visual';
  const heading = document.createElement('figcaption');
  const headingText = document.createElement('strong');
  headingText.textContent = profile.title;
  const copy = document.createElement('span');
  copy.textContent = profile.description;
  heading.append(headingText, copy);
  const svg = svgRoot(profile.title, profile.description);
  const kind = profile.kind;
  const customRenderer = CUSTOM_RENDERERS.get(definition.id);
  if (customRenderer) customRenderer(svg, { definition, result, locale, element, label, dimText, outputText });
  else if (kind === 'geometry') renderGeometry(svg, definition.id, definition, result, locale);
  else if (kind === 'motion') renderMotion(svg, definition.id, definition, result, locale);
  else if (kind === 'circuit') renderCircuit(svg, definition, result, locale);
  else if (kind === 'flow') renderFlow(svg, definition, result, locale);
  else if (kind === 'thermal') renderThermal(svg, definition, result, locale);
  else if (kind === 'process' || kind === 'diagram') renderProcess(svg, definition, result, locale);
  else renderBars(svg, definition, result, kind, locale);
  figure.append(heading, svg);
  return figure;
}
