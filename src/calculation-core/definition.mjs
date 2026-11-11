import { CalculationError } from './errors.mjs';
import { dimensionsEqual } from './dimensions.mjs';
import { assertUnitDimension } from './units.mjs';

const VALID_STATUSES = new Set(['discovered', 'specified', 'reviewed', 'verified', 'published', 'test-only', 'paused', 'retired']);
const VALID_RISK_CLASSES = new Set(['R0', 'R1', 'R2', 'R3']);
const VISUALIZATION_KINDS = new Set(['diagram', 'geometry', 'motion', 'circuit', 'flow', 'thermal', 'process', 'capacity', 'trend', 'balance']);
const STABLE_ID = /^[a-z0-9][a-z0-9._-]*$/;
const WORKFLOW_SOURCE_ID = /^[a-z0-9][a-z0-9_-]*\.[a-z0-9][a-z0-9_-]*$/;

export function validateDefinition(definition) {
  if (!definition || typeof definition !== 'object') {
    throw new CalculationError('INVALID_DEFINITION', 'A calculator definition must be an object.');
  }

  for (const key of [
    'id', 'version', 'title', 'discipline', 'category', 'description', 'purpose', 'intendedAudience',
    'riskClass', 'inputs', 'outputs', 'method', 'precision', 'rounding', 'assumptions', 'exclusions',
    'warnings', 'limitations', 'references', 'verificationCases', 'calculate', 'release',
  ]) {
    if (definition[key] === undefined || definition[key] === null) {
      throw new CalculationError('INCOMPLETE_DEFINITION', `Calculator definition is missing ${key}.`, { key });
    }
  }
  if (!STABLE_ID.test(definition.id)) throw new CalculationError('INVALID_CALCULATOR_ID', 'Calculator IDs must use lowercase letters, digits, dots, underscores, or hyphens.');
  if (typeof definition.version !== 'string' || definition.version.trim() === '') throw new CalculationError('INVALID_VERSION', 'A calculator must have a non-empty method version.');
  for (const key of ['title', 'discipline', 'category', 'description', 'purpose']) {
    if (typeof definition[key] !== 'string' || definition[key].trim() === '') {
      throw new CalculationError('INVALID_DEFINITION_TEXT', `Calculator ${key} must be non-empty.`, { key });
    }
  }
  if (!(typeof definition.intendedAudience === 'string' && definition.intendedAudience.trim()) && !(Array.isArray(definition.intendedAudience) && definition.intendedAudience.length)) {
    throw new CalculationError('INVALID_INTENDED_AUDIENCE', 'A calculator must identify its intended audience.');
  }
  for (const key of ['assumptions', 'exclusions', 'warnings', 'limitations', 'references', 'verificationCases']) {
    if (!Array.isArray(definition[key])) throw new CalculationError('INVALID_DEFINITION_METADATA', `${key} must be an array.`, { key });
    if (key !== 'references' && !definition[key].every(item => typeof item === 'string' && item.trim())) {
      throw new CalculationError('INVALID_DEFINITION_METADATA', `${key} entries must be non-empty strings.`, { key });
    }
  }
  if (!definition.method || typeof definition.method !== 'object' || typeof definition.method.type !== 'string' || !definition.method.type.trim() || typeof definition.method.description !== 'string' || !definition.method.description.trim()) {
    throw new CalculationError('INVALID_METHOD_METADATA', 'A calculator must document its method type and description.');
  }
  if (!definition.precision || typeof definition.precision.numericModel !== 'string' || definition.precision.numericModel.trim() === '') {
    throw new CalculationError('INVALID_PRECISION_POLICY', 'A calculator must document its numeric model.');
  }
  if (!definition.rounding || typeof definition.rounding.policy !== 'string' || definition.rounding.policy.trim() === '') {
    throw new CalculationError('INVALID_ROUNDING_POLICY', 'A calculator must document its rounding policy.');
  }
  if (!Array.isArray(definition.inputs) || !Array.isArray(definition.outputs)) throw new CalculationError('INVALID_DEFINITION_SCHEMA', 'Calculator inputs and outputs must be arrays.');
  if (definition.outputs.length === 0) throw new CalculationError('MISSING_OUTPUTS', 'A calculator must declare at least one output.');
  if (typeof definition.calculate !== 'function') throw new CalculationError('INVALID_CALCULATOR_METHOD', 'A calculator definition must provide a calculation function.');
  if (definition.visualization !== undefined) {
    const visual = definition.visualization;
    if (!visual || typeof visual !== 'object' || !VISUALIZATION_KINDS.has(visual.kind)
      || typeof visual.title !== 'string' || !visual.title.trim()
      || typeof visual.description !== 'string' || !visual.description.trim()) {
      throw new CalculationError('INVALID_VISUALIZATION_METADATA', 'Visual metadata must provide a supported kind, title, and accessible description.');
    }
  }
  if (definition.nextSteps !== undefined && (!Array.isArray(definition.nextSteps)
    || definition.nextSteps.some(step => !step || typeof step.calculatorId !== 'string'
      || typeof step.reason !== 'string' || !step.reason.trim()
      || (step.outputId !== undefined && typeof step.outputId !== 'string')
      || (step.inputId !== undefined && typeof step.inputId !== 'string')))) {
    throw new CalculationError('INVALID_NEXT_STEP_METADATA', 'Next-step metadata must contain calculator IDs and a plain-language reason.');
  }
  if (!definition.release || !VALID_STATUSES.has(definition.release.status)) throw new CalculationError('INVALID_RELEASE_STATUS', 'The calculator release status is not supported.');
  if (definition.visibility !== 'test-only' && definition.visibility !== 'public') throw new CalculationError('INVALID_VISIBILITY', 'Calculator visibility must be public or test-only.');
  if (definition.release.status === 'test-only' && definition.visibility !== 'test-only') throw new CalculationError('INVALID_RELEASE_STATUS', 'The test-only release status is reserved for test fixtures.');
  if (definition.visibility === 'test-only' && definition.release.status === 'published') throw new CalculationError('INVALID_RELEASE_STATUS', 'A test fixture cannot be published.');
  if (!VALID_RISK_CLASSES.has(definition.riskClass)) throw new CalculationError('INVALID_RISK_CLASS', 'A calculator must declare an R0–R3 risk class.');

  validateFields(definition.inputs, 'input');
  validateFields(definition.outputs, 'output');
  if ((definition.release.status === 'verified' || definition.release.status === 'published') && definition.visibility === 'public') {
    if (definition.riskClass === 'R3') {
      throw new CalculationError('RISK_CLASS_NOT_SUPPORTED', 'R3 calculations cannot be publicly released by this platform foundation.');
    }
    if (!Array.isArray(definition.release.evidenceIds) || definition.release.evidenceIds.length === 0) {
      throw new CalculationError('MISSING_VERIFICATION_EVIDENCE', 'Verified definitions require verification evidence IDs.');
    }
    if (!definition.release.evidenceIds.every(id => typeof id === 'string' && id.trim())) {
      throw new CalculationError('INVALID_VERIFICATION_EVIDENCE', 'Verification evidence IDs must be non-empty strings.');
    }
    if (definition.visibility === 'public' && (!Array.isArray(definition.references) || definition.references.length === 0)) {
      throw new CalculationError('MISSING_REFERENCES', 'Public verified definitions require references.');
    }
    if (!definition.references.every(reference => reference && typeof reference.id === 'string' && reference.id.trim() && typeof reference.citation === 'string' && reference.citation.trim())) {
      throw new CalculationError('INVALID_REFERENCE', 'Every public verified reference must include an ID and citation.');
    }
    if (!Array.isArray(definition.verificationCases) || definition.verificationCases.length === 0 || !definition.verificationCases.every(item => typeof item === 'string' && item.trim())) {
      throw new CalculationError('MISSING_VERIFICATION_CASES', 'Public verified definitions require recorded verification cases.');
    }
    const reviewers = definition.release.reviewers;
    if (!Array.isArray(reviewers) || reviewers.length === 0 || !reviewers.every(reviewer => reviewer && typeof reviewer.id === 'string' && reviewer.id.trim() && typeof reviewer.qualification === 'string' && reviewer.qualification.trim())) {
      throw new CalculationError('MISSING_REVIEWER', 'Verified definitions require reviewer records with an identifier and qualification.');
    }
    if (reviewers.some(reviewer => reviewer.independent !== undefined && typeof reviewer.independent !== 'boolean')) {
      throw new CalculationError('INVALID_REVIEWER_RECORD', 'Reviewer independence must be recorded as a boolean when provided.');
    }
    if (new Set(reviewers.map(reviewer => reviewer.id)).size !== reviewers.length) {
      throw new CalculationError('DUPLICATE_REVIEWER', 'Reviewer records must identify distinct reviewers.');
    }
    if (definition.riskClass === 'R2' && (reviewers.length < 2 || !reviewers.some(reviewer => reviewer.independent === true))) {
      throw new CalculationError('INSUFFICIENT_INDEPENDENT_REVIEW', 'R2 definitions require at least two reviewers, including one independent reviewer.');
    }
  }

  return definition;
}

function validateFields(fields, fieldKind) {
  const ids = new Set();
  for (const field of fields) {
    if (!field || typeof field.id !== 'string' || !STABLE_ID.test(field.id)) {
      throw new CalculationError('INVALID_FIELD_ID', `Every ${fieldKind} must have a stable identifier.`);
    }
    if (typeof field.label !== 'string' || field.label.trim() === '') {
      throw new CalculationError('MISSING_FIELD_LABEL', `Every ${fieldKind} must have a user-facing label.`, { fieldId: field.id });
    }
    if (field.type !== 'quantity') {
      throw new CalculationError('UNSUPPORTED_FIELD_TYPE', `This core stage supports quantity ${fieldKind}s only.`, { fieldId: field.id });
    }
    if (ids.has(field.id)) throw new CalculationError('DUPLICATE_FIELD_ID', `${fieldKind} identifiers must be unique.`, { fieldId: field.id });
    ids.add(field.id);
    if (!field.dimension || typeof field.dimension !== 'object') throw new CalculationError('MISSING_FIELD_DIMENSION', `Every ${fieldKind} must declare a dimension.`, { fieldId: field.id });
    if (typeof field.canonicalUnit !== 'string' || !Array.isArray(field.acceptedUnits) || field.acceptedUnits.length === 0) {
      throw new CalculationError('INVALID_FIELD_UNITS', `Every ${fieldKind} must declare a canonical unit and accepted units.`, { fieldId: field.id });
    }
    const canonicalUnit = assertUnitDimension(field.canonicalUnit, field.dimension);
    if (!field.acceptedUnits.includes(field.canonicalUnit)) {
      throw new CalculationError('CANONICAL_UNIT_NOT_ACCEPTED', `The canonical unit must be listed as an accepted unit.`, { fieldId: field.id });
    }
    if (new Set(field.acceptedUnits).size !== field.acceptedUnits.length) {
      throw new CalculationError('DUPLICATE_ACCEPTED_UNIT', `Accepted units must not contain duplicates.`, { fieldId: field.id });
    }
    for (const unitId of field.acceptedUnits) {
      const acceptedUnit = assertUnitDimension(unitId, field.dimension);
      if (acceptedUnit.temperatureKind !== canonicalUnit.temperatureKind) {
        throw new CalculationError('TEMPERATURE_KIND_MISMATCH', 'Absolute temperature and temperature-difference units cannot share one field.', { fieldId: field.id });
      }
    }
    if (field.required !== undefined && typeof field.required !== 'boolean') {
      throw new CalculationError('INVALID_REQUIRED_FLAG', `${fieldKind} required flag must be boolean.`, { fieldId: field.id });
    }
    if (field.integer !== undefined && typeof field.integer !== 'boolean') {
      throw new CalculationError('INVALID_INTEGER_FLAG', `${fieldKind} integer flag must be boolean.`, { fieldId: field.id });
    }
    if (field.allowMagnitudeWords !== undefined && typeof field.allowMagnitudeWords !== 'boolean') {
      throw new CalculationError('INVALID_MAGNITUDE_INPUT_FLAG', `${fieldKind} magnitude-word flag must be boolean.`, { fieldId: field.id });
    }
    if (field.unitLabel !== undefined && (typeof field.unitLabel !== 'string' || !field.unitLabel.trim())) {
      throw new CalculationError('INVALID_UNIT_LABEL', `${fieldKind} unit label must be non-empty text.`, { fieldId: field.id });
    }
    if (field.semanticType !== undefined && (typeof field.semanticType !== 'string' || !STABLE_ID.test(field.semanticType))) {
      throw new CalculationError('INVALID_SEMANTIC_TYPE', 'Quantity semantic types must be stable identifiers.', { fieldId: field.id });
    }
    if (field.workflowFrom !== undefined && (!Array.isArray(field.workflowFrom)
      || field.workflowFrom.some(source => typeof source !== 'string' || !WORKFLOW_SOURCE_ID.test(source)))) {
      throw new CalculationError('INVALID_WORKFLOW_SOURCES', 'Workflow source allowlists must be arrays of calculator.output identifiers.', { fieldId: field.id });
    }
    if (field.range) {
      if (fieldKind !== 'input' || field.range.unit !== field.canonicalUnit) {
        throw new CalculationError('INVALID_INPUT_RANGE', 'Input ranges must be expressed in that field’s canonical unit.', { fieldId: field.id });
      }
      if (field.range.min !== undefined && !Number.isFinite(field.range.min)) throw new CalculationError('INVALID_INPUT_RANGE', 'Minimum bounds must be finite.', { fieldId: field.id });
      if (field.range.max !== undefined && !Number.isFinite(field.range.max)) throw new CalculationError('INVALID_INPUT_RANGE', 'Maximum bounds must be finite.', { fieldId: field.id });
      if (field.range.min !== undefined && field.range.max !== undefined && field.range.min > field.range.max) {
        throw new CalculationError('INVALID_INPUT_RANGE', 'Minimum input bound cannot exceed maximum.', { fieldId: field.id });
      }
    }
  }
}

export function assertSameFieldDimension(field, unitId) {
  const unit = assertUnitDimension(unitId, field.dimension);
  if (!dimensionsEqual(unit.dimension, field.dimension)) {
    throw new CalculationError('DIMENSION_MISMATCH', 'The unit does not match the declared field dimension.', { fieldId: field.id });
  }
  return unit;
}
