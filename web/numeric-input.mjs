const numericCharacters = /[^\p{Nd}eE+\-−.,/\s\u066B\u066C'’]/u;
const magnitudeCharacters = /[^\p{Nd}a-zA-Z+\-−.,/\s\u066B\u066C'’]/u;

/** Keep localized numeric entry and allow scale words only on explicitly opted-in fields. */
export function configureNumericInput(input, { allowMagnitudeWords = false } = {}) {
  input.type = 'text';
  // Magnitude-enabled fields accept entries such as “123 million”; mobile
  // decimal keyboards would hide the letters users need for that format.
  input.inputMode = allowMagnitudeWords ? 'text' : 'decimal';
  input.autocomplete = 'off';
  input.spellcheck = false;

  input.addEventListener('beforeinput', event => {
    if (event.isComposing || !event.inputType?.startsWith('insert') || typeof event.data !== 'string') return;
    if ((allowMagnitudeWords ? magnitudeCharacters : numericCharacters).test(event.data)) event.preventDefault();
  });

  const validateCharacters = () => {
    input.setCustomValidity((allowMagnitudeWords ? magnitudeCharacters : numericCharacters).test(input.value)
      ? (allowMagnitudeWords ? 'Use digits, number separators, and supported scale words only.' : 'Use digits and number separators only.')
      : '');
  };

  input.addEventListener('input', validateCharacters);
  input.addEventListener('change', validateCharacters);
  validateCharacters();
  return input;
}
