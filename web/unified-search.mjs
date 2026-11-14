const STOP = new Set(['how', 'what', 'is', 'do', 'i', 'my', 'the', 'a', 'an', 'to', 'of', 'for', 'calculate', 'calculator', 'calculators', 'convert', 'converter', 'converters', 'conversion', 'does', 'much', 'use']);
export function normalizeSearch(value) {
  return String(value ?? '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(kilo|centi|milli)?met(?:re|er)s?\b/g, (_, prefix = '') => `${prefix}meter`)
    .replace(/\b(kilo|milli)?lit(?:re|er)s?\b/g, (_, prefix = '') => `${prefix}liter`)
    .replace(/\bfeet\b/g, 'foot').replace(/\binches\b/g, 'inch').replace(/\bpounds\b/g, 'pound')
    .replace(/\blbs?\b/g, 'lbm').trim();
}
export function searchTokens(query) { return normalizeSearch(query).slice(0, 240).split(/[^\p{L}\p{N}]+/u).filter(word => word && !STOP.has(word)).slice(0, 16); }
// One edit, only for words of at least five characters; never fuzzy-match unit symbols.
function nearWord(a, b) {
  if (a.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const mismatch = []; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) mismatch.push(i);
    return mismatch.length <= 1 || (mismatch.length === 2 && mismatch[1] === mismatch[0] + 1 && a[mismatch[0]] === b[mismatch[1]] && a[mismatch[1]] === b[mismatch[0]]);
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0; while (i < short.length && short[i] === long[i]) i++;
  return short.slice(i) === long.slice(i + 1);
}
function tokenMatch(text, words, token) {
  if (token.length < 3) return words.has(token);
  if (text.includes(token)) return true;
  if (token.length >= 5) {
    for (const word of words) if (nearWord(token, word)) return true;
  }
  return false;
}
export function matchesSearchText(text, query) {
  const corpus = normalizeSearch(text), words = new Set(corpus.split(/[^\p{L}\p{N}]+/u));
  return searchTokens(query).every(token => tokenMatch(corpus, words, token));
}
const INTENTS = [
  [/\b(?:salary|pay|income|price)\b.*\b(?:increase[ds]?|raise|decrease[ds]?)\b|\b(?:increase[ds]?|raise|decrease[ds]?)\b.*\b(?:salary|pay|income|price)\b/i, 'percentage-change'],
  [/\b(?:how many|number of|quantity of)\b.*\btiles?\b|\btiles?\b.*\b(?:room|floor|wall)\b/i, 'tile-quantity-estimate'],
  [/\bhow (?:quickly|fast)\b.*\b(?:moving|travel|going)\b|\bdistance\s+(?:over|divided by)\s+time\b/i, 'average-speed'],
  [/\bforce\s+(?:over|divided by)\s+area\b/i, 'pressure-from-force-area'],
  [/\b(?:room|floor|wall)\s+area\b/i, 'rectangle-area'],
  [/\b(?:monthly loan payment|loan monthly payment|monthly payment on a loan)\b/i, 'loan-monthly-payment-estimate'],
  [/\bpressure\b.*\b(?:water depth|below the surface|stationary fluid)\b/i, 'hydrostatic-gauge-pressure'],
  [/\belectricity\s+costs?\b/i, 'household-electricity-cost'],
  [/\b(?:electricity|energy)\b.*\b(?:computer|appliance)\b|\b(?:computer|appliance)\b.*\b(?:electricity|energy)\b/i, 'electrical-energy-power-time'],
];
export function intentCalculatorIds(query) { return INTENTS.filter(([pattern]) => pattern.test(query)).map(([, id]) => id); }
export function makeSearchIndex(definitions) {
  return definitions.map(definition => {
    const text = normalizeSearch([definition.title, definition.id, definition.category, definition.discipline, definition.description, definition.method?.description, ...(definition.keywords || []), ...(definition.fields || [])].join(' '));
    return { definition, title: normalizeSearch(definition.title), keywords: normalizeSearch((definition.keywords || []).join(' | ')), text, words: new Set(text.split(/[^\p{L}\p{N}]+/u)) };
  });
}
export function searchIndex(index, query, limit = 8) {
  const conversion = /^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?\s+(.+\s+to\s+.+)\s*$/i.exec(query);
  const effectiveQuery = normalizeSearch(conversion ? conversion[1] : query);
  const tokens = searchTokens(effectiveQuery);
  const intents = intentCalculatorIds(query);
  if (!tokens.length) return [];
  return index.map(entry => {
    if (!intents.includes(entry.definition.id) && !tokens.every(token => tokenMatch(entry.text, entry.words, token))) return null;
    return { ...entry, score: (intents.includes(entry.definition.id) ? 100 : 0) + tokens.reduce((sum, token) => sum + (entry.title.includes(token) ? 5 : entry.text.includes(token) ? 1 : 0), 0) + (entry.title.includes(effectiveQuery) ? 10 : 0) + (entry.keywords.includes(effectiveQuery) ? 15 : 0) };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.definition.title.localeCompare(b.definition.title)).slice(0, limit).map(entry => entry.definition);
}
