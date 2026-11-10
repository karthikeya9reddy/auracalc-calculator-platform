import { CalculationError } from '../../src/calculation-core/index.mjs';
import { reference, r0Release, scalarInput, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const modelWeightMemory = Object.freeze({
  id: 'model-weight-memory', version: '1.0.0', title: 'AI model weight storage estimate',
  discipline: 'AI, machine learning, and hardware',
  fields: Object.freeze(['Artificial intelligence and machine learning', 'Electronics and embedded hardware', 'Software development and programming', 'Cloud computing and DevOps']),
  category: 'Model sizing', description: 'Estimate the raw storage for model weights from parameter count and bits per parameter.',
  keywords: Object.freeze(['model size', 'parameter count', 'quantization', 'weights GB GiB', 'GPU memory']),
  purpose: 'Estimate raw model weight bytes for an explicitly chosen fixed precision.', intendedAudience: ['Learners', 'AI practitioners'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'unit conversion and equation', description: 'Raw weight bytes = parameter count × bits per parameter ÷ 8.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Every parameter uses the same stated bit width.', 'GB is decimal (10⁹ bytes) and GiB is binary (2³⁰ bytes).']),
  exclusions: Object.freeze(['Does not estimate runtime memory, KV cache, activations, gradients, optimizer states, scales, metadata, alignment, framework overhead, or fit on a specific device.']),
  warnings: Object.freeze(['This is raw weight storage only; actual inference memory requirements are higher and model-specific.']), limitations: Object.freeze(['Some quantization formats use additional per-block metadata and do not use a uniform bit width.']),
  references: Object.freeze([
    reference('rfc1392-octet-bits', 'IETF RFC 1392, Internet Users’ Glossary, “An octet is 8 bits.”', 'https://www.rfc-editor.org/rfc/rfc1392.html'),
    reference('nist-binary-prefixes', 'NIST, Binary Prefixes, 1 GiB = 2³⁰ bytes; 1 GB = 10⁹ bytes.', 'https://pml.nist.gov/cuu/Units/binary.html'),
  ]),
  verificationCases: Object.freeze(['7 billion parameters at 4 bits require 3.5 GB or about 3.2596 GiB of raw weights; doubling bits doubles size; unsupported bit widths are rejected.']),
  release: r0Release('model-weight-memory-rfc-nist-cases-v1'),
  inputs: Object.freeze([
    scalarInput('parameters', 'Parameter count', 'parameters', { min: 0, integer: true, allowMagnitudeWords: true }),
    scalarInput('bits-per-parameter', 'Bits per parameter', 'bits', { min: 1, integer: true }),
  ]),
  outputs: Object.freeze([
    scalarOutput('decimal-gigabytes', 'Raw weight size (GB)'),
    scalarOutput('binary-gibibytes', 'Raw weight size (GiB)'),
  ]),
  calculate(inputs) {
    const parameters = inputs.parameters.value;
    const bits = inputs['bits-per-parameter'].value;
    if (!Number.isSafeInteger(parameters) || parameters <= 0) throw new CalculationError('POSITIVE_SAFE_PARAMETER_COUNT_REQUIRED', 'Parameter count must be a positive whole number within JavaScript’s exact-integer range.', { fieldId: 'parameters' });
    if (![4, 8, 16, 32].includes(bits)) throw new CalculationError('UNSUPPORTED_PARAMETER_PRECISION', 'Choose 4, 8, 16, or 32 bits per parameter.', { fieldId: 'bits-per-parameter' });
    const bytes = parameters * bits / 8;
    const gb = bytes / 1e9;
    const gib = bytes / (2 ** 30);
    return { outputs: {
      'decimal-gigabytes': { value: gb, unit: '1' },
      'binary-gibibytes': { value: gib, unit: '1' },
    }, intermediates: { formula: 'bytes = parameters × bits per parameter / 8', steps: [
      `Calculate raw bits: ${stepNumber(parameters)} parameters × ${stepNumber(bits)} bits/parameter = ${stepNumber(parameters * bits)} bits.`,
      `Convert bits to bytes: ${stepNumber(parameters * bits)} / 8 = ${stepNumber(bytes)} bytes.`,
      `Convert to decimal GB: ${stepNumber(bytes)} / 1,000,000,000 = ${stepNumber(gb)} GB.`,
      `Convert to binary GiB: ${stepNumber(bytes)} / 1,073,741,824 = ${stepNumber(gib)} GiB.`,
    ] }, warnings: [] };
  },
});
