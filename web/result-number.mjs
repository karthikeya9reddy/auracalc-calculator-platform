/** Display tiny nonzero and very large results without silently rounding them to zero. */
export function formatResultNumber(value, locale = 'en-US', options = {}) {
  const magnitude = Math.abs(value);
  const notation = magnitude !== 0 && (magnitude < 0.000001 || magnitude >= 1e15) ? 'scientific' : 'standard';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 6, notation, ...options }).format(value);
}
