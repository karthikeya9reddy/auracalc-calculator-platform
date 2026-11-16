import { CalculationError } from './errors.mjs';
import { assertSameFieldDimension, validateDefinition } from './definition.mjs';
import { parseLocalizedNumber } from './number-input.mjs';
import { convertValue, getUnit, UNIT_REGISTRY_VERSION } from './units.mjs';

const EXECUTABLE_STATUSES = new Set(['published']);

export function executeCalculation(definition, rawInputs, options = {}) {
  validateDefinition(definition);
  if (definition.visibility === 'test-only' && options.allowTestFixtures !== true) {
    throw new CalculationError('TEST_FIXTURE_NOT_ALLOWED', 'Test-only calculations cannot run in a product session.');
  }
  const permittedTestFixture = definition.visibility === 'test-only'
    && definition.release.status === 'test-only'
    && options.allowTestFixtures === true;
  const permittedVerifiedReview = definition.visibility === 'public'
    && definition.release.status === 'verified'
    && options.allowVerifiedReview === true;
  if (!EXECUTABLE_STATUSES.has(definition.release.status) && !permittedTestFixture && !permittedVerifiedReview) {
    const code = definition.release.status === 'verified' ? 'CALCULATOR_NOT_PUBLISHED' : 'CALCULATOR_NOT_VERIFIED';
    throw new CalculationError(code, 'This calculation is not released for this execution context.', { calculatorId: definition.id, status: definition.release.status });
  }
  if (!rawInputs || typeof rawInputs !== 'object' || Array.isArray(rawInputs)) {
    throw new CalculationError('INVALID_INPUT_SET', 'Calculation inputs must be provided as an object.');
  }

  const locale = options.locale || 'en-US';
  const declaredInputIds = new Set(definition.inputs.map(field => field.id));
  const unknownInputId = Object.keys(rawInputs).find(inputId => !declaredInputIds.has(inputId));
  if (unknownInputId) {
    throw new CalculationError('UNKNOWN_INPUT', 'An input was provided that is not defined by this calculator.', { fieldId: unknownInputId });
  }

  const parsedInputs = Object.create(null);
  const inputRecords = Object.create(null);
  for (const field of definition.inputs) {
    const raw = Object.hasOwn(rawInputs, field.id) ? rawInputs[field.id] : undefined;
    const candidateValue = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw.value : raw;
    if (candidateValue === undefined || candidateValue === null || (typeof candidateValue === 'string' && !candidateValue.trim())) {
      if (field.required === false) continue;
      throw new CalculationError('MISSING_INPUT', `Enter a value for ${field.label || field.id}.`, { fieldId: field.id });
    }

    let rawValue;
    let unitId;
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      rawValue = raw.value;
      if (typeof raw.unit === 'string' && raw.unit.trim()) {
        unitId = raw.unit;
      } else if (field.acceptedUnits.length === 1) {
        unitId = field.acceptedUnits[0];
      } else {
        throw new CalculationError('UNIT_REQUIRED', `Choose a unit for ${field.label || field.id}.`, { fieldId: field.id });
      }
    } else {
      rawValue = raw;
      if (field.acceptedUnits.length !== 1) {
        throw new CalculationError('UNIT_REQUIRED', `Choose a unit for ${field.label || field.id}.`, { fieldId: field.id });
      }
      unitId = field.acceptedUnits[0];
    }
    if (!field.acceptedUnits.includes(unitId)) {
      throw new CalculationError('UNIT_NOT_ACCEPTED', `The selected unit is not accepted for ${field.label || field.id}.`, { fieldId: field.id, unitId });
    }

    const value = parseLocalizedNumber(rawValue, locale, { allowMagnitudeWords: field.allowMagnitudeWords === true });
    assertSameFieldDimension(field, unitId);
    if (getUnit(unitId).temperatureKind === 'absolute' && convertValue(value, unitId, 'K') < 0) {
      throw new CalculationError('INPUT_BELOW_ABSOLUTE_ZERO', `${field.label || field.id} cannot be below absolute zero.`, { fieldId: field.id });
    }
    const canonicalValue = convertValue(value, unitId, field.canonicalUnit);
    if (field.integer && !Number.isInteger(canonicalValue)) {
      throw new CalculationError('WHOLE_NUMBER_REQUIRED', `${field.label || field.id} must be a whole number.`, { fieldId: field.id });
    }
    if (field.range?.min !== undefined && canonicalValue < field.range.min) {
      throw new CalculationError('INPUT_BELOW_MINIMUM', `${field.label || field.id} is below the supported minimum.`, { fieldId: field.id, minimum: field.range.min, unit: field.canonicalUnit });
    }
    if (field.range?.max !== undefined && canonicalValue > field.range.max) {
      throw new CalculationError('INPUT_ABOVE_MAXIMUM', `${field.label || field.id} is above the supported maximum.`, { fieldId: field.id, maximum: field.range.max, unit: field.canonicalUnit });
    }

    const quantity = Object.freeze({
      value: canonicalValue,
      unit: field.canonicalUnit,
      dimension: field.dimension,
      temperatureKind: getUnit(field.canonicalUnit).temperatureKind,
      baseValue: false,
    });
    parsedInputs[field.id] = quantity;
    inputRecords[field.id] = Object.freeze({
      enteredValue: value,
      enteredText: typeof rawValue === 'string' ? rawValue : null,
      enteredUnit: unitId,
      canonicalValue,
      canonicalUnit: field.canonicalUnit,
      dimension: field.dimension,
    });
  }

  const methodContext = Object.freeze({
    calculatorId: definition.id,
    methodVersion: definition.version,
    locale,
    unitRegistryVersion: UNIT_REGISTRY_VERSION,
  });
  let methodResult;
  try {
    methodResult = definition.calculate(Object.freeze(parsedInputs), methodContext);
  } catch (error) {
    if (error instanceof CalculationError) throw error;
    throw new CalculationError('CALCULATION_FAILED', 'The calculation method failed. No result is available.', { calculatorId: definition.id, methodVersion: definition.version });
  }

  const outputs = validateAndNormalizeOutputs(definition, methodResult);
  const clock = options.clock || (() => new Date());
  const calculatedAt = clock();
  if (!(calculatedAt instanceof Date) || !Number.isFinite(calculatedAt.getTime())) {
    throw new CalculationError('INVALID_CALCULATION_TIME', 'The calculation clock returned an invalid timestamp.');
  }

  return Object.freeze({
    calculatorId: definition.id,
    methodVersion: definition.version,
    status: 'success',
    calculatedAt: calculatedAt.toISOString(),
    locale,
    unitRegistryVersion: UNIT_REGISTRY_VERSION,
    inputs: Object.freeze(inputRecords),
    outputs: Object.freeze(outputs),
    intermediates: methodResult.intermediates === undefined ? null : cloneStructuredData(methodResult.intermediates, 'intermediates'),
    warnings: cloneStructuredData([...(definition.warnings || []), ...(methodResult.warnings || [])], 'warnings'),
    provenance: cloneStructuredData({
      riskClass: definition.riskClass,
      releaseStatus: definition.release.status,
      reviewers: definition.release.reviewers || [],
      evidenceIds: definition.release.evidenceIds || [],
      references: definition.references || [],
      method: definition.method,
      precision: definition.precision,
      rounding: definition.rounding,
      assumptions: definition.assumptions,
      exclusions: definition.exclusions,
      limitations: definition.limitations || [],
    }, 'provenance'),
  });
}

function validateAndNormalizeOutputs(definition, methodResult) {
  if (!methodResult || typeof methodResult !== 'object' || !methodResult.outputs || typeof methodResult.outputs !== 'object') {
    throw new CalculationError('INVALID_CALCULATION_OUTPUT', 'The calculation method did not return structured outputs.', { calculatorId: definition.id });
  }
  const expectedIds = definition.outputs.map(field => field.id).sort();
  const actualIds = Object.keys(methodResult.outputs).sort();
  if (expectedIds.length !== actualIds.length || expectedIds.some((id, index) => id !== actualIds[index])) {
    throw new CalculationError('OUTPUT_SCHEMA_MISMATCH', 'The calculation method returned a different set of outputs than its definition.', { calculatorId: definition.id });
  }
  if (methodResult.warnings !== undefined && (!Array.isArray(methodResult.warnings) || methodResult.warnings.some(warning => typeof warning !== 'string' || !warning.trim()))) {
    throw new CalculationError('INVALID_CALCULATION_WARNING', 'Calculation warnings must be an array of text messages.', { calculatorId: definition.id });
  }

  const outputs = Object.create(null);
  for (const field of definition.outputs) {
    const result = methodResult.outputs[field.id];
    if (!result || typeof result !== 'object' || typeof result.value !== 'number' || !Number.isFinite(result.value) || typeof result.unit !== 'string') {
      throw new CalculationError('INVALID_OUTPUT_VALUE', `The calculation returned an invalid value for ${field.label || field.id}.`, { fieldId: field.id });
    }
    if (!field.acceptedUnits.includes(result.unit)) {
      throw new CalculationError('OUTPUT_UNIT_NOT_ACCEPTED', `The calculation returned an unsupported unit for ${field.label || field.id}.`, { fieldId: field.id, unitId: result.unit });
    }
    assertSameFieldDimension(field, result.unit);
    if (getUnit(result.unit).temperatureKind === 'absolute' && convertValue(result.value, result.unit, 'K') < 0) {
      throw new CalculationError('OUTPUT_BELOW_ABSOLUTE_ZERO', `The calculation returned an absolute temperature below zero kelvin.`, { fieldId: field.id });
    }
    const canonicalValue = convertValue(result.value, result.unit, field.canonicalUnit);
    outputs[field.id] = Object.freeze({
      value: canonicalValue,
      unit: field.canonicalUnit,
      methodValue: result.value,
      methodUnit: result.unit,
      dimension: field.dimension,
    });
  }
  return outputs;
}

function cloneStructuredData(value, label, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new CalculationError('INVALID_STRUCTURED_RESULT', `${label} contains a non-finite number.`);
    return value;
  }
  if (typeof value !== 'object') throw new CalculationError('INVALID_STRUCTURED_RESULT', `${label} contains an unsupported value.`);
  if (ancestors.has(value)) throw new CalculationError('INVALID_STRUCTURED_RESULT', `${label} contains a circular reference.`);
  ancestors.add(value);
  let copy;
  if (Array.isArray(value)) {
    copy = value.map(item => cloneStructuredData(item, label, ancestors));
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new CalculationError('INVALID_STRUCTURED_RESULT', `${label} must contain plain objects only.`);
    }
    copy = Object.create(null);
    for (const [key, child] of Object.entries(value)) copy[key] = cloneStructuredData(child, label, ancestors);
  }
  ancestors.delete(value);
  return Object.freeze(copy);
}
