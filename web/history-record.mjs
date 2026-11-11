import { getUnit } from '../src/calculation-core/units.mjs';

export function historyRecordUsable(record) {
  if (!record || !record.rawInputs || typeof record.rawInputs !== 'object' || Array.isArray(record.rawInputs)) return false;
  const outputs = record.result?.outputs;
  if (!outputs || typeof outputs !== 'object' || !Object.keys(outputs).length) return false;
  try {
    return Object.values(outputs).every(output => output && typeof output.value === 'number' && Number.isFinite(output.value) && !!getUnit(output.unit));
  } catch { return false; }
}

/** Routes are derived from known tool kinds, never executed from stored data. */
export function historyRecordRoute(record) {
  if (record.kind === 'personal-formula') return '/builder/';
  if (record.kind === 'currency-conversion') return '/currency/';
  if (record.kind === 'unit-conversion') return '/converters/';
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(record.calculatorId || '')) throw new TypeError('Invalid saved calculator.');
  return `/${record.calculatorId.startsWith('convert-') ? 'converters' : 'calculators'}/${record.calculatorId}/`;
}
