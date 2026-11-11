const BASE = 'https://api.frankfurter.dev/v2';
export function currencyCode(value) {
  const code = String(value || '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw new TypeError('Choose a valid currency code.');
  return code;
}
export async function fetchCurrencyList(fetcher = fetch) {
  const response = await fetcher(`${BASE}/currencies`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Currency list unavailable.');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid currency list.');
  return data.filter(item => item.type === 'currency' && /^[A-Z]{3}$/.test(item.iso_code) && typeof item.name === 'string').map(item => ({ code: item.iso_code, name: item.name })).sort((a, b) => a.code.localeCompare(b.code));
}
export async function fetchCurrencyRate(base, quote, fetcher = fetch) {
  const from = currencyCode(base), to = currencyCode(quote);
  if (from === to) return { base: from, quote: to, rate: 1, date: null, sameCurrency: true };
  const response = await fetcher(`${BASE}/rate/${from}/${to}`, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('No current reference rate is available for this pair.');
  const data = await response.json();
  const parsedDate = typeof data.date === 'string' ? Date.parse(`${data.date}T00:00:00Z`) : NaN;
  if (data.base !== from || data.quote !== to || typeof data.rate !== 'number' || !Number.isFinite(data.rate) || data.rate <= 0 || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(parsedDate) || new Date(parsedDate).toISOString().slice(0, 10) !== data.date) throw new Error('The exchange service returned an invalid rate.');
  return { base: from, quote: to, rate: data.rate, date: data.date, sameCurrency: false };
}
export function convertCurrency(amount, rate) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0 || !Number.isFinite(amount * rate)) throw new RangeError('Enter a valid amount and exchange rate.');
  return amount * rate;
}

export function currencyHistoryRecord({ amount, quote, converted, id, calculatedAt }) {
  if (typeof id !== 'string' || !id || !Number.isFinite(amount) || !Number.isFinite(converted) || !quote || !Number.isFinite(quote.rate) || quote.rate <= 0) throw new TypeError('A valid currency conversion is required.');
  const from = currencyCode(quote.base), to = currencyCode(quote.quote);
  return { id, kind: 'currency-conversion', calculatorId: 'currency-converter', calculatorTitle: 'Currency converter', methodVersion: 'Frankfurter reference rate', calculatedAt, rawInputs: { value: amount, from, to }, result: { outputs: { converted: { value: converted, unit: '1' } } }, rate: { value: quote.rate, date: quote.date }, summary: `${amount} ${from} = ${converted} ${to}${quote.date ? ` · rate ${quote.date}` : ''}`, route: '/currency/' };
}
