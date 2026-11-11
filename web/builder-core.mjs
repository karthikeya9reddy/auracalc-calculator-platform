const MAX_EXPRESSION = 400;
const FUNCTIONS = Object.freeze({
  sqrt: [1, Math.sqrt], abs: [1, Math.abs], ln: [1, Math.log], log: [1, Math.log10],
  exp: [1, Math.exp], sin: [1, Math.sin], cos: [1, Math.cos], tan: [1, Math.tan],
  floor: [1, Math.floor], ceil: [1, Math.ceil], round: [1, Math.round],
  min: [2, Math.min], max: [2, Math.max], pi: [0, () => Math.PI], e: [0, () => Math.E],
});
export const FORMULA_FUNCTIONS = Object.keys(FUNCTIONS);

export function parseFormula(expression) {
  if (typeof expression !== 'string' || !expression.trim() || expression.length > MAX_EXPRESSION) throw new Error('Enter a formula of up to 400 characters.');
  const tokens = []; let offset = 0;
  while (offset < expression.length) {
    if (/\s/.test(expression[offset])) { offset++; continue; }
    const rest = expression.slice(offset);
    const match = /^(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z][A-Za-z0-9_]*|[(),+\-*/^])/.exec(rest);
    if (!match) throw new Error(`Unsupported character at position ${offset + 1}.`);
    tokens.push(match[0]); offset += match[0].length;
    if (tokens.length > 150) throw new Error('The formula has too many parts.');
  }
  let index = 0, depth = 0; const variables = new Set();
  function primary() {
    const token = tokens[index++];
    if (token === '(') {
      if (++depth > 25) throw new Error('The formula has too many nested parentheses.');
      const item = sum(); depth--;
      if (tokens[index++] !== ')') throw new Error('A closing parenthesis is missing.');
      return item;
    }
    if (token && /^[A-Za-z]/.test(token)) {
      if (tokens[index] === '(') {
        if (!Object.hasOwn(FUNCTIONS, token)) throw new Error(`Unknown function: ${token}. Use a supported function from the reference.`);
        if (++depth > 25) throw new Error('The formula has too many nested functions.');
        index++; const args = [];
        if (tokens[index] !== ')') { args.push(sum()); while (tokens[index] === ',') { index++; args.push(sum()); } }
        if (tokens[index++] !== ')') throw new Error('A function needs a closing parenthesis.');
        depth--;
        if (args.length !== FUNCTIONS[token][0]) throw new Error(`${token} expects ${FUNCTIONS[token][0]} argument(s).`);
        return { type: 'call', name: token, args };
      }
      variables.add(token); if (variables.size > 12) throw new Error('Use at most 12 inputs.'); return { type: 'variable', name: token };
    }
    if (token && /^(?:\d|\.)/.test(token) && Number.isFinite(Number(token))) return { type: 'number', value: Number(token) };
    throw new Error('Expected a number, input name, or parenthesized expression.');
  }
  function power() { let left = primary(); if (tokens[index] === '^') { index++; left = { type: 'binary', operator: '^', left, right: unary() }; } return left; }
  function unary() { const token = tokens[index]; if (token === '+' || token === '-') { index++; return { type: 'unary', operator: token, operand: unary() }; } return power(); }
  function product() { let left = unary(); while (tokens[index] === '*' || tokens[index] === '/') { const operator = tokens[index++]; left = { type: 'binary', operator, left, right: unary() }; } return left; }
  function sum() { let left = product(); while (tokens[index] === '+' || tokens[index] === '-') { const operator = tokens[index++]; left = { type: 'binary', operator, left, right: product() }; } return left; }
  const tree = sum();
  if (index !== tokens.length) throw new Error('Check the formula for a missing operator or unexpected parenthesis.');
  return { tree, variables: [...variables] };
}

export function evaluateFormula(tree, values) {
  return evaluateFormulaDetailed(tree, values).value;
}

export function evaluateFormulaDetailed(tree, values) {
  let operations = 0; const steps = [];
  const checked = (value, expression) => {
    if (!Number.isFinite(value)) throw new Error(`${expression} does not produce a finite real number. Check the function's domain and input sizes.`);
    steps.push({ expression, value }); return value;
  };
  function run(node) {
    if (++operations > 200 || !node || typeof node !== 'object') throw new Error('Formula is too complex or invalid.');
    if (node.type === 'number') return node.value;
    if (node.type === 'variable') { const value = values?.[node.name]; if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Enter a valid number for ${node.name}.`); return value; }
    if (node.type === 'unary') { const value = run(node.operand); return node.operator === '-' ? -value : value; }
    if (node.type === 'call') {
      if (!Object.hasOwn(FUNCTIONS, node.name) || !Array.isArray(node.args) || node.args.length !== FUNCTIONS[node.name][0]) throw new Error('Unsupported function.');
      const args = node.args.map(run);
      if (node.name === 'tan' && Math.abs(Math.cos(args[0])) < 1e-14) throw new Error('Tangent is undefined at this angle. Angles use radians.');
      return checked(FUNCTIONS[node.name][1](...args), `${node.name}(${args.join(', ')})`);
    }
    const left = run(node.left), right = run(node.right);
    let value;
    switch (node.operator) {
      case '+': value = left + right; break; case '-': value = left - right; break; case '*': value = left * right; break;
      case '/': if (right === 0) throw new Error('Division by zero is not allowed.'); value = left / right; break;
      case '^': if (left === 0 && right === 0) throw new Error('Zero raised to zero is undefined in this builder.'); value = left ** right; break;
      default: throw new Error('Unsupported operation.');
    }
    return checked(value, `${left} ${node.operator} ${right}`);
  }
  const value = run(tree);
  if (!Number.isFinite(value)) throw new Error('The result is not a finite real number.');
  return { value, steps };
}

export function sampleFormula(tree, values, variable, from, to, count = 21) {
  if (![from,to].every(Number.isFinite) || from >= to || !Number.isInteger(count) || count < 2 || count > 51) throw new Error('Choose a finite increasing range and 2–51 samples.');
  return Array.from({length:count}, (_, i) => {
    const x = from * (1 - i / (count - 1)) + to * (i / (count - 1));
    try { return {x, y:evaluateFormula(tree, {...values, [variable]:x})}; }
    catch(error) { return {x, y:null, error:error.message}; }
  });
}
