import { CalculationError } from './errors.mjs';
import { dimensionsEqual } from './dimensions.mjs';
import { validateDefinition } from './definition.mjs';
import { convertValue, getUnit } from './units.mjs';

export function createWorkflowHandoff({ sourceDefinition, sourceResult, outputId, targetDefinition, inputId }) {
  validateDefinition(sourceDefinition);
  validateDefinition(targetDefinition);
  if (sourceDefinition.visibility !== 'public' || sourceDefinition.release.status !== 'published'
    || targetDefinition.visibility !== 'public' || targetDefinition.release.status !== 'published') {
    throw new CalculationError('WORKFLOW_CALCULATOR_NOT_PUBLISHED', 'Workflow handoffs require published calculators.');
  }
  if (!sourceResult || sourceResult.status !== 'success'
    || sourceResult.calculatorId !== sourceDefinition.id
    || sourceResult.methodVersion !== sourceDefinition.version) {
    throw new CalculationError('WORKFLOW_SOURCE_MISMATCH', 'The source result does not match the selected calculator version.');
  }

  const outputField = sourceDefinition.outputs.find(field => field.id === outputId);
  const outputValue = sourceResult.outputs?.[outputId];
  const inputField = targetDefinition.inputs.find(field => field.id === inputId);
  if (!outputField || !outputValue || !inputField) {
    throw new CalculationError('WORKFLOW_FIELD_NOT_FOUND', 'Choose an available result and a compatible input field.');
  }
  if (!dimensionsEqual(outputField.dimension, inputField.dimension)) {
    throw new CalculationError('WORKFLOW_DIMENSION_MISMATCH', 'These results measure different kinds of quantity and cannot be connected.', {
      outputId,
      inputId,
    });
  }
  if ((outputField.semanticType || inputField.semanticType) && outputField.semanticType !== inputField.semanticType) {
    throw new CalculationError('WORKFLOW_SEMANTIC_MISMATCH', 'These quantities share units but represent different concepts.');
  }
  if (inputField.workflowFrom && !inputField.workflowFrom.includes(`${sourceDefinition.id}.${outputId}`)) {
    throw new CalculationError('WORKFLOW_LINK_NOT_ALLOWED', 'This input is not configured to receive that result in the current workflow.');
  }

  const sourceUnit = getUnit(outputValue.unit);
  const targetUnit = getUnit(inputField.canonicalUnit);
  if (sourceUnit.temperatureKind !== targetUnit.temperatureKind) {
    throw new CalculationError('WORKFLOW_TEMPERATURE_KIND_MISMATCH', 'Absolute temperature and temperature differences cannot be connected.');
  }
  const carriedValue = convertValue(outputValue.value, outputValue.unit, inputField.canonicalUnit);
  if ((inputField.range?.min !== undefined && carriedValue < inputField.range.min)
    || (inputField.range?.max !== undefined && carriedValue > inputField.range.max)
    || (inputField.integer && !Number.isSafeInteger(carriedValue))) {
    throw new CalculationError('WORKFLOW_OUTSIDE_INPUT_DOMAIN', 'This result falls outside the destination input’s supported range.');
  }
  return Object.freeze({
    targetCalculatorId: targetDefinition.id,
    targetInputId: inputId,
    value: carriedValue,
    unit: inputField.canonicalUnit,
    source: Object.freeze({
      calculatorId: sourceDefinition.id,
      methodVersion: sourceDefinition.version,
      outputId,
      value: outputValue.value,
      unit: outputValue.unit,
      calculatedAt: sourceResult.calculatedAt,
      unitRegistryVersion: sourceResult.unitRegistryVersion,
    }),
  });
}
