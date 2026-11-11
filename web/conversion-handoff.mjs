import { dimensionsEqual, getUnit, listUnits } from '../src/calculation-core/index.mjs';

export function compatibleOutputUnits(unitId) {
  let source;
  try { source = getUnit(unitId); } catch { return []; }
  if (!Object.values(source.dimension).some(value => value !== 0)) return [];
  return listUnits().filter(unit => unit.id !== source.id && unit.temperatureKind === source.temperatureKind && dimensionsEqual(unit.dimension, source.dimension));
}

export function outputConversionPayload(record, title, label) {
  if (!record || typeof record.value !== 'number' || !Number.isFinite(record.value) || !compatibleOutputUnits(record.unit).length) return null;
  return { value: record.value, unit: record.unit, title: String(title || ''), label: String(label || '') };
}
