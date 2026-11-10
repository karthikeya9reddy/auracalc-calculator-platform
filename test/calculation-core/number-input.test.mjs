import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLocalizedNumber } from '../../src/calculation-core/index.mjs';

test('localized numbers parse decimal and grouping separators explicitly', () => {
  assert.equal(parseLocalizedNumber('1,234.5', 'en-US'), 1234.5);
  assert.equal(parseLocalizedNumber('1.234,5', 'de-DE'), 1234.5);
  assert.equal(parseLocalizedNumber('12,34,567.89', 'hi-IN'), 1234567.89);
  assert.equal(parseLocalizedNumber('1 234,5', 'fr-FR'), 1234.5);
});

test('parser accepts signs, fractions, scientific notation, and finite numbers', () => {
  assert.equal(parseLocalizedNumber('-0,25', 'de-DE'), -0.25);
  assert.equal(parseLocalizedNumber('.5', 'en-US'), 0.5);
  assert.equal(parseLocalizedNumber('1.25e3', 'en-US'), 1250);
  assert.equal(parseLocalizedNumber(42), 42);
});

test('parser rejects malformed grouping, empty input, and non-finite values', () => {
  assert.throws(() => parseLocalizedNumber('12,34.5', 'en-US'), { code: 'INVALID_NUMBER_FORMAT' });
  assert.throws(() => parseLocalizedNumber('1.234,5', 'en-US'), { code: 'INVALID_NUMBER_FORMAT' });
  assert.throws(() => parseLocalizedNumber(' ', 'en-US'), { code: 'REQUIRED_NUMBER' });
  assert.throws(() => parseLocalizedNumber(Infinity), { code: 'NON_FINITE_INPUT' });
  assert.throws(() => parseLocalizedNumber('1e999', 'en-US'), { code: 'NON_FINITE_INPUT' });
  assert.throws(() => parseLocalizedNumber('1,2', 'invalid_locale'), { code: 'INVALID_LOCALE' });
});
