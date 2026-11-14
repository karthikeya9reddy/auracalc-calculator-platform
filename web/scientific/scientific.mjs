import { calculateExpression } from './core.mjs';
const get = id => document.getElementById(id);
let answer = 0, memory = 0;
const expression = get('expression');
function insert(text) {
  expression.setRangeText(text, expression.selectionStart, expression.selectionEnd, 'end');
  expression.focus();
}
function button(label, handler, target, accessible = label) {
  const element = document.createElement('button'); element.type = 'button'; element.textContent = label; element.setAttribute('aria-label', accessible);
  element.addEventListener('click', handler); target.append(element);
}
const keys = ['(', ')', 'C', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '%', '+'];
for (const key of keys) button(key, () => {
  if (key === 'C') { expression.value = ''; get('error').textContent = ''; expression.focus(); }
  else if (key === '⌫') { const end = expression.selectionEnd, start = expression.selectionStart; expression.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end'); expression.focus(); }
  else if (key === '%') { expression.value = `(${expression.value || '0'})/100`; expression.focus(); }
  else insert(key);
}, get('keypad'), key === 'C' ? 'Clear expression' : key === '⌫' ? 'Backspace' : key);
for (const name of ['sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'exp', 'abs', 'min', 'max', 'factorial', 'ncr', 'npr', 'mod']) button(`${name}(`, () => insert(`${name}(`), get('functions'));
for (const name of ['pi', 'e', '^', 'ans', ',']) button(name, () => insert(name), get('functions'));
get('expression-form').addEventListener('submit', event => {
  event.preventDefault(); get('error').textContent = '';
  try {
    const degrees = get('angle-mode').value === 'degrees';
    const result = calculateExpression(expression.value, { degrees, answer, memory });
    const item = document.createElement('li');
    const source = expression.value;
    const display = Number(result.toPrecision(15)).toString();
    button(`${source} = ${display} (${degrees ? 'deg' : 'rad'})`, () => { expression.value = source; get('angle-mode').value = degrees ? 'degrees' : 'radians'; expression.focus(); }, item, `Reuse ${source}`);
    get('history').prepend(item);
    if (get('history').children.length > 30) get('history').lastChild.remove();
    answer = result; get('answer').value = display;
  } catch (error) { get('error').textContent = error.message; }
});
get('memory-save').addEventListener('click', () => { memory = answer; get('memory-status').textContent = `Memory: ${Number(memory.toPrecision(12))}`; });
get('memory-recall').addEventListener('click', () => insert('M'));
get('memory-clear').addEventListener('click', () => { memory = 0; get('memory-status').textContent = 'Memory: 0'; });
get('clear-history').addEventListener('click', () => get('history').replaceChildren());
get('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(String(answer)); get('notice').textContent = 'Full precision result copied.'; }
  catch { get('notice').textContent = 'Copy unavailable. Select the displayed result to copy it.'; }
});
expression.addEventListener('keydown', event => { if (event.key === 'Escape') { expression.value = ''; get('error').textContent = ''; } });
