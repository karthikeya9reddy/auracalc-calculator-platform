import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_DIMENSIONS,
  CalculatorRegistry,
  CalculationError,
  executeCalculation,
  validateDefinition,
} from '../../src/calculation-core/index.mjs';
import { rectangleAreaFixture } from '../../test-fixtures/rectangle-area.mjs';

const fixedClock = () => new Date('2026-11-10T00:00:00.000Z');

function fixtureWith(overrides = {}) {
  return { ...rectangleAreaFixture, ...overrides };
}

function publicFixture(status = 'published') {
  return fixtureWith({
    id: `test.public-area-${status}`,
    visibility: 'public',
    references: [{ id: 'test-source', citation: 'Synthetic test-only source.' }],
    verificationCases: ['Synthetic test case.'],
    release: {
      status,
      reviewers: [{ id: 'test-reviewer', qualification: 'Test fixture only', independent: false }],
      evidenceIds: ['synthetic-test-evidence'],
    },
  });
}

function temperatureFixture(overrides = {}) {
  return fixtureWith({
    id: 'test.temperature-contract',
    inputs: [{
      id: 'temperature',
      type: 'quantity',
      label: 'Temperature',
      required: true,
      dimension: BASE_DIMENSIONS.temperature,
      canonicalUnit: 'K',
      acceptedUnits: ['K', 'degC'],
    }],
    outputs: [{
      id: 'temperature',
      type: 'quantity',
      label: 'Temperature',
      dimension: BASE_DIMENSIONS.temperature,
      canonicalUnit: 'K',
      acceptedUnits: ['K'],
    }],
    calculate(inputs) {
      return { outputs: { temperature: { value: inputs.temperature.value, unit: 'K' } }, warnings: [] };
    },
    ...overrides,
  });
}

test('numeric parsing errors identify the field without changing the error code', () => {
  const definition = publicFixture();
  const [first] = definition.inputs;
  assert.throws(
    () => executeCalculation(definition, { [first.id]: { value: 'invalid', unit: first.canonicalUnit } }),
    error => error instanceof CalculationError && error.details.fieldId === first.id
      && error.code.startsWith('INVALID_') && error.message.startsWith(`${first.label}:`),
  );
});

test('test fixtures are isolated from a production registry', () => {
  const registry = new CalculatorRegistry();
  assert.throws(() => registry.register(rectangleAreaFixture), { code: 'TEST_FIXTURE_NOT_ALLOWED' });
  const registered = registry.register(rectangleAreaFixture, { allowTestFixtures: true });
  assert.equal(registered.id, rectangleAreaFixture.id);
  assert.equal(Object.isFrozen(registered), true);
  assert.throws(() => registry.register(rectangleAreaFixture, { allowTestFixtures: true }), { code: 'DUPLICATE_CALCULATOR_ID' });
});

test('registry public listing excludes draft and test-only definitions', () => {
  const registry = new CalculatorRegistry();
  registry.register(rectangleAreaFixture, { allowTestFixtures: true });
  assert.deepEqual(registry.listPublished(), []);

  const publishedFixture = fixtureWith({
    id: 'test.public-registry-fixture',
    visibility: 'public',
    references: [{ id: 'test-reference', citation: 'Synthetic test-only reference.' }],
    verificationCases: ['Synthetic expected value fixture.'],
    release: {
      status: 'published',
      reviewers: [{ id: 'test-reviewer', qualification: 'Automated fixture only', independent: false }],
      evidenceIds: ['test-evidence'],
    },
  });
  registry.register(publishedFixture);
  assert.deepEqual(registry.listPublished().map(definition => definition.id), ['test.public-registry-fixture']);
});

test('registry snapshots metadata without freezing the caller definition', () => {
  const mutableDefinition = {
    ...rectangleAreaFixture,
    inputs: rectangleAreaFixture.inputs.map(field => ({ ...field, acceptedUnits: [...field.acceptedUnits], range: { ...field.range } })),
    outputs: rectangleAreaFixture.outputs.map(field => ({ ...field, acceptedUnits: [...field.acceptedUnits] })),
    release: { status: 'test-only' },
    limitations: ['Not public.'],
  };
  const registry = new CalculatorRegistry();
  const snapshot = registry.register(mutableDefinition, { allowTestFixtures: true });
  assert.equal(Object.isFrozen(snapshot.inputs[0]), true);
  assert.equal(Object.isFrozen(mutableDefinition.inputs[0]), false);
});

test('execution normalizes units and returns structured result provenance', () => {
  const result = executeCalculation(rectangleAreaFixture, {
    width: { value: '200,0', unit: 'cm' },
    height: { value: '3,0', unit: 'm' },
  }, { locale: 'de-DE', allowTestFixtures: true, clock: fixedClock });

  assert.equal(result.status, 'success');
  assert.equal(result.calculatorId, 'test.rectangle-area');
  assert.equal(result.methodVersion, 'fixture-1');
  assert.equal(result.calculatedAt, '2026-11-10T00:00:00.000Z');
  assert.equal(result.inputs.width.enteredValue, 200);
  assert.equal(result.inputs.width.enteredUnit, 'cm');
  assert.equal(result.inputs.width.canonicalValue, 2);
  assert.equal(result.inputs.width.canonicalUnit, 'm');
  assert.equal(result.outputs.area.value, 6);
  assert.equal(result.outputs.area.unit, 'm2');
  assert.equal(result.provenance.releaseStatus, 'test-only');
  assert.ok(Object.isFrozen(result.outputs.area));
});

test('engine refuses test-only fixture execution outside explicit test mode', () => {
  assert.throws(() => executeCalculation(rectangleAreaFixture, {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' },
  }), { code: 'TEST_FIXTURE_NOT_ALLOWED' });
});

test('verified definitions require explicit review mode; public execution requires publication', () => {
  const verified = publicFixture('verified');
  const inputs = { width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' } };
  assert.throws(() => executeCalculation(verified, inputs), { code: 'CALCULATOR_NOT_PUBLISHED' });
  assert.equal(executeCalculation(verified, inputs, { allowVerifiedReview: true }).outputs.area.value, 6);
  assert.equal(executeCalculation(publicFixture('published'), inputs).outputs.area.value, 6);
});

test('engine rejects draft definitions and incomplete or invalid inputs', () => {
  assert.throws(() => executeCalculation(fixtureWith({ release: { status: 'specified' } }), {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'CALCULATOR_NOT_VERIFIED' });

  assert.throws(() => executeCalculation(rectangleAreaFixture, {
    width: { value: 2, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'MISSING_INPUT' });

  assert.throws(() => executeCalculation(rectangleAreaFixture, {
    width: { value: 2, unit: 'kg' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'UNIT_NOT_ACCEPTED' });

  assert.throws(() => executeCalculation(rectangleAreaFixture, {
    width: 2, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'UNIT_REQUIRED' });

  assert.throws(() => executeCalculation(rectangleAreaFixture, {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' }, extra: 7,
  }, { allowTestFixtures: true }), { code: 'UNKNOWN_INPUT' });

  assert.throws(() => executeCalculation(rectangleAreaFixture, {
    width: { value: -1, unit: 'm' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'INPUT_BELOW_MINIMUM' });
});

test('definition schema rejects unsupported fields and duplicate accepted units', () => {
  const unsupportedField = fixtureWith({
    inputs: rectangleAreaFixture.inputs.map((field, index) => index === 0 ? { ...field, type: 'text' } : field),
  });
  assert.throws(() => validateDefinition(unsupportedField), { code: 'UNSUPPORTED_FIELD_TYPE' });

  const duplicateUnit = fixtureWith({
    inputs: rectangleAreaFixture.inputs.map((field, index) => index === 0 ? { ...field, acceptedUnits: ['m', 'm', 'cm'] } : field),
  });
  assert.throws(() => validateDefinition(duplicateUnit), { code: 'DUPLICATE_ACCEPTED_UNIT' });
});

test('engine rejects absolute temperatures below zero kelvin on inputs and outputs', () => {
  assert.throws(() => executeCalculation(temperatureFixture(), {
    temperature: { value: -274, unit: 'degC' },
  }, { allowTestFixtures: true }), { code: 'INPUT_BELOW_ABSOLUTE_ZERO' });

  const invalidTemperatureOutput = temperatureFixture({
    calculate() { return { outputs: { temperature: { value: -1, unit: 'K' } }, warnings: [] }; },
  });
  assert.throws(() => executeCalculation(invalidTemperatureOutput, {
    temperature: { value: 0, unit: 'K' },
  }, { allowTestFixtures: true }), { code: 'OUTPUT_BELOW_ABSOLUTE_ZERO' });
});

test('definition gate requires complete public evidence before verification', () => {
  const publicCandidate = fixtureWith({
    visibility: 'public',
    release: { status: 'verified', reviewers: ['independent reviewer'], evidenceIds: ['evidence-1'] },
  });
  assert.throws(() => validateDefinition(publicCandidate), { code: 'MISSING_REFERENCES' });
});

test('R2 publication requires two qualified reviewers including an independent reviewer', () => {
  const r2Candidate = fixtureWith({
    visibility: 'public',
    riskClass: 'R2',
    references: [{ id: 'source-1', citation: 'Primary source citation' }],
    verificationCases: ['independent-case-1'],
    release: {
      status: 'verified',
      reviewers: [
        { id: 'reviewer-1', qualification: 'domain reviewer', independent: false },
        { id: 'reviewer-2', qualification: 'domain reviewer', independent: false },
      ],
      evidenceIds: ['evidence-1'],
    },
  });
  assert.throws(() => validateDefinition(r2Candidate), { code: 'INSUFFICIENT_INDEPENDENT_REVIEW' });
  r2Candidate.release.reviewers[1].independent = true;
  assert.doesNotThrow(() => validateDefinition(r2Candidate));
});

test('R3 methods cannot be marked verified for public use', () => {
  const r3Candidate = fixtureWith({
    visibility: 'public',
    riskClass: 'R3',
    references: [{ id: 'source-1', citation: 'Primary source citation' }],
    verificationCases: ['case-1'],
    release: {
      status: 'verified',
      reviewers: [{ id: 'reviewer-1', qualification: 'qualified reviewer', independent: true }],
      evidenceIds: ['evidence-1'],
    },
  });
  assert.throws(() => validateDefinition(r3Candidate), { code: 'RISK_CLASS_NOT_SUPPORTED' });
});

test('engine rejects malformed, non-finite, or extra method outputs', () => {
  const nonFinite = fixtureWith({
    calculate() { return { outputs: { area: { value: NaN, unit: 'm2' } }, warnings: [] }; },
  });
  assert.throws(() => executeCalculation(nonFinite, {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'INVALID_OUTPUT_VALUE' });

  const wrongOutput = fixtureWith({
    calculate() { return { outputs: { volume: { value: 6, unit: 'm3' } }, warnings: [] }; },
  });
  assert.throws(() => executeCalculation(wrongOutput, {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'OUTPUT_SCHEMA_MISMATCH' });

  const invalidIntermediate = fixtureWith({
    calculate() {
      return { outputs: { area: { value: 6, unit: 'm2' } }, intermediates: { step1: Infinity }, warnings: [] };
    },
  });
  assert.throws(() => executeCalculation(invalidIntermediate, {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'INVALID_STRUCTURED_RESULT' });

  const invalidWarning = fixtureWith({
    calculate() { return { outputs: { area: { value: 6, unit: 'm2' } }, warnings: [' '] }; },
  });
  assert.throws(() => executeCalculation(invalidWarning, {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), { code: 'INVALID_CALCULATION_WARNING' });
});

test('unexpected method exceptions fail closed without returning an answer', () => {
  const brokenMethod = fixtureWith({ calculate() { throw new Error('internal detail'); } });
  assert.throws(() => executeCalculation(brokenMethod, {
    width: { value: 2, unit: 'm' }, height: { value: 3, unit: 'm' },
  }, { allowTestFixtures: true }), error => error instanceof CalculationError && error.code === 'CALCULATION_FAILED' && !error.message.includes('internal detail'));
});
