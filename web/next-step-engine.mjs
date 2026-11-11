import { createWorkflowHandoff } from '../src/calculation-core/index.mjs';

const VERIFIED_EDGES = Object.freeze({
  'rectangle-area': [{ calculatorId: 'rectangular-prism-volume', outputId: 'area', inputId: 'base-area', reason: 'Use the calculated area as the prism base, then add depth to estimate volume.' }],
  'volumetric-flow-rate': [
    { calculatorId: 'mass-flow-rate', outputId: 'flow-rate', inputId: 'flow-rate', reason: 'Add fluid density to convert volume flow into mass flow.' },
    { calculatorId: 'hydraulic-pump-input-power', outputId: 'flow-rate', inputId: 'flow-rate', reason: 'Add head and efficiency to estimate idealized pump input power.' },
  ],
  'work-done': [{ calculatorId: 'mechanical-power', outputId: 'work', inputId: 'work', reason: 'Add elapsed time to estimate average power.' }],
  'dc-electric-power': [{ calculatorId: 'electrical-energy-power-time', outputId: 'power', inputId: 'power', reason: 'Add duration to estimate energy use.' }],
  'electrical-energy-power-time': [{ calculatorId: 'household-electricity-cost', outputId: 'energy', inputId: 'energy-use', reason: 'Add your tariff to estimate an energy charge.' }],
  'ideal-gas-pressure': [{ calculatorId: 'ideal-gas-density', outputId: 'pressure', inputId: 'absolute-pressure', reason: 'Add gas molar mass and temperature to continue the ideal-gas estimate.' }],
  'gear-pair-output-speed': [{ calculatorId: 'rotational-power-from-torque-speed', outputId: 'output-speed', inputId: 'angular-speed', reason: 'Add output-shaft torque to estimate rotational power.' }],
  'compound-growth-estimate': [{ calculatorId: 'percentage-change', outputId: 'ending-amount', inputId: 'new', reason: 'Compare the illustrative ending amount with a starting amount.' }],
});

const inputDimensionIndex = new WeakMap();
function dimensionKey(dimension) {
  return Object.entries(dimension || {}).sort(([left], [right]) => left.localeCompare(right))
    .map(([name, exponent]) => `${name}:${exponent}`).join('|');
}

function indexedInputs(calculators) {
  let index = inputDimensionIndex.get(calculators);
  if (index) return index;
  index = new Map();
  for (const targetDefinition of calculators) {
    for (const inputField of targetDefinition.inputs) {
      const key = dimensionKey(inputField.dimension);
      if (!index.has(key)) index.set(key, []);
      index.get(key).push({ targetDefinition, inputField });
    }
  }
  inputDimensionIndex.set(calculators, index);
  return index;
}

const wordSet = value => new Set(String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(word => word.length > 2));
const overlap = (left, right) => [...left].filter(word => right.has(word)).length;

function scalarKind(field) {
  const text = `${field.id} ${field.label}`.toLowerCase();
  if (/amount|currency|price|cost|revenue|income|loan|debt|cash|payment|profit|principal|saving|sale|fee|budget|capital|commission|expenditure|expense|subtotal|tax amount|estimated tax/.test(text)) return 'money';
  if (/percent|percentage|ratio|fraction|margin|yield|efficiency|utilization|tax rate/.test(text)) return 'ratio';
  if (/count|number of|items|people|workers|units|pixels|frames|tokens|requests|samples|steps|cycles|teeth|rows|columns/.test(text)) return 'count';
  if (/time|duration|period|years|months|seconds|minutes|hours/.test(text)) return 'time';
  return null;
}

function scalarSemanticsCompatible(output, input) {
  const hasPhysicalDimension = field => Object.values(field.dimension || {}).some(exponent => exponent !== 0);
  if (hasPhysicalDimension(output) || hasPhysicalDimension(input)) return true;
  const outputKind = scalarKind(output);
  const inputKind = scalarKind(input);
  return !(outputKind && inputKind && outputKind !== inputKind);
}

function rationale(source, output, target, input, authoredReason) {
  if (authoredReason) return authoredReason;
  const shared = overlap(wordSet(`${source.discipline} ${source.fields.join(' ')} ${source.category} ${source.keywords.join(' ')}`), wordSet(`${target.discipline} ${target.fields.join(' ')} ${target.category} ${target.keywords.join(' ')}`));
  if (shared >= 2) return `Continue in ${target.discipline}: carry ${output.label.toLowerCase()} into ${input.label.toLowerCase()} and add the remaining inputs.`;
  return `Reuse ${output.label.toLowerCase()} as ${input.label.toLowerCase()}; the compatible value will be filled in and remain editable.`;
}

/** Return every published, dimensionally valid handoff. Per-field workflow allowlists remain authoritative. */
export function compatibleNextSteps(sourceDefinition, sourceResult, calculators) {
  const authored = sourceDefinition.nextSteps?.length ? sourceDefinition.nextSteps : VERIFIED_EDGES[sourceDefinition.id] || [];
  const edges = new Map();
  for (const edge of authored) edges.set(`${edge.calculatorId}.${edge.outputId}.${edge.inputId}`, { ...edge, authored: true });

  const candidates = [];
  const inputsByDimension = indexedInputs(calculators);
  for (const outputField of sourceDefinition.outputs) {
    for (const { targetDefinition, inputField } of inputsByDimension.get(dimensionKey(outputField.dimension)) || []) {
      if (targetDefinition.id === sourceDefinition.id) continue;
      if (!scalarSemanticsCompatible(outputField, inputField)) continue;
      const key = `${targetDefinition.id}.${outputField.id}.${inputField.id}`;
      const edge = edges.get(key);
      try {
        const handoff = createWorkflowHandoff({ sourceDefinition, sourceResult, outputId: outputField.id, targetDefinition, inputId: inputField.id });
        const contextWords = wordSet(`${sourceDefinition.discipline} ${sourceDefinition.fields.join(' ')} ${sourceDefinition.category} ${sourceDefinition.keywords.join(' ')}`);
        const targetWords = wordSet(`${targetDefinition.discipline} ${targetDefinition.fields.join(' ')} ${targetDefinition.category} ${targetDefinition.keywords.join(' ')}`);
        const inputWords = wordSet(`${inputField.label} ${inputField.id}`);
        const outputWords = wordSet(`${outputField.label} ${outputField.id}`);
        const semantic = overlap(contextWords, targetWords) * 4 + overlap(outputWords, inputWords) * 5;
        candidates.push({
          outputField, targetDefinition, inputField, handoff,
          reason: rationale(sourceDefinition, outputField, targetDefinition, inputField, edge?.reason),
          score: (edge?.authored ? 1000 : 0) + semantic,
        });
      } catch { /* Incompatible dimensions, restricted workflow links, or unpublished tools are excluded. */ }
    }
  }
  return candidates.sort((a, b) => b.score - a.score || a.targetDefinition.title.localeCompare(b.targetDefinition.title));
}

function relatedNextSteps(sourceDefinition, calculators) {
  const sourceWords = wordSet(`${sourceDefinition.discipline} ${sourceDefinition.fields.join(' ')} ${sourceDefinition.category} ${sourceDefinition.keywords.join(' ')}`);
  return calculators.flatMap(targetDefinition => {
    if (targetDefinition.id === sourceDefinition.id) return [];
    const targetWords = wordSet(`${targetDefinition.discipline} ${targetDefinition.fields.join(' ')} ${targetDefinition.category} ${targetDefinition.keywords.join(' ')}`);
    const score = overlap(sourceWords, targetWords);
    if (score < 2) return [];
    return [{
      targetDefinition,
      handoff: null,
      reason: `Explore a related ${targetDefinition.discipline.toLowerCase()} tool. Its inputs use different units or dimensions, so no result is prefilled.`,
      score,
    }];
  }).sort((a, b) => b.score - a.score || a.targetDefinition.title.localeCompare(b.targetDefinition.title));
}

/** Show safe carry-forward options first, then related tools when no direct handoff exists. */
export function recommendNextSteps(sourceDefinition, sourceResult, calculators, compatible = null) {
  const valid = compatible || compatibleNextSteps(sourceDefinition, sourceResult, calculators);
  const top = [];
  const chosen = new Set();
  for (const option of valid) {
    if (chosen.has(option.targetDefinition.id)) continue;
    chosen.add(option.targetDefinition.id);
    top.push(option);
    if (top.length === 3) break;
  }
  if (top.length === 3) return top;
  const existing = new Set(top.map(option => option.targetDefinition.id));
  return [...top, ...relatedNextSteps(sourceDefinition, calculators).filter(option => !existing.has(option.targetDefinition.id)).slice(0, 3 - top.length)];
}
