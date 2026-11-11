import { normalizeSearch } from './unified-search.mjs';
import { getUnit } from '../src/calculation-core/units.mjs';

/** Carry only an explicit numeric quantity and exact directed pair, never a fuzzy guess. */
export function conversionQuery(definition, query) {
  if (definition.catalogKind !== 'converter' || definition.inputs.length !== 1 || definition.outputs.length !== 1) return null;
  const match = /^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s+(.+?)\s+to\s+(.+?)\s*$/i.exec(query);
  if (!match || !Number.isFinite(Number(match[1]))) return null;
  const source = getUnit(definition.inputs[0].canonicalUnit), target = getUnit(definition.outputs[0].canonicalUnit);
  const phrase = normalizeSearch(`${match[2]} to ${match[3]}`);
  const exactSymbols = match[2] === source.symbol && match[3] === target.symbol;
  const fullNames = normalizeSearch(definition.title.replace(/ converter$/i, '')) === phrase;
  if (!exactSymbols && !fullNames) return null;
  return { calculatorId: definition.id, methodVersion: definition.version, inputs: { [definition.inputs[0].id]: {value:Number(match[1]),unit:source.id} } };
}
export function attachConversionQuery(link, definition, query) {
  const payload = conversionQuery(definition, query);
  if (!payload) return;
  link.title = `Open with ${Object.values(payload.inputs)[0].value} already entered`;
  link.addEventListener('click', () => { try { sessionStorage.setItem('nexora.restore.v1', JSON.stringify(payload)); } catch { /* Route remains usable without browser storage. */ } });
}
