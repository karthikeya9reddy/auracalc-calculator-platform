import { CalculationError } from './errors.mjs';
import { validateDefinition } from './definition.mjs';

function cloneJson(value, fallback) {
  if (value === undefined) return fallback;
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function snapshotDefinition(definition) {
  const snapshot = {
    ...definition,
    inputs: cloneJson(definition.inputs, []),
    outputs: cloneJson(definition.outputs, []),
    release: cloneJson(definition.release, {}),
    references: cloneJson(definition.references, []),
    assumptions: cloneJson(definition.assumptions, []),
    exclusions: cloneJson(definition.exclusions, []),
    warnings: cloneJson(definition.warnings, []),
    limitations: cloneJson(definition.limitations, []),
    verificationCases: cloneJson(definition.verificationCases, []),
    method: cloneJson(definition.method, {}),
    visualization: cloneJson(definition.visualization, undefined),
    nextSteps: cloneJson(definition.nextSteps, []),
    precision: cloneJson(definition.precision, {}),
    rounding: cloneJson(definition.rounding, {}),
    intendedAudience: cloneJson(definition.intendedAudience, ''),
    calculate: definition.calculate,
  };
  return deepFreeze(snapshot);
}

export class CalculatorRegistry {
  #definitions = new Map();

  register(definition, { allowTestFixtures = false } = {}) {
    validateDefinition(definition);
    if (definition.visibility === 'test-only' && !allowTestFixtures) {
      throw new CalculationError('TEST_FIXTURE_NOT_ALLOWED', 'Test-only calculator definitions cannot be added to a production registry.');
    }
    if (this.#definitions.has(definition.id)) {
      throw new CalculationError('DUPLICATE_CALCULATOR_ID', 'A calculator with this identifier is already registered.', { calculatorId: definition.id });
    }
    const snapshot = snapshotDefinition(definition);
    this.#definitions.set(snapshot.id, snapshot);
    return snapshot;
  }

  get(calculatorId) {
    const definition = this.#definitions.get(calculatorId);
    if (!definition) throw new CalculationError('UNKNOWN_CALCULATOR', 'No calculator is registered with this identifier.', { calculatorId });
    return definition;
  }

  list({ status, discipline } = {}) {
    return [...this.#definitions.values()].filter(definition => {
      if (status && definition.release.status !== status) return false;
      if (discipline && definition.discipline !== discipline) return false;
      return true;
    });
  }

  listPublished() {
    return [...this.#definitions.values()].filter(definition =>
      definition.visibility === 'public' && definition.release.status === 'published'
    );
  }
}
