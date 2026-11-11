const MAX_EXPRESSION = 400;

export function parseFormula(expression) {
  if (typeof expression !== 'string' || !expression.trim() || expression.length > MAX_EXPRESSION) throw new Error('Enter a formula of up to 400 characters.');
  const tokens = []; let offset = 0;
  while (offset < expression.length) {
    if (/\s/.test(expression[offset])) { offset++; continue; }
    const rest = expression.slice(offset);
    const match = /^(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z][A-Za-z0-9_]*|[()+\-*/^])/.exec(rest);
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
    if (token && /^[A-Za-z]/.test(token)) { variables.add(token); if (variables.size > 12) throw new Error('Use at most 12 inputs.'); return { type: 'variable', name: token }; }
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
  function run(node) {
    if (node.type === 'number') return node.value;
    if (node.type === 'variable') { const value = values?.[node.name]; if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Enter a valid number for ${node.name}.`); return value; }
    if (node.type === 'unary') { const value = run(node.operand); return node.operator === '-' ? -value : value; }
    const left = run(node.left), right = run(node.right);
    let value;
    switch (node.operator) {
      case '+': value = left + right; break; case '-': value = left - right; break; case '*': value = left * right; break;
      case '/': if (right === 0) throw new Error('Division by zero is not allowed.'); value = left / right; break;
      case '^': if (left === 0 && right === 0) throw new Error('Zero raised to zero is undefined in this builder.'); value = left ** right; break;
      default: throw new Error('Unsupported operation.');
    }
    if (!Number.isFinite(value)) throw new Error('The result is not a finite real number.');
    return value;
  }
  return run(tree);
}
