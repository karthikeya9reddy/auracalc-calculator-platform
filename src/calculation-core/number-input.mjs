import { CalculationError } from './errors.mjs';

const DIRECTIONAL_MARKS = /[\u061c\u200e\u200f]/g;
const SPACE_GROUPS = new Set([' ', '\u00a0', '\u202f']);

export function parseLocalizedNumber(rawValue, locale = 'en-US', { allowMagnitudeWords = false } = {}) {
  if (typeof rawValue === 'number') {
    if (!Number.isFinite(rawValue)) {
      throw new CalculationError('NON_FINITE_INPUT', 'Enter a finite number.');
    }
    return rawValue;
  }
  if (typeof rawValue !== 'string' || rawValue.trim() === '') {
    throw new CalculationError('REQUIRED_NUMBER', 'Enter a number.');
  }

  if (allowMagnitudeWords) {
    const magnitude = splitMagnitude(rawValue);
    if (magnitude) {
      const base = parseLocalizedNumber(magnitude.number, locale);
      const result = base * magnitude.factor;
      if (!Number.isFinite(result)) {
        throw new CalculationError('NON_FINITE_INPUT', 'The scaled number is outside the supported numeric range.');
      }
      return result;
    }
    if (/[a-df-z]/i.test(rawValue)) {
      throw new CalculationError('INVALID_MAGNITUDE_FORMAT', 'Use digits with a scale such as 2 thousand, 1.5 million, 3 lakh, or 2 crore.');
    }
  }

  let formatter;
  try {
    formatter = new Intl.NumberFormat(locale);
  } catch (error) {
    throw new CalculationError('INVALID_LOCALE', 'The selected number format is not supported.');
  }

  const decimalSeparator = formatter.formatToParts(1.1).find(part => part.type === 'decimal')?.value || '.';
  const groupSeparator = formatter.formatToParts(1234).find(part => part.type === 'group')?.value || '';
  const groupingLengths = formatter.formatToParts(1234567890123)
    .filter(part => part.type === 'integer')
    .map(part => [...part.value].length);
  const primaryGroupSize = groupingLengths.at(-1) || 3;
  const secondaryGroupSize = groupingLengths.at(-2) || primaryGroupSize;
  const minusSign = formatter.formatToParts(-1).find(part => part.type === 'minusSign')?.value || '-';
  const digitFormatter = new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 0 });
  const localizedDigits = new Map();
  for (let digit = 0; digit <= 9; digit += 1) {
    localizedDigits.set(digitFormatter.format(digit), String(digit));
  }

  let text = [...rawValue.trim().replace(DIRECTIONAL_MARKS, '')]
    .map(character => localizedDigits.get(character) || character)
    .join('');
  if (minusSign !== '-') text = text.replaceAll(minusSign, '-');
  if (groupSeparator && SPACE_GROUPS.has(groupSeparator)) {
    text = text.replace(/[ \u00a0\u202f]/g, groupSeparator);
  }

  const exponentParts = text.split(/[eE]/);
  if (exponentParts.length > 2) throw invalidNumber();
  const exponentText = exponentParts[1];
  if (exponentText !== undefined && !/^[+-]?\d+$/.test(exponentText)) throw invalidNumber();

  let mantissa = exponentParts[0];
  let sign = '';
  if (mantissa.startsWith('-') || mantissa.startsWith('+')) {
    sign = mantissa[0];
    mantissa = mantissa.slice(1);
  }

  const decimalParts = mantissa.split(decimalSeparator);
  if (decimalParts.length > 2) throw invalidNumber();
  let integerPart = decimalParts[0];
  const fractionalPart = decimalParts[1] ?? '';
  if (fractionalPart && !/^\d+$/.test(fractionalPart)) throw invalidNumber();

  if (groupSeparator && integerPart.includes(groupSeparator)) {
    const groups = integerPart.split(groupSeparator);
    const firstValid = groups[0].length >= 1 && groups[0].length <= secondaryGroupSize;
    const middleValid = groups.slice(1, -1).every(group => group.length === secondaryGroupSize);
    const finalValid = groups.at(-1).length === primaryGroupSize;
    if (!firstValid || !middleValid || !finalValid || groups.some(group => !/^\d+$/.test(group))) {
      throw invalidNumber();
    }
    integerPart = groups.join('');
  } else if (integerPart && !/^\d+$/.test(integerPart)) {
    throw invalidNumber();
  }

  if (!integerPart && !fractionalPart) throw invalidNumber();
  const normalized = `${sign}${integerPart || '0'}${fractionalPart ? `.${fractionalPart}` : ''}${exponentText === undefined ? '' : `e${exponentText}`}`;
  const result = Number(normalized);
  if (!Number.isFinite(result)) {
    throw new CalculationError('NON_FINITE_INPUT', 'The number is outside the supported numeric range.');
  }
  return result;
}

function splitMagnitude(rawValue) {
  const text = rawValue.trim();
  const wordScales = [
    ['thousands?', 1e3],
    ['millions?', 1e6],
    ['billions?', 1e9],
    ['trillions?', 1e12],
    ['lakhs?', 1e5],
    ['lacs?', 1e5],
    ['crores?', 1e7],
  ];
  for (const [suffix, factor] of wordScales) {
    const match = text.match(new RegExp(`^(.+?)\\s+(${suffix})$`, 'i'));
    if (match) return { number: match[1], factor };
  }

  // Compact forms are limited to unambiguous k (thousand) and bn (billion).
  const compact = text.match(/^(.+?)\s*(bn|k)$/i);
  if (compact) return { number: compact[1], factor: compact[2].toLowerCase() === 'k' ? 1e3 : 1e9 };
  return null;
}

function invalidNumber() {
  return new CalculationError('INVALID_NUMBER_FORMAT', 'The number does not match the selected locale. Check its decimal and grouping separators.');
}
