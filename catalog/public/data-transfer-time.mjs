import { CalculationError } from '../../src/calculation-core/index.mjs';
import { reference, r0Release, scalarInput, scalarOutput, sciencePrecision, scienceRounding, stepNumber } from './science-helpers.mjs';

export const dataTransferTime = Object.freeze({
  id: 'data-transfer-time', version: '1.0.0', title: 'Ideal data transfer time',
  discipline: 'Networking and software operations',
  fields: Object.freeze(['Software development and programming', 'Networking and telecommunications', 'Data engineering and databases', 'Cloud computing and DevOps', 'Education, assessment, and learning']),
  category: 'Network estimates', description: 'Estimate transfer duration from decimal gigabytes and a sustained megabit-per-second rate.',
  keywords: Object.freeze(['download time', 'upload time', 'GB Mbps', 'file transfer']),
  purpose: 'Convert file size and a user-provided transfer rate into an ideal lower-bound duration.', intendedAudience: ['Learners', 'General planning'], riskClass: 'R0', visibility: 'public',
  method: Object.freeze({ type: 'unit conversion and equation', description: 'Ideal seconds = decimal file size in GB × 8,000 megabits per GB ÷ transfer rate in Mbps.' }),
  precision: sciencePrecision, rounding: scienceRounding,
  assumptions: Object.freeze(['GB is decimal: 1 GB = 1,000,000,000 bytes.', 'The entered rate is a sustained payload rate in megabits per second.', 'One byte/octet is eight bits.']),
  exclusions: Object.freeze(['Does not include protocol overhead, congestion, latency, server limits, wireless variation, retransmissions, or storage write time.']),
  warnings: Object.freeze(['Real transfers commonly take longer than this ideal estimate.']), limitations: Object.freeze(['The output is a lower-bound arithmetic estimate based on the supplied rate.']),
  references: Object.freeze([
    reference('rfc1392-octet-bits', 'IETF RFC 1392, Internet Users’ Glossary, “An octet is 8 bits.”', 'https://www.rfc-editor.org/rfc/rfc1392.html'),
    reference('nist-si-prefixes', 'NIST, SI prefixes use decimal powers; giga denotes 10⁹.', 'https://www.nist.gov/pml/owm/metric-si-prefixes'),
  ]),
  verificationCases: Object.freeze(['1 decimal GB at 100 Mbps is 80 s; doubling file size doubles duration; zero rate is rejected.']),
  release: r0Release('data-transfer-time-rfc-nist-cases-v1'),
  inputs: Object.freeze([
    scalarInput('file-size', 'File size', 'decimal GB (10⁹ bytes)', { min: 0, allowMagnitudeWords: true }),
    scalarInput('transfer-rate', 'Sustained transfer rate', 'Mbps (10⁶ bits/s)', { min: 0, allowMagnitudeWords: true }),
  ]),
  outputs: Object.freeze([
    scalarOutput('seconds', 'Ideal time (seconds)'),
    scalarOutput('minutes', 'Ideal time (minutes)'),
    scalarOutput('hours', 'Ideal time (hours)'),
  ]),
  calculate(inputs) {
    const gigabytes = inputs['file-size'].value;
    const mbps = inputs['transfer-rate'].value;
    if (mbps <= 0) throw new CalculationError('POSITIVE_RATE_REQUIRED', 'Transfer rate must be greater than zero.', { fieldId: 'transfer-rate' });
    const megabits = gigabytes * 8000;
    const seconds = megabits / mbps;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    return { outputs: {
      seconds: { value: seconds, unit: '1' },
      minutes: { value: minutes, unit: '1' },
      hours: { value: hours, unit: '1' },
    }, intermediates: { formula: 'seconds = decimal GB × 8,000 Mb/GB ÷ Mbps', steps: [
      `Convert file size to megabits: ${stepNumber(gigabytes)} GB × 1,000 MB/GB × 8 Mb/MB = ${stepNumber(megabits)} Mb.`,
      `Divide by the sustained rate: ${stepNumber(megabits)} Mb / ${stepNumber(mbps)} Mb/s = ${stepNumber(seconds)} s.`,
      `Convert time: ${stepNumber(seconds)} / 60 = ${stepNumber(minutes)} min; ${stepNumber(minutes)} / 60 = ${stepNumber(hours)} h.`,
    ] }, warnings: [] };
  },
});
