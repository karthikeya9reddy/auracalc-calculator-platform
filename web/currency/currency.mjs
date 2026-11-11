import { parseLocalizedNumber } from '/src/calculation-core/index.mjs';
import { fetchCurrencyList, createRateCache, convertCurrency, currencyHistoryRecord } from '../currency-core.mjs';
import { formatResultNumber } from '../result-number.mjs';
import { saveHistoryRecord } from '../storage.mjs';

const $ = selector => document.querySelector(selector);
const amount = $('#currency-amount'), from = $('#currency-from'), to = $('#currency-to'), result = $('#currency-result'), status = $('#currency-status');
const saveStatus = document.createElement('p'); saveStatus.className = 'currency-save-status'; saveStatus.setAttribute('role', 'status'); $('#currency-form').append(saveStatus);
const supportedLocales = new Set(['en-US', 'en-GB', 'de-DE', 'fr-FR', 'hi-IN']);
let locale = 'en-US';
try { const stored = localStorage.getItem('nexora.locale.v1'); if (supportedLocales.has(stored)) locale = stored; } catch {}
let generation = 0;
let latestConversion = null;
const getRate = createRateCache();
const fallback = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD'].map(code => ({ code, name: code }));
function setOptions(currencies) {
  for (const [select, fallbackValue] of [[from, 'USD'], [to, 'INR']]) {
    const selected = select.value || fallbackValue; select.replaceChildren();
    const options = [...currencies];
    if (/^[A-Z]{3}$/.test(selected) && !options.some(item => item.code === selected)) options.push({ code: selected, name: 'Rate availability varies' });
    for (const item of options) { const option = document.createElement('option'); option.value = item.code; option.textContent = `${item.code} · ${item.name}`; select.append(option); }
    select.value = options.some(item => item.code === selected) ? selected : options[0]?.code || '';
  }
}
async function updateRate(refresh = false) {
  const token = ++generation;
  saveStatus.textContent = '';
  latestConversion = null; $('#currency-save').disabled = true;
  result.textContent = '—';
  let numeric;
  try { numeric = parseLocalizedNumber(amount.value, locale); if (!Number.isFinite(numeric)) throw new Error(); }
  catch { status.textContent = `Enter a valid amount using ${locale} number format.`; return; }
  if (!from.value || !to.value) { status.textContent = 'Choose both currencies.'; return; }
  status.textContent = 'Fetching the latest available reference rate…';
  try {
    const quote = await getRate(from.value, to.value, { refresh: refresh === true });
    if (token !== generation) return;
    const converted = convertCurrency(numeric, quote.rate);
    const formatted = formatResultNumber(converted, locale);
    result.textContent = `${formatted} ${quote.quote}`;
    latestConversion = { amount: numeric, quote, converted };
    $('#currency-save').disabled = false;
    status.textContent = quote.sameCurrency ? 'Same currency: the exchange rate is 1.' : `${quote.stale ? 'Could not refresh. Showing a previously fetched rate — retry before relying on it. ' : ''}1 ${quote.base} = ${new Intl.NumberFormat(locale, { maximumSignificantDigits: 10 }).format(quote.rate)} ${quote.quote} · Rate date: ${quote.date} · Checked: ${new Date(quote.checkedAt).toLocaleString(locale)}${quote.cached ? ' (cached)' : ''}.`;
  } catch { if (token === generation) status.textContent = 'The rate is unavailable. Check your connection or choose another currency pair, then retry.'; }
}
let carried = null;
try { carried = JSON.parse(sessionStorage.getItem('auracalc.exchange-output.v1') || 'null'); sessionStorage.removeItem('auracalc.exchange-output.v1'); } catch {}
try { const restored = JSON.parse(sessionStorage.getItem('nexora.restore.v1') || 'null'); if (restored?.kind === 'currency-conversion') { sessionStorage.removeItem('nexora.restore.v1'); carried = { value: restored.rawInputs.value, currency: restored.rawInputs.from, target: restored.rawInputs.to, title: 'saved currency conversion', label: 'original inputs; rate will be refreshed' }; } } catch {}
if (carried && typeof carried.value === 'number' && Number.isFinite(carried.value) && /^[A-Z]{3}$/.test(carried.currency || '')) {
  if (!fallback.some(item => item.code === carried.currency)) fallback.push({ code: carried.currency, name: carried.currency });
  amount.value = new Intl.NumberFormat(locale, { useGrouping: false, maximumSignificantDigits: 17 }).format(carried.value);
}
setOptions(fallback);
if (carried && /^[A-Z]{3}$/.test(carried.currency || '') && Number.isFinite(carried.value)) {
  from.value = carried.currency;
  if (/^[A-Z]{3}$/.test(carried.target || '')) { if (!fallback.some(item => item.code === carried.target)) { const option = document.createElement('option'); option.value = carried.target; option.textContent = carried.target; to.append(option); } to.value = carried.target; }
  $('#currency-origin').textContent = `Amount from ${String(carried.title || 'your calculation')} · ${String(carried.label || 'result')}. Review the currencies and rate before using it.`;
  $('#currency-origin').hidden = false;
}
$('#currency-form').addEventListener('submit', event => { event.preventDefault(); updateRate(); });
$('#currency-refresh').addEventListener('click', () => updateRate(true));
$('#currency-save').addEventListener('click', () => {
  if (!latestConversion) return;
  const { amount: value, quote, converted } = latestConversion;
  const record = currencyHistoryRecord({ amount: value, quote, converted, id: globalThis.crypto?.randomUUID?.() || `currency-${Date.now()}-${Math.random().toString(36).slice(2)}`, calculatedAt: new Date().toISOString() });
  const outcome = saveHistoryRecord(record);
  saveStatus.textContent = outcome.saved ? 'Saved to this device’s calculation history.' : outcome.reason === 'paused' ? 'History saving is paused.' : 'Could not save history on this device.';
});
$('#currency-swap').addEventListener('click', () => { const prior = from.value; from.value = to.value; to.value = prior; updateRate(); });
from.addEventListener('change', updateRate); to.addEventListener('change', updateRate);
let timer;
amount.addEventListener('input', () => { generation++; latestConversion = null; saveStatus.textContent = ''; $('#currency-save').disabled = true; result.textContent = '—'; status.textContent = 'Updating…'; clearTimeout(timer); timer = setTimeout(updateRate, 400); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateRate(); });
setInterval(() => { if (!document.hidden) updateRate(); }, 30 * 60 * 1000);
updateRate();
fetchCurrencyList().then(currencies => {
  if (!currencies.length) return;
  const oldFrom = from.value, oldTo = to.value;
  setOptions(currencies);
  if (oldFrom !== from.value || oldTo !== to.value) updateRate();
}).catch(() => { /* Common currencies remain usable if a rate is available. */ });
