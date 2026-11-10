import { createWorkflowHandoff } from '../src/calculation-core/index.mjs';

const VERIFIED_EDGES = Object.freeze({
  'rectangle-area': [
    { calculatorId: 'rectangular-prism-volume', outputId: 'area', inputId: 'base-area', reason: 'Use the rectangle’s area as the prism base, then enter its depth to estimate volume.' },
  ],
  'volumetric-flow-rate': [
    { calculatorId: 'mass-flow-rate', outputId: 'flow-rate', inputId: 'flow-rate', reason: 'Convert the calculated volume flow into mass flow by adding the fluid density.' },
    { calculatorId: 'hydraulic-pump-input-power', outputId: 'flow-rate', inputId: 'flow-rate', reason: 'Continue to an idealized pump input-power estimate using this flow and your fluid, head, and efficiency values.' },
  ],
  'work-done': [
    { calculatorId: 'mechanical-power', outputId: 'work', inputId: 'work', reason: 'Estimate average power from this work and an elapsed time.' },
  ],
  'dc-electric-power': [
    { calculatorId: 'electrical-energy-power-time', outputId: 'power', inputId: 'power', reason: 'Estimate energy use from this power and a duration.' },
  ],
  'electrical-energy-power-time': [
    { calculatorId: 'household-electricity-cost', outputId: 'energy', inputId: 'energy-use', reason: 'Estimate an energy charge with your tariff per kilowatt-hour.' },
  ],
  'ideal-gas-pressure': [
    { calculatorId: 'ideal-gas-density', outputId: 'pressure', inputId: 'absolute-pressure', reason: 'Continue the ideal-gas estimate by adding gas molar mass and absolute temperature to calculate density.' },
  ],
  'gear-pair-output-speed': [
    { calculatorId: 'rotational-power-from-torque-speed', outputId: 'output-speed', inputId: 'angular-speed', reason: 'Estimate ideal rotational power after entering the output-shaft torque.' },
  ],
  'compound-growth-estimate': [
    { calculatorId: 'percentage-change', outputId: 'ending-amount', inputId: 'new', reason: 'Compare this illustrative ending amount with a starting amount you choose.' },
  ],
});

/**
 * Suggest only authored next-step edges. Each candidate is revalidated through
 * the same dimension and workflow checks as a manual result handoff.
 */
export function recommendNextSteps(sourceDefinition, sourceResult, calculators) {
  const byId = new Map(calculators.map(definition => [definition.id, definition]));
  const authored = sourceDefinition.nextSteps?.length ? sourceDefinition.nextSteps : VERIFIED_EDGES[sourceDefinition.id] || [];
  const suggestions = [];
  for (const edge of authored) {
    const targetDefinition = byId.get(edge.calculatorId);
    if (!targetDefinition) continue;
    const outputField = sourceDefinition.outputs.find(field => field.id === edge.outputId);
    const inputField = targetDefinition.inputs.find(field => field.id === edge.inputId);
    if (!outputField || !inputField) continue;
    try {
      const handoff = createWorkflowHandoff({ sourceDefinition, sourceResult, outputId: edge.outputId, targetDefinition, inputId: edge.inputId });
      suggestions.push({ outputField, targetDefinition, inputField, handoff, reason: edge.reason });
    } catch { /* Invalid or dimensionally incompatible edges never reach the user. */ }
  }
  return suggestions.slice(0, 3);
}
