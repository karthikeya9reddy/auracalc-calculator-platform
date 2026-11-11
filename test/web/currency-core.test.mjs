import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCurrencyList, fetchCurrencyRate, convertCurrency, currencyHistoryRecord } from '../../web/currency-core.mjs';

test('currency conversion uses a dated matching rate and keeps full numeric precision', async () => {
  let requested;
  const rate = await fetchCurrencyRate('usd', 'inr', async url => { requested = url; return { ok: true, json: async () => ({ base: 'USD', quote: 'INR', rate: 83.25, date: '2026-11-10' }) }; });
  assert.match(requested, /\/rate\/USD\/INR$/);
  assert.equal(rate.date, '2026-11-10');
  assert.equal(convertCurrency(10, rate.rate), 832.5);
  assert.equal(convertCurrency(0, rate.rate), 0);
});

test('currency conversion fails closed for invalid, mismatched or unavailable rates', async () => {
  for (const data of [{ base: 'EUR', quote: 'INR', rate: 1, date: '2026-11-10' }, { base: 'USD', quote: 'INR', rate: -1, date: '2026-11-10' }, { base: 'USD', quote: 'INR', rate: 3, date: '2026-02-30' }]) {
    await assert.rejects(fetchCurrencyRate('USD', 'INR', async () => ({ ok: true, json: async () => data })));
  }
  await assert.rejects(fetchCurrencyRate('USD', 'INR', async () => ({ ok: false })));
  await assert.rejects(fetchCurrencyRate('../USD', 'INR'));
  assert.throws(() => convertCurrency(Infinity, 1));
  assert.deepEqual(await fetchCurrencyRate('USD', 'USD', () => { throw new Error('No network needed'); }), { base: 'USD', quote: 'USD', rate: 1, date: null, sameCurrency: true });
});

test('currency list excludes non-currency assets and malformed entries', async () => {
  const items = await fetchCurrencyList(async () => ({ ok: true, json: async () => [{ iso_code: 'USD', name: 'US Dollar', type: 'currency' }, { iso_code: 'XAU', name: 'Gold', type: 'metal' }, { iso_code: '../', name: 'Bad', type: 'currency' }] }));
  assert.deepEqual(items, [{ code: 'USD', name: 'US Dollar' }]);
});

test('currency history preserves the rate date and the original amount', () => {
  const record = currencyHistoryRecord({ amount: 10, converted: 832.5, quote: { base: 'USD', quote: 'INR', rate: 83.25, date: '2026-11-10' }, id: 'sample', calculatedAt: '2026-11-11T00:00:00Z' });
  assert.deepEqual(record.rawInputs, { value: 10, from: 'USD', to: 'INR' });
  assert.deepEqual(record.rate, { value: 83.25, date: '2026-11-10' });
  assert.equal(record.route, '/currency/');
});
