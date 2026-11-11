const STOP = new Set(['how', 'what', 'is', 'do', 'i', 'my', 'the', 'a', 'an', 'to', 'of', 'for', 'calculate', 'calculator', 'calculators', 'convert', 'converter', 'converters', 'conversion']);
export function normalizeSearch(value) {
  return String(value ?? '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(kilo|centi|milli)?met(?:re|er)s?\b/g, (_, prefix = '') => `${prefix}meter`)
    .replace(/\b(kilo|milli)?lit(?:re|er)s?\b/g, (_, prefix = '') => `${prefix}liter`)
    .replace(/\bfeet\b/g, 'foot').replace(/\binches\b/g, 'inch').replace(/\bpounds\b/g, 'pound').trim();
}
export function searchTokens(query) { return normalizeSearch(query).split(/[^\p{L}\p{N}]+/u).filter(word => word && !STOP.has(word)); }
export function matchesSearchText(text, query) { const corpus = normalizeSearch(text); return searchTokens(query).every(token => corpus.includes(token)); }
export function makeSearchIndex(definitions) {
  return definitions.map(definition => ({ definition, title: normalizeSearch(definition.title), keywords: normalizeSearch((definition.keywords || []).join(' | ')), text: normalizeSearch([definition.title, definition.id, definition.category, definition.discipline, definition.description, ...(definition.keywords || []), ...(definition.fields || [])].join(' ')) }));
}
export function searchIndex(index, query, limit = 8) {
  const tokens = searchTokens(query);
  if (!tokens.length) return [];
  return index.map(entry => {
    if (!tokens.every(token => entry.text.includes(token))) return null;
    return { ...entry, score: tokens.reduce((sum, token) => sum + (entry.title.includes(token) ? 5 : 1), 0) + (entry.title.includes(normalizeSearch(query)) ? 10 : 0) + (entry.keywords.includes(normalizeSearch(query)) ? 15 : 0) };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.definition.title.localeCompare(b.definition.title)).slice(0, limit).map(entry => entry.definition);
}
