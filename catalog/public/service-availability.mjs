import { CalculationError } from '../../src/calculation-core/index.mjs';
import { reference, r0Release, scalarInput, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const serviceAvailability = Object.freeze({
  id: 'service-availability', version: '1.0.0', title: 'Service availability from downtime',
  discipline: 'Software reliability and operations',
  fields: Object.freeze(['Software development and programming', 'Networking and telecommunications', 'Cloud computing and DevOps', 'Cybersecurity configuration and capacity planning']),
  category: 'Reliability metrics', description: 'Calculate time-based availability from an observation period and measured downtime.',
  keywords: Object.freeze(['uptime percentage', 'downtime', 'availability', 'error budget']),
  purpose: 'Calculate a historical time-based availability percentage for a stated observation window.', intendedAudience: ['Learners', 'Operations teams'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'equation', description: 'Availability = (total observation time − downtime) ÷ total observation time × 100%.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['Observation and downtime values use the same time unit and measurement window.', 'Downtime is measured using the user’s stated service availability definition.']),
  exclusions: Object.freeze(['Does not determine SLA compliance, service-level indicators, request-based availability, maintenance exclusions, or contractual obligations.']),
  warnings: Object.freeze(['Availability results depend on the monitoring window and the definition of a failed or unavailable service.']), limitations: Object.freeze(['A time-based metric may differ from request-based availability.']),
  references: Object.freeze([reference('google-sre-availability', 'Google Cloud SRE, “Available or not: That is the question,” time-based availability may be measured as uptime / (uptime + downtime).', 'https://cloud.google.com/blog/products/gcp/available-or-not-that-is-the-question-cre-life-lessons')]),
  verificationCases: Object.freeze(['43.2 downtime minutes in 43,200 total minutes gives 99.9%; zero downtime gives 100%; downtime exceeding total time is rejected.']),
  release: r0Release('service-availability-google-sre-cases-v1'),
  inputs: Object.freeze([
    scalarInput('total-time', 'Total observation time', 'minutes', { min: 0, allowMagnitudeWords: true }),
    scalarInput('downtime', 'Measured downtime', 'minutes', { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([scalarOutput('availability', 'Time-based availability', 'percent')]),
  calculate(inputs) {
    const total = inputs['total-time'].value;
    const downtime = inputs.downtime.value;
    if (total <= 0) throw new CalculationError('POSITIVE_OBSERVATION_TIME_REQUIRED', 'Total observation time must be greater than zero.', { fieldId: 'total-time' });
    if (downtime > total) throw new CalculationError('DOWNTIME_EXCEEDS_TOTAL', 'Downtime cannot exceed total observation time.', { fieldId: 'downtime' });
    const uptime = total - downtime;
    const ratio = uptime / total;
    const percent = ratio * 100;
    return { outputs: { availability: { value: ratio, unit: '1' } }, intermediates: { formula: 'availability = uptime / total time', steps: [
      `Find uptime: total time − downtime = ${stepNumber(total)} − ${stepNumber(downtime)} = ${stepNumber(uptime)} minutes.`,
      `Divide uptime by the observation period: ${stepNumber(uptime)} / ${stepNumber(total)} = ${stepNumber(ratio)}.`,
      `Convert to percent: ${stepNumber(ratio)} × 100 = ${stepNumber(percent)}%.`,
    ] }, warnings: [] };
  },
});
