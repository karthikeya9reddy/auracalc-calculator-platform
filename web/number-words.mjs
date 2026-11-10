const SMALL = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES = [
  '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion',
  'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion',
  'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion',
  'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion',
];

function underThousand(value) {
  if (value < 20) return SMALL[value];
  if (value < 100) {
    const remainder = value % 10;
    return remainder ? `${TENS[Math.floor(value / 10)]}-${SMALL[remainder]}` : TENS[Math.floor(value / 10)];
  }
  const remainder = value % 100;
  return remainder
    ? `${SMALL[Math.floor(value / 100)]} hundred ${underThousand(remainder)}`
    : `${SMALL[Math.floor(value / 100)]} hundred`;
}

function integerToWords(integer) {
  if (integer === 0n) return 'zero';
  const parts = [];
  let scale = 0;
  let remaining = integer;
  while (remaining > 0n) {
    const group = Number(remaining % 1000n);
    if (group) {
      if (scale >= SCALES.length) return null;
      const words = underThousand(group);
      parts.unshift(SCALES[scale] ? `${words} ${SCALES[scale]}` : words);
    }
    remaining /= 1000n;
    scale += 1;
  }
  return parts.join(' ');
}

/** Spell a calculator result in English, using the same six-decimal precision as the UI. */
export function numberToEnglishWords(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const absolute = Math.abs(value);
  const roundedText = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    maximumFractionDigits: 6,
  }).format(absolute);
  const [integerText, fractionText = ''] = roundedText.split('.');
  let integer;
  try {
    integer = BigInt(integerText);
  } catch {
    return null;
  }
  const integerWords = integerToWords(integer);
  if (!integerWords) return null;
  const fractionWords = fractionText
    ? ` point ${[...fractionText].map(digit => SMALL[Number(digit)]).join(' ')}`
    : '';
  const approximation = absolute > Number.MAX_SAFE_INTEGER ? 'approximately ' : '';
  const sign = value < 0 ? 'minus ' : '';
  return `${approximation}${sign}${integerWords}${fractionWords}`;
}
