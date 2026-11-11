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

function inputMagnitude(result, id) {
  return Math.abs(result.inputs[id]?.canonicalValue || 0);
}

function scaledSketchExtent(value, min, max) {
  const magnitude = Math.max(0, Number(value) || 0);
  const weight = Math.log10(1 + magnitude);
  return min + (max - min) * (weight / (weight + 2));
}

function relativeSketchLengths(values, maximum, minimum = 34) {
  const largest = Math.max(...values.map(value => Math.abs(Number(value) || 0)), 1e-12);
  return values.map(value => Math.max(minimum, maximum * Math.abs(Number(value) || 0) / largest));
}

function renderGeometry(svg, id, definition, result, locale) {
  const common = { fill: 'rgba(184,255,61,.12)', stroke: '#b8ff3d', 'stroke-width': 2.5 };
  const detail = { stroke: '#70e8ff', 'stroke-width': 1.5, 'stroke-dasharray': '5 5', fill: 'none' };
  if (id === 'circle-area-circumference' || id === 'sphere-volume') {
    const radius = scaledSketchExtent(inputMagnitude(result, 'radius'), 34, 68);
    svg.append(element('circle', { cx: 128, cy: 92, r: radius, ...common, class: id === 'sphere-volume' ? 'visual-3d-sphere' : 'visual-geometry-face' }));
    if (id === 'sphere-volume') {
      svg.append(element('ellipse', { cx: 111, cy: 70, rx: radius * .31, ry: radius * .17, transform: 'rotate(-32 111 70)', class: 'visual-sphere-highlight' }));
      svg.append(element('ellipse', { cx: 128, cy: 92, rx: radius * .96, ry: radius * .29, class: 'visual-sphere-latitude' }));
    }
    svg.append(element('path', { d: `M128 92H${128 + radius}`, ...detail }));
    label(svg, 140, 86, dimText(definition, result, 'radius', locale) || 'radius');
  } else if (id === 'right-triangle-hypotenuse' || id === 'triangle-area') {
    const firstId = id === 'triangle-area' ? 'base' : 'leg-a';
    const secondId = id === 'triangle-area' ? 'height' : 'leg-b';
    const [width, height] = relativeSketchLengths([inputMagnitude(result, firstId), inputMagnitude(result, secondId)], 170, 42);
    const x0 = 70;
    const y0 = 145;
    svg.append(element('path', { d: `M${x0} ${y0} L${x0} ${y0 - height} L${x0 + width} ${y0} Z`, ...common }));
    svg.append(element('path', { d: `M${x0} ${y0 - 15} H${x0 + 15} V${y0}`, ...detail }));
    label(svg, 74, 91, dimText(definition, result, id === 'triangle-area' ? 'height' : 'leg-b', locale) || 'height');
    label(svg, 132, 161, dimText(definition, result, id === 'triangle-area' ? 'base' : 'leg-a', locale) || 'base');
    label(svg, 160, 84, id === 'triangle-area'
      ? (outputText(definition, result, definition.outputs[0]?.id, locale) || 'area')
      : (outputText(definition, result, 'hypotenuse', locale) || 'hypotenuse'));
  } else if (id === 'trapezoid-area') {
    const [bottom, top] = relativeSketchLengths([inputMagnitude(result, 'parallel-side-1'), inputMagnitude(result, 'parallel-side-2')], 190, 44);
    const height = scaledSketchExtent(inputMagnitude(result, 'height'), 55, 100);
    const center = 160;
    const bottomLeft = center - bottom / 2;
    const topLeft = center - top / 2;
    const topY = 145 - height;
    svg.append(element('path', { d: `M${bottomLeft} 145 L${topLeft} ${topY} L${topLeft + top} ${topY} L${center + bottom / 2} 145 Z`, ...common }));
    svg.append(element('path', { d: `M${topLeft} ${topY + 8} V145`, ...detail }));
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
    const radius = scaledSketchExtent(inputMagnitude(result, 'radius'), 44, 88);
    const height = scaledSketchExtent(inputMagnitude(result, 'height'), 52, 108);
    const center = 157;
    const baseY = 143;
    const topY = baseY - height;
    const ellipseY = Math.max(11, radius * .28);
    svg.append(element('ellipse', { cx: center, cy: baseY, rx: radius, ry: ellipseY, class: 'visual-3d-base' }));
    svg.append(element('path', { d: `M${center} ${topY} L${center - radius} ${baseY} Q${center} ${baseY + ellipseY * 1.35} ${center + radius} ${baseY} Z`, ...common, class: 'visual-3d-cone' }));
    svg.append(element('path', { d: `M${center} ${topY} V${baseY} M${center} ${baseY} H${center + radius * .9}`, ...detail }));
    label(svg, 166, 86, dimText(definition, result, 'height', locale) || 'height');
    label(svg, 188, 160, dimText(definition, result, 'radius', locale) || 'radius');
  } else if (id === 'cylinder-volume') {
    const [width, height] = relativeSketchLengths([inputMagnitude(result, 'radius') * 2, inputMagnitude(result, 'height')], 150, 48);
    const center = 154;
    const rx = width / 2;
    const ry = Math.max(12, rx * .28);
    const topY = 48;
    const bottomY = Math.min(155, topY + height);
    svg.append(element('path', { d: `M${center - rx} ${topY} C${center - rx} ${topY - ry} ${center + rx} ${topY - ry} ${center + rx} ${topY} L${center + rx} ${bottomY} C${center + rx} ${bottomY + ry} ${center - rx} ${bottomY + ry} ${center - rx} ${bottomY} Z`, class: 'visual-3d-cylinder' }));
    svg.append(element('ellipse', { cx: center, cy: topY, rx, ry, ...common, class: 'visual-3d-top' }));
    svg.append(element('path', { d: `M${center - rx} ${topY} V${bottomY} M${center + rx} ${topY} V${bottomY} M${center - rx} ${bottomY} C${center - rx} ${bottomY + ry} ${center + rx} ${bottomY + ry} ${center + rx} ${bottomY}`, ...common, fill: 'none' }));
    svg.append(element('path', { d: `M${center} ${topY} V${bottomY} M${center} ${bottomY} H${center + rx * .9}`, ...detail }));
    label(svg, 160, 93, dimText(definition, result, 'height', locale) || 'height');
    label(svg, 178, 132, dimText(definition, result, 'radius', locale) || 'radius');
  } else if (id === 'rectangle-area') {
    const [length, width] = relativeSketchLengths([inputMagnitude(result, 'length'), inputMagnitude(result, 'width')], 185, 46);
    const originX = 70;
    const originY = 61;
    const dx = width * .25;
    const dy = width * .66;
    svg.append(element('polygon', { points: `${originX},${originY} ${originX + length},${originY - 12} ${originX + length + dx},${originY + dy - 12} ${originX + dx},${originY + dy}`, class: 'visual-3d-plane' }));
    svg.append(element('path', { d: `M${originX} ${originY} L${originX + length} ${originY - 12} M${originX + dx} ${originY + dy} L${originX + length + dx} ${originY + dy - 12}`, ...detail }));
    label(svg, 120, 161, dimText(definition, result, 'length', locale) || 'length');
    label(svg, 264, 91, dimText(definition, result, 'width', locale) || 'width');
  } else {
    renderBars(svg, definition, result, 'geometry', locale);
  }
  label(svg, 318, 64, outputText(definition, result, definition.outputs[0]?.id, locale) || 'Calculated result', 'visual-result');
}

function renderMotion(svg, id, definition, result, locale) {
  if (id === 'projectile-motion-level-ground') {
    const x0 = 44;
    const y0 = 150;
    const range = inputMagnitude(result, 'launch-speed') === 0 ? 0 : Math.abs(result.outputs.range?.value || 0);
    const peakHeight = Math.abs(result.outputs['peak-height']?.value || 0);
    const horizontalExtent = range < 1e-12 ? 12 : scaledSketchExtent(range, 82, 382);
    const verticalExtent = peakHeight < 1e-12 ? 0 : scaledSketchExtent(peakHeight, 10, 105);
    const x1 = x0 + horizontalExtent;
    const controlY = y0 - Math.max(0, verticalExtent) * 2;
    const trajectory = verticalExtent < 1
      ? `M${x0} ${y0} L${x1} ${y0}`
      : `M${x0} ${y0} Q${(x0 + x1) / 2} ${controlY} ${x1} ${y0}`;
    svg.append(element('path', { d: trajectory, class: 'visual-curve visual-trajectory' }));
    svg.append(element('circle', { cx: x0, cy: y0, r: 5, class: 'visual-point' }), element('circle', { cx: x1, cy: y0, r: 5, class: 'visual-point' }));
    const angle = result.inputs['launch-angle']?.canonicalValue || 0;
    const angleLength = 30;
    const arrowX = x0 + Math.cos(angle) * angleLength;
    const arrowY = y0 - Math.sin(angle) * angleLength;
    svg.append(element('path', { d: `M${x0 + 7} ${y0 - 2} L${arrowX} ${arrowY}`, class: 'visual-arrow' }));
    label(svg, 64, 120, dimText(definition, result, 'launch-speed', locale) || 'launch speed');
    label(svg, Math.min(330, x0 + horizontalExtent * .55), 169, outputText(definition, result, 'range', locale) || 'range');
    label(svg, Math.min(330, x0 + horizontalExtent * .47), Math.max(32, y0 - verticalExtent - 8), outputText(definition, result, 'peak-height', locale) || 'peak height');
    label(svg, 42, 37, `Launch angle ${new Intl.NumberFormat(locale || 'en-US', { maximumFractionDigits: 1 }).format(angle * 180 / Math.PI)}°`, 'visual-small-label');
  } else if (id === 'simple-pendulum-period') {
    const length = inputMagnitude(result, 'length');
    const swingLength = scaledSketchExtent(length, 38, 88);
    const pivotX = 232;
    const pivotY = 35;
    const leftX = pivotX - swingLength * .62;
    const rightX = pivotX + swingLength * .62;
    const bobY = Math.min(143, pivotY + swingLength);
    svg.append(element('path', { d: `M${pivotX} ${pivotY} L${leftX} ${bobY} M${pivotX} ${pivotY} L${rightX} ${bobY}`, class: 'visual-curve' }));
    svg.append(element('circle', { cx: pivotX, cy: pivotY, r: 7, class: 'visual-point' }), element('circle', { cx: leftX, cy: bobY, r: 14, class: 'visual-node' }), element('circle', { cx: rightX, cy: bobY, r: 14, class: 'visual-node' }));
    label(svg, 232, 166, outputText(definition, result, definition.outputs[0]?.id, locale) || 'period');
    label(svg, 68, 74, dimText(definition, result, 'length', locale) || 'length');
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
  // Do not invent a two-resistor topology for every electrical formula.
  if (definition.id !== 'ohms-law') return renderProcess(svg, definition, result, locale);
  svg.append(element('path', { d: 'M90 82 V54 H194 M274 54 H390 V142 H90 V112', class: 'visual-wire' }));
  svg.append(element('circle', { cx:90,cy:97,r:15,class:'visual-component-alt' }));
  label(svg,85,94,'+'); label(svg,86,108,'−');
  svg.append(element('rect',{x:194,y:42,width:80,height:24,rx:3,class:'visual-component'}));
  label(svg,230,58,'R');
  svg.append(element('path',{d:'M310 54 H348 M340 48 L348 54 L340 60',class:'visual-arrow'}));
  label(svg,48,176,outputText(definition,result,'voltage',locale));
  label(svg,278,176,outputText(definition,result,'current',locale));
  label(svg,169,103,outputText(definition,result,'resistance',locale));
  label(svg,170,125,'Ideal DC resistor · V = I × R','visual-small-label');
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

function gearToothPath(teeth, rootRadius, tipRadius) {
  const displayedTeeth = Math.min(64, Math.max(4, Math.round(teeth)));
  const points = [];
  for (let tooth = 0; tooth < displayedTeeth; tooth += 1) {
    const start = (tooth / displayedTeeth) * Math.PI * 2;
    for (const [fraction, radius] of [[0, rootRadius], [.18, rootRadius], [.25, tipRadius], [.75, tipRadius], [.82, rootRadius], [1, rootRadius]]) {
      const angle = start + fraction * Math.PI * 2 / displayedTeeth;
      points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
  }
  return `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;
}

function renderGearPair(svg, definition, result, locale) {
  const driver = result.inputs['driver-teeth']?.canonicalValue;
  const driven = result.inputs['driven-teeth']?.canonicalValue;
  if (!(driver > 0 && driven > 0)) return renderProcess(svg, definition, result, locale);
  const ratio = result.outputs['speed-ratio']?.value || driver / driven;
  const sum = driver + driven;
  const driverRadius = Math.max(30, Math.min(82, 154 * driver / sum));
  const drivenRadius = Math.max(30, Math.min(82, 154 * driven / sum));
  const left = 240 - driverRadius - drivenRadius;
  const driverX = left + driverRadius;
  const drivenX = driverX + driverRadius + drivenRadius;
  const centerY = 91;
  const inputRadPerSecond = Math.abs(result.inputs['input-speed']?.canonicalValue || 0);
  const inputRpm = inputRadPerSecond * 60 / (Math.PI * 2);
  const inputDuration = Math.max(.8, Math.min(8, inputRpm > 0 ? 60 / inputRpm : 4));
  const outputDuration = Math.max(.8, Math.min(8, inputDuration / Math.max(.05, Math.abs(ratio))));
  for (const [cx, radius, teeth, className, duration] of [
    [driverX, driverRadius, driver, 'visual-gear-motion visual-gear-driver', inputDuration],
    [drivenX, drivenRadius, driven, 'visual-gear-motion visual-gear-driven', outputDuration],
  ]) {
    const group = element('g', {
      class: className,
      transform: `translate(${cx} ${centerY})`,
      'data-tooth-count': teeth,
      style: `transform-origin:${cx}px ${centerY}px;animation-duration:${duration.toFixed(2)}s`,
    });
    const toothPath = gearToothPath(teeth, radius * .87, radius);
    group.append(element('path', { d: toothPath, transform: 'translate(0 7)', class: 'visual-gear-depth' }));
    group.append(element('path', { d: toothPath, class: 'visual-gear-shape' }));
    group.append(element('ellipse', { cx: 0, cy: 6, rx: Math.max(8, radius * .2), ry: Math.max(6, radius * .16), class: 'visual-gear-hub-depth' }));
    group.append(element('circle', { r: Math.max(8, radius * .2), class: 'visual-gear-hub' }));
    group.append(element('circle', { r: 3, class: 'visual-gear-center' }));
    svg.append(group);
  }
  svg.append(element('path', { d: `M${driverX + driverRadius * .52} ${centerY - driverRadius * .66} Q240 14 ${drivenX - drivenRadius * .52} ${centerY - drivenRadius * .66}`, class: 'visual-gear-speed-arc' }));
  label(svg, Math.max(26, driverX - 42), 29, `DRIVER · ${driver} TEETH`, 'visual-gear-label');
  label(svg, Math.min(324, drivenX - 42), 29, `DRIVEN · ${driven} TEETH`, 'visual-gear-label');
  label(svg, 30, 177, `Input ${dimText(definition, result, 'input-speed', locale) || ''}`, 'visual-label');
  label(svg, 264, 177, outputText(definition, result, 'output-speed', locale) || 'Output speed', 'visual-result');
  label(svg, 193, 150, `Speed ratio ${new Intl.NumberFormat(locale || 'en-US', { maximumSignificantDigits: 4 }).format(ratio)}`, 'visual-small-label');
  label(svg, 154, 165, 'Schematic gear sizes are illustrative; tooth form, mesh, strength, and load are not modeled.', 'visual-footnote');
}

function renderProcess(svg, definition, result, locale) {
  if (definition.id === 'gear-pair-output-speed') return renderGearPair(svg, definition, result, locale);
  if (definition.inputs.length > 3) {
    const positions = [[14, 27], [14, 97], [135, 27], [135, 97]];
    const count = Math.min(definition.inputs.length, positions.length);
    for (let i = 0; i < count; i += 1) {
      const field = definition.inputs[i];
      const [x, y] = positions[i];
      svg.append(element('rect', { x, y, width: 108, height: 52, rx: 7, class: i === count - 1 ? 'visual-node-alt' : 'visual-node' }));
      label(svg, x + 7, y + 19, field.label.slice(0, 16), 'visual-small-label');
      label(svg, x + 7, y + 38, dimText(definition, result, field.id, locale)?.slice(0, 15) || '—', 'visual-label');
      svg.append(element('path', { d: `M${x + 109} ${y + 26} H261 V95 H274`, class: 'visual-arrow' }));
    }
    svg.append(element('rect', { x: 278, y: 62, width: 176, height: 68, rx: 7, class: 'visual-node-alt' }));
    label(svg, 290, 87, definition.outputs[0]?.label || 'Calculated result', 'visual-small-label');
    label(svg, 290, 111, outputText(definition, result, definition.outputs[0]?.id, locale) || 'Result available', 'visual-result');
    label(svg, 14, 174, definition.inputs.length > count ? `Showing ${count} of ${definition.inputs.length} inputs; review the rest in the method.` : 'Schematic only · see method and limits.', 'visual-footnote');
    return;
  }
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
  if (definition.inputs.length > 3) {
    renderProcess(svg, definition, result, locale);
    return;
  }
  const inputs = definition.inputs.slice(0, 3);
  const output = definition.outputs[0];
  const positions = inputs.length > 2 ? [[14, 36], [14, 78], [14, 120]] : inputs.length > 1 ? [[20, 48], [20, 112]] : [[28, 78]];
  inputs.forEach((field, index) => {
    const [x, y] = positions[index];
    const record = result.inputs[field.id];
    const text = record ? new Intl.NumberFormat(locale, { maximumSignificantDigits: 5 }).format(record.canonicalValue) : '—';
    const width = inputs.length > 2 ? 145 : 154;
    const height = inputs.length > 2 ? 36 : 43;
    svg.append(element('rect', { x, y, width, height, rx: 5, class: 'visual-node' }));
    label(svg, x + 8, y + 14, field.label.slice(0, 21), 'visual-small-label');
    label(svg, x + 8, y + 29, `${text} ${field.canonicalUnit === '1' ? field.unitLabel || '' : field.canonicalUnit}`.trim(), 'visual-label');
  });
  const targetY = inputs.length > 2 ? 95 : 100;
  const routes = inputs.map((_, index) => {
    const [x, y] = positions[index];
    const startY = y + (inputs.length > 2 ? 18 : 21);
    return `M${x + (inputs.length > 2 ? 147 : 156)} ${startY} H219 V${targetY} H252`;
  }).join(' ');
  svg.append(element('path', { d: routes, class: 'visual-arrow' }));
  svg.append(element('rect', { x: 260, y: 62, width: 190, height: 72, rx: 7, class: 'visual-node-alt' }));
  label(svg, 274, 88, output?.label || 'Calculated result', 'visual-small-label');
  label(svg, 274, 113, outputText(definition, result, output?.id, locale) || 'Result available', 'visual-result');
  label(svg, 20, 174, definition.inputs.length > inputs.length ? `Showing ${inputs.length} of ${definition.inputs.length} inputs; all are listed in the method.` : kind === 'trend' ? 'Outcome summary only; this is not a forecast.' : 'Schematic summary; see the method steps for the calculation.', 'visual-footnote');
}

export function visualizationProfile(definition) {
  if (definition.visualization && VISUAL_KINDS.has(definition.visualization.kind)) return definition.visualization;
  const profile = PROFILES[definition.id];
  if (!profile) {
    const context = `${definition.title} ${definition.description} ${definition.discipline} ${definition.category} ${(definition.fields || []).join(' ')}`.toLowerCase();
    const kind = /circuit|electrical|voltage|current|resistan/.test(context) ? 'circuit'
      : /flow|fluid|hydraulic|pipe|pump/.test(context) ? 'flow'
        : /thermal|heat|temperature|conduction|cooling|hvac/.test(context) ? 'thermal'
          : /geometry|area|volume|shape|construction|civil|site|building/.test(context) ? 'geometry'
            : /motion|mechanical|force|energy|physics|speed|velocity|torque/.test(context) ? 'motion'
              : /chemistry|mining|ore|grade|concentration|molar|reaction/.test(context) ? 'balance'
                : /finance|business|money|price|profit|margin|statistic|percentage|percent/.test(context) ? 'trend'
                  : /software|hardware|data|cloud|network|storage|render|model|artificial intelligence|ai infrastructure/.test(context) ? 'capacity'
                    : 'diagram';
    const title = `${definition.title} · calculation map`;
    return { kind, title, description: `Visual summary of the entered values and calculated output for ${definition.title}. It is a schematic aid; use the displayed method, units, assumptions, and limitations for interpretation.` };
  }
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
